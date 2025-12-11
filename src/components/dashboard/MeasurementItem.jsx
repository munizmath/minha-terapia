import React from 'react';
import { Activity, Scale, Heart, Thermometer, Droplet, Trash2 } from 'lucide-react';
import { useMedications } from '../../context/MedicationContext';
import './TimelineItem.css';

const ICONS = {
    blood_pressure: Activity,
    weight: Scale,
    heart_rate: Heart,
    temperature: Thermometer,
    glucose: Droplet
};

const MeasurementItem = ({ data }) => {
    const { removeMeasurement } = useMedications();
    const Icon = ICONS[data.subtype] || Activity;

    const time = new Date(data.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="timeline-item taken"> {/* Always 'taken' style for now */}
            <div className="time-column">
                <span className="time">{time}</span>
            </div>

            <div className="timeline-content">
                <div className="med-icon" style={{ backgroundColor: 'var(--color-secondary)' }}>
                    <Icon size={24} color="white" />
                </div>
                <div className="med-info">
                    <h3>{ICONS[data.subtype] ? '' : 'Medida: '}{data.value} <small>{data.unit}</small></h3>
                    <p className="med-details">{new Date(data.date).toLocaleDateString()}</p>
                </div>

                <button
                    className="check-btn"
                    style={{ background: 'none', border: 'none', color: '#999' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Excluir esta medida?')) removeMeasurement(data.id);
                    }}
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
};

export default MeasurementItem;
