import React from 'react';
import { Check, Clock } from 'lucide-react';
import './TimelineItem.css';

const TimelineItem = ({ item, allTimes, isTaken, onToggle }) => {
    const { time, name, dosage } = item;
    return (
        <div className={`timeline-item ${isTaken ? 'taken' : ''}`} onClick={onToggle}>
            <div className="time-column">
                <span className="time-text">{time}</span>
            </div>

            <div className="card">
                <div className="card-content">
                    <h3 className="med-name">{name}</h3>
                    <p className="med-dose">{dosage}</p>
                    {item.stock !== undefined && (
                        <p className="med-stock" style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                            Estoque: {item.stock}
                        </p>
                    )}
                </div>

                <div className={`checkbox ${isTaken ? 'checked' : ''}`}>
                    {isTaken && <Check size={20} color="white" />}
                </div>
            </div>
        </div>
    );
};

export default TimelineItem;
