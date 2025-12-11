import React from 'react';
import { Check, Clock } from 'lucide-react';
import './TimelineItem.css';

const TimelineItem = ({ time, medicationName, dosage, isTaken, onToggle }) => {
    return (
        <div className={`timeline-item ${isTaken ? 'taken' : ''}`} onClick={onToggle}>
            <div className="time-column">
                <span className="time-text">{time}</span>
            </div>

            <div className="card">
                <div className="card-content">
                    <h3 className="med-name">{medicationName}</h3>
                    <p className="med-dose">{dosage}</p>
                </div>

                <div className={`checkbox ${isTaken ? 'checked' : ''}`}>
                    {isTaken && <Check size={20} color="white" />}
                </div>
            </div>
        </div>
    );
};

export default TimelineItem;
