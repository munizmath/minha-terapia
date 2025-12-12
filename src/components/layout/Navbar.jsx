import React from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarCheck, Pill, BarChart3, Users, BookOpen } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="bottom-nav">
            <NavLink
                to="/"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <CalendarCheck size={24} />
                <span>Hoje</span>
            </NavLink>

            <NavLink
                to="/medications"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <Pill size={24} />
                <span>Medicamentos</span>
            </NavLink>

            <NavLink
                to="/agenda-tcc"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <BookOpen size={24} />
                <span>Psicoterapia</span>
            </NavLink>

            <NavLink
                to="/progress"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <BarChart3 size={24} />
                <span>Progresso</span>
            </NavLink>

            <NavLink
                to="/support"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <Users size={24} />
                <span>Apoio</span>
            </NavLink>
        </nav>
    );
};

export default Navbar;
