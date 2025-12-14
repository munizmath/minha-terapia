/**
 * SECURITY-NOTES: Hook de Notificações com Snooze
 * 
 * Gerencia notificações de medicamentos com suporte a snooze.
 * 
 * Controles de Segurança:
 * - Respeita preferência do usuário
 * - Integra com NotificationContext para snooze
 * - Evita notificações duplicadas
 */

import { useEffect, useRef } from 'react';

/**
 * Hook para gerenciar notificações de medicamentos
 * Respeita a preferência do usuário salva no localStorage
 * Integra com NotificationContext para suporte a snooze
 */
export const useNotifications = (medications, logs, notificationContext) => {
    const lastCheck = useRef(Date.now());
    const lastNotified = useRef({}); // Rastrear último horário notificado por medicamento

    // Verificar se notificações estão habilitadas pelo usuário
    const areNotificationsEnabled = () => {
        const saved = localStorage.getItem('notifications_enabled');
        if (saved !== null) {
            return JSON.parse(saved);
        }
        // Default: true se permissão foi concedida
        return Notification.permission === 'granted';
    };

    // Request permission on mount (only if user hasn't disabled)
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            const enabled = areNotificationsEnabled();
            if (enabled) {
                Notification.requestPermission();
            }
        }
    }, []);

    useEffect(() => {
        // Verificar se notificações estão habilitadas
        const enabled = areNotificationsEnabled();
        if (!enabled || !notificationContext) {
            return;
        }

        const checkInterval = setInterval(() => {
            // Verificar novamente a cada intervalo (pode ter mudado)
            if (!areNotificationsEnabled()) {
                return;
            }

            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const today = now.toISOString().split('T')[0];

            // Verificar medicamentos que precisam de notificação
            medications.forEach(med => {
                const [medHour, medMinute] = med.time.split(':').map(Number);

                // Verificar se é hora do medicamento
                if (currentHour === medHour && currentMinute === medMinute) {
                    const medKey = `${med.id}_${today}`;
                    const lastNotifiedTime = lastNotified.current[medKey];

                    // Evitar notificações duplicadas no mesmo minuto
                    if (lastNotifiedTime && 
                        lastNotifiedTime.hour === currentHour && 
                        lastNotifiedTime.minute === currentMinute) {
                        return;
                    }

                    // Verificar se já foi tomado hoje
                    const todayLogs = logs.filter(log => {
                        const logDate = new Date(log.takenAt || log.scheduledTime).toISOString().split('T')[0];
                        return logDate === today && log.medicationId === med.id;
                    });

                    // Adicionar notificação no contexto (será exibida na UI)
                    const notification = notificationContext.addNotification(med);

                    // Enviar notificação do navegador se permitido
                    if (Notification.permission === 'granted' && areNotificationsEnabled()) {
                        new Notification(`Hora do Remédio: ${med.name}`, {
                            body: `${med.dosage} - Toque para abrir`,
                            icon: '/pwa-192x192.png',
                            badge: '/pwa-192x192.png',
                            tag: `med-${med.id}`, // Evita múltiplas notificações do mesmo medicamento
                            requireInteraction: false
                        });
                    }

                    // Registrar que notificamos neste horário
                    lastNotified.current[medKey] = {
                        hour: currentHour,
                        minute: currentMinute,
                        timestamp: Date.now()
                    };
                }
            });

            lastCheck.current = Date.now();
        }, 60000); // Check every minute

        return () => clearInterval(checkInterval);
    }, [medications, logs, notificationContext]); // Re-run if meds list changes

    const sendStockAlert = (medName, remaining) => {
        if (Notification.permission === 'granted' && areNotificationsEnabled()) {
            new Notification(`Estoque Baixo: ${medName}`, {
                body: `Restam apenas ${remaining} unidades.`,
                icon: '/pwa-192x192.png'
            });
        }
    };

    return { sendStockAlert };
};
