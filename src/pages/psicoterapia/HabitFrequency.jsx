import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, Edit2 } from 'lucide-react';
import '../support/SubPage.css'; // Reuse styles

const HabitFrequency = () => {
    const navigate = useNavigate();
    const [habits, setHabits] = useState(() => {
        const saved = localStorage.getItem('tcc_habits');
        return saved ? JSON.parse(saved) : [];
    });
    const [newHabit, setNewHabit] = useState('');

    useEffect(() => {
        localStorage.setItem('tcc_habits', JSON.stringify(habits));
    }, [habits]);

    const addHabit = (e) => {
        e.preventDefault();
        if (!newHabit.trim()) return;
        setHabits([...habits, { id: Date.now(), name: newHabit, count: 0, history: [] }]);
        setNewHabit('');
    };

    const increment = (id) => {
        setHabits(habits.map(h =>
            h.id === id ? { ...h, count: h.count + 1 } : h
        ));
    };

    const decrement = (id) => {
        setHabits(habits.map(h =>
            h.id === id && h.count > 0 ? { ...h, count: h.count - 1 } : h
        ));
    };

    const deleteHabit = (id) => {
        if (window.confirm('Excluir este hábito?')) {
            setHabits(habits.filter(h => h.id !== id));
        }
    };

    const editHabitName = (habit) => {
        const newName = prompt('Editar nome do hábito:', habit.name);
        if (newName && newName.trim()) {
            setHabits(habits.map(h => h.id === habit.id ? { ...h, name: newName.trim() } : h));
        }
    };

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>Registro de Hábitos</h1>
                <div style={{ width: 32 }}></div>
            </header>

            <div className="content-container">
                <form onSubmit={addHabit} className="generic-form" style={{ marginBottom: 20 }}>
                    <div className="form-group" style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <input
                            value={newHabit}
                            onChange={e => setNewHabit(e.target.value)}
                            placeholder="Novo hábito (ex: Roer unhas)"
                            style={{ flex: 1, marginBottom: 0 }}
                        />
                        <button type="submit" className="icon-btn-primary"><Plus size={24} /></button>
                    </div>
                </form>

                <div className="list-grid">
                    {habits.length === 0 ? (
                        <p className="empty-text">Adicione hábitos para monitorar a frequência.</p>
                    ) : (
                        habits.map(habit => (
                            <div key={habit.id} className="contact-card" style={{ alignItems: 'center' }}>
                                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => editHabitName(habit)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <h3>{habit.name}</h3>
                                        <Edit2 size={14} color="#999" />
                                    </div>
                                    <p style={{ fontSize: 13, color: '#666' }}>Hoje: {habit.count} vezes</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <button className="icon-btn" onClick={() => decrement(habit.id)} disabled={habit.count === 0}>
                                        <Minus size={20} />
                                    </button>
                                    <span style={{ fontSize: 24, fontWeight: 'bold', minWidth: 30, textAlign: 'center' }}>
                                        {habit.count}
                                    </span>
                                    <button className="icon-btn-primary" onClick={() => increment(habit.id)}>
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <button className="delete-mini" onClick={() => deleteHabit(habit.id)} style={{ marginLeft: 10 }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HabitFrequency;
