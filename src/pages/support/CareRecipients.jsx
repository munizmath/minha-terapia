import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Plus, X, Heart } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import './SubPage.css';

const CareRecipients = () => {
    const navigate = useNavigate();
    const [recipients, setRecipients] = useState(() => {
        const saved = localStorage.getItem('care_recipients');
        return saved ? JSON.parse(saved) : [{ id: 'me', name: 'Eu (Principal)' }];
    });

    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        localStorage.setItem('care_recipients', JSON.stringify(recipients));
    }, [recipients]);

    const handleSave = (e) => {
        e.preventDefault();
        if (!newName) return;

        if (editingId) {
            setRecipients(recipients.map(r => r.id === editingId ? { ...r, name: newName } : r));
        } else {
            setRecipients([...recipients, { id: uuidv4(), name: newName }]);
        }

        setNewName('');
        setEditingId(null);
        setShowAdd(false);
    };

    const editRecipient = (r) => {
        if (r.id === 'me') return;
        setNewName(r.name);
        setEditingId(r.id);
        setShowAdd(true);
    };

    const removeRecipient = (id) => {
        if (id === 'me') return alert('Não é possível remover o perfil principal.');
        if (window.confirm('Remover este perfil?')) {
            setRecipients(recipients.filter(r => r.id !== id));
        }
    };

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Destinatários de Cuidados</h1>
            </header>

            <div className="sub-content">
                <div className="info-card">
                    <Heart size={32} color="var(--color-primary)" />
                    <p>Gerencie quem está recebendo os cuidados neste aplicativo.</p>
                </div>

                <div className="contact-list">
                    {recipients.map(r => (
                        <div key={r.id} className="contact-card">
                            <div className="contact-icon">
                                <User size={24} color="var(--color-primary-dark)" />
                            </div>
                            <div className="contact-info" onClick={() => editRecipient(r)} style={{ cursor: 'pointer' }}>
                                <h3>{r.name}</h3>
                                {r.id !== 'me' && <p className="specialty" style={{ fontSize: 11 }}>Toque para editar</p>}
                            </div>
                            {r.id !== 'me' && (
                                <button className="delete-mini" onClick={() => removeRecipient(r.id)}>
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {showAdd ? (
                    <form onSubmit={handleSave} className="generic-form" style={{ marginTop: 16 }}>
                        <h3>{editingId ? 'Editar Nome' : 'Novo Dependente'}</h3>
                        <input
                            type="text"
                            placeholder="Nome da pessoa"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" className="action-btn secondary" onClick={() => { setShowAdd(false); setEditingId(null); setNewName(''); }}>Cancelar</button>
                            <button type="submit" className="action-btn primary">Salvar</button>
                        </div>
                    </form>
                ) : (
                    <button className="action-btn primary" onClick={() => { setNewName(''); setEditingId(null); setShowAdd(true); }} style={{ marginTop: 24, justifyContent: 'center' }}>
                        <Plus size={24} /> Adicionar Pessoa
                    </button>
                )}

            </div>
        </div>
    );
};

export default CareRecipients;
