import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pill, Trash2, AlertCircle } from 'lucide-react';
import { useMedications } from '../context/MedicationContext';
import './MedicationList.css';

const MedicationList = () => {
    const { medications, removeMedication } = useMedications();
    const navigate = useNavigate();

    const handleDelete = (id, name) => {
        if (window.confirm(`Tem certeza que deseja remover ${name}?`)) {
            removeMedication(id);
        }
    };

    return (
        <div className="medication-list-page">
            <header className="page-header">
                <h1>Minha Terapia</h1>
                <button className="icon-btn-primary" onClick={() => navigate('/medications/add')}>
                    <Plus size={24} />
                </button>
            </header>

            <div className="med-list-container">
                {medications.length === 0 ? (
                    <div className="empty-state">
                        <Pill size={48} color="var(--color-text-disabled)" />
                        <p>Nenhum medicamento cadastrado.</p>
                    </div>
                ) : (
                    medications.map(med => (
                        <div key={med.id} className="med-card">
                            <div className="med-info">
                                <h3>{med.name}</h3>
                                <p className="med-details">{med.dosage} • {med.time}</p>
                                {med.stock !== undefined && (
                                    <div className={`stock-badge ${med.stock < 5 ? 'low' : ''}`}>
                                        {med.stock < 5 && <AlertCircle size={12} />}
                                        <span>Estoque: {med.stock}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(med.id, med.name);
                                }}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MedicationList;
