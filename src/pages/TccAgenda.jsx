/* src/pages/TccAgenda.jsx */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, BookOpen, Layers, GitCommit } from 'lucide-react';
import './Support.css';

const TccAgenda = () => {
    const navigate = useNavigate();

    return (
        <div className="sub-page">
            <header className="page-header">
                <h1>Psicoterapia</h1>
            </header>
            
            <div className="support-container" style={{ marginTop: 20 }}>
                <div className="menu-card">
                    {/* HÁBITOS */}
                    <div className="menu-item" onClick={() => navigate('/psicoterapia/habits')}>
                        <div className="icon-box blue"><Repeat size={20} /></div>
                        <div className="menu-text">
                            <h3>Frequência de Hábitos</h3>
                            <p>Registro de Frequência de Hábitos</p>
                        </div>
                    </div>
                    
                    <div className="divider"></div>

                    {/* RPD */}
                    <div className="menu-item" onClick={() => navigate('/psicoterapia/thoughts')}>
                        <div className="icon-box purple"><BookOpen size={20} /></div>
                        <div className="menu-text">
                            <h3>Pensamentos Disfuncionais</h3>
                            <p>Registro de Pensamentos Disfuncionais</p>
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* ABC */}
                    <div className="menu-item" onClick={() => navigate('/psicoterapia/abc')}>
                        <div className="icon-box green"><GitCommit size={20} /></div>
                        <div className="menu-text">
                            <h3>Registro ABC</h3>
                            <p>Antecedente, Comportamento, Consequência</p>
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* CARDS */}
                    <div className="menu-item" onClick={() => navigate('/psicoterapia/cards')}>
                        <div className="icon-box orange"><Layers size={20} /></div>
                        <div className="menu-text">
                            <h3>Cartões de Enfrentamento</h3>
                            <p>Estratégias para momentos difíceis</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TccAgenda;
