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
    { id: 'laboratory', label: 'Exames Laboratoriais', icon: Droplet, unit: '-' },
    { id: 'body_measurements', label: 'Medidas Corporais', icon: Scale, unit: '-' }, // Unified Body
];

// Sub-types for the Laboratory Panel
const LAB_SECTIONS = [
    {
        title: "Destaques / Comuns",
        fields: [
            { id: 'glucose', label: 'Glicose (Glicemia)', unit: 'mg/dL' },
            { id: 'glucose_post', label: 'Glicemia (Pós-prandial)', unit: 'mg/dL' },
            { id: 'hba1c', label: 'Hemoglobina Glicada (HbA1c)', unit: '%' },
            { id: 'cholesterol_total', label: 'Colesterol Total', unit: 'mg/dL' },
            { id: 'triglycerides', label: 'Triglicerídeos', unit: 'mg/dL' },
            { id: 'creatinine', label: 'Creatinina', unit: 'mg/dL' },
            { id: 'inr', label: 'INR (Coagulação)', unit: '' },
            { id: 'ferritin', label: 'Ferritina', unit: 'ng/mL' },
        ]
    },
    {
        title: "Lipídios Detalhado",
        fields: [
            { id: 'cholesterol_hdl', label: 'Colesterol HDL', unit: 'mg/dL' },
            { id: 'cholesterol_ldl', label: 'Colesterol LDL', unit: 'mg/dL' },
            { id: 'apob', label: 'Apolipoproteína B (Apo B)', unit: 'mg/dL' },
            { id: 'lpa', label: 'Lipoproteína Lp(a)', unit: 'mg/dL' },
        ]
    },
    {
        title: "Fígado",
        fields: [
            { id: 'alt', label: 'ALT (Alanina aminotransferase)', unit: 'U/L' },
            { id: 'ast', label: 'AST (Aspartato aminotransferase)', unit: 'U/L' },
            { id: 'ggt', label: 'GGT (Gama-glutamil transferase)', unit: 'U/L' },
            { id: 'alp', label: 'Fosfatase Alcalina', unit: 'U/L' },
            { id: 'bilirubin', label: 'Bilirrubina', unit: 'mg/dL' },
            { id: 'albumin', label: 'Albumina', unit: 'g/dL' },
        ]
    },
    {
        title: "Rins e Metabolismo",
        fields: [
            { id: 'urea', label: 'Ureia', unit: 'mg/dL' },
            { id: 'gfr', label: 'Taxa de Filtração Glomerular (TFG)', unit: 'mL/min' },
            { id: 'uacr', label: 'Razão Albumina-Creatinina (uACR)', unit: 'mg/g' },
            { id: 'uric_acid', label: 'Ácido Úrico', unit: 'mg/dL' },
            { id: 'sodium', label: 'Sódio', unit: 'mEq/L' },
            { id: 'potassium', label: 'Potássio', unit: 'mEq/L' },
            { id: 'calcium', label: 'Cálcio', unit: 'mg/dL' },
            { id: 'lactate', label: 'Lactato', unit: 'mmol/L' },
            { id: 'glycosuria', label: 'Glicosúria', unit: '' },
        ]
    },
    {
        title: "Tireoide e Hormônios",
        fields: [
            { id: 'tsh', label: 'TSH', unit: 'mIU/L' },
            { id: 't4_free', label: 'T4 Livre', unit: 'ng/dL' },
            { id: 't3_free', label: 'T3 Livre', unit: 'pg/mL' },
            { id: 'psa', label: 'PSA', unit: 'ng/mL' },
        ]
    },
    {
        title: "Outros / Toxicológico",
        fields: [
            { id: 'pcr', label: 'PCR (Proteína C Reativa)', unit: 'mg/L' },
            { id: 'platelets', label: 'Plaquetas', unit: 'mil/mm³' },
            { id: 'cd4', label: 'CD4', unit: 'cél/mm³' },
            { id: 'viral_load', label: 'Carga Viral', unit: 'cópias/mL' },
            { id: 'vit_d', label: 'Vitamina D', unit: 'ng/mL' },
            { id: 'ck', label: 'Creatina Quinase (CK)', unit: 'U/L' },
            { id: 'lithium', label: 'Nível de Lítio', unit: 'mEq/L' },
            { id: 'alcohol_level', label: 'Nível de Álcool', unit: 'g/L' },
            { id: 'nicotine', label: 'Nicotina', unit: 'ng/mL' },
            { id: 'antifactor_xa', label: 'Anti-fator Xa', unit: 'UI/mL' },
        ]
    }
];

const BODY_SECTIONS = [
    {
        title: "Circunferências",
        fields: [
            { id: 'waist_circ', label: 'Cintura', unit: 'cm' },
            { id: 'chest_circ', label: 'Peito', unit: 'cm' },
            { id: 'biceps_circ', label: 'Bíceps', unit: 'cm' },
            { id: 'thigh_circ', label: 'Coxa (Meio)', unit: 'cm' },
        ]
    },
    {
        title: "Composição Corporal",
        fields: [
            { id: 'body_fat', label: '% Gordura Corporal', unit: '%' },
            { id: 'body_water', label: '% Água Corporal', unit: '%' },
            { id: 'bone_density', label: 'Densidade Óssea', unit: 'g/cm²' },
            { id: 'bmr', label: 'Taxa Metabólica Basal', unit: 'kcal' },
        ]
    },
    {
        title: "Função Respiratória",
        fields: [
            { id: 'resp_rate', label: 'Frequência Respiratória', unit: 'rpm' },
            { id: 'pef', label: 'Pico de Fluxo Expiratório (PFE)', unit: 'L/min' },
            { id: 'vital_capacity', label: 'Capacidade Vital', unit: 'L' },
            { id: 'resp_volume', label: 'Volume da Respiração', unit: 'L' },
        ]
    }
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

        if (type === 'laboratory' || type === 'body_measurements') {
            const sections = type === 'laboratory' ? LAB_SECTIONS : BODY_SECTIONS;
            // Save multiple entries
            let count = 0;
            sections.forEach(section => {
                section.fields.forEach(field => {
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
            });
            if (count === 0) return alert('Preencha pelo menos um campo para salvar.');
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

    // Render Laboratory or Body Form (Unified)
    if (type === 'laboratory' || type === 'body_measurements') {
        const sections = type === 'laboratory' ? LAB_SECTIONS : BODY_SECTIONS;
        const title = type === 'laboratory' ? 'Exames Laboratoriais' : 'Medidas Corporais';

        return (
            <div className="add-medication-page">
                <header className="page-header">
                    <button className="icon-btn" onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                    <h1>{title}</h1>
                    <div style={{ width: 32 }}></div>
                </header>

                <form onSubmit={handleSubmit} className="med-form" style={{ paddingBottom: 40 }}>
                    <div className="form-group">
                        <label>Data</label>
                        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>

                    {sections.map((section, idx) => (
                        <div key={idx} style={{ marginBottom: 24 }}>
                            <p className="section-title-small" style={{ marginBottom: 12, fontWeight: 600 }}>{section.title}</p>
                            {section.fields.map(field => (
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
