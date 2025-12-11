import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, Save, Camera } from 'lucide-react';
import './SubPage.css';

const UserProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem('user_profile');
        return saved ? JSON.parse(saved) : {
            name: '',
            email: '',
            birthDate: '',
            gender: 'female',
            height: '',
            weight: '',
            relationshipStatus: 'single',
            address: {
                street: '',
                neighborhood: '',
                city: '',
                state: '',
                country: 'Brasil',
                zipCode: ''
            }
        };
    });

    // Helper to update nested address
    const updateAddress = (field, value) => {
        setProfile(prev => ({
            ...prev,
            address: { ...prev.address, [field]: value }
        }));
    };

    // CEP Fetch Effect
    useEffect(() => {
        const cep = profile.address?.zipCode?.replace(/\D/g, '');
        if (cep?.length === 8) {
            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(res => res.json())
                .then(data => {
                    if (!data.erro) {
                        setProfile(prev => ({
                            ...prev,
                            address: {
                                ...prev.address,
                                street: data.logradouro,
                                neighborhood: data.bairro,
                                city: data.localidade,
                                state: data.uf,
                                country: 'Brasil'
                            }
                        }));
                    }
                })
                .catch(console.error);
        }
    }, [profile.address?.zipCode]);

    // BMI Calculation
    const bmi = (profile.weight && profile.height)
        ? (parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2)).toFixed(1)
        : null;

    const saveProfile = (e) => {
        e.preventDefault();
        localStorage.setItem('user_profile', JSON.stringify(profile));
        alert('Perfil atualizado!');
        navigate(-1);
    };

    return (
        <div className="sub-page">
            <header className="sub-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={24} />
                </button>
                <h1>Meu Perfil</h1>
            </header>

            <div className="sub-content">

                <div className="profile-edit-header">
                    <div className="avatar-large">
                        <User size={48} color="white" />
                        <button className="camera-btn">
                            <Camera size={16} />
                        </button>
                    </div>
                    <p className="edit-hint">Toque para alterar foto</p>
                </div>

                <form onSubmit={saveProfile} className="generic-form">
                    <div className="form-group">
                        <label>Nome Completo</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                value={profile.name}
                                onChange={e => setProfile({ ...profile, name: e.target.value })}
                                placeholder="Seu nome"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>E-mail (Opcional)</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                value={profile.email}
                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                                placeholder="email@exemplo.com"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Data de Nascimento</label>
                        <div className="input-wrapper">
                            <Calendar size={18} className="input-icon" />
                            <input
                                type="date"
                                value={profile.birthDate}
                                onChange={e => setProfile({ ...profile, birthDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Gênero</label>
                        <select
                            value={profile.gender}
                            onChange={e => setProfile({ ...profile, gender: e.target.value })}
                            className="styled-select"
                        >
                            <option value="female">Feminino</option>
                            <option value="male">Masculino</option>
                            <option value="other">Outro / Prefiro não dizer</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Estado Civil</label>
                        <select
                            value={profile.relationshipStatus || 'single'}
                            onChange={e => setProfile({ ...profile, relationshipStatus: e.target.value })}
                            className="styled-select"
                        >
                            <option value="single">Solteiro(a)</option>
                            <option value="married">Casado(a)</option>
                            <option value="divorced">Divorciado(a)</option>
                            <option value="widowed">Viúvo(a)</option>
                        </select>
                    </div>

                    <div className="section-title-small">Dados Físicos</div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Altura (cm)</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    value={profile.height || ''}
                                    onChange={e => setProfile({ ...profile, height: e.target.value })}
                                    placeholder="Ex: 170"
                                    style={{ paddingLeft: 12 }}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Peso (kg)</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    value={profile.weight || ''}
                                    onChange={e => setProfile({ ...profile, weight: e.target.value })}
                                    placeholder="Ex: 70.5"
                                    style={{ paddingLeft: 12 }}
                                />
                            </div>
                        </div>
                    </div>
                    {bmi && (
                        <div className="info-alert" style={{ marginTop: 0, marginBottom: 24, padding: 8 }}>
                            <strong>IMC Estimado:</strong> {bmi}
                        </div>
                    )}


                    <div className="section-title-small">Endereço</div>

                    <div className="form-group">
                        <label>CEP</label>
                        <input
                            className="styled-input"
                            value={profile.address?.zipCode || ''}
                            onChange={e => updateAddress('zipCode', e.target.value)}
                            placeholder="00000-000"
                        />
                    </div>

                    <div className="form-group">
                        <label>Rua / Logradouro</label>
                        <input
                            className="styled-input"
                            value={profile.address?.street || ''}
                            onChange={e => updateAddress('street', e.target.value)}
                            placeholder="Av. Paulista, 1000, Apt 55"
                        />
                    </div>

                    <div className="form-group">
                        <label>Bairro</label>
                        <input
                            className="styled-input"
                            value={profile.address?.neighborhood || ''}
                            onChange={e => updateAddress('neighborhood', e.target.value)}
                        />
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Cidade</label>
                            <input
                                className="styled-input"
                                value={profile.address?.city || ''}
                                onChange={e => updateAddress('city', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Estado</label>
                            <input
                                className="styled-input"
                                value={profile.address?.state || ''}
                                onChange={e => updateAddress('state', e.target.value)}
                                placeholder="UF"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>País</label>
                        <input
                            className="styled-input"
                            value={profile.address?.country || 'Brasil'}
                            onChange={e => updateAddress('country', e.target.value)}
                        />
                    </div>

                    <div style={{ height: 24 }}></div>

                    <button type="submit" className="action-btn primary" style={{ justifyContent: 'center' }}>
                        <Save size={20} /> Salvar Alterações
                    </button>
                </form>

            </div>
        </div>
    );
};

export default UserProfile;
