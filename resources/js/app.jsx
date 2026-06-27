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
import { AuthProvider, useAuth } from './contexts/AuthContext';

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
    const { user, loading, logout, refreshUser } = useAuth();
    const [currentPage, setCurrentPage] = useState('dashboard');

    const [notifications, setNotifications] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [budgetData, setBudgetData] = useState(null);
    const [isLoadingNotif, setIsLoadingNotif] = useState(false);
    const [dashboardSummary, setDashboardSummary] = useState(null);

    // State untuk menyimpan transaksi yang sedang di-edit
    const [editingTransaction, setEditingTransaction] = useState(null);

    /**
     * Centralized function to handle authentication failure (e.g. invalid/expired token).
     */
    const handleAuthFailure = useCallback(() => {
        logout();
    }, [logout]);

    /**
     * Fetch semua data awal dari API setelah login.
     * Hanya dipanggil ketika user sudah ter-autentikasi.
     */
    const fetchInitialData = useCallback(() => {
        const headers = authHeaders();
        setIsLoadingNotif(true);

        fetch('/api/notifications', { headers })
            .then((res) => {
                if (res.status === 401) {
                    handleAuthFailure();
                    throw new Error('Unauthenticated');
                }
                if (!res.ok) { throw new Error('Failed to fetch notifications'); }
                return res.json();
            })
            .then((data) => setNotifications(data))
            .catch((err) => console.error('Error fetching notifications:', err))
            .finally(() => setIsLoadingNotif(false));

        fetch('/api/transactions', { headers })
            .then((res) => {
                if (res.status === 401) {
                    handleAuthFailure();
                    throw new Error('Unauthenticated');
                }
                if (!res.ok) { throw new Error('Failed to fetch transactions'); }
                return res.json();
            })
            .then((data) => {
                setTransactions(data);
                // After initial load, evaluate budget alerts
                checkBudgetAlerts(budgetData, data);
            })
            .catch((err) => console.error('Error fetching transactions:', err));

        fetch('/api/categories', { headers })
            .then((res) => {
                if (res.status === 401) {
                    handleAuthFailure();
                    throw new Error('Unauthenticated');
                }
                if (!res.ok) { throw new Error('Failed to fetch categories'); }
                return res.json();
            })
            .then((data) => setCategories(data))
            .catch((err) => console.error('Error fetching categories:', err));

        fetch('/api/budget', { headers })
            .then((res) => {
                if (res.status === 401) {
                    handleAuthFailure();
                    throw new Error('Unauthenticated');
                }
                if (!res.ok) { throw new Error('Failed to fetch budget'); }
                return res.json();
            })
            .then((data) => setBudgetData(data))
            .catch((err) => console.error('Error fetching budget:', err));

        fetch('/api/dashboard', { headers })
            .then((res) => {
                if (res.status === 401) { throw new Error('Unauthenticated'); }
                if (!res.ok) { throw new Error('Failed to fetch dashboard'); }
                return res.json();
            })
            .then((data) => setDashboardSummary(data))
            .catch((err) => console.error('Error fetching dashboard summary:', err));
    }, [handleAuthFailure]);

    // Track login status and dynamically set page routes
    useEffect(() => {
        if (!loading) {
            if (!user) {
                setCurrentPage('auth');
            } else if (currentPage === 'auth') {
                setCurrentPage('dashboard');
            }
        }
    }, [user, loading, currentPage]);

    // Fetch initial transactions/notifications when user is loaded
    useEffect(() => {
        if (user) {
            fetchInitialData();
        }
    }, [user, fetchInitialData]);

    /**
     * Auto-create notifikasi budget harian saat dashboardSummary tersedia.
     * Dipanggil setiap kali dashboardSummary atau budgetData berubah.
     * Throttle: max 1 per hari per threshold (via localStorage).
     */
    useEffect(() => {
        if (!dashboardSummary || !budgetData || !user) return;

        // Jangan kirim notifikasi jika setting notifikasi dimatikan
        if (!budgetData.notifikasi) return;

        const dailyUsed  = dashboardSummary.dailyBudgetUsed  ?? 0;
        const dailyTotal = dashboardSummary.dailyBudgetTotal ?? (budgetData.harian ?? 0);
        if (dailyTotal <= 0) return;

        const dailyPct = (dailyUsed / dailyTotal) * 100;
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const sentKey = `budget_daily_alert_${today}`;
        const alreadySent = localStorage.getItem(sentKey) || '';

        const sendNotif = async (title, message, level) => {
            if (alreadySent.includes(level)) return;
            try {
                const res = await fetch('/api/notifications', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({ title, message, type: 'warning' }),
                });
                if (res.ok) {
                    const newNotif = await res.json();
                    setNotifications((prev) => {
                        // Hindari duplikat di state
                        if (prev.some((n) => n.id === newNotif.id)) return prev;
                        return [newNotif, ...prev];
                    });
                    localStorage.setItem(sentKey, alreadySent + level);
                }
            } catch (err) {
                console.error('Error sending budget notif:', err);
            }
        };

        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const pct = Math.round(dailyPct);

        // Cek alertMelebihi untuk kondisi >= 100%
        if (budgetData.alertMelebihi && dailyPct >= 100) {
            sendNotif(
                'Peringatan Budget',
                `Budget Harian sudah melebihi batas (${pct}% terpakai pada ${dateStr})`,
                'exceeded'
            );
        // Cek alertHampirHabis untuk kondisi 80-99%
        } else if (budgetData.alertHampirHabis && dailyPct >= 80) {
            sendNotif(
                'Peringatan Budget',
                `Budget Harian hampir habis (${pct}% terpakai pada ${dateStr})`,
                'near'
            );
        }
    }, [dashboardSummary, budgetData, user]);

    /* ─────────────── AUTH HANDLERS ─────────────── */

    /**
     * Dipanggil oleh AuthPage setelah login/register berhasil.
     * Token sudah disimpan ke localStorage oleh AuthPage.
     */
    const handleLogin = (page) => {
        refreshUser();
        setCurrentPage(page || 'dashboard');
    };

    /**
     * Logout: hapus token, kembali ke halaman auth.
     */
    const handleLogout = () => {
        logout().finally(() => {
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

    /**
     * Re-fetch semua notifikasi dari server dan perbarui state.
     * Dipanggil setelah setiap mutasi transaksi agar bell icon & sidebar selalu sinkron.
     */
    const refreshNotifications = useCallback(() => {
        setIsLoadingNotif(true);
        fetch('/api/notifications', { headers: authHeaders() })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to refresh notifications');
                return res.json();
            })
            .then((data) => setNotifications(data))
            .catch((err) => console.error('Error refreshing notifications:', err))
            .finally(() => setIsLoadingNotif(false));
    }, []);

    /**
     * Kirim notifikasi baru ke database dan perbarui state di frontend.
     *
     * @param {string} title   - Judul notifikasi
     * @param {string} message - Isi pesan notifikasi
     * @param {string} type    - Tipe notifikasi ('success', 'info', 'warning')
     */
    const addTransactionNotification = useCallback(async (title, message, type) => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ title, message, type }),
            });
            if (res.ok) {
                refreshNotifications();
            }
        } catch (err) {
            console.error('Error adding transaction notification:', err);
        }
    }, [refreshNotifications]);

    /* ─────────────── TRANSACTION CRUD HANDLERS ─────────────── */

    /**
     * Tambah transaksi baru.
     *
     * @param {Object} transaction - Data transaksi tanpa id
     */
    const refreshDashboardSummary = useCallback(() => {
        fetch('/api/dashboard', { headers: authHeaders() })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to refresh dashboard');
                return res.json();
            })
            .then((data) => setDashboardSummary(data))
            .catch((err) => console.error('Error refreshing dashboard summary:', err));
    }, []);

    const handleAddTransaction = async (transaction) => {
        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(transaction),
            });
            const newTx = await res.json();
            const updatedTransactions = [newTx, ...transactions];
            setTransactions(updatedTransactions);
            
            // Refresh dashboard summary agar dailyBudgetUsed terupdate
            refreshDashboardSummary();

            // Cek budget alert setelah transaksi baru ditambahkan
            if (budgetData) {
                await checkBudgetAlerts(budgetData, updatedTransactions);
            }

            // Kirim notifikasi transaksi berhasil ditambahkan
            const formattedAmount = 'Rp ' + Math.abs(Number(newTx.amount)).toLocaleString('id-ID');
            const typeLabel = newTx.type === 'Pemasukan' ? 'Pemasukan' : 'Pengeluaran';
            await addTransactionNotification(
                '✅ Transaksi Berhasil',
                `${typeLabel} ${formattedAmount} berhasil ditambahkan`,
                'success'
            );
        } catch (err) {
            console.error('Error adding transaction:', err);
        }
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
            .then(() => {
                // Update local state
                setTransactions((prev) => prev.map((tx) => (tx.id === updatedTransaction.id ? updatedTransaction : tx)));
                
                // Re‑evaluate budget alerts after edit
                if (budgetData) {
                    checkBudgetAlerts(budgetData, transactions.map((tx) => (tx.id === updatedTransaction.id ? updatedTransaction : tx)));
                }

                // Kirim notifikasi transaksi berhasil diperbarui
                addTransactionNotification(
                    '✏️ Transaksi Diperbarui',
                    `Transaksi "${updatedTransaction.description}" berhasil diperbarui`,
                    'info'
                );
            })
            .catch((err) => console.error('Error editing transaction:', err));
    };

    /**
     * Hapus transaksi berdasarkan id.
     *
     * @param {number} id - ID transaksi yang akan dihapus
     */
    const handleDeleteTransaction = (id) => {
        const targetTx = transactions.find((tx) => tx.id === id);
        const description = targetTx ? targetTx.description : 'transaksi';

        fetch(`/api/transactions/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        })
            .then(() => {
                setTransactions((prev) => prev.filter((tx) => tx.id !== id));
                
                // Kirim notifikasi transaksi berhasil dihapus
                addTransactionNotification(
                    '🗑️ Transaksi Dihapus',
                    `Transaksi "${description}" berhasil dihapus`,
                    'warning'
                );
            })
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
     * Cek apakah pengeluaran bulan ini sudah melewati threshold budget
     * dan tambahkan notifikasi ke state (& API) jika perlu.
     *
     * @param {Object} budget      - Budget data (dari state atau freshly saved)
     * @param {Array}  txList      - Daftar transaksi saat ini
     */
    const checkBudgetAlerts = useCallback(async (budget, txList) => {
        if (!budget || !budget.notifikasi) return;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Total pengeluaran bulan ini
        const totalSpent = txList
            .filter((tx) => {
                if (!(tx.type === 'Pengeluaran' || (typeof tx.amount === 'number' && tx.amount < 0))) return false;
                const txDate = new Date(tx.date);
                return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
            })
            .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

        const totalBudget = budget.bulanan || 0;
        if (totalBudget <= 0) return;

        const percentage = (totalSpent / totalBudget) * 100;
        const headers = authHeaders();
        const todayKey = `${currentYear}-${currentMonth}`;
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        // Throttle: max 1 alert per threshold per bulan
        const sentKey = `budget_alert_sent_${todayKey}`;
        const alreadySent = localStorage.getItem(sentKey) || '';

        const addNotif = async (type, message, level) => {
            if (alreadySent.includes(level)) return; // sudah kirim hari ini
            try {
                const res = await fetch('/api/notifications', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ type, message }),
                });
                if (res.ok) {
                    const newNotif = await res.json();
                    setNotifications((prev) => [newNotif, ...prev]);
                    localStorage.setItem(sentKey, alreadySent + level);
                }
            } catch (err) {
                console.error('Error adding notification:', err);
            }
        };

        if (budget.alertMelebihi && percentage >= 100) {
            await addNotif('warning', `🚨 Budget bulanan MELEBIHI batas! Pengeluaran ${Math.round(percentage)}% dari budget. (${timeStr})`, 'exceeded');
        } else if (budget.alertHampirHabis && percentage >= 80) {
            await addNotif('warning', `⚠️ Budget bulanan hampir habis! Pengeluaran sudah ${Math.round(percentage)}% dari budget. (${timeStr})`, 'near');
        }
    }, []);


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

        // Cek alert langsung setelah budget disimpan
        await checkBudgetAlerts(saved, transactions);
    };

    /* ─────────────── PROFILE HANDLERS ─────────────── */

    // Profile updates are handled directly inside ProfilPage.jsx using the Context API

    /* ─────────────── RENDER ─────────────── */

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return (
                    <DashboardPage
                        notifications={notifications}
                        onMarkRead={handleMarkRead}
                        onNavigate={setCurrentPage}
                        transactions={transactions}
                        budgetData={budgetData}
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
                return <LaporanPage onNavigate={setCurrentPage} />;
            case 'notifikasi':
                return (
                    <NotifikasiPage
                        notifications={notifications}
                        onMarkRead={handleMarkRead}
                        onMarkAllRead={handleMarkAllRead}
                        dashboardSummary={dashboardSummary}
                        budgetData={budgetData}
                        onNavigate={setCurrentPage}
                    />
                );
            case 'profil':
                return <ProfilPage onNavigate={setCurrentPage} />;
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

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b09] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-emerald-400 text-sm font-medium tracking-wide">Memuat aplikasi...</p>
            </div>
        );
    }

    if (currentPage === 'auth') {
        return <AuthPage onLogin={handleLogin} />;
    }

    return (
        <MainLayout
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            notifications={notifications}
            isLoadingNotif={isLoadingNotif}
            onMarkAllRead={handleMarkAllRead}
            onMarkRead={handleMarkRead}
            onLogout={handleLogout}
            budgetData={budgetData}
            transactions={transactions}
            userProfile={user}
            dashboardSummary={dashboardSummary}
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
            <AuthProvider>
                <App />
            </AuthProvider>
        </React.StrictMode>
    );
}
