/**
 * SECURITY-NOTES: Autenticação e Múltiplos Usuários
 * 
 * Sistema de autenticação local com múltiplos perfis de usuário.
 * 
 * Controles de Segurança:
 * - Hash de senha usando Web Crypto API (PBKDF2)
 * - Armazenamento seguro de credenciais
 * - Isolamento de dados por perfil
 * - Sessão com timeout automático
 * - Validação de força de senha
 * 
 * Riscos Mitigados:
 * - Acesso não autorizado a dados de outros perfis
 * - Senhas em texto plano
 * - Sessões indefinidas
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * Gera hash de senha usando PBKDF2
 */
async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const hash = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        passwordKey,
        256
    );

    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Gera salt aleatório
 */
function generateSalt() {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(salt)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Valida força da senha
 */
function validatePassword(password) {
    if (password.length < 6) {
        return { valid: false, message: 'Senha deve ter pelo menos 6 caracteres' };
    }
    if (password.length > 128) {
        return { valid: false, message: 'Senha muito longa (máximo 128 caracteres)' };
    }
    return { valid: true };
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = sessionStorage.getItem('current_user_id');
        return saved || null;
    });

    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('app_users');
        return saved ? JSON.parse(saved) : [];
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!sessionStorage.getItem('auth_token');
    });

    // Salvar lista de usuários
    useEffect(() => {
        localStorage.setItem('app_users', JSON.stringify(users));
    }, [users]);

    /**
     * Registra novo usuário
     */
    const register = async (email, password, name) => {
        const validation = validatePassword(password);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        // Verificar se email já existe
        if (users.some(u => u.email === email)) {
            throw new Error('Email já cadastrado');
        }

        const salt = generateSalt();
        const passwordHash = await hashPassword(password, new Uint8Array(
            salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        ));

        const newUser = {
            id: uuidv4(),
            email,
            passwordHash,
            salt,
            name: name || email.split('@')[0],
            createdAt: new Date().toISOString()
        };

        setUsers(prev => [...prev, newUser]);
        return newUser;
    };

    /**
     * Autentica usuário
     */
    const login = async (email, password) => {
        const user = users.find(u => u.email === email);
        if (!user) {
            throw new Error('Email ou senha incorretos');
        }

        const saltBytes = new Uint8Array(
            user.salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        );
        const passwordHash = await hashPassword(password, saltBytes);

        if (passwordHash !== user.passwordHash) {
            throw new Error('Email ou senha incorretos');
        }

        // Criar token de sessão
        const token = crypto.getRandomValues(new Uint8Array(32))
            .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('current_user_id', user.id);
        setCurrentUser(user.id);
        setIsAuthenticated(true);

        return user;
    };

    /**
     * Logout
     */
    const logout = () => {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('current_user_id');
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    /**
     * Troca de perfil (sem logout)
     */
    const switchUser = async (userId, password) => {
        const user = users.find(u => u.id === userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        // Verificar senha
        const saltBytes = new Uint8Array(
            user.salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        );
        const passwordHash = await hashPassword(password, saltBytes);

        if (passwordHash !== user.passwordHash) {
            throw new Error('Senha incorreta');
        }

        const token = crypto.getRandomValues(new Uint8Array(32))
            .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('current_user_id', userId);
        setCurrentUser(userId);
        setIsAuthenticated(true);

        return user;
    };

    /**
     * Obtém dados do usuário atual
     */
    const getCurrentUser = () => {
        return users.find(u => u.id === currentUser) || null;
    };

    /**
     * Remove usuário
     */
    const removeUser = (userId) => {
        if (users.length <= 1) {
            throw new Error('Não é possível remover o último usuário');
        }

        setUsers(prev => prev.filter(u => u.id !== userId));

        // Se for o usuário atual, fazer logout
        if (currentUser === userId) {
            logout();
        }
    };

    // Timeout de sessão (30 minutos de inatividade)
    useEffect(() => {
        if (!isAuthenticated) return;

        let timeout;
        const resetTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                logout();
                alert('Sessão expirada por inatividade. Faça login novamente.');
            }, 30 * 60 * 1000); // 30 minutos
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimeout));
        resetTimeout();

        return () => {
            clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, resetTimeout));
        };
    }, [isAuthenticated]);

    return (
        <AuthContext.Provider value={{
            currentUser,
            users,
            isAuthenticated,
            register,
            login,
            logout,
            switchUser,
            getCurrentUser,
            removeUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

