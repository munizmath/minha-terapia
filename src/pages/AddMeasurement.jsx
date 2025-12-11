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
    { id: 'oxygen', label: 'Saturação (SpO2)', icon: Activity, unit: '%' },
    { id: 'laboratory', label: 'Exames Laboratoriais', icon: Droplet, unit: '-' }, // Unified Generic
];

// Sub-types for the Laboratory Panel
const LAB_FIELDS = [
    { id: 'glucose', label: 'Glicemia', unit: 'mg/dL' },
    { id: 'cholesterol_total', label: 'Colesterol Total', unit: 'mg/dL' },
    { id: 'cholesterol_hdl', label: 'Colesterol HDL', unit: 'mg/dL' },
    { id: 'cholesterol_ldl', label: 'Colesterol LDL', unit: 'mg/dL' },
    { id: 'triglycerides', label: 'Triglicerídeos', unit: 'mg/dL' },
    { id: 'hba1c', label: 'Hemoglobina Glicada', unit: '%' },
    { id: 'tsh', label: 'TSH', unit: 'mIU/L' },
    { id: 'creatinine', label: 'Creatinina', unit: 'mg/dL' },
    { id: 'urea', label: 'Ureia', unit: 'mg/dL' },
    { id: 'inr', label: 'INR', unit: '' },
    { id: 'pcr', label: 'PCR', unit: 'mg/L' },
    { id: 'vit_d', label: 'Vitamina D', unit: 'ng/mL' },
    { id: 'vit_b12', label: 'Vitamina B12', unit: 'pg/mL' }
];

const AddMeasurement = () => {
    const navigate = useNavigate();
    const { addMeasurement } = useMedications();

    const [type, setType] = useState('blood_pressure');

    // State to hold all possible values. 
    // For single types (weight, etc.), we update 'val'. 
    // For BP, we use 'sys'/'dia'.
    // For Lab, we use the specific keys from LAB_FIELDS.
    const [values, setValues] = useState({});
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16));

    const handleSubmit = (e) => {
        e.preventDefault();

        if (type === 'laboratory') {
            // Save multiple entries
            let count = 0;
            LAB_FIELDS.forEach(field => {
                if (values[field.id]) {
                    addMeasurement({
                        type: 'measurement',
                        subtype: field.id,
                        value: values[field.id],
                        unit: field.unit,
                        date: date
                    });
                    count++;
                }
            });
            if (count === 0) return alert('Preencha pelo menos um campo.');
            navigate('/');
        } else {
            // Single Entry Logic
            let payload = {
                type: 'measurement',
                subtype: type,
                date: date,
                unit: MEASUREMENT_TYPES.find(t => t.id === type).unit
            };

            if (type === 'blood_pressure') {
                if (!values.sys || !values.dia) return;
                payload.value = `${values.sys}/${values.dia}`;
            } else {
                if (!values.val) return;
                payload.value = values.val;
            }

            addMeasurement(payload);
            navigate('/');
        }
    };

    const handleValueChange = (key, val) => {
        setValues(prev => ({ ...prev, [key]: val }));
    };

    const SelectedIcon = MEASUREMENT_TYPES.find(t => t.id === type).icon;

    // Render Laboratory Form
    if (type === 'laboratory') {
        return (
            <div className="add-medication-page">
                <header className="page-header">
                    <button className="icon-btn" onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                    <h1>Exames Laboratoriais</h1>
                    <div style={{ width: 32 }}></div>
                </header>

                <form onSubmit={handleSubmit} className="med-form" style={{ paddingBottom: 40 }}>
                    <div className="form-group">
                        <label>Data dos Resultados</label>
                        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>

                    <p className="section-title-small">Preencha os valores disponíveis:</p>

                    {LAB_FIELDS.map(field => (
                        <div key={field.id} className="form-group small-group">
                            <label>{field.label} <small>({field.unit})</small></label>
                            <input
                                type="number"
                                step="any"
                                placeholder="--"
                                value={values[field.id] || ''}
                                onChange={e => handleValueChange(field.id, e.target.value)}
                            />
                        </div>
                    ))}

                    <button type="submit" className="save-btn">
                        <Save size={20} /> Salvar Tudo
                    </button>
                </form>
            </div>
        );
    }

    // Render Single Type Form
    return (
        <div className="add-medication-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>Nova Medida</h1>
                <div style={{ width: 32 }}></div>
            </header>

            <form onSubmit={handleSubmit} className="med-form">

                {/* Type Selector */}
                <div className="type-scroll" style={{ flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 8 }}>
                    {MEASUREMENT_TYPES.map(t => (
                        <button
                            key={t.id}
                            type="button"
                            className={`type-chip ${type === t.id ? 'active' : ''}`}
                            onClick={() => {
                                setType(t.id);
                                setValues({}); // Reset values on swap
                            }}
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
                                    value={values.sys || ''}
                                    onChange={e => handleValueChange('sys', e.target.value)}
                                    placeholder="120"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label>Diastólica</label>
                                <input
                                    type="number"
                                    value={values.dia || ''}
                                    onChange={e => handleValueChange('dia', e.target.value)}
                                    placeholder="80"
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label>Valor ({MEASUREMENT_TYPES.find(t => t.id === type).unit})</label>
                            <input
                                type="number"
                                step="any"
                                value={values.val || ''}
                                onChange={e => handleValueChange('val', e.target.value)}
                                placeholder="Digite o valor"
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
                    <Save size={20} /> Salvar
                </button>
            </form>
        </div>
    );
};

export default AddMeasurement;
