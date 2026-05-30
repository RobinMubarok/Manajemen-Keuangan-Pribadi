import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';

// Initial dummy notifications
const INITIAL_NOTIFICATIONS = [
    { id: 1, message: 'Belum mencatat transaksi hari ini', time: '5 jam lalu',  type: 'info',    read: false },
    { id: 2, message: 'Budget harian hampir habis',        time: '1 jam lalu',  type: 'warning', read: false },
];

/**
 * Root App component.
 *
 * Handles page-level routing state. When the team adds new pages
 * (Transaksi, Kategori, Laporan, Notifikasi), they only need to:
 *   1. Import the new page component.
 *   2. Add a case to the switch below.
 * MainLayout and Sidebar do NOT need to be modified.
 */
export default function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleMarkRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return (
                    <DashboardPage 
                        notifications={notifications} 
                        onMarkRead={handleMarkRead} 
                    />
                );
            // Tim dapat menambahkan halaman baru di sini:
            // case 'transaksi':
            //     return <TransaksiPage />;
            // case 'kategori':
            //     return <KategoriPage />;
            // case 'laporan':
            //     return <LaporanPage />;
            // case 'notifikasi':
            //     return <NotifikasiPage />;
            default:
                return (
                    <DashboardPage 
                        notifications={notifications} 
                        onMarkRead={handleMarkRead} 
                    />
                );
        }
    };

    return (
        <MainLayout 
            currentPage={currentPage} 
            onNavigate={setCurrentPage}
            notifications={notifications}
            onMarkAllRead={handleMarkAllRead}
            onMarkRead={handleMarkRead}
        >
            {renderPage()}
        </MainLayout>
    );
}

// Mount React App to #app
const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
