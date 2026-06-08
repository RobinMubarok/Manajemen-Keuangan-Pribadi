import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import NotifikasiPage from './pages/NotifikasiPage';
import TransaksiPage from './pages/TransaksiPage';
import TambahTransaksiPage from './pages/TambahTransaksiPage';
import AturBudgetPage from './pages/AturBudgetPage';
import LaporanPage from './pages/LaporanPage';

// Initial dummy notifications
const INITIAL_NOTIFICATIONS = [
    { id: 1, message: 'Budget Makanan hampir habis (85% terpakai)', time: 'Sekitar 23 jam yang lalu', type: 'warning', read: false },
    { id: 2, message: 'Jangan lupa catat pengeluaran hari ini', time: '1 hari yang lalu', type: 'reminder', read: false },
    { id: 3, message: 'Transaksi berhasil disimpan: Langganan streaming', time: '1 hari yang lalu', type: 'success', read: true },
    { id: 4, message: 'Budget Transportasi hampir habis (80% terpakai)', time: '3 hari yang lalu', type: 'warning', read: true },
];

// Initial dummy transactions — nanti diganti dengan API call saat backend siap
const INITIAL_TRANSACTIONS = [
    { id: 1, date: '19/5/2026', category: 'Hiburan', description: 'Langganan Streaming', amount: -350000, type: 'Pengeluaran' },
    { id: 2, date: '18/5/2026', category: 'Beasiswa', description: 'Beasiswa Indonesia Jaya', amount: 5800000, type: 'Pemasukan' },
    { id: 3, date: '17/5/2026', category: 'Makanan', description: 'Kopi & Snack', amount: -50000, type: 'Pengeluaran' },
    { id: 4, date: '17/5/2026', category: 'Belanja', description: 'Beli Baju', amount: -750000, type: 'Pengeluaran' },
    { id: 5, date: '16/5/2026', category: 'Transportasi', description: 'Grab ke kampus', amount: -50000, type: 'Pengeluaran' },
    { id: 6, date: '15/5/2026', category: 'Makanan', description: 'DO Gacoan', amount: -50000, type: 'Pengeluaran' },
    { id: 7, date: '14/5/2026', category: 'Kesehatan', description: 'Vitamin C', amount: -200000, type: 'Pengeluaran' },
];

/**
 * Root App component.
 *
 * Handles page-level routing state and centralized transaction data.
 * When the team adds new pages, they only need to:
 *   1. Import the new page component.
 *   2. Add a case to the switch below.
 * MainLayout and Sidebar do NOT need to be modified.
 *
 * Transaction CRUD is centralized here so all pages share the same data.
 * When connecting to a database later, replace useState with API calls
 * (e.g. useEffect + fetch) and update the handlers to call the API.
 */
export default function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [notifications, setNotifications] = useState([]);
    const [transactions, setTransactions] = useState([]);

    // Fetch initial data from backend API
    useEffect(() => {
        // Fetch notifications
        fetch('/api/notifications')
            .then((res) => res.json())
            .then((data) => setNotifications(data))
            .catch((err) => console.error('Error fetching notifications:', err));
        // Fetch transactions
        fetch('/api/transactions')
            .then((res) => res.json())
            .then((data) => setTransactions(data))
            .catch((err) => console.error('Error fetching transactions:', err));
    }, []);

    // State untuk menyimpan transaksi yang sedang di-edit (dioper ke halaman edit)
    const [editingTransaction, setEditingTransaction] = useState(null);

    const handleMarkAllRead = () => {
        fetch('/api/notifications/mark-all-read', {
            method: 'POST',
        })
            .then(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))))
            .catch((err) => console.error('Error marking all notifications read:', err));
    };

    const handleMarkRead = (id) => {
        fetch(`/api/notifications/${id}/mark-read`, {
            method: 'POST',
        })
            .then(() => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))))
            .catch((err) => console.error('Error marking notification read:', err));
    };

    /* ─────────────── TRANSACTION CRUD HANDLERS ─────────────── */

    /**
     * Tambah transaksi baru.
     * Nanti: ganti dengan POST ke API /api/transactions
     *
     * @param {Object} transaction - Data transaksi tanpa id
     */
    const handleAddTransaction = (transaction) => {
        fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction),
        })
            .then((res) => res.json())
            .then((newTx) => setTransactions((prev) => [newTx, ...prev]))
            .catch((err) => console.error('Error adding transaction:', err));
    };

    /**
     * Update transaksi yang sudah ada.
     * Nanti: ganti dengan PUT ke API /api/transactions/{id}
     *
     * @param {Object} updatedTransaction - Data transaksi lengkap dengan id
     */
    const handleEditTransaction = (updatedTransaction) => {
        fetch(`/api/transactions/${updatedTransaction.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTransaction),
        })
            .then(() => setTransactions((prev) => prev.map((tx) => (tx.id === updatedTransaction.id ? updatedTransaction : tx))))
            .catch((err) => console.error('Error editing transaction:', err));
    };

    /**
     * Hapus transaksi berdasarkan id.
     * Nanti: ganti dengan DELETE ke API /api/transactions/{id}
     *
     * @param {number} id - ID transaksi yang akan dihapus
     */
    const handleDeleteTransaction = (id) => {
        fetch(`/api/transactions/${id}`, {
            method: 'DELETE',
        })
            .then(() => setTransactions((prev) => prev.filter((tx) => tx.id !== id)))
            .catch((err) => console.error('Error deleting transaction:', err));
    };

    /**
     * Navigasi ke halaman edit dengan data transaksi yang dipilih.
     *
     * @param {Object} transaction - Transaksi yang akan di-edit
     */
    const handleNavigateToEdit = (transaction) => {
        setEditingTransaction(transaction);
        setCurrentPage('edit-transaksi');
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
                return (
                    <TransaksiPage 
                        onNavigate={setCurrentPage} 
                        transactions={transactions}
                        onDelete={handleDeleteTransaction}
                        onNavigateToEdit={handleNavigateToEdit}
                    />
                );
            case 'tambah-transaksi':
                return (
                    <TambahTransaksiPage 
                        onNavigate={setCurrentPage} 
                        onAdd={handleAddTransaction}
                    />
                );
            case 'edit-transaksi':
                return (
                    <TambahTransaksiPage 
                        onNavigate={setCurrentPage} 
                        onEdit={handleEditTransaction}
                        editData={editingTransaction}
                    />
                );
            case 'atur-budget':
                return <AturBudgetPage onNavigate={setCurrentPage} />;
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
