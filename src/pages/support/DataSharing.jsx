/**
 * SECURITY-NOTES: Compartilhamento de Dados com Profissionais
 * 
 * Permite compartilhar dados de saúde através de links seguros.
 * 
 * Controles de Segurança:
 * - Links temporários com expiração
 * - Controle granular de dados compartilhados
 * - Tokens seguros
 * 
 * Riscos Mitigados:
 * - Exposição não autorizada de dados
 * - Links permanentes
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, Check, Clock, Eye, EyeOff } from 'lucide-react';
import { useMedications } from '../../context/MedicationContext';
import './SubPage.css';
import './DataSharing.css';

const DataSharing = () => {
    const navigate = useNavigate();
    const { medications, measurements, symptoms, activities, logs } = useMedications();
    const [shares, setShares] = useState(() => {
        const saved = localStorage.getItem('data_shares');
        return saved ? JSON.parse(saved) : [];
    });
    const [isCreating, setIsCreating] = useState(false);
    const [selectedData, setSelectedData] = useState({
        medications: true,
        measurements: true,
        symptoms: false,
        activities: false,
        logs: false
    });
    const [expirationDays, setExpirationDays] = useState(7);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        localStorage.setItem('data_shares', JSON.stringify(shares));
    }, [shares]);

    const generateShareLink = () => {
        const token = crypto.getRandomValues(new Uint8Array(32))
            .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
        
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + expirationDays);

        const share = {
            id: Date.now(),
            token,
            createdAt: new Date().toISOString(),
            expiresAt: expirationDate.toISOString(),
            dataTypes: selectedData,
            active: true
        };

        setShares(prev => [share, ...prev]);
        setIsCreating(false);
        return share;
    };

    const copyLink = (share) => {
        const baseUrl = window.location.origin + window.location.pathname;
        const link = `${baseUrl}share/${share.token}`;
        navigator.clipboard.writeText(link);
        setCopiedId(share.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const revokeShare = (id) => {
        setShares(prev => prev.map(s => s.id === id ? { ...s, active: false } : s));
    };

    const isExpired = (share) => {
        return new Date(share.expiresAt) < new Date();
    };

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Compartilhar Dados</h1>
            </header>

            <div className="sub-content">
                {!isCreating ? (
                    <>
                        <button 
                            className="action-btn primary"
                            onClick={() => setIsCreating(true)}
                            style={{ width: '100%', marginBottom: 16 }}
                        >
                            <Share2 size={20} /> Criar Link de Compartilhamento
                        </button>

                        <div className="shares-list">
                            {shares.length === 0 ? (
                                <div className="empty-state">
                                    <Share2 size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                                    <p>Nenhum link de compartilhamento criado.</p>
                                </div>
                            ) : (
                                shares.map(share => {
                                    const expired = isExpired(share);
                                    return (
                                        <div key={share.id} className={`share-card ${!share.active || expired ? 'inactive' : ''}`}>
                                            <div className="share-header">
                                                <div>
                                                    <h3>Link de Compartilhamento</h3>
                                                    <p className="share-date">
                                                        Criado em {new Date(share.createdAt).toLocaleString('pt-BR')}
                                                    </p>
                                                </div>
                                                <div className="share-status">
                                                    {expired ? (
                                                        <span className="status-badge expired">Expirado</span>
                                                    ) : !share.active ? (
                                                        <span className="status-badge revoked">Revogado</span>
                                                    ) : (
                                                        <span className="status-badge active">Ativo</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="share-info">
                                                <div className="info-item">
                                                    <Clock size={16} />
                                                    <span>
                                                        Expira em {new Date(share.expiresAt).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                                <div className="info-item">
                                                    <Eye size={16} />
                                                    <span>
                                                        Dados: {Object.entries(share.dataTypes)
                                                            .filter(([_, selected]) => selected)
                                                            .map(([key]) => {
                                                                const labels = {
                                                                    medications: 'Medicamentos',
                                                                    measurements: 'Medidas',
                                                                    symptoms: 'Sintomas',
                                                                    activities: 'Atividades',
                                                                    logs: 'Histórico'
                                                                };
                                                                return labels[key];
                                                            }).join(', ')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="share-actions">
                                                <button 
                                                    className="action-btn secondary small"
                                                    onClick={() => copyLink(share)}
                                                    disabled={!share.active || expired}
                                                >
                                                    {copiedId === share.id ? (
                                                        <>
                                                            <Check size={16} /> Copiado!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={16} /> Copiar Link
                                                        </>
                                                    )}
                                                </button>
                                                {share.active && !expired && (
                                                    <button 
                                                        className="action-btn danger small"
                                                        onClick={() => {
                                                            if (window.confirm('Deseja revogar este link?')) {
                                                                revokeShare(share.id);
                                                            }
                                                        }}
                                                    >
                                                        Revogar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                ) : (
                    <div className="share-form">
                        <h2>Selecione os Dados para Compartilhar</h2>
                        <div className="data-selection">
                            {[
                                { key: 'medications', label: 'Medicamentos', count: medications.length },
                                { key: 'measurements', label: 'Medidas', count: measurements.length },
                                { key: 'symptoms', label: 'Sintomas', count: symptoms.length },
                                { key: 'activities', label: 'Atividades', count: activities.length },
                                { key: 'logs', label: 'Histórico', count: logs.length }
                            ].map(item => (
                                <label key={item.key} className="data-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedData[item.key]}
                                        onChange={(e) => setSelectedData(prev => ({
                                            ...prev,
                                            [item.key]: e.target.checked
                                        }))}
                                    />
                                    <span>{item.label} ({item.count})</span>
                                </label>
                            ))}
                        </div>
                        <div className="form-group">
                            <label>Expira em (dias)</label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={expirationDays}
                                onChange={(e) => setExpirationDays(parseInt(e.target.value))}
                            />
                        </div>
                        <div className="form-actions">
                            <button 
                                className="action-btn primary"
                                onClick={generateShareLink}
                            >
                                Gerar Link
                            </button>
                            <button 
                                className="action-btn secondary"
                                onClick={() => setIsCreating(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataSharing;

