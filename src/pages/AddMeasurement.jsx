import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Activity, Scale, Heart, Thermometer, Droplet } from 'lucide-react';
import { useMedications } from '../context/MedicationContext';
import './AddMedication.css'; // Reusing styles

const MEASUREMENT_TYPES = [
    { id: 'blood_pressure', label: 'Pressão Arterial', icon: Activity, unit: 'mmHg' },
    { id: 'weight', label: 'Peso Corporal', icon: Scale, unit: 'kg' },
    { id: 'heart_rate', label: 'Frequência Cardíaca', icon: Heart, unit: 'bpm' },
    { id: 'temperature', label: 'Temperatura', icon: Thermometer, unit: '°C' },
    { id: 'glucose', label: 'Glicemia', icon: Droplet, unit: 'mg/dL' },
];

const AddMeasurement = () => {
    const navigate = useNavigate();
    const { addMeasurement } = useMedications();

    const [type, setType] = useState('blood_pressure');
    const [values, setValues] = useState({ sys: '', dia: '', val: '' });
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16));

    const handleSubmit = (e) => {
        e.preventDefault();

        // Format payload
        let payload = {
            type: 'measurement',
            subtype: type,
            date: date,
            unit: MEASUREMENT_TYPES.find(t => t.id === type).unit
        };

        if (type === 'blood_pressure') {
            payload.value = `${values.sys}/${values.dia}`;
        } else {
            payload.value = values.val;
        }

        addMeasurement(payload);
        navigate('/');
    };

    const SelectedIcon = MEASUREMENT_TYPES.find(t => t.id === type).icon;

    return (
        <div className="add-medication-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Nova Medida</h1>
                <div style={{ width: 32 }}></div>
            </header>

            <form onSubmit={handleSubmit} className="med-form">

                {/* Type Selector (Simple Tabs) */}
                <div className="type-scroll">
                    {MEASUREMENT_TYPES.map(t => (
                        <button
                            key={t.id}
                            type="button"
                            className={`type-chip ${type === t.id ? 'active' : ''}`}
                            onClick={() => setType(t.id)}
                        >
                            <t.icon size={18} />
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="form-group" style={{ marginTop: 24, textAlign: 'center' }}>
                    <SelectedIcon size={48} color="var(--color-primary)" style={{ marginBottom: 16 }} />

                    {type === 'blood_pressure' ? (
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div>
                                <label>Sistólica</label>
                                <input
                                    type="number"
                                    value={values.sys}
                                    onChange={e => setValues({ ...values, sys: e.target.value })}
                                    placeholder="120"
                                    required
                                />
                            </div>
                            <div>
                                <label>Diastólica</label>
                                <input
                                    type="number"
                                    value={values.dia}
                                    onChange={e => setValues({ ...values, dia: e.target.value })}
                                    placeholder="80"
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label>Valor ({MEASUREMENT_TYPES.find(t => t.id === type).unit})</label>
                            <input
                                type="number"
                                step="0.1"
                                value={values.val}
                                onChange={e => setValues({ ...values, val: e.target.value })}
                                placeholder="Digite o valor"
                                required
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Data e Hora</label>
                    <input
                        type="datetime-local"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="save-btn">
                    <Save size={20} />
                    Salvar
                </button>
            </form>
        </div>
    );
};

export default AddMeasurement;
