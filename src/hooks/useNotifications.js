import { useEffect, useRef } from 'react';

export const useNotifications = (medications, logs) => {
    const lastCheck = useRef(Date.now());

    // Request permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        const checkInterval = setInterval(() => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // Simple check: iterate all daily meds for now
            // Real app implementation needs more robust "next due" logic
            medications.forEach(med => {
                const [medHour, medMinute] = med.time.split(':').map(Number);

                // Exact minute match (debounced by interval slightly)
                // Should use a "last notified" flag in real production to avoid dupes
                if (currentHour === medHour && currentMinute === medMinute) {
                    // Check if already taken today? (Optional: reminder even if not checked yet)
                    // For simpler logic: just remind if it's time

                    if (Notification.permission === 'granted') {
                        new Notification(`Hora do Remédio: ${med.name}`, {
                            body: `${med.dosage} - Toque para abrir`,
                            icon: '/pwa-192x192.png',
                            badge: '/pwa-192x192.png'
                        });
                    }
                }
            });

            lastCheck.current = Date.now();
        }, 60000); // Check every minute

        return () => clearInterval(checkInterval);
    }, [medications]); // Re-run if meds list changes

    const sendStockAlert = (medName, remaining) => {
        if (Notification.permission === 'granted') {
            new Notification(`Estoque Baixo: ${medName}`, {
                body: `Restam apenas ${remaining} unidades.`,
                icon: '/pwa-192x192.png'
            });
        }
    };

    return { sendStockAlert };
};
