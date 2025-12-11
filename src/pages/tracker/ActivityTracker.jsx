import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Watch, Activity } from 'lucide-react';
import { useMedications } from '../../context/MedicationContext';
import '../support/SubPage.css';

const ActivityTracker = () => {
    const navigate = useNavigate();
    const { addActivity } = useMedications();

    const [name, setName] = useState('Caminhada');
    const [duration, setDuration] = useState(30);
    const [customName, setCustomName] = useState('');

    const activities = [
        'Caminhada', 'Corrida', 'Ciclismo', 'Natação',
        'Musculação', 'Yoga', 'Pilates', 'Alongamento',
        'Fisioterapia', 'Dança', 'Futebol', 'Vôlei'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        addActivity({
            name: name === 'Outro' ? customName : name,
            duration,
            date: new Date().toISOString()
        });
        navigate(-1);
    };

    return (
        <div className="sub-page">
            <header className="sub-header">
                <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={24} /></button>
                <h1>Atividade Física</h1>
            </header>

            <div className="sub-content">
                <form onSubmit={handleSubmit} className="generic-form">

                    <div className="form-group">
                        <label>Tipo de Atividade</label>
                        <div className="chips-container">
                            {activities.map(a => (
                                <button
                                    key={a}
                                    type="button"
                                    className={`choice-chip ${name === a ? 'active' : ''}`}
                                    onClick={() => setName(a)}
                                >
                                    {a}
                                </button>
                            ))}
                            <button
                                type="button"
                                className={`choice-chip ${name === 'Outro' ? 'active' : ''}`}
                                onClick={() => setName('Outro')}
                            >
                                Outro
                            </button>
                        </div>
                    </div>

                    {name === 'Outro' && (
                        <div className="form-group">
                            <label>Qual atividade?</label>
                            <input
                                className="styled-input"
                                value={customName}
                                onChange={e => setCustomName(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Duração (minutos)</label>
                        <div className="duration-input-wrapper">
                            <Watch size={20} />
                            <input
                                type="number"
                                className="styled-input"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                                style={{ paddingLeft: 36 }}
                            />
                        </div>
                        <div className="slider-wrapper" style={{ marginTop: 12 }}>
                            <input
                                type="range" min="5" max="120" step="5"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                                className="severity-slider"
                            />
                        </div>
                    </div>

                    <button type="submit" className="action-btn primary">
                        <Save size={20} /> Salvar Atividade
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ActivityTracker;
