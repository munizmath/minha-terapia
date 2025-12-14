/**
 * SECURITY-NOTES: Página de Metas e Objetivos
 * 
 * Permite criar e acompanhar metas de saúde.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Target, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useGoals } from '../context/GoalsContext';
import { useMedications } from '../context/MedicationContext';
import '../pages/support/SubPage.css';
import './Goals.css';

const GOAL_TYPES = [
    { id: 'weight', label: 'Peso', unit: 'kg', icon: '⚖️' },
    { id: 'blood_pressure', label: 'Pressão Arterial', unit: 'mmHg', icon: '🩺' },
    { id: 'exercise', label: 'Exercício', unit: 'min/semana', icon: '🏃' },
    { id: 'medication_adherence', label: 'Adesão a Medicamentos', unit: '%', icon: '💊' },
    { id: 'custom', label: 'Personalizada', unit: '', icon: '🎯' }
];

const Goals = () => {
    const navigate = useNavigate();
    const { goals, addGoal, updateGoal, deleteGoal, addProgress } = useGoals();
    const { measurements } = useMedications();
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({
        title: '',
        type: 'weight',
        currentValue: '',
        targetValue: '',
        targetDate: '',
        unit: 'kg',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const goal = {
            ...form,
            currentValue: parseFloat(form.currentValue) || 0,
            targetValue: parseFloat(form.targetValue) || null,
            type: form.type === 'decrease' ? 'decrease' : 'increase'
        };
        addGoal(goal);
        setIsAdding(false);
        setForm({
            title: '',
            type: 'weight',
            currentValue: '',
            targetValue: '',
            targetDate: '',
            unit: 'kg',
            description: ''
        });
    };

    const handleAddProgress = (goalId) => {
        const value = prompt('Digite o valor atual:');
        if (value) {
            addProgress(goalId, parseFloat(value));
        }
    };

    const calculateProgress = (goal) => {
        if (!goal.targetValue || goal.progress.length === 0) return 0;
        const latest = goal.progress[goal.progress.length - 1].value;
        const start = goal.currentValue;
        const target = goal.targetValue;
        const total = Math.abs(target - start);
        const current = Math.abs(latest - start);
        return total > 0 ? Math.min(100, (current / total) * 100) : 0;
    };

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Metas de Saúde</h1>
            </header>

            <div className="sub-content">
                {!isAdding ? (
                    <>
                        <button 
                            className="action-btn primary"
                            onClick={() => setIsAdding(true)}
                            style={{ width: '100%', marginBottom: 16 }}
                        >
                            <Plus size={20} /> Nova Meta
                        </button>

                        <div className="goals-list">
                            {goals.length === 0 ? (
                                <div className="empty-state">
                                    <Target size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                                    <p>Nenhuma meta definida ainda.</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                        Crie uma meta para acompanhar seu progresso!
                                    </p>
                                </div>
                            ) : (
                                goals.map(goal => {
                                    const progress = calculateProgress(goal);
                                    return (
                                        <div key={goal.id} className="goal-card">
                                            <div className="goal-header">
                                                <div className="goal-icon">{GOAL_TYPES.find(t => t.id === goal.type)?.icon || '🎯'}</div>
                                                <div className="goal-info">
                                                    <h3>{goal.title}</h3>
                                                    <p className="goal-description">{goal.description || 'Sem descrição'}</p>
                                                </div>
                                                {goal.achieved ? (
                                                    <CheckCircle size={24} color="#4caf50" />
                                                ) : (
                                                    <XCircle size={24} color="#9e9e9e" />
                                                )}
                                            </div>
                                            <div className="goal-progress">
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="progress-text">{progress.toFixed(0)}%</span>
                                            </div>
                                            <div className="goal-details">
                                                <div>
                                                    <span className="detail-label">Atual:</span>
                                                    <span className="detail-value">
                                                        {goal.progress.length > 0 
                                                            ? goal.progress[goal.progress.length - 1].value 
                                                            : goal.currentValue} {goal.unit}
                                                    </span>
                                                </div>
                                                {goal.targetValue && (
                                                    <div>
                                                        <span className="detail-label">Meta:</span>
                                                        <span className="detail-value">{goal.targetValue} {goal.unit}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="goal-actions">
                                                <button 
                                                    className="action-btn secondary small"
                                                    onClick={() => handleAddProgress(goal.id)}
                                                >
                                                    <TrendingUp size={16} /> Atualizar
                                                </button>
                                                <button 
                                                    className="action-btn danger small"
                                                    onClick={() => {
                                                        if (window.confirm('Deseja excluir esta meta?')) {
                                                            deleteGoal(goal.id);
                                                        }
                                                    }}
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className="goal-form">
                        <div className="form-group">
                            <label>Título da Meta</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Ex: Perder peso, Controlar pressão..."
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Tipo</label>
                            <select
                                value={form.type}
                                onChange={(e) => {
                                    const type = GOAL_TYPES.find(t => t.id === e.target.value);
                                    setForm(prev => ({ 
                                        ...prev, 
                                        type: e.target.value,
                                        unit: type?.unit || ''
                                    }));
                                }}
                            >
                                {GOAL_TYPES.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.icon} {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Valor Atual</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.currentValue}
                                    onChange={(e) => setForm(prev => ({ ...prev, currentValue: e.target.value }))}
                                    placeholder="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Meta (Opcional)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.targetValue}
                                    onChange={(e) => setForm(prev => ({ ...prev, targetValue: e.target.value }))}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Unidade</label>
                            <input
                                type="text"
                                value={form.unit}
                                onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
                                placeholder="kg, %, minutos..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Data Alvo (Opcional)</label>
                            <input
                                type="date"
                                value={form.targetDate}
                                onChange={(e) => setForm(prev => ({ ...prev, targetDate: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label>Descrição</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Descreva sua meta..."
                                rows={3}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="action-btn primary">
                                Criar Meta
                            </button>
                            <button 
                                type="button" 
                                className="action-btn secondary"
                                onClick={() => setIsAdding(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Goals;

