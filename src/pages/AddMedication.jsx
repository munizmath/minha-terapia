import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useMedications } from '../context/MedicationContext';
import './AddMedication.css';

const AddMedication = () => {
    const navigate = useNavigate();
    const { addMedication } = useMedications();

    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        time: '08:00',
        frequency: 'daily',
        intervalHours: '',
        stock: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) return;

        addMedication(formData);
        navigate('/');
    };

    return (
        <div className="add-medication-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Novo Medicamento</h1>
                <div style={{ width: 32 }}></div>
            </header>

            <form onSubmit={handleSubmit} className="med-form">
                <div className="form-group">
                    <label>Nome do Medicamento</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Ex: Dipirona"
                        value={formData.name}
                        onChange={handleChange}
                        autoFocus
                        required
                    />
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
