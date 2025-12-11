import React from 'react';
import { useMedications } from '../context/MedicationContext';
import { BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './Progress.css';

const Progress = () => {
    const { logs, medications } = useMedications();
    const today = new Date();

    // Weekly Stats
    const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Calculate daily compliance
    const weeklyData = weekDays.map(day => {
        // Find logs for this day
        const dayLogs = logs.filter(log => isSameDay(parseISO(log.takenAt), day));
        // Find expected doses for this day (simplified: assumes daily for all active meds)
        const activeMedsCount = medications.filter(m => m.frequency === 'daily').length;

        // Safety check div by zero
        const compliance = activeMedsCount > 0
            ? Math.min(100, Math.round((dayLogs.length / activeMedsCount) * 100))
            : 0;

        return {
            day: format(day, 'EEE', { locale: ptBR }),
            date: day,
            compliance,
            taken: dayLogs.length
        };
    });

    const totalTaken = logs.length;

    return (
        <div className="progress-page">
            <header className="page-header">
                <h1>Meu Progresso</h1>
            </header>

            <div className="progress-container">
                {/* Weekly Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <BarChart3 size={20} color="var(--color-primary)" />
                        <h2>Adesão Semanal</h2>
                    </div>
                    <div className="bar-chart">
                        {weeklyData.map((data, index) => (
                            <div key={index} className="bar-group">
                                <div className="bar-wrapper">
                                    <div
                                        className="bar-fill"
                                        style={{ height: `${data.compliance}%` }}
                                        title={`${data.taken} tomados`}
                                    ></div>
                                </div>
                                <span className="bar-label">{data.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <CheckCircle size={24} color="var(--color-success)" />
                        <div className="stat-info">
                            <span className="stat-value">{totalTaken}</span>
                            <span className="stat-label">Total Tomados</span>
                        </div>
                    </div>
                    {/* Placeholder for Missed */}
                    <div className="stat-card">
                        <XCircle size={24} color="var(--color-error)" />
                        <div className="stat-info">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Perdidos</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Progress;
