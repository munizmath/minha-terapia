/**
 * SECURITY-NOTES: Análise de Padrões de Pensamento
 * 
 * Visualiza padrões de pensamentos disfuncionais.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import '../support/SubPage.css';
import './ThoughtPatterns.css';

const ThoughtPatterns = () => {
    const navigate = useNavigate();
    const [thoughts, setThoughts] = useState(() => {
        const saved = localStorage.getItem('tcc_thoughts');
        return saved ? JSON.parse(saved) : [];
    });

    const DISTORTIONS = [
        'Pensamento Tudo ou Nada',
        'Generalização Excessiva',
        'Filtro Mental',
        'Desqualificar o Positivo',
        'Leitura Mental',
        'Catastrofização',
        'Raciocínio Emocional',
        'Devoções',
        'Rotulagem',
        'Personalização'
    ];

    const analyzePatterns = () => {
        if (thoughts.length === 0) return null;

        const distortionCount = {};
        const emotionCount = {};
        const monthlyData = {};

        thoughts.forEach(thought => {
            // Contar distorções
            if (thought.distortion) {
                distortionCount[thought.distortion] = (distortionCount[thought.distortion] || 0) + 1;
            }
            // Contar emoções
            if (thought.emotion) {
                emotionCount[thought.emotion] = (emotionCount[thought.emotion] || 0) + 1;
            }
            // Agrupar por mês
            const month = new Date(thought.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });

        const topDistortions = Object.entries(distortionCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const topEmotions = Object.entries(emotionCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return { topDistortions, topEmotions, monthlyData };
    };

    const patterns = analyzePatterns();

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Análise de Padrões</h1>
            </header>

            <div className="sub-content">
                {!patterns ? (
                    <div className="empty-state">
                        <AlertCircle size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                        <p>Nenhum registro de pensamento encontrado.</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            Registre pensamentos disfuncionais para ver análises.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="pattern-section">
                            <h2 className="section-title">
                                <TrendingUp size={20} style={{ marginRight: 8 }} />
                                Distorções Cognitivas Mais Comuns
                            </h2>
                            <div className="pattern-list">
                                {patterns.topDistortions.map(([distortion, count], index) => (
                                    <div key={distortion} className="pattern-item">
                                        <div className="pattern-rank">#{index + 1}</div>
                                        <div className="pattern-info">
                                            <h3>{distortion}</h3>
                                            <p>{count} ocorrência(s)</p>
                                        </div>
                                        <div className="pattern-bar">
                                            <div 
                                                className="pattern-fill"
                                                style={{ width: `${(count / patterns.topDistortions[0][1]) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pattern-section">
                            <h2 className="section-title">
                                <AlertCircle size={20} style={{ marginRight: 8 }} />
                                Emoções Mais Frequentes
                            </h2>
                            <div className="emotion-list">
                                {patterns.topEmotions.map(([emotion, count]) => (
                                    <div key={emotion} className="emotion-item">
                                        <span className="emotion-name">{emotion}</span>
                                        <span className="emotion-count">{count}x</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pattern-section">
                            <h2 className="section-title">
                                <Lightbulb size={20} style={{ marginRight: 8 }} />
                                Sugestões
                            </h2>
                            <div className="suggestions">
                                {patterns.topDistortions.length > 0 && (
                                    <div className="suggestion-item">
                                        <strong>Distorção mais comum:</strong> {patterns.topDistortions[0][0]}
                                        <p>Considere trabalhar técnicas específicas para esta distorção cognitiva.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ThoughtPatterns;

