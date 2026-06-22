import React, { useState, useEffect } from 'react';
import SummaryCard from '../components/SummaryCard';
import BudgetProgress from '../components/BudgetProgress';
import SpendingDonutChart from '../components/SpendingDonutChart';
import TransactionList from '../components/TransactionList';
import NotificationList from '../components/NotificationList';

/**
 * Helper: format angka ke format Rupiah (e.g. 17600000 → "Rp 17.600.000")
 *
 * @param {number} amount
 * @returns {string}
 */
function formatRupiah(amount) {
    return 'Rp ' + Math.abs(amount).toLocaleString('id-ID');
}

/**
 * DashboardPage
 *
 * Halaman utama aplikasi. Fetch data ringkasan dari /api/dashboard
 * sehingga semua angka mencerminkan data user yang sesungguhnya.
 *
 * @param {Array}    notifications - Notifikasi aktif dari App.jsx
 * @param {Function} onMarkRead    - Callback untuk menandai dibaca
 */
export default function DashboardPage({ notifications, onMarkRead, onNavigate, transactions = [], budgetData = null }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        fetch('/api/dashboard', {
            headers: {
                Accept: 'application/json',
                Authorization: token ? `Bearer ${token}` : '',
            },
        })
            .then((res) => {
                if (res.status === 401) {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                    if (onNavigate) onNavigate('auth');
                    throw new Error('Unauthenticated');
                }
                if (!res.ok) { throw new Error('Failed to load dashboard'); }
                return res.json();
            })
            .then((data) => setDashboardData(data))
            .catch((err) => console.error('Error fetching dashboard:', err))
            .finally(() => setIsLoading(false));
    }, [onNavigate, transactions, budgetData]);

    // Compute donut total label from spending data
    const donutTotal = dashboardData?.spendingData?.length
        ? formatRupiah(dashboardData.expense)
        : 'Rp 0';

    return (
        <div className="p-5 lg:p-7 max-w-6xl mx-auto space-y-5">

            {/* ── 1. HEADER ── */}
            <header className="flex items-start justify-between">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Dashboard
                    </h1>
                    <p
                        className="text-sm mt-0.5"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {dashboardData
                            ? `Ringkasan keuangan bulan ${dashboardData.monthLabel}`
                            : 'Memuat data keuangan Anda...'
                        }
                    </p>
                </div>
            </header>

            {/* ── 2. RINGKASAN KEUANGAN ── */}
            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SummaryCard
                        title="Pemasukan"
                        amount={isLoading ? '...' : formatRupiah(dashboardData?.income ?? 0)}
                        type="income"
                        subtitle={dashboardData ? `Bulan ${dashboardData.monthLabel}` : ''}
                    />
                    <SummaryCard
                        title="Pengeluaran"
                        amount={isLoading ? '...' : formatRupiah(dashboardData?.expense ?? 0)}
                        type="expense"
                        subtitle={dashboardData ? `Bulan ${dashboardData.monthLabel}` : ''}
                    />
                </div>
            </section>

            {/* ── 3. BUDGET HARIAN ── */}
            <section>
                <BudgetProgress
                    used={dashboardData?.dailyBudgetUsed ?? 0}
                    total={dashboardData?.dailyBudgetTotal ?? 0}
                />
            </section>

            {/* ── 4. ANALISIS + TRANSAKSI TERBARU ── */}
            <section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SpendingDonutChart
                        data={dashboardData?.spendingData ?? []}
                        total={donutTotal}
                        budgetTotal={dashboardData?.dailyBudgetTotal ?? 0}
                    />
                    <TransactionList
                        transactions={dashboardData?.recentTransactions ?? []}
                        onNavigate={onNavigate}
                    />
                </div>
            </section>

            {/* ── 5. NOTIFIKASI ── */}
            <section>
                <NotificationList notifications={notifications} onNavigate={onNavigate} />
            </section>
        </div>
    );
}
