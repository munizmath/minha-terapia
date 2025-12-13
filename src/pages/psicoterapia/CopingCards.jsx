import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Save } from 'lucide-react';
import '../support/SubPage.css';

const CopingCards = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState(() => {
        const saved = localStorage.getItem('tcc_cards');
        return saved ? JSON.parse(saved) : [];
    });
    const [isAdding, setIsAdding] = useState(false);
    const [newCard, setNewCard] = useState({ id: null, title: '', content: '' });

    useEffect(() => {
        localStorage.setItem('tcc_cards', JSON.stringify(cards));
    }, [cards]);

    const saveCard = (e) => {
        e.preventDefault();
        let newCards;
        if (newCard.id) {
            newCards = cards.map(c => c.id === newCard.id ? newCard : c);
        } else {
            newCards = [...cards, { ...newCard, id: Date.now() }];
        }
        setCards(newCards);
        setIsAdding(false);
        setNewCard({ id: null, title: '', content: '' });
    };

    const editCard = (card) => {
        setNewCard(card);
        setIsAdding(true);
    };

    const deleteCard = (id) => {
        if (window.confirm('Excluir cartão?')) setCards(cards.filter(c => c.id !== id));
    };

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => { setIsAdding(false); setNewCard({ id: null, title: '', content: '' }); navigate(-1); }}>
                    <ArrowLeft size={24} />
                </button>
                <h1>{isAdding ? (newCard.id ? 'Editar Cartão' : 'Novo Cartão') : 'Cartões de Enfrentamento'}</h1>
                {!isAdding && (
                    <button className="icon-btn-primary" onClick={() => { setNewCard({ id: null, title: '', content: '' }); setIsAdding(true); }}>
                        <Plus size={24} />
                    </button>
                )}
            </header>

            <div className="content-container">
                {isAdding ? (
                    <form onSubmit={saveCard} className="generic-form">
                        <div className="form-group">
                            <label>Título / Situação</label>
                            <input
                                placeholder="Ex: Quando sinto pânico..."
                                value={newCard.title} onChange={e => setNewCard({ ...newCard, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>O que fazer / Lembrar?</label>
                            <textarea
                                placeholder="Respire fundo. Isso é só ansiedade. Vai passar em minutos."
                                value={newCard.content} onChange={e => setNewCard({ ...newCard, content: e.target.value })}
                                rows={5}
                                required
                            />
                        </div>
                        <button type="submit" className="save-btn"><Save size={20} /> Salvar Cartão</button>
                    </form>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                        {cards.length === 0 ? <p className="empty-text" style={{ gridColumn: '1/-1' }}>Crie cartões para ter à mão em momentos difíceis.</p> :
                            cards.map(card => (
                                <div key={card.id} className="contact-card" style={{ flexDirection: 'column', alignItems: 'flex-start', background: '#fff3e0', border: '1px solid #ffe0b2' }}>
                                    <h3 style={{ fontSize: 16, marginBottom: 8, color: '#e65100' }}>{card.title}</h3>
                                    <p style={{ fontSize: 14, whiteSpace: 'pre-wrap', flex: 1 }}>{card.content}</p>
                                    <div style={{ alignSelf: 'flex-end', marginTop: 10, display: 'flex', gap: 8 }}>
                                        <button className="icon-btn" onClick={() => editCard(card)} title="Editar" style={{ padding: 4 }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="delete-mini" onClick={() => deleteCard(card.id)} title="Excluir">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default CopingCards;
