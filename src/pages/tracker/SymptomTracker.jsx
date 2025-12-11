import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Smile, Frown, Meh, Activity } from 'lucide-react';
import { useMedications } from '../../context/MedicationContext';
import '../support/SubPage.css';

const SymptomTracker = () => {
    const navigate = useNavigate();
    const { addSymptom } = useMedications();

    // Default categories from MyTherapy style
    const [selectedSymptom, setSelectedSymptom] = useState('Humor');
    const [severity, setSeverity] = useState(5); // 0-10 or 0-4 (Smiley)
    const [note, setNote] = useState('');

    const symptomsList = [
        'Humor', 'Dor', 'Dor de Cabeça', 'Febre', 'Náusea',
        'Tontura', 'Cansaço', 'Ansiedade', 'Qualidade do Sono',
        'Falta de Ar', 'Tosse', 'Dor de Garganta', 'Palpitações'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        addSymptom({
            name: selectedSymptom,
            severity,
            note,
            date: new Date().toISOString()
        });
        navigate(-1);
    };

    // Render logic for different input types
    const renderInput = () => {
        if (selectedSymptom === 'Humor' || selectedSymptom === 'Qualidade do Sono') {
            return (
                <div className="smiley-selector">
                    {[1, 2, 3, 4, 5].map(level => (
                        <button
                            key={level}
                            type="button"
                            className={`smiley-btn ${severity === level ? 'active' : ''}`}
                            onClick={() => setSeverity(level)}
                        >
                            {level === 1 ? <Frown color="#e53935" size={32} /> :
                                level === 3 ? <Meh color="#fbc02d" size={32} /> :
                                    level === 5 ? <Smile color="#43a047" size={32} /> :
                                        <span className="dot">{level}</span>}
                        </button>
                    ))}
                    <p className="mood-label">
                        {severity === 1 ? 'Péssimo' : severity === 5 ? 'Excelente' : 'Regular'}
                    </p>
                </div>
            );
        }
        return (
            <div className="slider-wrapper">
                <input
                    type="range"
                    min="0" max="10"
                    value={severity}
                    onChange={e => setSeverity(parseInt(e.target.value))}
                    className="severity-slider"
                />
                <div className="slider-labels">
                    <span>Leve (0)</span>
                    <span className="current-val">{severity}</span>
                    <span>Intenso (10)</span>
                </div>
            </div>
        );
    };

    return (
        <div className="sub-page">
            <header className="sub-header">
                <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={24} /></button>
                <h1>Registrar Sintoma</h1>
            </header>

            <div className="sub-content">
                <form onSubmit={handleSubmit} className="generic-form">

                    <div className="form-group">
                        <label>O que você sentiu?</label>
                        <div className="chips-container">
                            {symptomsList.map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    className={`choice-chip ${selectedSymptom === s ? 'active' : ''}`}
                                    onClick={() => setSelectedSymptom(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Intensidade / Estado</label>
                        {renderInput()}
                    </div>

                    <div className="form-group">
                        <label>Notas (Opcional)</label>
                        <textarea
                            rows="3"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Descreva melhor..."
                            className="styled-input"
                        ></textarea>
                    </div>

                    <button type="submit" className="action-btn primary">
                        <Save size={20} /> Salvar Registro
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SymptomTracker;
