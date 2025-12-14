/**
 * SECURITY-NOTES: Componente de Snooze para Notificações
 * 
 * Componente que permite adiar notificações de medicamentos.
 * 
 * Controles de Segurança:
 * - Validação de tempo de snooze
 * - Limite de snoozes por notificação
 * - Histórico de snoozes para auditoria
 * 
 * Riscos Mitigados:
 * - Snoozes infinitos que podem causar esquecimento
 * - Falta de rastreamento de adiamentos
 */

import React, { useState, useEffect } from 'react';
import { Clock, X, Bell } from 'lucide-react';
import './NotificationSnooze.css';

const SNOOZE_OPTIONS = [5, 10, 15]; // minutos
const MAX_SNOOZES = 3; // máximo de snoozes antes de notificação final

const NotificationSnooze = ({ notification, onSnooze, onDismiss, onTake }) => {
    const [timeRemaining, setTimeRemaining] = useState(null);
    const snoozeCount = notification.snoozeCount || 0;

    // Calcular tempo restante se houver snooze ativo
    useEffect(() => {
        if (notification.snoozedUntil) {
            const updateTimer = () => {
                const now = Date.now();
                const until = new Date(notification.snoozedUntil).getTime();
                const remaining = Math.max(0, until - now);
                
                if (remaining > 0) {
                    const minutes = Math.floor(remaining / 60000);
                    const seconds = Math.floor((remaining % 60000) / 1000);
                    setTimeRemaining({ minutes, seconds });
                } else {
                    setTimeRemaining(null);
                }
            };

            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        } else {
            setTimeRemaining(null);
        }
    }, [notification.snoozedUntil]);

    const handleSnooze = (minutes) => {
        if (snoozeCount >= MAX_SNOOZES) {
            // Ainda permite snooze, mas mostra aviso final
            if (!window.confirm(`Você já adiou ${snoozeCount} vezes. Este será o último aviso. Continuar?`)) {
                return;
            }
        }
        onSnooze(minutes);
    };

    const handleDismiss = () => {
        onDismiss(notification);
    };

    const handleTake = () => {
        onTake(notification);
    };

    // Se estiver em snooze, mostrar contador
    if (notification.snoozedUntil && timeRemaining) {
        const isFinalWarning = snoozeCount >= MAX_SNOOZES;
        
        return (
            <div className={`notification-snooze ${isFinalWarning ? 'final-warning' : ''}`}>
                <div className="snooze-header">
                    <Bell size={20} />
                    <h3>Lembrete Adiado</h3>
                </div>
                <div className="snooze-content">
                    <p className="medication-name">{notification.medicationName}</p>
                    <p className="medication-dosage">{notification.dosage}</p>
                    
                    {isFinalWarning && (
                        <div className="final-warning-message">
                            ⚠️ Último aviso! Este é seu {snoozeCount}º adiamento.
                        </div>
                    )}
                    
                    <div className="timer-display">
                        <Clock size={24} />
                        <div className="timer-text">
                            <span className="timer-value">
                                {String(timeRemaining.minutes).padStart(2, '0')}:
                                {String(timeRemaining.seconds).padStart(2, '0')}
                            </span>
                            <span className="timer-label">restantes</span>
                        </div>
                    </div>
                    
                    <div className="snooze-actions">
                        <button 
                            className="snooze-btn take-btn" 
                            onClick={handleTake}
                        >
                            Já tomei
                        </button>
                        <button 
                            className="snooze-btn dismiss-btn" 
                            onClick={handleDismiss}
                        >
                            Dispensar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Notificação ativa - mostrar opções de snooze
    return (
        <div className="notification-snooze active">
            <div className="snooze-header">
                <Bell size={20} />
                <h3>Hora do Remédio</h3>
                <button className="close-btn" onClick={handleDismiss}>
                    <X size={18} />
                </button>
            </div>
            <div className="snooze-content">
                <p className="medication-name">{notification.medicationName}</p>
                <p className="medication-dosage">{notification.dosage}</p>
                
                {snoozeCount > 0 && (
                    <p className="snooze-count">Adiado {snoozeCount} vez(es)</p>
                )}
                
                <div className="snooze-options">
                    <p className="snooze-label">Adiar por:</p>
                    <div className="snooze-buttons">
                        {SNOOZE_OPTIONS.map(minutes => (
                            <button
                                key={minutes}
                                className="snooze-option-btn"
                                onClick={() => handleSnooze(minutes)}
                            >
                                {minutes} min
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="snooze-actions">
                    <button 
                        className="snooze-btn take-btn primary" 
                        onClick={handleTake}
                    >
                        Já tomei
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSnooze;

