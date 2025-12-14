/**
 * Componente global para exibir notificações ativas com snooze
 */

import React from 'react';
import { useNotificationContext } from '../context/NotificationContext';
import NotificationSnooze from './NotificationSnooze';
import './NotificationOverlay.css';

const NotificationOverlay = () => {
    const { 
        activeNotifications, 
        snoozeNotification, 
        dismissNotification, 
        markAsTaken 
    } = useNotificationContext();

    // Filtrar apenas notificações ativas (não dispensadas, não tomadas)
    const visibleNotifications = activeNotifications.filter(
        n => !n.dismissed && !n.taken
    );

    if (visibleNotifications.length === 0) {
        return null;
    }

    return (
        <div className="notification-overlay">
            {visibleNotifications.map((notification, index) => (
                <div 
                    key={notification.id} 
                    className="notification-wrapper"
                    style={{ 
                        top: `${20 + index * 380}px` // Empilhar notificações verticalmente
                    }}
                >
                    <NotificationSnooze
                        notification={notification}
                        onSnooze={(minutes) => {
                            snoozeNotification(notification.id, minutes);
                        }}
                        onDismiss={() => dismissNotification(notification.id)}
                        onTake={() => {
                            markAsTaken(notification.id);
                            // Opcional: registrar no log de medicamentos
                            // Isso pode ser feito através de um callback ou contexto
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default NotificationOverlay;

