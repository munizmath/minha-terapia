import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import '../support/SubPage.css';

const ThoughtRecord = () => {
    const navigate = useNavigate();
    const [thoughts, setThoughts] = useState(() => {
        const saved = localStorage.getItem('tcc_thoughts');
        return saved ? JSON.parse(saved) : [];
    });
    const [isAdding, setIsAdding] = useState(false);
    const [expandedIds, setExpandedIds] = useState([]);

    const [form, setForm] = useState({
        date: new Date().toISOString().slice(0, 16),
        situation: '',
        emotion: '',
        automaticThought: '',
        distortion: '',
        rationalResponse: '',
        outcome: ''
    });

    useEffect(() => {
        localStorage.setItem('tcc_thoughts', JSON.stringify(thoughts));
    }, [thoughts]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setThoughts([{ id: Date.now(), ...form }, ...thoughts]);
        setIsAdding(false);
        setForm({
            date: new Date().toISOString().slice(0, 16),
            situation: '', emotion: '', automaticThought: '', distortion: '', rationalResponse: '', outcome: ''
        });
    };

    const toggleExpand = (id) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const deleteThought = (id) => {
        if (window.confirm('Excluir este registro?')) setThoughts(thoughts.filter(t => t.id !== id));
    };

    const cognitiveDistortions = [
        "Catastrofização", "Pensamento Tudo-ou-Nada", "Filtro Mental",
        "Desqualificar o Positivo", "Leitura Mental", "Adivinhação",
        "Rotulação", "Personalização", "Deverias (Cobrança Excessiva)"
    ];

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => isAdding ? setIsAdding(false) : navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>{isAdding ? 'Novo R.P.D.' : 'Registro de Pensamentos'}</h1>
                {!isAdding && (
                    <button className="icon-btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={24} />
                    </button>
                )}
            </header>

            <div className="content-container">
                {isAdding ? (
                    <form onSubmit={handleSubmit} className="generic-form">
                        <div className="form-group">
                            <label>Data e Hora</label>
                            <input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Situação (Gatilho)</label>
                            <textarea
                                placeholder="O que aconteceu? Onde? Com quem?"
                                value={form.situation} onChange={e => setForm({ ...form, situation: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="form-group">
                            <label>Emoção (0-100%)</label>
                            <input
                                placeholder="Ex: Ansiedade 80%, Tristeza 50%"
                                value={form.emotion} onChange={e => setForm({ ...form, emotion: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Pensamento Automático</label>
                            <textarea
                                placeholder="O que passou pela sua cabeça?"
                                value={form.automaticThought} onChange={e => setForm({ ...form, automaticThought: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="form-group">
                            <label>Distorção Cognitiva</label>
                            <select value={form.distortion} onChange={e => setForm({ ...form, distortion: e.target.value })}>
                                <option value="">Selecione...</option>
                                {cognitiveDistortions.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Resposta Racional</label>
                            <textarea
                                placeholder="Qual outra forma de ver isso? Evidências contrárias?"
                                value={form.rationalResponse} onChange={e => setForm({ ...form, rationalResponse: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="form-group">
                            <label>Resultado (Reavaliação)</label>
                            <textarea
                                placeholder="Como se sente agora?"
                                value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })}
                                rows={2}
                            />
                        </div>
                        <button type="submit" className="save-btn"><Save size={20} /> Salvar Registro</button>
                    </form>
                ) : (
                    <div className="list-grid">
                        {thoughts.length === 0 ? <p className="empty-text">Nenhum pensamento registrado.</p> :
                            thoughts.map(t => (
                                <div key={t.id} className="contact-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                        <div onClick={() => toggleExpand(t.id)} style={{ flex: 1 }}>
                                            <span style={{ fontSize: 12, color: '#666' }}>{new Date(t.date).toLocaleDateString()}</span>
                                            <h3 style={{ fontSize: 16 }}>{t.situation.substring(0, 30)}...</h3>
                                        </div>
                                        <button className="icon-btn" onClick={() => toggleExpand(t.id)}>
                                            {expandedIds.includes(t.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>

                                    {expandedIds.includes(t.id) && (
                                        <div style={{ marginTop: 12, width: '100%', fontSize: 14 }}>
                                            <p><strong>Pensamento:</strong> {t.automaticThought}</p>
                                            <p><strong>Emoção:</strong> {t.emotion}</p>
                                            <p><strong>Distorção:</strong> {t.distortion}</p>
                                            <hr style={{ margin: '10px 0', borderColor: '#eee' }} />
                                            <p><strong>Resposta:</strong> {t.rationalResponse}</p>
                                            <p><strong>Resultado:</strong> {t.outcome}</p>
                                            <button className="delete-mini" onClick={() => deleteThought(t.id)} style={{ marginTop: 10, alignSelf: 'flex-end' }}>
                                                <Trash2 size={16} /> Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThoughtRecord;
