import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Phone, MapPin, User, Stethoscope, Trash2, Save, Share2, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import './SubPage.css';

const Doctors = () => {
    const navigate = useNavigate();
    // Local state for demo. In real app, put in Context or separate DoctorsContext
    const [doctors, setDoctors] = useState(() => {
        const saved = localStorage.getItem('doctors');
        return saved ? JSON.parse(saved) : [];
    });

    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', specialty: '', phone: '', address: '' });

    const saveDoctor = (e) => {
        e.preventDefault();
        const newDoc = { ...formData, id: uuidv4() };
        const newDocs = [...doctors, newDoc];
        setDoctors(newDocs);
        localStorage.setItem('doctors', JSON.stringify(newDocs));
        setIsAdding(false);
        setFormData({ name: '', specialty: '', phone: '', address: '' });
    };

    const deleteDoctor = (id) => {
        if (window.confirm('Remover este médico?')) {
            const newDocs = doctors.filter(d => d.id !== id);
            setDoctors(newDocs);
            localStorage.setItem('doctors', JSON.stringify(newDocs));
        }
    };

    const handleExport = () => {
        if (doctors.length === 0) return;

        const text = doctors.map(d =>
            `*${d.name}* (${d.specialty})\n📞 ${d.phone}\n📍 ${d.address}`
        ).join('\n\n');

        const shareData = {
            title: 'Meus Médicos - Minha Terapia',
            text: text,
        };

        if (navigator.share) {
            navigator.share(shareData).catch(console.error);
        } else {
            // Fallback: Copy to clipboard or simple alert
            navigator.clipboard.writeText(text).then(() => {
                alert('Lista copiada para a área de transferência!');
            });
        }
    };

    const handleImport = async () => {
        if ('contacts' in navigator && 'ContactsManager' in window) {
            try {
                const props = ['name', 'tel', 'address'];
                const contacts = await navigator.contacts.select(props, { multiple: true });

                const importedDocs = contacts.map(c => ({
                    id: uuidv4(),
                    name: c.name[0] || 'Sem nome',
                    specialty: 'Importado',
                    phone: c.tel ? c.tel[0] : '',
                    address: c.address ? c.address[0].addressLine[0] : '' // Address format varies
                }));

                const newDocs = [...doctors, ...importedDocs];
                setDoctors(newDocs);
                localStorage.setItem('doctors', JSON.stringify(newDocs));
                alert(`${importedDocs.length} contatos importados!`);
            } catch (ex) {
                // User cancelled or error
                console.error(ex);
            }
        } else {
            alert('Seu navegador não suporta importação direta de contatos.');
        }
    };

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => isAdding ? setIsAdding(false) : navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>{isAdding ? 'Novo Médico' : 'Meus Médicos'}</h1>
                {!isAdding && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="icon-btn" onClick={handleImport} title="Importar Contatos">
                            <Download size={24} color="var(--color-primary)" />
                        </button>
                        <button className="icon-btn" onClick={handleExport} title="Exportar">
                            <Share2 size={24} color="var(--color-primary)" />
                        </button>
                        <button className="icon-btn-primary" onClick={() => setIsAdding(true)}>
                            <Plus size={24} />
                        </button>
                    </div>
                )}
            </header>

            <div className="content-container">
                {isAdding ? (
                    <form onSubmit={saveDoctor} className="generic-form">
                        <div className="form-group">
                            <label><User size={16} /> Nome</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Dr. Silva"
                            />
                        </div>
                        <div className="form-group">
                            <label><Stethoscope size={16} /> Especialidade</label>
                            <input
                                value={formData.specialty}
                                onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                                placeholder="Cardiologista"
                            />
                        </div>
                        <div className="form-group">
                            <label><Phone size={16} /> Telefone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                        <div className="form-group">
                            <label><MapPin size={16} /> Endereço</label>
                            <input
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Av. Paulista, 1000"
                            />
                        </div>
                        <button type="submit" className="save-btn">
                            <Save size={20} /> Salvar
                        </button>
                    </form>
                ) : (
                    <div className="list-grid">
                        {doctors.length === 0 ? (
                            <p className="empty-text">Nenhum médico cadastrado.</p>
                        ) : (
                            doctors.map(doc => (
                                <div key={doc.id} className="contact-card">
                                    <div className="contact-icon">
                                        <Stethoscope size={24} color="white" />
                                    </div>
                                    <div className="contact-info">
                                        <h3>{doc.name}</h3>
                                        <p className="specialty">{doc.specialty}</p>
                                        {doc.phone && (
                                            <a href={`tel:${doc.phone}`} className="contact-link">
                                                <Phone size={14} /> {doc.phone}
                                            </a>
                                        )}
                                    </div>
                                    <button className="delete-mini" onClick={() => deleteDoctor(doc.id)}>
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

export default Doctors;
