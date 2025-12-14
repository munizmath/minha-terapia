import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Moon, Trash2, Lock, Key, Clock, History, ChevronRight } from 'lucide-react';
import { useMedications } from '../../context/MedicationContext';
import { useEncryption } from '../../hooks/useEncryption';
import { useAuth } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import './SubPage.css';

const Settings = () => {
    const navigate = useNavigate();
    const { clearAllData } = useMedications();
    const { encryptionEnabled, enableEncryption, disableEncryption, masterPassword } = useEncryption();
    const { getCurrentUser } = useAuth();
    const { getSnoozeHistory } = useNotificationContext();
    const [showSnoozeHistory, setShowSnoozeHistory] = useState(false);

    // Load notifications state from localStorage
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        const saved = localStorage.getItem('notifications_enabled');
        if (saved !== null) {
            return JSON.parse(saved);
        }
        // Default: true if permission is granted
        return Notification.permission === 'granted';
    });
    const [darkMode, setDarkMode] = useState(false);
    const [showEncryptionDialog, setShowEncryptionDialog] = useState(false);
    const [encryptionPassword, setEncryptionPassword] = useState('');
    const [encryptionPasswordConfirm, setEncryptionPasswordConfirm] = useState('');

    // Obter identificador do usuário
    const getUserIdentifier = () => {
        // Prioridade: 1. Nome do perfil, 2. Nome do usuário autenticado, 3. Email do usuário autenticado, 4. "Usuário Local"
        const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
        if (profile.name) {
            return profile.name;
        }
        
        const currentUser = getCurrentUser();
        if (currentUser) {
            return currentUser.name || currentUser.email || 'Usuário Autenticado';
        }
        
        return 'Usuário Local';
    };

    // Load Dark Mode from LocalStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    // Save notifications preference to localStorage
    useEffect(() => {
        localStorage.setItem('notifications_enabled', JSON.stringify(notificationsEnabled));
    }, [notificationsEnabled]);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    };

    const toggleNotifications = async () => {
        if (notificationsEnabled) {
            // Desativar notificações - mostrar aviso
            if (!window.confirm('Tem certeza? Isso pode ser prejudicial para você.')) {
                return;
            }
            setNotificationsEnabled(false);
        } else {
            // Ativar notificações - solicitar permissão
            if (Notification.permission === 'default') {
                const perm = await Notification.requestPermission();
                if (perm === 'granted') {
                    setNotificationsEnabled(true);
                } else {
                    alert('Permissão de notificações negada. Você pode ativar nas configurações do navegador.');
                }
            } else if (Notification.permission === 'granted') {
                setNotificationsEnabled(true);
            } else {
                alert('Permissão de notificações negada. Você pode ativar nas configurações do navegador.');
            }
        }
    };

    const handleEnableEncryption = async () => {
        if (encryptionPassword.length < 6) {
            alert('Senha deve ter pelo menos 6 caracteres');
            return;
        }
        if (encryptionPassword !== encryptionPasswordConfirm) {
            alert('As senhas não coincidem');
            return;
        }

        try {
            await enableEncryption(encryptionPassword);
            setShowEncryptionDialog(false);
            setEncryptionPassword('');
            setEncryptionPasswordConfirm('');
            alert('Criptografia habilitada com sucesso! Seus dados agora estão protegidos.');
        } catch (error) {
            alert('Erro ao habilitar criptografia: ' + error.message);
        }
    };

    const handleDisableEncryption = async () => {
        if (!window.confirm('ATENÇÃO: Desabilitar criptografia irá descriptografar todos os dados. Deseja continuar?')) {
            return;
        }

        try {
            await disableEncryption();
            alert('Criptografia desabilitada. Seus dados foram descriptografados.');
        } catch (error) {
            alert('Erro ao desabilitar criptografia: ' + error.message);
        }
    };

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Configurações</h1>
            </header>

            <div className="sub-content">

                <div className="section-group">
                    <h2 className="group-title">Notificações</h2>
                    <div className="setting-item" onClick={toggleNotifications}>
                        <div className="setting-icon"><Bell size={20} /></div>
                        <div className="setting-text">
                            <h3>Lembretes de Medicamentos</h3>
                            <p>{notificationsEnabled ? 'Ativado' : 'Desativado - Toque para ativar'}</p>
                        </div>
                        <div className="toggle">
                            <input type="checkbox" checked={notificationsEnabled} readOnly />
                            <span className="slider"></span>
                        </div>
                    </div>
                    {/* Mock Setting */}
                    <div className="setting-item">
                        <div className="setting-text" style={{ marginLeft: 44 }}>
                            <h3>Som do Lembrete</h3>
                            <p>Padrão (Bip)</p>
                        </div>
                    </div>
                    <div className="setting-item" onClick={() => setShowSnoozeHistory(!showSnoozeHistory)}>
                        <div className="setting-icon"><History size={20} /></div>
                        <div className="setting-text">
                            <h3>Histórico de Lembretes Adiados</h3>
                            <p>{getSnoozeHistory().length} registro(s)</p>
                        </div>
                        <ChevronRight size={20} className="chevron" />
                    </div>
                </div>

                {/* Histórico de Snoozes */}
                {showSnoozeHistory && (
                    <div className="section-group">
                        <h2 className="group-title">Histórico de Adiamentos</h2>
                        {getSnoozeHistory().length === 0 ? (
                            <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                <Clock size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                                <p>Nenhum lembrete foi adiado ainda.</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                {getSnoozeHistory()
                                    .sort((a, b) => new Date(b.snoozedAt) - new Date(a.snoozedAt))
                                    .slice(0, 50) // Limitar a 50 mais recentes
                                    .map((entry, idx) => (
                                        <div key={idx} style={{
                                            padding: 12,
                                            marginBottom: 8,
                                            background: 'var(--color-surface)',
                                            borderRadius: 8,
                                            border: '1px solid var(--color-surface-dim)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 4 }}>
                                                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                                                    {entry.medicationName}
                                                </h4>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                                    {entry.snoozeCount}º adiamento
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                Adiado por {entry.minutes} min em {new Date(entry.snoozedAt).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="section-group">
                    <h2 className="group-title">Aparência</h2>
                    <div className="setting-item" onClick={toggleDarkMode}>
                        <div className="setting-icon"><Moon size={20} /></div>
                        <div className="setting-text">
                            <h3>Modo Escuro</h3>
                            <p>{darkMode ? 'Ativado' : 'Desativado'}</p>
                        </div>
                        <div className="toggle">
                            <input type="checkbox" checked={darkMode} readOnly />
                            <span className="slider"></span>
                        </div>
                    </div>
                </div>

                <div className="section-group">
                    <h2 className="group-title">Segurança</h2>
                    <div className="setting-item" onClick={() => setShowEncryptionDialog(true)}>
                        <div className="setting-icon"><Lock size={20} /></div>
                        <div className="setting-text">
                            <h3>Criptografia de Dados</h3>
                            <p>{encryptionEnabled ? 'Ativada' : 'Desativada'}</p>
                        </div>
                        <div className="toggle">
                            <input type="checkbox" checked={encryptionEnabled} readOnly />
                            <span className="slider"></span>
                        </div>
                    </div>
                    {encryptionEnabled && (
                        <div className="setting-item" onClick={handleDisableEncryption}>
                            <div className="setting-icon"><Key size={20} /></div>
                            <div className="setting-text">
                                <h3>Desabilitar Criptografia</h3>
                                <p>Descriptografar todos os dados</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="section-group">
                    <h2 className="group-title">Conta & Dados</h2>
                    <div className="setting-item" onClick={() => navigate('/support/data')}>
                        <div className="setting-text" style={{ marginLeft: 44 }}>
                            <h3>Backup & Restauração</h3>
                            <p>Gerenciar planilha Excel</p>
                        </div>
                    </div>

                    <button className="danger-link" onClick={clearAllData}>
                        <Trash2 size={16} /> Apagar todos os dados do app
                    </button>
                </div>

                {/* Dialog de Criptografia */}
                {showEncryptionDialog && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: 24,
                            borderRadius: 12,
                            maxWidth: 400,
                            width: '90%',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                        }}>
                            <h2 style={{ marginBottom: 16 }}>Habilitar Criptografia</h2>
                            <p style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
                                Defina uma senha mestre para criptografar seus dados de saúde. Esta senha será necessária para acessar seus dados.
                            </p>
                            <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                                    Senha Mestre
                                </label>
                                <input
                                    type="password"
                                    value={encryptionPassword}
                                    onChange={(e) => setEncryptionPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    style={{
                                        width: '100%',
                                        padding: 8,
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        fontSize: 14
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                                    Confirmar Senha
                                </label>
                                <input
                                    type="password"
                                    value={encryptionPasswordConfirm}
                                    onChange={(e) => setEncryptionPasswordConfirm(e.target.value)}
                                    placeholder="Digite novamente"
                                    style={{
                                        width: '100%',
                                        padding: 8,
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        fontSize: 14
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={() => {
                                        setShowEncryptionDialog(false);
                                        setEncryptionPassword('');
                                        setEncryptionPasswordConfirm('');
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        backgroundColor: '#f5f5f5',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleEnableEncryption}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        border: 'none',
                                        borderRadius: 6,
                                        backgroundColor: '#009688',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Habilitar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="app-version">
                    <p>Minha Terapia v1.3.1</p>
                    <p>Identificador: {getUserIdentifier()}</p>
                </div>

            </div>
        </div>
    );
};

export default Settings;
