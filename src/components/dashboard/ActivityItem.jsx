import React from 'react';
import { Zap, Clock, Trash2 } from 'lucide-react';
import { useMedications } from '../../context/MedicationContext';
import './TimelineItem.css';

const ActivityItem = ({ data }) => {
    const { removeActivity } = useMedications();
    const time = new Date(data.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="timeline-item taken">
            <div className="time-column">
                <span className="time">{time}</span>
            </div>

            <div className="timeline-content">
                <div className="med-icon" style={{ backgroundColor: '#FF9800' }}> {/* Orange for Activity */}
                    <Zap size={24} color="white" />
                </div>
                <div className="med-info">
                    <h3>{data.name}</h3>
                    <p className="med-details">
                        <Clock size={12} style={{ marginRight: 4, display: 'inline' }} />
                        {data.duration} min
                    </p>
                </div>

                <button
                    className="check-btn"
                    style={{ background: 'none', border: 'none', color: '#999' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Excluir esta atividade?')) removeActivity(data.id);
                    }}
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
};

export default ActivityItem;
