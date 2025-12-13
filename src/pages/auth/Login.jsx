import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, UserPlus, AlertCircle } from 'lucide-react';
import '../support/SubPage.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, register, users, switchUser } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                await register(email, password, name);
                await login(email, password);
                navigate('/');
            } else {
                await login(email, password);
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Erro ao autenticar');
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchUser = async (userId, userEmail) => {
        const userPassword = prompt(`Digite a senha para ${userEmail}:`);
        if (!userPassword) return;

        try {
            await switchUser(userId, userPassword);
            navigate('/');
        } catch (err) {
            alert(err.message || 'Erro ao trocar de usuário');
        }
    };

    return (
        <div className="sub-page" style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
            <header className="page-header" style={{ marginBottom: 32 }}>
                <h1>{isRegistering ? 'Criar Conta' : 'Entrar'}</h1>
            </header>

            {error && (
                <div style={{
                    padding: 12,
                    marginBottom: 16,
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="generic-form">
                {isRegistering && (
                    <div className="form-group">
                        <label>Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome"
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label>
                        <Mail size={16} style={{ marginRight: 8 }} />
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>
                        <Lock size={16} style={{ marginRight: 8 }} />
                        Senha
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    className="action-btn primary"
                    disabled={loading}
                    style={{ width: '100%', marginTop: 16 }}
                >
                    {loading ? 'Processando...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
                </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
                <button
                    type="button"
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError('');
                    }}
                    className="action-btn secondary"
                    style={{ width: '100%' }}
                >
                    {isRegistering ? 'Já tenho conta' : 'Criar nova conta'}
                </button>
            </div>

            {users.length > 0 && !isRegistering && (
                <div style={{ marginTop: 32 }}>
                    <h3 style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>
                        Trocar de Usuário
                    </h3>
                    <div className="list-grid">
                        {users.map(user => (
                            <div
                                key={user.id}
                                className="contact-card"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSwitchUser(user.id, user.email)}
                            >
                                <div className="contact-icon">
                                    <UserPlus size={24} color="white" />
                                </div>
                                <div className="contact-info">
                                    <h3>{user.name}</h3>
                                    <p style={{ fontSize: 12, color: '#666' }}>{user.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {users.length === 0 && (
                <div style={{
                    marginTop: 32,
                    padding: 16,
                    backgroundColor: '#e3f2fd',
                    borderRadius: 8,
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: 14, color: '#1976d2', margin: 0 }}>
                        Primeira vez? Crie uma conta para proteger seus dados.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        style={{
                            marginTop: 12,
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            border: '1px solid #1976d2',
                            borderRadius: 6,
                            color: '#1976d2',
                            cursor: 'pointer',
                            fontSize: 14
                        }}
                    >
                        Continuar sem conta
                    </button>
                </div>
            )}
        </div>
    );
};

export default Login;

