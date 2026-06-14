import React from 'react';
import SummaryCard from '../components/SummaryCard';
import BudgetProgress from '../components/BudgetProgress';
import SpendingDonutChart from '../components/SpendingDonutChart';
import TransactionList from '../components/TransactionList';
import NotificationList from '../components/NotificationList';

/* ─────────────────────────── DATA STATIS ─────────────────────────── */
/* Ganti dengan API call / props dari parent saat backend sudah siap   */

const SPENDING_DATA = [
    { name: 'Jajan',          value: 36 },
    { name: 'Makan',          value: 31 },
    { name: 'Kebutuhan Kost', value: 16 },
    { name: 'Kesehatan',      value: 11 },
    { name: 'Transportasi',   value: 5  },
];

const TRANSACTIONS = [
    { id: 1, name: 'Gacoan',       amount: -30000, date: 'Hari ini, 12:30',  category: 'Makan' },
    { id: 2, name: 'Isi Bensin',   amount: -20000, date: 'Hari ini, 09:15',  category: 'Transportasi' },
    { id: 3, name: 'Beli Vitamin', amount: -40000, date: 'Kemarin, 18:00',   category: 'Kesehatan' },
];

/* ─────────────────────────── KOMPONEN ──────────────────────────────── */

/**
 * DashboardPage
 *
 * Halaman utama aplikasi. Komponen ini hanya bertanggung jawab
 * merangkai section-section Dashboard — logika & data sepenuhnya
 * terpisah sehingga mudah diganti dengan API nyata.
 *
 * Anggota tim TIDAK perlu mengubah MainLayout atau Sidebar
 * untuk menambah halaman baru.
 *
 * @param {Array}    notifications - Notifikasi aktif dari App.jsx
 * @param {Function} onMarkRead    - Callback untuk menandai dibaca
 */
export default function DashboardPage({ notifications, onMarkRead }) {
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
                        Selamat datang! Berikut ringkasan keuangan Anda
                    </p>
                </div>
            </header>

            {/* ── 2. RINGKASAN KEUANGAN ── */}
            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SummaryCard
                        title="Pemasukan"
                        amount="Rp 17.600.000"
                        type="income"
                        subtitle="Bulan Mei 2026"
                    />
                    <SummaryCard
                        title="Pengeluaran"
                        amount="Rp 5.800.000"
                        type="expense"
                        subtitle="Bulan Mei 2026"
                    />
                </div>
            </section>

            {/* ── 3. BUDGET HARIAN ── */}
            <section>
                <BudgetProgress used={30000} total={75000} />
            </section>

            {/* ── 4. ANALISIS + TRANSAKSI TERBARU ── */}
            <section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SpendingDonutChart data={SPENDING_DATA} total="Rp 5,8jt" />
                    <TransactionList transactions={TRANSACTIONS} />
                </div>
            </section>

            {/* ── 5. NOTIFIKASI ── */}
            <section>
                <NotificationList notifications={notifications} />
            </section>
        </div>
    );
}
