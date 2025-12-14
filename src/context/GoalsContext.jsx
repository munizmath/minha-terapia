/**
 * SECURITY-NOTES: Contexto de Metas e Objetivos
 * 
 * Gerencia metas de saúde e objetivos de tratamento.
 * 
 * Controles de Segurança:
 * - Validação de dados de metas
 * - Histórico de progresso
 * 
 * Riscos Mitigados:
 * - Metas irrealistas
 * - Falta de acompanhamento
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const GoalsContext = createContext();

export const useGoals = () => {
    const context = useContext(GoalsContext);
    if (!context) {
        throw new Error('useGoals must be used within GoalsProvider');
    }
    return context;
};

export const GoalsProvider = ({ children }) => {
    const [goals, setGoals] = useState(() => {
        const saved = localStorage.getItem('health_goals');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('health_goals', JSON.stringify(goals));
    }, [goals]);

    const addGoal = (goal) => {
        const newGoal = {
            id: uuidv4(),
            ...goal,
            createdAt: new Date().toISOString(),
            progress: [],
            achieved: false
        };
        setGoals(prev => [...prev, newGoal]);
        return newGoal;
    };

    const updateGoal = (id, updates) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    };

    const deleteGoal = (id) => {
        setGoals(prev => prev.filter(g => g.id !== id));
    };

    const addProgress = (goalId, value, date) => {
        setGoals(prev => prev.map(g => {
            if (g.id === goalId) {
                const progress = [...(g.progress || []), { value, date: date || new Date().toISOString() }];
                const achieved = g.targetValue 
                    ? (g.type === 'decrease' ? progress[progress.length - 1]?.value <= g.targetValue 
                        : progress[progress.length - 1]?.value >= g.targetValue)
                    : false;
                return { ...g, progress, achieved };
            }
            return g;
        }));
    };

    return (
        <GoalsContext.Provider value={{
            goals,
            addGoal,
            updateGoal,
            deleteGoal,
            addProgress
        }}>
            {children}
        </GoalsContext.Provider>
    );
};

