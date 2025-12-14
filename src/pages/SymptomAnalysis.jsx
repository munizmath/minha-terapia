/**
 * SECURITY-NOTES: Análise Preditiva de Sintomas
 * 
 * Analisa padrões e correlações entre sintomas, medicamentos e atividades.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { useMedications } from '../context/MedicationContext';
import './support/SubPage.css';
import './SymptomAnalysis.css';

const SymptomAnalysis = () => {
    const navigate = useNavigate();
    const { symptoms, medications, activities, logs } = useMedications();

    const analyzeCorrelations = () => {
        if (symptoms.length === 0) return null;

        // Agrupar sintomas por data
        const symptomsByDate = {};
        symptoms.forEach(symptom => {
            const date = new Date(symptom.date).toLocaleDateString('pt-BR');
            if (!symptomsByDate[date]) {
                symptomsByDate[date] = [];
            }
            symptomsByDate[date].push(symptom);
        });

        // Contar frequência de sintomas
        const symptomFrequency = {};
        symptoms.forEach(s => {
            symptomFrequency[s.name] = (symptomFrequency[s.name] || 0) + 1;
        });

        // Análise de severidade média
        const severityBySymptom = {};
        symptoms.forEach(s => {
            if (!severityBySymptom[s.name]) {
                severityBySymptom[s.name] = { total: 0, count: 0 };
            }
            severityBySymptom[s.name].total += parseInt(s.severity) || 0;
            severityBySymptom[s.name].count += 1;
        });

        const avgSeverity = Object.entries(severityBySymptom).map(([name, data]) => ({
            name,
            avg: data.total / data.count
        })).sort((a, b) => b.avg - a.avg);

        // Padrões temporais
        const timePatterns = {
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0
        };

        symptoms.forEach(s => {
            const hour = new Date(s.date).getHours();
            if (hour >= 6 && hour < 12) timePatterns.morning++;
            else if (hour >= 12 && hour < 18) timePatterns.afternoon++;
            else if (hour >= 18 && hour < 22) timePatterns.evening++;
            else timePatterns.night++;
        });

        return {
            symptomFrequency: Object.entries(symptomFrequency).sort((a, b) => b[1] - a[1]).slice(0, 5),
            avgSeverity,
            timePatterns,
            totalSymptoms: symptoms.length
        };
    };

    const correlations = analyzeCorrelations();

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Análise de Sintomas</h1>
            </header>

            <div className="sub-content">
                {!correlations ? (
                    <div className="empty-state">
                        <AlertTriangle size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                        <p>Nenhum sintoma registrado ainda.</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            Registre sintomas para ver análises e padrões.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="analysis-section">
                            <h2 className="section-title">
                                <TrendingUp size={20} style={{ marginRight: 8 }} />
                                Resumo
                            </h2>
                            <div className="summary-cards">
                                <div className="summary-card">
                                    <div className="summary-value">{correlations.totalSymptoms}</div>
                                    <div className="summary-label">Total de Registros</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-value">{correlations.symptomFrequency.length}</div>
                                    <div className="summary-label">Tipos de Sintomas</div>
                                </div>
                            </div>
                        </div>

                        <div className="analysis-section">
                            <h2 className="section-title">
                                <Activity size={20} style={{ marginRight: 8 }} />
                                Sintomas Mais Frequentes
                            </h2>
                            <div className="frequency-list">
                                {correlations.symptomFrequency.map(([name, count]) => (
                                    <div key={name} className="frequency-item">
                                        <span className="frequency-name">{name}</span>
                                        <div className="frequency-bar-container">
                                            <div 
                                                className="frequency-bar"
                                                style={{ 
                                                    width: `${(count / correlations.symptomFrequency[0][1]) * 100}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="frequency-count">{count}x</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="analysis-section">
                            <h2 className="section-title">
                                <AlertTriangle size={20} style={{ marginRight: 8 }} />
                                Severidade Média
                            </h2>
                            <div className="severity-list">
                                {correlations.avgSeverity.slice(0, 5).map(({ name, avg }) => (
                                    <div key={name} className="severity-item">
                                        <span className="severity-name">{name}</span>
                                        <div className="severity-rating">
                                            {[1, 2, 3, 4, 5].map(level => (
                                                <span 
                                                    key={level}
                                                    className={level <= Math.round(avg) ? 'active' : ''}
                                                >
                                                    ⭐
                                                </span>
                                            ))}
                                        </div>
                                        <span className="severity-value">{avg.toFixed(1)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="analysis-section">
                            <h2 className="section-title">Padrões Temporais</h2>
                            <div className="time-patterns">
                                {[
                                    { key: 'morning', label: 'Manhã (6h-12h)' },
                                    { key: 'afternoon', label: 'Tarde (12h-18h)' },
                                    { key: 'evening', label: 'Noite (18h-22h)' },
                                    { key: 'night', label: 'Madrugada (22h-6h)' }
                                ].map(({ key, label }) => (
                                    <div key={key} className="time-pattern-item">
                                        <span className="time-label">{label}</span>
                                        <div className="time-bar-container">
                                            <div 
                                                className="time-bar"
                                                style={{ 
                                                    width: `${(correlations.timePatterns[key] / correlations.totalSymptoms) * 100}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="time-count">{correlations.timePatterns[key]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SymptomAnalysis;

