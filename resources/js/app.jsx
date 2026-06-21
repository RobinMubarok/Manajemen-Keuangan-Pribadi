import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import NotifikasiPage from './pages/NotifikasiPage';
import TransaksiPage from './pages/TransaksiPage';
import TambahTransaksiPage from './pages/TambahTransaksiPage';
import AturBudgetPage from './pages/AturBudgetPage';
import LaporanPage from './pages/LaporanPage';
import AuthPage from './pages/AuthPage';
import ProfilPage from './pages/ProfilPage';

/**
 * Helper: return Authorization headers from localStorage token.
 * All authenticated API calls must use this.
 *
 * @returns {Record<string, string>}
 */
function authHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

/**
 * Root App component.
 *
 * Handles page-level routing state and centralized data.
 * Authentication state is derived from localStorage token.
 * All API calls include Bearer token via authHeaders().
 */
export default function App() {
    // Determine initial page based on whether a token is already stored
    const hasToken = Boolean(localStorage.getItem('auth_token'));
    const [currentPage, setCurrentPage] = useState(hasToken ? 'dashboard' : 'auth');

    const [notifications, setNotifications] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [budgetData, setBudgetData] = useState(null);

    const [userProfile, setUserProfile] = useState(() => {
        const stored = localStorage.getItem('auth_user');
        if (stored) {
            const user = JSON.parse(stored);
            return {
                firstName: user.name?.split(' ')[0] || user.name,
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                email: user.email,
                dobDay: '',
                dobMonth: '',
                dobYear: '',
                gender: '',
                photo: null,
            };
        }
        return {
            firstName: '',
            lastName: '',
            email: '',
            dobDay: '',
            dobMonth: '',
            dobYear: '',
            gender: '',
            photo: null,
        };
    });

    // State untuk menyimpan transaksi yang sedang di-edit
    const [editingTransaction, setEditingTransaction] = useState(null);

    /**
     * Fetch semua data awal dari API setelah login.
     * Hanya dipanggil ketika user sudah ter-autentikasi.
     */
    const fetchInitialData = useCallback(() => {
        const headers = authHeaders();

        fetch('/api/notifications', { headers })
            .then((res) => {
                if (!res.ok) { throw new Error('Unauthenticated'); }
                return res.json();
            })
            .then((data) => setNotifications(data))
            .catch((err) => console.error('Error fetching notifications:', err));

        fetch('/api/transactions', { headers })
            .then((res) => {
                if (!res.ok) { throw new Error('Unauthenticated'); }
                return res.json();
            })
            .then((data) => setTransactions(data))
            .catch((err) => console.error('Error fetching transactions:', err));

        fetch('/api/categories', { headers })
            .then((res) => {
                if (!res.ok) { throw new Error('Unauthenticated'); }
                return res.json();
            })
            .then((data) => setCategories(data))
            .catch((err) => console.error('Error fetching categories:', err));

        fetch('/api/budget', { headers })
            .then((res) => {
                if (!res.ok) { throw new Error('Unauthenticated'); }
                return res.json();
            })
            .then((data) => setBudgetData(data))
            .catch((err) => console.error('Error fetching budget:', err));

        fetch('/api/user', { headers })
            .then((res) => {
                if (!res.ok) { throw new Error('Unauthenticated'); }
                return res.json();
            })
            .then((data) => {
                setUserProfile({
                    firstName: data.first_name || data.name?.split(' ')[0] || '',
                    lastName: data.last_name || data.name?.split(' ').slice(1).join(' ') || '',
                    email: data.email,
                    dobYear: data.dob ? data.dob.split('-')[0] : '',
                    dobMonth: data.dob ? data.dob.split('-')[1] : '',
                    dobDay: data.dob ? data.dob.split('-')[2] : '',
                    gender: data.gender || '',
                    photo: data.photo_url || null,
                });
                localStorage.setItem('auth_user', JSON.stringify(data));
            })
            .catch((err) => console.error('Error fetching user profile:', err));
    }, []);

    useEffect(() => {
        if (currentPage !== 'auth') {
            fetchInitialData();
        }
    }, [currentPage, fetchInitialData]);

    /* ─────────────── AUTH HANDLERS ─────────────── */

    /**
     * Dipanggil oleh AuthPage setelah login/register berhasil.
     * Token sudah disimpan ke localStorage oleh AuthPage.
     */
    const handleLogin = (page) => {
        // Refresh user profile from localStorage after login
        const stored = localStorage.getItem('auth_user');
        if (stored) {
            const user = JSON.parse(stored);
            setUserProfile({
                firstName: user.first_name || user.name?.split(' ')[0] || user.name,
                lastName: user.last_name || user.name?.split(' ').slice(1).join(' ') || '',
                email: user.email,
                dobYear: user.dob ? user.dob.split('-')[0] : '',
                dobMonth: user.dob ? user.dob.split('-')[1] : '',
                dobDay: user.dob ? user.dob.split('-')[2] : '',
                gender: user.gender || '',
                photo: user.photo_url || null,
            });
        }
        setCurrentPage(page || 'dashboard');
    };

    /**
     * Logout: hapus token, kembali ke halaman auth.
     */
    const handleLogout = () => {
        fetch('/api/logout', {
            method: 'POST',
            headers: authHeaders(),
        }).finally(() => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            setNotifications([]);
            setTransactions([]);
            setCategories([]);
            setBudgetData(null);
            setCurrentPage('auth');
        });
    };

    /* ─────────────── NOTIFICATION HANDLERS ─────────────── */

    const handleMarkAllRead = () => {
        fetch('/api/notifications/mark-all-read', {
            method: 'POST',
            headers: authHeaders(),
        })
            .then(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))))
            .catch((err) => console.error('Error marking all notifications read:', err));
    };

    const handleMarkRead = (id) => {
        fetch(`/api/notifications/${id}/mark-read`, {
            method: 'POST',
            headers: authHeaders(),
        })
            .then(() => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))))
            .catch((err) => console.error('Error marking notification read:', err));
    };

    /* ─────────────── TRANSACTION CRUD HANDLERS ─────────────── */

    /**
     * Tambah transaksi baru.
     *
     * @param {Object} transaction - Data transaksi tanpa id
     */
    const handleAddTransaction = (transaction) => {
        fetch('/api/transactions', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(transaction),
        })
            .then((res) => res.json())
            .then((newTx) => setTransactions((prev) => [newTx, ...prev]))
            .catch((err) => console.error('Error adding transaction:', err));
    };

    /**
     * Update transaksi yang sudah ada.
     *
     * @param {Object} updatedTransaction - Data transaksi lengkap dengan id
     */
    const handleEditTransaction = (updatedTransaction) => {
        fetch(`/api/transactions/${updatedTransaction.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(updatedTransaction),
        })
            .then(() => setTransactions((prev) => prev.map((tx) => (tx.id === updatedTransaction.id ? updatedTransaction : tx))))
            .catch((err) => console.error('Error editing transaction:', err));
    };

    /**
     * Hapus transaksi berdasarkan id.
     *
     * @param {number} id - ID transaksi yang akan dihapus
     */
    const handleDeleteTransaction = (id) => {
        fetch(`/api/transactions/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
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

    /* ─────────────── CATEGORY CRUD HANDLERS ─────────────── */

    /**
     * Tambah kategori baru via API.
     *
     * @param {{ name: string, type: string, icon: string, color: string }} category
     */
    const handleAddCategory = async (category) => {
        const res = await fetch('/api/categories', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(category),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to add category');
        }

        const newCat = await res.json();
        setCategories((prev) => [...prev, newCat]);
    };

    /**
     * Hapus kategori via API.
     *
     * @param {number} id - ID kategori
     */
    const handleDeleteCategory = (id) => {
        fetch(`/api/categories/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        })
            .then(() => setCategories((prev) => prev.filter((c) => c.id !== id)))
            .catch((err) => console.error('Error deleting category:', err));
    };

    /* ─────────────── BUDGET HANDLERS ─────────────── */

    /**
     * Simpan budget via API dan update state.
     *
     * @param {Object} data - Data budget dari AturBudgetPage
     */
    const handleSaveBudget = async (data) => {
        const res = await fetch('/api/budget', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error('Gagal menyimpan budget');
        }

        const saved = await res.json();
        setBudgetData(saved);
    };

    /* ─────────────── PROFILE HANDLERS ─────────────── */

    const handleUpdateProfile = async (formData, photoFile) => {
        let dob = null;
        if (formData.dobYear && formData.dobMonth && formData.dobDay) {
            dob = `${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}`;
        }
        
        const payload = new FormData();
        payload.append('first_name', formData.firstName || '');
        payload.append('last_name', formData.lastName || '');
        payload.append('email', formData.email || '');
        if (dob) payload.append('dob', dob);
        payload.append('gender', formData.gender || '');
        if (photoFile) {
            payload.append('photo', photoFile);
        }
        
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('/api/profile', {
                method: 'POST', // POST with FormData for file upload
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: payload,
            });
            
            if (!res.ok) throw new Error('Gagal update profil');
            const data = await res.json();
            
            const newUserProfile = {
                ...formData,
                firstName: data.first_name || '',
                lastName: data.last_name || '',
                email: data.email,
                dobYear: data.dob ? data.dob.split('-')[0] : '',
                dobMonth: data.dob ? data.dob.split('-')[1] : '',
                dobDay: data.dob ? data.dob.split('-')[2] : '',
                gender: data.gender || '',
                photo: data.photo_url || formData.photo,
            };
            setUserProfile(newUserProfile);
            localStorage.setItem('auth_user', JSON.stringify(data));
        } catch (error) {
            console.error(error);
        }
    };

    /* ─────────────── RENDER ─────────────── */

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return (
                    <DashboardPage
                        notifications={notifications}
                        onMarkRead={handleMarkRead}
                        onNavigate={setCurrentPage}
                    />
                );
            case 'transaksi':
                return (
                    <TransaksiPage
                        onNavigate={setCurrentPage}
                        transactions={transactions}
                        onDelete={handleDeleteTransaction}
                        onNavigateToEdit={handleNavigateToEdit}
                        categories={categories}
                        onAddCategory={handleAddCategory}
                        onDeleteCategory={handleDeleteCategory}
                    />
                );
            case 'tambah-transaksi':
                return (
                    <TambahTransaksiPage
                        onNavigate={setCurrentPage}
                        onAdd={handleAddTransaction}
                        categories={categories}
                    />
                );
            case 'edit-transaksi':
                return (
                    <TambahTransaksiPage
                        onNavigate={setCurrentPage}
                        onEdit={handleEditTransaction}
                        editData={editingTransaction}
                        categories={categories}
                    />
                );
            case 'atur-budget':
                return (
                    <AturBudgetPage
                        onNavigate={setCurrentPage}
                        budgetData={budgetData}
                        onSave={handleSaveBudget}
                    />
                );
            case 'laporan':
                return <LaporanPage />;
            case 'notifikasi':
                return (
                    <NotifikasiPage
                        notifications={notifications}
                        onMarkRead={handleMarkRead}
                    />
                );
            case 'profil':
                return <ProfilPage userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />;
            default:
                return (
                    <DashboardPage
                        notifications={notifications}
                        onMarkRead={handleMarkRead}
                        onNavigate={setCurrentPage}
                    />
                );
        }
    };

    if (currentPage === 'auth') {
        return <AuthPage onLogin={handleLogin} />;
    }

    return (
        <MainLayout
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            notifications={notifications}
            onMarkAllRead={handleMarkAllRead}
            onMarkRead={handleMarkRead}
            userProfile={userProfile}
            onLogout={handleLogout}
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
