import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import NotifikasiPage from './pages/NotifikasiPage';
import TransaksiPage from './pages/TransaksiPage';
import TambahTransaksiPage from './pages/TambahTransaksiPage';
import LaporanPage from './pages/LaporanPage';

// Initial dummy notifications
const INITIAL_NOTIFICATIONS = [
    { id: 1, message: 'Budget Makanan hampir habis (85% terpakai)', time: 'Sekitar 23 jam yang lalu', type: 'warning', read: false },
    { id: 2, message: 'Jangan lupa catat pengeluaran hari ini', time: '1 hari yang lalu', type: 'reminder', read: false },
    { id: 3, message: 'Transaksi berhasil disimpan: Langganan streaming', time: '1 hari yang lalu', type: 'success', read: true },
    { id: 4, message: 'Budget Transportasi hampir habis (80% terpakai)', time: '3 hari yang lalu', type: 'warning', read: true },
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
            case 'transaksi':
                return <TransaksiPage onNavigate={setCurrentPage} />;
            case 'tambah-transaksi':
                return <TambahTransaksiPage onNavigate={setCurrentPage} />;
            // case 'kategori':
            //     return <KategoriPage />;
            case 'laporan':
                return <LaporanPage />;
            case 'notifikasi':
                return (
                    <NotifikasiPage 
                        notifications={notifications} 
                        onMarkRead={handleMarkRead} 
                    />
                );
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
