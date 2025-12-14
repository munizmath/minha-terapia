import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import NotificationOverlay from '../NotificationOverlay';

const Layout = () => {
    return (
        <div className="app-layout">
            <main className="app-content">
                <Outlet />
            </main>
            <Navbar />
            <NotificationOverlay />
        </div>
    );
};

export default Layout;
