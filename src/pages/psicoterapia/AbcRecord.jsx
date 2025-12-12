import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import '../support/SubPage.css';

const AbcRecord = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState(() => {
        const saved = localStorage.getItem('tcc_abc');
        return saved ? JSON.parse(saved) : [];
    });
    const [isAdding, setIsAdding] = useState(false);
    const [expandedIds, setExpandedIds] = useState([]);

    const [form, setForm] = useState({
        date: new Date().toISOString().slice(0, 16),
        antecedent: '',
        behavior: '',
        consequence: ''
    });

    useEffect(() => {
        localStorage.setItem('tcc_abc', JSON.stringify(records));
    }, [records]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setRecords([{ id: Date.now(), ...form }, ...records]);
        setIsAdding(false);
        setForm({
            date: new Date().toISOString().slice(0, 16),
            antecedent: '',
            behavior: '',
            consequence: ''
        });
    };

    const toggleExpand = (id) => {
        setExpandedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const deleteRecord = (id) => {
        if(window.confirm('Excluir este registro?')) setRecords(records.filter(r => r.id !== id));
    };

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => isAdding ? setIsAdding(false) : navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>{isAdding ? 'Novo Registro ABC' : 'Registro ABC'}</h1>
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
                            <input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                        </div>
                        
                        {/* A - Antecedent */}
                        <div className="form-group">
                            <label>1. Situação Anterior (A)</label>
                            <p className="field-hint">Qual o gatilho? O que aconteceu imediatamente antes?</p>
                            <textarea 
                                placeholder="Estava em casa quando..."
                                value={form.antecedent} onChange={e => setForm({...form, antecedent: e.target.value})}
                                rows={3}
                                required
                            />
                        </div>

                        {/* B - Behavior */}
                        <div className="form-group">
                            <label>2. Comportamento (B)</label>
                            <p className="field-hint">Como você se sentiu? O que você fez?</p>
                            <textarea 
                                placeholder="Senti raiva e gritei..."
                                value={form.behavior} onChange={e => setForm({...form, behavior: e.target.value})}
                                rows={3}
                                required
                            />
                        </div>

                        {/* C - Consequence */}
                        <div className="form-group">
                            <label>3. Consequência (C)</label>
                            <p className="field-hint">O que aconteceu depois do comportamento?</p>
                            <textarea 
                                placeholder="A discussão piorou e me senti culpado..."
                                value={form.consequence} onChange={e => setForm({...form, consequence: e.target.value})}
                                rows={3}
                                required
                            />
                        </div>

                        <button type="submit" className="save-btn"><Save size={20} /> Salvar Registro</button>
                    </form>
                ) : (
                    <div className="list-grid">
                        {records.length === 0 ? <p className="empty-text">Nenhum registro ABC encontrado.</p> : 
                            records.map(r => (
                                <div key={r.id} className="contact-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                        <div onClick={() => toggleExpand(r.id)} style={{ flex: 1 }}>
                                            <span style={{ fontSize: 12, color: '#666' }}>{new Date(r.date).toLocaleDateString()} - {new Date(r.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            <h3 style={{ fontSize: 16 }}>{r.antecedent.substring(0, 30)}...</h3>
                                        </div>
                                        <button className="icon-btn" onClick={() => toggleExpand(r.id)}>
                                            {expandedIds.includes(r.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                    
                                    {expandedIds.includes(r.id) && (
                                        <div style={{ marginTop: 12, width: '100%', fontSize: 14 }}>
                                            <p><strong>(A) Situação:</strong> {r.antecedent}</p>
                                            <hr style={{ margin: '8px 0', borderColor: '#eee' }} />
                                            <p><strong>(B) Comportamento:</strong> {r.behavior}</p>
                                            <hr style={{ margin: '8px 0', borderColor: '#eee' }} />
                                            <p><strong>(C) Consequência:</strong> {r.consequence}</p>
                                            
                                            <button className="delete-mini" onClick={() => deleteRecord(r.id)} style={{ marginTop: 10, alignSelf: 'flex-end' }}>
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

export default AbcRecord;
