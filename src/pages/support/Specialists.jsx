import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Phone, MapPin, User, Stethoscope, Trash2, Save, Share2, Download, Mail, Edit2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import './SubPage.css';

const Doctors = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState(() => {
        const saved = localStorage.getItem('doctors');
        return saved ? JSON.parse(saved) : [];
    });

    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', specialty: '', phone: '', address: '', email: '' });

    const saveDoctor = (e) => {
        e.preventDefault();
        let newDocs;
        if (formData.id) {
            // Update existing
            newDocs = doctors.map(d => d.id === formData.id ? formData : d);
        } else {
            // Create new
            const newDoc = { ...formData, id: uuidv4() };
            newDocs = [...doctors, newDoc];
        }
        setDoctors(newDocs);
        localStorage.setItem('doctors', JSON.stringify(newDocs));
        setIsAdding(false);
        setFormData({ id: null, name: '', specialty: '', phone: '', address: '', email: '' });
    };

    const editDoctor = (doc) => {
        setFormData(doc);
        setIsAdding(true);
    };

    const deleteDoctor = (id) => {
        if (window.confirm('Remover este especialista?')) {
            const newDocs = doctors.filter(d => d.id !== id);
            setDoctors(newDocs);
            localStorage.setItem('doctors', JSON.stringify(newDocs));
        }
    };

    const handleExport = () => {
        if (doctors.length === 0) return;

        const text = doctors.map(d =>
            `*${d.name}* (${d.specialty})\n📞 ${d.phone}\n📧 ${d.email || ''}\n📍 ${d.address}`
        ).join('\n\n');

        const shareData = {
            title: 'Meus Especialistas - Minha Terapia',
            text: text,
        };

        if (navigator.share) {
            navigator.share(shareData).catch(console.error);
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert('Lista copiada para a área de transferência!');
            });
        }
    };

    const handleImport = async () => {
        if ('contacts' in navigator && 'ContactsManager' in window) {
            try {
                const props = ['name', 'tel', 'address', 'email'];
                const contacts = await navigator.contacts.select(props, { multiple: true });

                const importedDocs = contacts.map(c => ({
                    id: uuidv4(),
                    name: c.name[0] || 'Sem nome',
                    specialty: 'Importado (Edite para alterar)',
                    phone: c.tel ? c.tel[0] : '',
                    address: c.address ? c.address[0].addressLine[0] : '',
                    email: c.email ? c.email[0] : ''
                }));

                const newDocs = [...doctors, ...importedDocs];
                setDoctors(newDocs);
                localStorage.setItem('doctors', JSON.stringify(newDocs));
                alert(`${importedDocs.length} contatos importados! Edite-os para definir a especialidade.`);
            } catch (ex) {
                console.error(ex);
            }
        } else {
            alert('Seu navegador não suporta importação direta de contatos.');
        }
    };

    const specialties = [
        "Acupuntura", "Alergia e Imunologia", "Análises Clínicas", "Anatomia Patológica", "Anestesiologia", "Angiologia", "Arteterapia",
        "Biomedicina", "Bioquímica",
        "Cardiologia", "Cardiologia Pediátrica", "Cirurgia Bariátrica", "Cirurgia Buco-Maxilo-Facial", "Cirurgia Cardiovascular", "Cirurgia da Mão", "Cirurgia de Cabeça e Pescoço", "Cirurgia do Aparelho Digestivo", "Cirurgia Geral", "Cirurgia Oncológica", "Cirurgia Pediátrica", "Cirurgia Plástica", "Cirurgia Torácica", "Cirurgia Vascular", "Clínica Geral / Médica", "Coloproctologia", "Cuidador de Idosos",
        "Dentística (Restauradora)", "Dermatologia", "Disfunção Temporomandibular (DTM)", "Dor Orofacial", "Doula", "Drenagem Linfática",
        "Ecografia", "Educação Física", "Endocrinologia e Metabologia", "Endodontia (Canal)", "Endoscopia", "Enfermagem", "Estética", "Estomatologia",
        "Farmácia", "Fisiatria", "Fisioterapia", "Fisioterapia Dermato-Funcional", "Fisioterapia Esportiva", "Fisioterapia Neurológica", "Fisioterapia Pélvica", "Fisioterapia Respiratória", "Fonoaudiologia",
        "Gastroenterologia", "Genética Médica", "Geriatria", "Gerontologia", "Ginecologia e Obstetrícia",
        "Harmonização Orofacial", "Hematologia e Hemoterapia", "Hepatologia", "Homeopatia",
        "Implantodontia", "Infectologia", "Instrumentação Cirúrgica",
        "Mamografia", "Massoterapia", "Mastologia", "Medicina de Emergência", "Medicina de Família e Comunidade", "Medicina do Sono", "Medicina do Trabalho", "Medicina do Tráfego", "Medicina Esportiva", "Medicina Física e Reabilitação", "Medicina Hiperbárica", "Medicina Intensiva (UTI)", "Medicina Legal e Perícia", "Medicina Nuclear", "Medicina Paliativa", "Medicina Preventiva e Social", "Musicoterapia",
        "Naturopatia", "Nefrologia", "Neurocirurgia", "Neurologia", "Neuropediatria", "Neuropsicologia", "Nutrição", "Nutrição Clínica", "Nutrição Esportiva", "Nutrologia",
        "Obstetrícia", "Odontogeriatria", "Odontologia", "Odontologia do Esporte", "Odontologia do Trabalho", "Odontologia Estética", "Odontologia Hospitalar", "Odontologia Legal", "Odontologia para Pacientes Especiais", "Odontopediatria", "Oftalmologia", "Oncologia Clínica", "Optometria", "Ortodontia", "Ortopedia e Traumatologia", "Ortopedia Funcional dos Maxilares", "Ortóptica", "Osteopatia", "Otorrinolaringologia",
        "Patologia", "Patologia Clínica", "Patologia Oral e Maxilo Facial", "Pediatria", "Periodontia (Gengiva)", "Personal Trainer", "Pilates", "Pneumologia", "Podologia", "Prótese Buco-Maxilo-Facial", "Prótese Dentária", "Psicanálise", "Psicologia", "Psicologia Hospitalar", "Psicopedagogia", "Psiquiatria", "Psiquiatria da Infância e Adolescência",
        "Quiropraxia",
        "Radiologia e Diagnóstico por Imagem", "Radiologia Intervencionista", "Radiologia Odontológica", "Radioterapia", "Reflexologia", "Reprodução Humana", "Reumatologia",
        "Saúde Coletiva", "Saúde da Família", "Sexologia",
        "Técnico de Enfermagem", "Terapia Holística", "Terapia Ocupacional", "Toxicologia",
        "Ultrassonografia", "Urologia",
        "Yoga"
    ].sort();

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => { setIsAdding(false); setFormData({ id: null, name: '', specialty: '', phone: '', address: '', email: '' }); navigate(-1); }}>
                    <ArrowLeft size={24} />
                </button>
                <h1>{isAdding ? (formData.id ? 'Editar Especialista' : 'Novo Especialista') : 'Meus Especialistas'}</h1>
                {!isAdding && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="icon-btn" onClick={handleImport} title="Importar Contatos">
                            <Download size={24} color="var(--color-primary)" />
                        </button>
                        <button className="icon-btn" onClick={handleExport} title="Exportar">
                            <Share2 size={24} color="var(--color-primary)" />
                        </button>
                        <button className="icon-btn-primary" onClick={() => { setFormData({ id: null, name: '', specialty: '', phone: '', address: '', email: '' }); setIsAdding(true); }}>
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
                                placeholder="Nome do Especialista"
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label><Stethoscope size={16} /> Especialidade</label>
                            <input
                                value={formData.specialty}
                                onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                                placeholder="Ex: Cardiologista"
                                list="specialty-list"
                            />
                            <datalist id="specialty-list">
                                {specialties.map(s => <option key={s} value={s} />)}
                            </datalist>
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
                            <label><Mail size={16} /> E-mail</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@exemplo.com"
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
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" className="icon-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsAdding(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className="save-btn" style={{ flex: 2 }}>
                                <Save size={20} /> Salvar
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="list-grid">
                        {doctors.length === 0 ? (
                            <p className="empty-text">Nenhum especialista cadastrado.</p>
                        ) : (
                            doctors.map(doc => (
                                <div key={doc.id} className="contact-card">
                                    <div className="contact-icon">
                                        <Stethoscope size={24} color="white" />
                                    </div>
                                    <div className="contact-info" onClick={() => editDoctor(doc)} style={{ cursor: 'pointer' }}>
                                        <h3>{doc.name}</h3>
                                        <p className="specialty">{doc.specialty}</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                                            {doc.phone && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>
                                                    <Phone size={12} /> {doc.phone}
                                                </span>
                                            )}
                                            {doc.email && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>
                                                    <Mail size={12} /> {doc.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <button className="icon-btn" onClick={() => editDoctor(doc)} style={{ padding: 6 }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="delete-mini" onClick={() => deleteDoctor(doc.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
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
