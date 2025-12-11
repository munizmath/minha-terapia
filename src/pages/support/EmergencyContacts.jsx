import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Plus, X, Import, Ambulance } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import './SubPage.css';

const EmergencyContacts = () => {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState(() => {
        const saved = localStorage.getItem('emergency_contacts');
        return saved ? JSON.parse(saved) : [];
    });

    const [showAdd, setShowAdd] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '' });

    useEffect(() => {
        localStorage.setItem('emergency_contacts', JSON.stringify(contacts));
    }, [contacts]);

    const handleSave = (e) => {
        e.preventDefault();
        if (!newContact.name || !newContact.phone) return;

        setContacts([...contacts, { ...newContact, id: uuidv4() }]);
        setNewContact({ name: '', phone: '' });
        setShowAdd(false);
    };

    const removeContact = (id) => {
        if (window.confirm('Remover este contato?')) {
            setContacts(contacts.filter(c => c.id !== id));
        }
    };

    const handleImport = async () => {
        try {
            const props = ['name', 'tel'];
            const opts = { multiple: false };

            if (!('contacts' in navigator && 'ContactsManager' in window)) {
                alert('Seu navegador não suporta importação de contatos (Web Contact Picker API). Tente usar o Chrome no Android.');
                return;
            }

            const contacts = await navigator.contacts.select(props, opts);

            if (contacts.length > 0) {
                const imported = contacts[0];
                const name = imported.name && imported.name.length > 0 ? imported.name[0] : 'Sem Nome';
                const phone = imported.tel && imported.tel.length > 0 ? imported.tel[0] : '';

                if (phone) {
                    setNewContact({ name, phone });
                    setShowAdd(true);
                } else {
                    alert('O contato selecionado não tem número de telefone.');
                }
            }
        } catch (err) {
            console.error(err);
            // User might have cancelled
        }
    };

    return (
        <div className="sub-page">
            <header className="sub-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={24} />
                </button>
                <h1>Números Importantes</h1>
            </header>

            <div className="sub-content">
                <div className="info-card">
                    <Ambulance size={32} color="#e53935" />
                    <p>Tenha acesso rápido a contatos de emergência. Toque no ícone para ligar.</p>
                </div>

                <div className="contact-list">
                    {contacts.length === 0 && <p className="empty-text">Nenhum contato salvo.</p>}

                    {contacts.map(c => (
                        <div key={c.id} className="contact-card">
                            <a href={`tel:${c.phone}`} className="contact-icon" style={{ backgroundColor: '#ffebee' }}>
                                <Phone size={24} color="#d32f2f" />
                            </a>
                            <div className="contact-info">
                                <h3>{c.name}</h3>
                                <p className="specialty">{c.phone}</p>
                            </div>
                            <button className="delete-mini" onClick={() => removeContact(c.id)}>
                                <X size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                {showAdd ? (
                    <form onSubmit={handleSave} className="generic-form" style={{ marginTop: 16 }}>
                        <h3>Novo Contato</h3>
                        <input
                            type="text"
                            placeholder="Nome (Ex: Ambulância, Filho)"
                            value={newContact.name}
                            onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                            autoFocus
                        />
                        <input
                            type="tel"
                            placeholder="Telefone"
                            value={newContact.phone}
                            onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" className="action-btn secondary" onClick={() => setShowAdd(false)}>Cancelar</button>
                            <button type="submit" className="action-btn primary">Salvar</button>
                        </div>
                    </form>
                ) : (
                    <div className="action-buttons-stack">
                        <button className="action-btn primary" onClick={() => setShowAdd(true)}>
                            <div className="icon-box">
                                <Plus size={24} />
                            </div>
                            <div className="text-box">
                                <h3>Adicionar Manualmente</h3>
                            </div>
                        </button>

                        <button className="action-btn secondary" onClick={handleImport}>
                            <div className="icon-box">
                                <Import size={24} />
                            </div>
                            <div className="text-box">
                                <h3>Importar da Agenda</h3>
                                <p>Copiar contato do celular</p>
                            </div>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default EmergencyContacts;
