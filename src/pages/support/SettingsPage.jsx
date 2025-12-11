import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Moon, Trash2 } from 'lucide-react';
import { useMedications } from '../../context/MedicationContext';
import './SubPage.css';

const Settings = () => {
    const navigate = useNavigate();
    const { clearAllData } = useMedications();

    // Mock state for settings (In real app, save to localStorage)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    // Load Dark Mode from LocalStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    useEffect(() => {
        if (Notification.permission !== 'granted') setNotificationsEnabled(false);
    }, []);

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

    const requestNotif = () => {
        Notification.requestPermission().then(perm => {
            setNotificationsEnabled(perm === 'granted');
        });
    };

    return (
        <div className="sub-page">
            <header className="sub-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={24} />
                </button>
                <h1>Configurações</h1>
            </header>

            <div className="sub-content">

                <div className="section-group">
                    <h2 className="group-title">Notificações</h2>
                    <div className="setting-item" onClick={requestNotif}>
                        <div className="setting-icon"><Bell size={20} /></div>
                        <div className="setting-text">
                            <h3>Lembretes de Medicamentos</h3>
                            <p>{notificationsEnabled ? 'Ativado' : 'Toque para ativar'}</p>
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
                </div>

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

                <div className="app-version">
                    <p>Minha Terapia v1.2.0</p>
                    <p>Identificador: {localStorage.getItem('user_id') || 'Local User'}</p>
                </div>

            </div>
        </div>
    );
};

export default Settings;
