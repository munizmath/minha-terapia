import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, AlertTriangle } from 'lucide-react';
import './SubPage.css';

const Allergies = () => {
    const navigate = useNavigate();
    const [allergies, setAllergies] = useState(() => {
        const saved = localStorage.getItem('user_allergies');
        return saved ? JSON.parse(saved) : [];
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newAllergy, setNewAllergy] = useState('');

    useEffect(() => {
        localStorage.setItem('user_allergies', JSON.stringify(allergies));
    }, [allergies]);

    const handleAdd = (e) => {
        e.preventDefault();
        if (newAllergy.trim()) {
            setAllergies(prev => [...prev, newAllergy.trim()]);
            setNewAllergy('');
            setIsAdding(false);
        }
    };

    const handleRemove = (allergy) => {
        if (window.confirm(`Remover alergia a ${allergy}?`)) {
            setAllergies(prev => prev.filter(a => a !== allergy));
        }
    };

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Minhas Alergias</h1>
                {!isAdding && (
                    <button className="icon-btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={24} />
                    </button>
                )}
            </header>

            <div className="content-container">
                <div className="info-card" style={{ marginBottom: 24 }}>
                    <AlertTriangle size={32} color="#f57c00" />
                    <p style={{ marginTop: 12 }}>
                        Registre aqui suas alergias conhecidas. O sistema irá alertá-lo ao adicionar medicamentos que possam causar reações alérgicas.
                    </p>
                </div>

                {isAdding ? (
                    <form onSubmit={handleAdd} className="generic-form">
                        <div className="form-group">
                            <label>Nome da Substância/Medicamento</label>
                            <input
                                type="text"
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                                placeholder="Ex: Penicilina, Dipirona"
                                autoFocus
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                type="button"
                                className="action-btn secondary"
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewAllergy('');
                                }}
                                style={{ flex: 1 }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="action-btn primary"
                                style={{ flex: 1 }}
                            >
                                Adicionar
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="list-grid">
                        {allergies.length === 0 ? (
                            <p className="empty-text">Nenhuma alergia registrada.</p>
                        ) : (
                            allergies.map((allergy, idx) => (
                                <div key={idx} className="contact-card">
                                    <div className="contact-icon" style={{ backgroundColor: '#fff3e0' }}>
                                        <AlertTriangle size={24} color="#f57c00" />
                                    </div>
                                    <div className="contact-info">
                                        <h3>{allergy}</h3>
                                    </div>
                                    <button
                                        className="delete-mini"
                                        onClick={() => handleRemove(allergy)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Allergies;

