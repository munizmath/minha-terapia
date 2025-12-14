import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Phone, Settings, ChevronRight, Heart, Database, AlertTriangle } from 'lucide-react';
import './Support.css';

const Support = () => {
    const navigate = useNavigate();
    return (
        <div className="support-page">
            <header className="page-header">
                <h1>Apoio & Mais</h1>
            </header>

            <div className="support-container">
                {/* Profile Header */}
                <div className="profile-card" onClick={() => navigate('/support/profile')}>
                    <div className="profile-avatar">
                        <Users size={32} color="white" />
                    </div>
                    <div className="profile-info">
                        <h2>Meu Perfil</h2>
                        <p>Toque para editar dados</p>
                    </div>
                    <ChevronRight size={24} className="chevron" />
                </div>
                {/* Support Section */}
                <div className="section-title">Minha Equipe</div>
                <div className="menu-card">
                    <div
                        className="menu-item"
                        onClick={() => navigate('/support/specialists')}
                    >
                        <div className="icon-box blue"><Users size={20} /></div>
                        <div className="menu-text">
                            <h3>Saúde - Especialistas</h3>
                            <p>Gerencie seus contatos médicos</p>
                        </div>
                        <ChevronRight size={20} className="chevron" />
                    </div>
                    <div className="divider"></div>
                    <div className="menu-item" onClick={() => navigate('/support/care-recipients')}>
                        <div className="icon-box green"><Heart size={20} /></div>
                        <div className="menu-text">
                            <h3>Cuidadores / Dependentes</h3>
                            <p>Compartilhe seu progresso</p>
                        </div>
                        <ChevronRight size={20} className="chevron" />
                    </div>
                    <div className="divider"></div>
                    <div className="menu-item" onClick={() => navigate('/support/allergies')}>
                        <div className="icon-box orange"><AlertTriangle size={20} /></div>
                        <div className="menu-text">
                            <h3>Alergias</h3>
                            <p>Registre suas alergias conhecidas</p>
                        </div>
                        <ChevronRight size={20} className="chevron" />
                    </div>
                    <div className="divider"></div>
                    <div className="menu-item" onClick={() => navigate('/support/data')}>
                        <div className="icon-box purple"><Database size={20} /></div>
                        <div className="menu-text">
                            <h3>Meus Dados</h3>
                            <p>Backup, Restaurar (Excel)</p>
                        </div>
                        <ChevronRight size={20} className="chevron" />
                    </div>
                    <div className="divider"></div>
                    <div className="menu-item" onClick={() => navigate('/support/sharing')}>
                        <div className="icon-box blue"><Database size={20} /></div>
                        <div className="menu-text">
                            <h3>Compartilhar Dados</h3>
                            <p>Compartilhar com profissionais</p>
                        </div>
                        <ChevronRight size={20} className="chevron" />
                    </div>
                </div>

                {/* Resources */}
                <div className="section-title">Ajuda</div>
                <div className="menu-card">
                    <div className="menu-item" onClick={() => navigate('/support/emergency')}>
                        <div className="icon-box orange"><Phone size={20} /></div>
                        <div className="menu-text">
                            <h3>Emergência</h3>
                            <p>Números importantes</p>
                        </div>
                        <ChevronRight size={20} className="chevron" />
                    </div>
                </div>

                {/* Settings */}
                <div className="section-title">App</div>
                <div className="menu-card">
                    <div className="menu-item" onClick={() => navigate('/support/settings')}>
                        <div className="icon-box gray"><Settings size={20} /></div>
                        <div className="menu-text">
                            <h3>Configurações</h3>
                            <p>Notificações, Sons, Aparência</p>
                        </div>
                        <ChevronRight size={20} className="chevron" />
                    </div>
                    <div className="divider"></div>
                    <div className="menu-item" onClick={() => navigate('/goals')}>
                        <div className="icon-box green"><Heart size={20} /></div>
                        <div className="menu-text">
                            <h3>Metas de Saúde</h3>
                            <p>Acompanhar objetivos de tratamento</p>
                        </div>
                        <ChevronRight size={20} className="chevron" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
