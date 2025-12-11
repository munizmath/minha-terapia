import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './TopBar.css';

const TopBar = () => {
    const today = new Date();

    return (
        <header className="top-bar">
            <div className="date-display">
                <h1>{format(today, "EEEE", { locale: ptBR })}</h1>
                <p>{format(today, "d 'de' MMMM", { locale: ptBR })}</p>
            </div>
            <div className="actions">
                {/* User profile or settings placeholder */}
                <div className="avatar-placeholder">M</div>
            </div>
        </header>
    );
};

export default TopBar;
