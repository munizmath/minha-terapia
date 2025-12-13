import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pill, Trash2, AlertCircle, Edit2 } from 'lucide-react';
import { useMedications } from '../context/MedicationContext';
import { generateDailySchedule } from '../utils/scheduler';
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
                                <div className="med-schedule-details" style={{ marginTop: 4 }}>
                                    {(() => {
                                        const schedule = generateDailySchedule([med], new Date());
                                        const times = schedule.map(s => s.time).sort().join(' - ');
                                        return (
                                            <p className="med-times" style={{ fontSize: '13px', color: '#555', marginBottom: 4 }}>
                                                • {times}
                                            </p>
                                        );
                                    })()}
                                </div>
                                <p className="med-details" style={{ fontSize: '12px', color: '#888' }}>{med.dosage}</p>

                                {med.stock !== undefined && (
                                    <div className={`stock-badge ${med.stock < 5 ? 'low' : ''}`} style={{ marginTop: 8 }}>
                                        {med.stock < 5 && <AlertCircle size={12} />}
                                        <span>Estoque: {med.stock}</span>
                                    </div>
                                )}
                            </div>
                            <div className="card-actions">
                                <button
                                    className="edit-btn"
                                    onClick={() => navigate('/medications/add', { state: { med } })}
                                    style={{ marginRight: 8, background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <Edit2 size={20} color="#666" />
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(med.id, med.name);
                                    }}
                                >
                                    <Trash2 size={20} color="#ff5252" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MedicationList;
