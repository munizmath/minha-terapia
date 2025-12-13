import React from 'react';
import { Smile, Frown, Meh, Trash2 } from 'lucide-react';
import { useMedications } from '../../context/MedicationContext';
import './TimelineItem.css';

const SymptomItem = ({ data }) => {
    const { removeSymptom } = useMedications();
    const time = new Date(data.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Determine color based on severity/feeling if possible, or just generic
    // Usually 'severity' is 1-10 or 'Low/Med/High'. 
    // If it's just a note, we use generic.

    return (
        <div className="timeline-item taken">
            <div className="time-column">
                <span className="time">{time}</span>
            </div>

            <div className="timeline-content">
                <div className="med-icon" style={{ backgroundColor: '#9C27B0' }}> {/* Purple for Symptom/Mood */}
                    <Smile size={24} color="white" />
                </div>
                <div className="med-info">
                    <h3>{data.name}</h3>
                    <p className="med-details">
                        {data.severity ? `Intensidade: ${data.severity}` : ''}
                        {data.note && (data.severity ? ' • ' : '') + data.note}
                    </p>
                </div>

                <button
                    className="check-btn"
                    style={{ background: 'none', border: 'none', color: '#999' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Excluir este registro?')) removeSymptom(data.id);
                    }}
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
};

export default SymptomItem;
