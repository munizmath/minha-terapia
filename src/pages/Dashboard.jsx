import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Pill, Activity, Smile, Zap } from 'lucide-react';
import { useMedications } from '../context/MedicationContext';
import TopBar from '../components/layout/TopBar';
import TimelineItem from '../components/dashboard/TimelineItem';
import MeasurementItem from '../components/dashboard/MeasurementItem';
import { format, isSameDay, parseISO } from 'date-fns';
import { generateDailySchedule } from '../utils/scheduler';
import './Dashboard.css';

const Dashboard = () => {
    const { medications, logs, logIntake, measurements } = useMedications();
    const navigate = useNavigate();
    const today = new Date();
    const [showMenu, setShowMenu] = useState(false);

    // 1. Get Scheduled Meds
    const scheduledMeds = generateDailySchedule(medications, today);

    // 2. Get Measurements for Today
    const todayMeasurements = measurements.filter(m => isSameDay(parseISO(m.date), today));

    const isTaken = (medId, time) => {
        return logs.some(log =>
            log.medicationId === medId &&
            isSameDay(parseISO(log.takenAt), today) &&
            log.scheduledTime.includes(time) // loose match
        );
    };

    const handleToggle = (med, time) => {
        if (!isTaken(med.id, time)) {
            logIntake(med.id, time);
        }
    };

    return (
        <div className="dashboard-page">
            <TopBar />

            <div className="timeline-container">
                {scheduledMeds.length === 0 && todayMeasurements.length === 0 ? (
                    <div className="empty-state">
                        <p>Nada agendado para hoje.</p>
                    </div>
                ) : (
                    <>
                        {scheduledMeds.map((item, index) => (
                            <TimelineItem
                                key={`${item.id}-${item.time}-${index}`}
                                item={item}
                                isTaken={isTaken(item.id, item.time)}
                                onToggle={() => handleToggle(item, item.time)}
                            />
                        ))}

                        {todayMeasurements.length > 0 && <div className="divider-label">Registros</div>}

                        {todayMeasurements.map(meas => (
                            <MeasurementItem key={meas.id} data={meas} />
                        ))}
                    </>
                )}
            </div>

            {/* FAB & Menu Overlay */}
            {showMenu && (
                <div className="fab-overlay" onClick={() => setShowMenu(false)}>
                    <div className="fab-menu">
                        <button onClick={() => navigate('/medications/add')}>
                            <Pill size={20} /> Medicamento
                        </button>
                        <button onClick={() => navigate('/measurements/add')}>
                            <Activity size={20} /> Medição
                        </button>
                        <button onClick={() => navigate('/tracker/symptom')}>
                            <Smile size={20} /> Sintoma / Humor
                        </button>
                        <button onClick={() => navigate('/tracker/activity')}>
                            <Zap size={20} /> Atividade Física
                        </button>
                    </div>
                </div>
            )}

            <button
                className={`fab ${showMenu ? 'open' : ''}`}
                onClick={() => setShowMenu(!showMenu)}
            >
                {showMenu ? <X size={24} /> : <Plus size={24} />}
            </button>
        </div>
    );
};

export default Dashboard;
