import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Download } from 'lucide-react';

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

    // Fetch transactions from backend API on component mount
    useEffect(() => {
        fetch('/api/transactions')
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
    }, []);

    // Filter transactions based on selected month and year
    const filteredTransactions = transactions.filter(tx => {
        const [day, month, year] = tx.date.split('/');
        return month === selectedMonth && year === selectedYear;
    });

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

    // Ekspor ke PDF (Print Halaman secara optimal)
    const exportPDF = () => {
        window.print();
    };

    const currentMonthName = MONTHS.find(m => m.value === selectedMonth)?.name || 'Mei';

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto print:p-0 print:max-w-full">
            {/* ── 1. HEADER (Disembunyikan tombolnya saat cetak jika perlu, tapi kita buat rapi) ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 font-serif">Report Keuangan</h1>
                    <p className="text-slate-500 mt-1 text-sm">Analisis lengkap transaksi bulanan</p>
                </div>
                <div className="flex items-center gap-3 print:hidden">
                    <button 
                        onClick={exportPDF}
                        className="flex items-center gap-2 bg-[#5E6AD2] hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm cursor-pointer"
                    >
                        <Download size={18} />
                        Export PDF
                    </button>
                    <button 
                        onClick={exportCSV}
                        className="flex items-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm cursor-pointer"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* ── 2. DATE SELECTOR BAR (Disembunyikan saat cetak) ── */}
            <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center gap-3 print:hidden">
                <Calendar className="text-slate-700" size={22} />
                
                {/* Dropdown Bulan */}
                <div className="relative flex items-center">
                    <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="appearance-none bg-transparent border-none text-slate-700 font-medium focus:outline-none cursor-pointer pr-8 pl-1 text-sm sm:text-base"
                    >
                        {MONTHS.map(m => (
                            <option key={m.value} value={m.value}>{m.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" size={16} />
                </div>

                <div className="w-px h-6 bg-slate-200"></div>

                {/* Dropdown Tahun */}
                <div className="relative flex items-center">
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="appearance-none bg-transparent border-none text-slate-700 font-medium focus:outline-none cursor-pointer pr-8 pl-1 text-sm sm:text-base"
                    >
                        {YEARS.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" size={16} />
                </div>
            </div>

            {/* ── 3. SUMMARY CARDS (2 Column Grid) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Pemasukan */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                    <p className="text-sm font-semibold text-slate-500">Total Pemasukan</p>
                    <p className="text-3xl font-bold font-serif text-slate-800 text-center mt-4">
                        {formatRupiah(totalPemasukan)}
                    </p>
                    <div className="absolute right-4 bottom-4 w-12 h-12 rounded-full bg-emerald-50 opacity-10 flex items-center justify-center pointer-events-none"></div>
                </div>

                {/* Total Pengeluaran */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                    <p className="text-sm font-semibold text-slate-500">Total Pengeluaran</p>
                    <p className="text-3xl font-bold font-serif text-slate-800 text-center mt-4">
                        {formatRupiah(totalPengeluaran)}
                    </p>
                    <div className="absolute right-4 bottom-4 w-12 h-12 rounded-full bg-red-50 opacity-10 flex items-center justify-center pointer-events-none"></div>
                </div>
            </div>

            {/* ── 4. TABLE SECTION ── */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 font-serif">
                    Daftar Transaksi {currentMonthName} {selectedYear}
                </h2>

                <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F8F9FA] border-b border-slate-100 text-slate-800 text-sm">
                                    <th className="px-6 py-4 font-bold font-serif whitespace-nowrap">Tanggal</th>
                                    <th className="px-6 py-4 font-bold font-serif whitespace-nowrap">Kategori</th>
                                    <th className="px-6 py-4 font-bold font-serif min-w-[200px]">Deskripsi</th>
                                    <th className="px-6 py-4 font-bold font-serif text-right whitespace-nowrap">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-400 text-sm">
                                            Tidak ada transaksi pada bulan ini.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx) => {
                                        const isNegative = tx.amount < 0;
                                        const displayAmount = (isNegative ? '-' : '+') + 'Rp. ' + Math.abs(tx.amount).toLocaleString('id-ID');
                                        return (
                                            <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors text-sm">
                                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{tx.date}</td>
                                                <td className="px-6 py-4 text-slate-800 font-medium whitespace-nowrap">{tx.category}</td>
                                                <td className="px-6 py-4 text-slate-600">{tx.description}</td>
                                                <td className={`px-6 py-4 font-bold text-right whitespace-nowrap ${isNegative ? 'text-[#e87c7c]' : 'text-[#6cc28a]'}`}>
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
                    .shadow-\\[0_2px_10px_-3px_rgba\\(6\\,81\\,237\\,0\\.1\\)\\] {
                        box-shadow: none !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
