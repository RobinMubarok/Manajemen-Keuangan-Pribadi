import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const MONTHS = [
    { value: '01', name: 'Januari' },
    { value: '02', name: 'Februari' },
    { value: '03', name: 'Maret' },
    { value: '04', name: 'April' },
    { value: '05', name: 'Mei' },
    { value: '06', name: 'Juni' },
    { value: '07', name: 'Juli' },
    { value: '08', name: 'Agustus' },
    { value: '09', name: 'September' },
    { value: '10', name: 'Oktober' },
    { value: '11', name: 'November' },
    { value: '12', name: 'Desember' }
];

const YEARS = ['2024', '2025', '2026', '2027'];

export default function LaporanPage() {
    const [selectedMonth, setSelectedMonth] = useState('05'); // Default: Mei
    const [selectedYear, setSelectedYear] = useState('2026'); // Default: 2026
    // State for transactions fetched from API
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch transactions from backend API whenever month/year filter changes
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        setLoading(true);
        setError(null);
        fetch(`/api/transactions?month=${selectedMonth}&year=${selectedYear}`, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setTransactions(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch transactions:', err);
                setError(err.message);
                setLoading(false);
            });
    }, [selectedMonth, selectedYear]);

    // Transactions are already filtered by month/year from the API
    const filteredTransactions = transactions;

    // Hitung total pemasukan dan pengeluaran secara dinamis
    const totalPemasukan = filteredTransactions
        .filter(tx => tx.type === 'Pemasukan')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const totalPengeluaran = filteredTransactions
        .filter(tx => tx.type === 'Pengeluaran')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    // Format Rupiah (Indonesia) dengan desimal/sen senilai ,00 sesuai gambar
    const formatRupiah = (amount) => {
        const formatted = amount.toLocaleString('id-ID');
        return `Rp. ${formatted},00`;
    };

    // Ekspor ke CSV
    const exportCSV = () => {
        const headers = ['Tanggal', 'Kategori', 'Deskripsi', 'Jumlah', 'Tipe'];
        const rows = filteredTransactions.map(tx => [
            tx.date,
            tx.category,
            tx.description,
            tx.amount,
            tx.type
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const monthName = MONTHS.find(m => m.value === selectedMonth)?.name || selectedMonth;
        link.setAttribute("download", `Laporan_Keuangan_${monthName}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const currentMonthName = MONTHS.find(m => m.value === selectedMonth)?.name || 'Mei';

    // Ekspor ke PDF secara langsung tanpa dialog
    const exportPDF = () => {
        const element = document.getElementById('laporan-content');
        if (!element) return;

        const opt = {
            margin:       0.5,
            filename:     `Laporan_Keuangan_${currentMonthName}_${selectedYear}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    return (
        <div id="laporan-content" className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto print:p-0 print:max-w-full">
            {/* ── 1. HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold font-serif"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Report Keuangan
                    </h1>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Analisis lengkap transaksi bulanan
                    </p>
                </div>
                <div id="action-buttons" className="flex items-center gap-3 print:hidden" data-html2canvas-ignore="true">
                    <button 
                        onClick={exportPDF}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all"
                        style={{
                            backgroundColor: 'var(--accent-muted)',
                            color: 'var(--accent)',
                            border: '1px solid var(--accent-border)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(74,222,128,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent-muted)'}
                    >
                        <Download size={18} />
                        Export PDF
                    </button>
                    <button 
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all"
                        style={{
                            backgroundColor: 'var(--accent)',
                            color: 'var(--text-on-accent)',
                            border: 'none',
                            borderRadius: 'var(--r-pill)',
                            fontWeight: 700,
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* ── 2. DATE SELECTOR BAR ── */}
            <div
                id="filter-bar"
                className="p-4 rounded-2xl flex items-center gap-3 print:hidden"
                data-html2canvas-ignore="true"
                style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                }}
            >
                <Calendar style={{ color: 'var(--text-muted)' }} size={22} />
                
                {/* Dropdown Bulan */}
                <div className="relative flex items-center">
                    <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="appearance-none font-medium focus:outline-none cursor-pointer pr-8 pl-1 text-sm sm:text-base bg-transparent"
                        style={{ color: 'var(--text-body)', border: 'none' }}
                    >
                        {MONTHS.map(m => (
                            <option key={m.value} value={m.value}>{m.name}</option>
                        ))}
                    </select>
                    <ChevronDown
                        className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none"
                        size={16}
                        style={{ color: 'var(--text-body)' }}
                    />
                </div>

                <div
                    className="w-px h-6"
                    style={{ backgroundColor: 'var(--border-default)' }}
                />

                {/* Dropdown Tahun */}
                <div className="relative flex items-center">
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="appearance-none font-medium focus:outline-none cursor-pointer pr-8 pl-1 text-sm sm:text-base bg-transparent"
                        style={{ color: 'var(--text-body)', border: 'none' }}
                    >
                        {YEARS.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <ChevronDown
                        className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none"
                        size={16}
                        style={{ color: 'var(--text-body)' }}
                    />
                </div>
            </div>

            {/* ── 3. SUMMARY CARDS (2 Column Grid) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Pemasukan */}
                <div
                    className="rounded-2xl p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden"
                    style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--accent-border)',
                    }}
                >
                    <p
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Total Pemasukan
                    </p>
                    <p
                        className="text-3xl font-bold font-serif text-center mt-4"
                        style={{ color: 'var(--positive)' }}
                    >
                        {formatRupiah(totalPemasukan)}
                    </p>
                </div>

                {/* Total Pengeluaran */}
                <div
                    className="rounded-2xl p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden"
                    style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                    }}
                >
                    <p
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Total Pengeluaran
                    </p>
                    <p
                        className="text-3xl font-bold font-serif text-center mt-4"
                        style={{ color: 'var(--negative)' }}
                    >
                        {formatRupiah(totalPengeluaran)}
                    </p>
                </div>
            </div>

            {/* ── 4. TABLE SECTION ── */}
            <div className="space-y-4">
                <h2
                    className="text-xl font-bold font-serif"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Daftar Transaksi {currentMonthName} {selectedYear}
                </h2>

                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                    }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr
                                    className="text-sm"
                                    style={{
                                        backgroundColor: 'var(--bg-overlay)',
                                        borderBottom: '1px solid var(--border-default)',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    <th className="px-6 py-4 font-bold font-serif whitespace-nowrap">Tanggal</th>
                                    <th className="px-6 py-4 font-bold font-serif whitespace-nowrap">Kategori</th>
                                    <th className="px-6 py-4 font-bold font-serif min-w-[200px]">Deskripsi</th>
                                    <th className="px-6 py-4 font-bold font-serif text-right whitespace-nowrap">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-6 py-10 text-center text-sm"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            Tidak ada transaksi pada bulan ini.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx) => {
                                        const isNegative = tx.amount < 0;
                                        const displayAmount = (isNegative ? '-' : '+') + 'Rp. ' + Math.abs(tx.amount).toLocaleString('id-ID');
                                        return (
                                            <tr
                                                key={tx.id}
                                                className="transition-colors text-sm"
                                                style={{ borderTop: '1px solid var(--border-subtle)' }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <td
                                                    className="px-6 py-4 whitespace-nowrap"
                                                    style={{ color: 'var(--text-muted)' }}
                                                >
                                                    {tx.date}
                                                </td>
                                                <td
                                                    className="px-6 py-4 font-medium whitespace-nowrap"
                                                    style={{ color: 'var(--text-body)' }}
                                                >
                                                    {tx.category}
                                                </td>
                                                <td
                                                    className="px-6 py-4"
                                                    style={{ color: 'var(--text-muted)' }}
                                                >
                                                    {tx.description}
                                                </td>
                                                <td
                                                    className="px-6 py-4 font-bold text-right whitespace-nowrap"
                                                    style={{
                                                        color: isNegative ? 'var(--negative)' : 'var(--positive)',
                                                    }}
                                                >
                                                    {displayAmount}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* CSS Cetak Khusus (Media Print) */}
            <style>{`
                @media print {
                    body {
                        background-color: white !important;
                        color: black !important;
                    }
                    main {
                        overflow: visible !important;
                        height: auto !important;
                    }
                    aside, header, .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
