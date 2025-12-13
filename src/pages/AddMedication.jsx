import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle, X } from 'lucide-react';
import { useMedications } from '../context/MedicationContext';
import { commonMedications } from '../data/medicationsDb';
import { checkDrugInteractions, checkAllergy, getSeverityColor, getSeverityIcon } from '../services/drugInteractions';
import './AddMedication.css';

const AddMedication = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addMedication, updateMedication, medications } = useMedications();
    const editingMed = location.state?.med;

    // Carregar alergias do localStorage
    const [allergies] = useState(() => {
        const saved = localStorage.getItem('user_allergies');
        return saved ? JSON.parse(saved) : [];
    });

    const [interactions, setInteractions] = useState([]);
    const [hasAllergy, setHasAllergy] = useState(false);

    const [formData, setFormData] = useState(() => {
        if (editingMed) {
            return {
                name: editingMed.name || '',
                dosage: editingMed.dosage || '',
                time: editingMed.time || '08:00',
                frequency: editingMed.frequency || 'daily',
                intervalHours: editingMed.intervalHours || '',
                stock: editingMed.stock || '',
            };
        }
        return {
            name: '',
            dosage: '',
            time: '08:00',
            frequency: 'daily',
            intervalHours: '',
            stock: '',
        };
    });

    const handleChange = (e) => {
        const newData = { ...formData, [e.target.name]: e.target.value };
        setFormData(newData);

        // Verificar interações quando nome do medicamento mudar
        if (e.target.name === 'name' && newData.name) {
            // Verificar alergia
            const isAllergic = checkAllergy(newData.name, allergies);
            setHasAllergy(isAllergic);

            // Verificar interações com medicamentos existentes
            if (medications.length > 0) {
                const testMedications = [...medications, { name: newData.name }];
                const foundInteractions = checkDrugInteractions(testMedications);
                setInteractions(foundInteractions.filter(i => 
                    i.medication1 === newData.name || i.medication2 === newData.name
                ));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) return;

        // Alertar sobre alergia ou interação grave antes de salvar
        if (hasAllergy) {
            if (!window.confirm('⚠️ ATENÇÃO: Você tem alergia conhecida a este medicamento. Deseja continuar mesmo assim?')) {
                return;
            }
        }

        if (interactions.some(i => i.severity === 'grave')) {
            if (!window.confirm('⚠️ ATENÇÃO: Interação medicamentosa GRAVE detectada. Deseja continuar mesmo assim?')) {
                return;
            }
        }

        if (editingMed) {
            updateMedication(editingMed.id, formData);
        } else {
            addMedication(formData);
        }
        navigate('/');
    };

    return (
        <div className="add-medication-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>{editingMed ? 'Editar Medicamento' : 'Novo Medicamento'}</h1>
                <div style={{ width: 32 }}></div>
            </header>

            <form onSubmit={handleSubmit} className="med-form">
                {/* Alertas de Alergia */}
                {hasAllergy && (
                    <div style={{
                        padding: 12,
                        marginBottom: 16,
                        backgroundColor: '#ffebee',
                        border: '2px solid #d32f2f',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <AlertTriangle size={20} color="#d32f2f" />
                        <div style={{ flex: 1 }}>
                            <strong style={{ color: '#d32f2f' }}>ALERGIA CONHECIDA</strong>
                            <p style={{ margin: 4, fontSize: 14 }}>Você tem alergia registrada a este medicamento.</p>
                        </div>
                    </div>
                )}

                {/* Alertas de Interações */}
                {interactions.length > 0 && interactions.map((interaction, idx) => (
                    <div
                        key={idx}
                        style={{
                            padding: 12,
                            marginBottom: 16,
                            backgroundColor: interaction.severity === 'grave' ? '#ffebee' : '#fff3e0',
                            border: `2px solid ${getSeverityColor(interaction.severity)}`,
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}
                    >
                        <AlertTriangle size={20} color={getSeverityColor(interaction.severity)} />
                        <div style={{ flex: 1 }}>
                            <strong style={{ color: getSeverityColor(interaction.severity) }}>
                                {getSeverityIcon(interaction.severity)} INTERAÇÃO {interaction.severity.toUpperCase()}
                            </strong>
                            <p style={{ margin: 4, fontSize: 14 }}>
                                {interaction.medication1} + {interaction.medication2}: {interaction.description}
                            </p>
                        </div>
                    </div>
                ))}

                <div className="form-group">
                    <label>Nome do Medicamento</label>
                    <input
                        type="text"
                        name="name"
                        list="meds-list"
                        placeholder="Ex: Dipirona"
                        value={formData.name}
                        onChange={handleChange}
                        autoFocus
                        required
                        style={hasAllergy ? { borderColor: '#d32f2f', borderWidth: 2 } : {}}
                    />
                    <datalist id="meds-list">
                        {commonMedications.map(med => (
                            <option key={med} value={med} />
                        ))}
                    </datalist>
                </div>

                <div className="form-group">
                    <label>Frequência</label>
                    <select
                        name="frequency"
                        value={formData.frequency}
                        onChange={handleChange}
                    >
                        <option value="daily">Todos os dias</option>
                        <option value="every_other_day">Dia sim, dia não</option>
                        <option value="interval">Intervalo de Horas</option>
                    </select>
                </div>

                {formData.frequency === 'interval' && (
                    <div className="form-group">
                        <label>A cada quantas horas?</label>
                        <input
                            type="number"
                            name="intervalHours"
                            placeholder="Ex: 8"
                            value={formData.intervalHours}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div className="form-group">
                    <label>Dosagem</label>
                    <input
                        type="text"
                        name="dosage"
                        placeholder="Ex: 500mg"
                        value={formData.dosage}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Horário (1ª Dose)</label>
                    <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Estoque Atual (Opcional)</label>
                    <input
                        type="number"
                        name="stock"
                        placeholder="Ex: 30"
                        value={formData.stock}
                        onChange={handleChange}
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

export default AddMedication;
