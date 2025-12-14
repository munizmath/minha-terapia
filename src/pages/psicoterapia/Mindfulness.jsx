/**
 * SECURITY-NOTES: Página de Mindfulness e Relaxamento
 * 
 * Página para exercícios de mindfulness e relaxamento.
 * 
 * Controles de Segurança:
 * - Histórico de uso para acompanhamento
 * - Validação de dados de exercícios
 * 
 * Riscos Mitigados:
 * - Uso excessivo sem supervisão
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music, Headphones, BookOpen, Clock } from 'lucide-react';
import MindfulnessTimer from '../../components/MindfulnessTimer';
import '../support/SubPage.css';
import './Mindfulness.css';

const RELAXATION_EXERCISES = [
    {
        id: 'body-scan',
        title: 'Varredura Corporal',
        description: 'Exercício guiado de atenção plena ao corpo',
        duration: '10-15 min',
        icon: '🧘'
    },
    {
        id: 'progressive-relaxation',
        title: 'Relaxamento Progressivo',
        description: 'Tensão e relaxamento de grupos musculares',
        duration: '15-20 min',
        icon: '💆'
    },
    {
        id: 'loving-kindness',
        title: 'Bondade Amorosa',
        description: 'Meditação de compaixão e bondade',
        duration: '10-15 min',
        icon: '❤️'
    }
];

const Mindfulness = () => {
    const navigate = useNavigate();
    const [activeExercise, setActiveExercise] = useState(null);
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('mindfulness_history');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('mindfulness_history', JSON.stringify(history));
    }, [history]);

    const handleTimerComplete = (data) => {
        const entry = {
            id: Date.now(),
            type: 'breathing',
            pattern: data.pattern,
            cycles: data.cycles,
            duration: data.duration,
            date: new Date().toISOString()
        };
        setHistory(prev => [entry, ...prev]);
        setActiveExercise(null);
    };

    const handleExerciseStart = (exerciseId) => {
        setActiveExercise(exerciseId);
        // Aqui poderia iniciar um áudio guiado ou vídeo
    };

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Mindfulness & Relaxamento</h1>
            </header>

            <div className="sub-content">
                {!activeExercise ? (
                    <>
                        {/* Timer de Respiração */}
                        <div className="mindfulness-section">
                            <h2 className="section-title">
                                <Clock size={20} style={{ marginRight: 8 }} />
                                Respiração Guiada
                            </h2>
                            <MindfulnessTimer onComplete={handleTimerComplete} />
                        </div>

                        {/* Exercícios de Relaxamento */}
                        <div className="mindfulness-section">
                            <h2 className="section-title">
                                <BookOpen size={20} style={{ marginRight: 8 }} />
                                Exercícios de Relaxamento
                            </h2>
                            <div className="exercises-grid">
                                {RELAXATION_EXERCISES.map(exercise => (
                                    <div 
                                        key={exercise.id} 
                                        className="exercise-card"
                                        onClick={() => handleExerciseStart(exercise.id)}
                                    >
                                        <div className="exercise-icon">{exercise.icon}</div>
                                        <h3>{exercise.title}</h3>
                                        <p>{exercise.description}</p>
                                        <span className="exercise-duration">{exercise.duration}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sons Ambiente */}
                        <div className="mindfulness-section">
                            <h2 className="section-title">
                                <Headphones size={20} style={{ marginRight: 8 }} />
                                Sons Ambiente
                            </h2>
                            <div className="sounds-grid">
                                {['Chuva', 'Oceano', 'Floresta', 'Fogueira'].map(sound => (
                                    <div key={sound} className="sound-card">
                                        <Music size={24} />
                                        <span>{sound}</span>
                                        <button className="sound-toggle">▶</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Histórico */}
                        {history.length > 0 && (
                            <div className="mindfulness-section">
                                <h2 className="section-title">Histórico de Uso</h2>
                                <div className="history-list">
                                    {history.slice(0, 10).map(entry => (
                                        <div key={entry.id} className="history-item">
                                            <div className="history-icon">
                                                {entry.type === 'breathing' ? '🫁' : '🧘'}
                                            </div>
                                            <div className="history-info">
                                                <h4>
                                                    {entry.type === 'breathing' 
                                                        ? `Respiração ${entry.pattern}` 
                                                        : 'Exercício de Relaxamento'}
                                                </h4>
                                                <p>
                                                    {entry.type === 'breathing' 
                                                        ? `${entry.cycles} ciclos • ${entry.duration}s`
                                                        : entry.duration}
                                                </p>
                                            </div>
                                            <div className="history-date">
                                                {new Date(entry.date).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="exercise-active">
                        <h2>Exercício em Andamento</h2>
                        <p>Áudio guiado ou vídeo seria reproduzido aqui</p>
                        <button 
                            className="action-btn primary"
                            onClick={() => setActiveExercise(null)}
                        >
                            Voltar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Mindfulness;

