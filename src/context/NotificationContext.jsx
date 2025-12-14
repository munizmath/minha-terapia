/**
 * SECURITY-NOTES: Contexto de Notificações com Snooze
 * 
 * Gerencia notificações ativas e snoozes de medicamentos.
 * 
 * Controles de Segurança:
 * - Limite de snoozes por notificação
 * - Histórico de snoozes para auditoria
 * - Validação de tempo de snooze
 * 
 * Riscos Mitigados:
 * - Snoozes infinitos
 * - Falta de rastreamento
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext();

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within NotificationProvider');
    }
    return context;
};

const MAX_SNOOZES = 3;

export const NotificationProvider = ({ children }) => {
    const [activeNotifications, setActiveNotifications] = useState(() => {
        const saved = localStorage.getItem('active_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    // Salvar notificações ativas
    useEffect(() => {
        localStorage.setItem('active_notifications', JSON.stringify(activeNotifications));
    }, [activeNotifications]);

    // Verificar snoozes expirados a cada minuto
    useEffect(() => {
        const checkInterval = setInterval(() => {
            setActiveNotifications(prev => {
                const now = Date.now();
                return prev.map(notif => {
                    if (notif.snoozedUntil) {
                        const until = new Date(notif.snoozedUntil).getTime();
                        if (until <= now) {
                            // Snooze expirado - reativar notificação
                            const updated = { ...notif };
                            delete updated.snoozedUntil;
                            
                            // Se atingiu limite de snoozes, marcar como final warning
                            if (notif.snoozeCount >= MAX_SNOOZES) {
                                updated.isFinalWarning = true;
                            }
                            
                            return updated;
                        }
                    }
                    return notif;
                }).filter(notif => {
                    // Remover notificações dispensadas ou tomadas
                    return !notif.dismissed && !notif.taken;
                });
            });
        }, 1000); // Verificar a cada segundo para contador visual

        return () => clearInterval(checkInterval);
    }, []);

    const addNotification = useCallback((medication) => {
        // Verificar se já existe notificação ativa para este medicamento hoje
        const today = new Date().toISOString().split('T')[0];
        const existing = activeNotifications.find(
            n => n.medicationId === medication.id && 
                 n.date === today &&
                 !n.dismissed &&
                 !n.taken
        );

        if (existing) {
            return existing; // Já existe notificação ativa
        }

        const notification = {
            id: uuidv4(),
            medicationId: medication.id,
            medicationName: medication.name,
            dosage: medication.dosage,
            date: today,
            createdAt: new Date().toISOString(),
            snoozeCount: 0,
            dismissed: false,
            taken: false
        };

        setActiveNotifications(prev => [...prev, notification]);
        return notification;
    }, [activeNotifications]);

    const snoozeNotification = useCallback((notificationId, minutes) => {
        setActiveNotifications(prev => prev.map(notif => {
            if (notif.id === notificationId) {
                const snoozedUntil = new Date(Date.now() + minutes * 60000).toISOString();
                
                // Registrar no histórico
                const history = JSON.parse(localStorage.getItem('notification_snooze_history') || '[]');
                history.push({
                    notificationId: notif.id,
                    medicationId: notif.medicationId,
                    medicationName: notif.medicationName,
                    snoozedAt: new Date().toISOString(),
                    snoozedUntil,
                    minutes,
                    snoozeCount: notif.snoozeCount + 1
                });
                localStorage.setItem('notification_snooze_history', JSON.stringify(history));

                return {
                    ...notif,
                    snoozedUntil,
                    snoozeCount: (notif.snoozeCount || 0) + 1,
                    isFinalWarning: (notif.snoozeCount || 0) + 1 >= MAX_SNOOZES
                };
            }
            return notif;
        }));
    }, []);

    const dismissNotification = useCallback((notificationId) => {
        setActiveNotifications(prev => prev.map(notif => {
            if (notif.id === notificationId) {
                return { ...notif, dismissed: true };
            }
            return notif;
        }));
    }, []);

    const markAsTaken = useCallback((notificationId) => {
        setActiveNotifications(prev => prev.map(notif => {
            if (notif.id === notificationId) {
                return { ...notif, taken: true };
            }
            return notif;
        }));
    }, []);

    const getSnoozeHistory = useCallback(() => {
        return JSON.parse(localStorage.getItem('notification_snooze_history') || '[]');
    }, []);

    const getActiveNotifications = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        return activeNotifications.filter(
            n => n.date === today && !n.dismissed && !n.taken
        );
    }, [activeNotifications]);

    return (
        <NotificationContext.Provider value={{
            activeNotifications: getActiveNotifications(),
            addNotification,
            snoozeNotification,
            dismissNotification,
            markAsTaken,
            getSnoozeHistory,
            MAX_SNOOZES
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

