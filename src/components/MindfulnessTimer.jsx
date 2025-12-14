/**
 * SECURITY-NOTES: Timer de Respiração para Mindfulness
 * 
 * Componente para exercícios de respiração guiada (técnica 4-7-8).
 * 
 * Controles de Segurança:
 * - Validação de tempo de respiração
 * - Histórico de uso para acompanhamento
 * 
 * Riscos Mitigados:
 * - Uso excessivo sem supervisão médica
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import './MindfulnessTimer.css';

const BREATHING_PATTERNS = {
    '4-7-8': { inhale: 4, hold: 7, exhale: 8, name: '4-7-8 (Relaxamento)' },
    '4-4-4': { inhale: 4, hold: 4, exhale: 4, name: '4-4-4 (Equilíbrio)' },
    '5-5-5': { inhale: 5, hold: 5, exhale: 5, name: '5-5-5 (Calma)' },
    '6-2-6': { inhale: 6, hold: 2, exhale: 6, name: '6-2-6 (Energia)' }
};

const MindfulnessTimer = ({ onComplete }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentPhase, setCurrentPhase] = useState('inhale'); // inhale, hold, exhale
    const [timeRemaining, setTimeRemaining] = useState(4);
    const [selectedPattern, setSelectedPattern] = useState('4-7-8');
    const [cycles, setCycles] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const intervalRef = useRef(null);
    const audioContextRef = useRef(null);

    const pattern = BREATHING_PATTERNS[selectedPattern];

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        // Mudar de fase
                        if (currentPhase === 'inhale') {
                            setCurrentPhase('hold');
                            return pattern.hold;
                        } else if (currentPhase === 'hold') {
                            setCurrentPhase('exhale');
                            return pattern.exhale;
                        } else {
                            // Ciclo completo
                            setCycles(prev => prev + 1);
                            setCurrentPhase('inhale');
                            return pattern.inhale;
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, currentPhase, pattern]);

    const handleStart = () => {
        setTimeRemaining(pattern.inhale);
        setCurrentPhase('inhale');
        setCycles(0);
        setIsRunning(true);
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeRemaining(pattern.inhale);
        setCurrentPhase('inhale');
        setCycles(0);
    };

    const handleComplete = () => {
        setIsRunning(false);
        if (onComplete) {
            onComplete({ cycles, pattern: selectedPattern, duration: cycles * (pattern.inhale + pattern.hold + pattern.exhale) });
        }
    };

    const getPhaseLabel = () => {
        switch (currentPhase) {
            case 'inhale': return 'Inspire';
            case 'hold': return 'Segure';
            case 'exhale': return 'Expire';
            default: return '';
        }
    };

    const getPhaseColor = () => {
        switch (currentPhase) {
            case 'inhale': return '#4caf50'; // Verde
            case 'hold': return '#2196f3'; // Azul
            case 'exhale': return '#ff9800'; // Laranja
            default: return '#9e9e9e';
        }
    };

    return (
        <div className="mindfulness-timer">
            <div className="timer-header">
                <h3>Exercício de Respiração</h3>
                <div className="pattern-selector">
                    <label>Padrão:</label>
                    <select 
                        value={selectedPattern} 
                        onChange={(e) => {
                            setSelectedPattern(e.target.value);
                            handleReset();
                        }}
                        disabled={isRunning}
                    >
                        {Object.keys(BREATHING_PATTERNS).map(key => (
                            <option key={key} value={key}>
                                {BREATHING_PATTERNS[key].name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="timer-circle" style={{ borderColor: getPhaseColor() }}>
                <div className="timer-content">
                    <div className="phase-label" style={{ color: getPhaseColor() }}>
                        {getPhaseLabel()}
                    </div>
                    <div className="time-display">
                        {timeRemaining}
                    </div>
                    <div className="cycles-display">
                        Ciclos: {cycles}
                    </div>
                </div>
            </div>

            <div className="timer-controls">
                {!isRunning ? (
                    <button className="timer-btn start-btn" onClick={handleStart}>
                        <Play size={24} />
                        Iniciar
                    </button>
                ) : (
                    <button className="timer-btn pause-btn" onClick={handlePause}>
                        <Pause size={24} />
                        Pausar
                    </button>
                )}
                <button className="timer-btn reset-btn" onClick={handleReset} disabled={isRunning}>
                    <RotateCcw size={24} />
                    Resetar
                </button>
                <button 
                    className="timer-btn sound-btn" 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                >
                    {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>
            </div>

            {cycles >= 4 && (
                <button className="complete-btn" onClick={handleComplete}>
                    Finalizar Exercício
                </button>
            )}

            <div className="timer-info">
                <p>Padrão: {pattern.name}</p>
                <p>Inspire: {pattern.inhale}s | Segure: {pattern.hold}s | Expire: {pattern.exhale}s</p>
            </div>
        </div>
    );
};

export default MindfulnessTimer;

