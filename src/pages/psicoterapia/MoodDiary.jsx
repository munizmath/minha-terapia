/**
 * SECURITY-NOTES: Diário de Humor e Emoções
 * 
 * Permite registro de humor e emoções ao longo do dia.
 * 
 * Controles de Segurança:
 * - Validação de dados de entrada
 * - Histórico para análise de padrões
 * 
 * Riscos Mitigados:
 * - Dados sensíveis de saúde mental
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, Edit2, TrendingUp } from 'lucide-react';
import '../support/SubPage.css';
import './MoodDiary.css';
import MoodChart from '../../components/charts/MoodChart';

const EMOTIONS = [
    { id: 'joy', label: 'Alegria', emoji: '😊', color: '#4caf50' },
    { id: 'sadness', label: 'Tristeza', emoji: '😢', color: '#2196f3' },
    { id: 'anger', label: 'Raiva', emoji: '😠', color: '#f44336' },
    { id: 'fear', label: 'Medo', emoji: '😨', color: '#9c27b0' },
    { id: 'anxiety', label: 'Ansiedade', emoji: '😰', color: '#ff9800' },
    { id: 'calm', label: 'Calma', emoji: '😌', color: '#00bcd4' },
    { id: 'excited', label: 'Empolgação', emoji: '🤩', color: '#e91e63' },
    { id: 'tired', label: 'Cansaço', emoji: '😴', color: '#607d8b' }
];

const INTENSITY_LEVELS = [
    { value: 1, label: 'Muito Baixa', color: '#e0e0e0' },
    { value: 2, label: 'Baixa', color: '#bdbdbd' },
    { value: 3, label: 'Moderada', color: '#9e9e9e' },
    { value: 4, label: 'Alta', color: '#757575' },
    { value: 5, label: 'Muito Alta', color: '#424242' }
];

const MoodDiary = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState(() => {
        const saved = localStorage.getItem('mood_diary');
        return saved ? JSON.parse(saved) : [];
    });
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        date: new Date().toISOString().slice(0, 16),
        emotions: [],
        intensity: 3,
        context: '',
        notes: ''
    });

    useEffect(() => {
        localStorage.setItem('mood_diary', JSON.stringify(entries));
    }, [entries]);

    const handleEmotionToggle = (emotionId) => {
        setForm(prev => ({
            ...prev,
            emotions: prev.emotions.includes(emotionId)
                ? prev.emotions.filter(id => id !== emotionId)
                : [...prev.emotions, emotionId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.emotions.length === 0) {
            alert('Selecione pelo menos uma emoção');
            return;
        }

        const entry = {
            id: editingId || Date.now(),
            ...form,
            createdAt: new Date().toISOString()
        };

        if (editingId) {
            setEntries(prev => prev.map(e => e.id === editingId ? entry : e));
            setEditingId(null);
        } else {
            setEntries(prev => [entry, ...prev]);
        }

        setIsAdding(false);
        setForm({
            date: new Date().toISOString().slice(0, 16),
            emotions: [],
            intensity: 3,
            context: '',
            notes: ''
        });
    };

    const handleEdit = (entry) => {
        setForm(entry);
        setEditingId(entry.id);
        setIsAdding(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Deseja excluir este registro?')) {
            setEntries(prev => prev.filter(e => e.id !== id));
        }
    };

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Diário de Humor</h1>
            </header>

            <div className="sub-content">
                {/* Gráfico de Evolução */}
                {entries.length > 0 && (
                    <div className="mood-section">
                        <h2 className="section-title">
                            <TrendingUp size={20} style={{ marginRight: 8 }} />
                            Evolução Emocional
                        </h2>
                        <MoodChart entries={entries} />
                    </div>
                )}

                {/* Formulário */}
                {isAdding ? (
                    <form onSubmit={handleSubmit} className="mood-form">
                        <div className="form-group">
                            <label>Data e Hora</label>
                            <input
                                type="datetime-local"
                                value={form.date}
                                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Emoções Sentidas</label>
                            <div className="emotions-grid">
                                {EMOTIONS.map(emotion => (
                                    <button
                                        key={emotion.id}
                                        type="button"
                                        className={`emotion-btn ${form.emotions.includes(emotion.id) ? 'active' : ''}`}
                                        onClick={() => handleEmotionToggle(emotion.id)}
                                        style={{
                                            borderColor: form.emotions.includes(emotion.id) ? emotion.color : 'transparent',
                                            backgroundColor: form.emotions.includes(emotion.id) 
                                                ? `${emotion.color}20` 
                                                : 'transparent'
                                        }}
                                    >
                                        <span className="emotion-emoji">{emotion.emoji}</span>
                                        <span className="emotion-label">{emotion.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Intensidade: {INTENSITY_LEVELS.find(l => l.value === form.intensity)?.label}</label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={form.intensity}
                                onChange={(e) => setForm(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                            />
                            <div className="intensity-labels">
                                <span>Muito Baixa</span>
                                <span>Muito Alta</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Contexto / Eventos</label>
                            <textarea
                                value={form.context}
                                onChange={(e) => setForm(prev => ({ ...prev, context: e.target.value }))}
                                placeholder="O que estava acontecendo quando sentiu essas emoções?"
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label>Notas Adicionais</label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Observações, pensamentos, etc."
                                rows={3}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="action-btn primary">
                                <Save size={20} /> Salvar
                            </button>
                            <button 
                                type="button" 
                                className="action-btn secondary"
                                onClick={() => {
                                    setIsAdding(false);
                                    setEditingId(null);
                                    setForm({
                                        date: new Date().toISOString().slice(0, 16),
                                        emotions: [],
                                        intensity: 3,
                                        context: '',
                                        notes: ''
                                    });
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <button 
                            className="action-btn primary"
                            onClick={() => setIsAdding(true)}
                            style={{ width: '100%', marginBottom: 16 }}
                        >
                            <Plus size={20} /> Novo Registro
                        </button>

                        {/* Lista de Registros */}
                        <div className="mood-entries">
                            {entries.length === 0 ? (
                                <div className="empty-state">
                                    <p>Nenhum registro ainda. Comece registrando seu humor!</p>
                                </div>
                            ) : (
                                entries.map(entry => (
                                    <div key={entry.id} className="mood-entry">
                                        <div className="entry-header">
                                            <div className="entry-date">
                                                {new Date(entry.date).toLocaleString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="entry-actions">
                                                <button 
                                                    className="icon-btn-small"
                                                    onClick={() => handleEdit(entry)}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    className="icon-btn-small"
                                                    onClick={() => handleDelete(entry.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="entry-emotions">
                                            {entry.emotions.map(emotionId => {
                                                const emotion = EMOTIONS.find(e => e.id === emotionId);
                                                return emotion ? (
                                                    <span key={emotionId} className="emotion-tag" style={{ borderColor: emotion.color }}>
                                                        {emotion.emoji} {emotion.label}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                        <div className="entry-intensity">
                                            Intensidade: {INTENSITY_LEVELS.find(l => l.value === entry.intensity)?.label}
                                        </div>
                                        {entry.context && (
                                            <div className="entry-context">
                                                <strong>Contexto:</strong> {entry.context}
                                            </div>
                                        )}
                                        {entry.notes && (
                                            <div className="entry-notes">
                                                <strong>Notas:</strong> {entry.notes}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MoodDiary;

