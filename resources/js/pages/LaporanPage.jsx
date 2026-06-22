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

export default function LaporanPage({ onNavigate }) {
    const currentDate = new Date();
    const currentMonthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYearStr = String(currentDate.getFullYear());

    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
    const [selectedYear, setSelectedYear] = useState(currentYearStr);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Saldo Awal Dinamis: Ambil dari state atau API (di-set 0 sebagai nilai awal default)
    // Jika backend Anda mengirim data saldoAwal bersamaan dengan transaksi, Anda bisa melakukan setSaldoAwal(data.saldoAwal) di useEffect.
    const [saldoAwal, setSaldoAwal] = useState(0);

    const status = 'Terverifikasi';

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
                if (response.status === 401) {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                    if (onNavigate) onNavigate('auth');
                    throw new Error('Unauthenticated');
                }
                if (!response.ok) throw new Error('Network response was not ok');
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
    }, [selectedMonth, selectedYear, onNavigate]);

    const filteredTransactions = transactions;

    const totalPemasukan = filteredTransactions
        .filter(tx => tx.type === 'Pemasukan' || tx.amount > 0)
        .reduce((sum, tx) => sum + (tx.amount > 0 ? tx.amount : Math.abs(tx.amount)), 0);

    const totalPengeluaran = filteredTransactions
        .filter(tx => tx.type === 'Pengeluaran' || tx.amount < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    // Total Perubahan murni menghitung transaksi bulan berjalan (Masuk - Keluar)
    const totalPerubahan = totalPemasukan - totalPengeluaran;
    
    // Saldo Akhir murni menggunakan rumus: Saldo Awal Dinamis + Total Perubahan
    const saldoAkhir = saldoAwal + totalPerubahan;

    const formatRupiah = (amount) => {
        return `Rp. ${amount.toLocaleString('id-ID')},00`;
    };

    const exportCSV = () => {
        const headers = ['Tanggal', 'Kategori', 'Deskripsi', 'Jumlah', 'Tipe'];
        const rows = filteredTransactions.map(tx => [
            tx.date, tx.category, tx.description, tx.amount, tx.type
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
    
    // Logika Periode Dinamis: Mencari tanggal terkecil dan terbesar dari transaksi yang ada
    let periodeText = `01 - ${new Date(selectedYear, selectedMonth, 0).getDate()} ${currentMonthName} ${selectedYear}`; // Default fallback
    if (filteredTransactions.length > 0) {
        const days = filteredTransactions.map(tx => {
            const dateStr = tx.tanggal || tx.date;
            if (!dateStr) return 1;
            // Support format DD/MM/YYYY atau YYYY-MM-DD
            if (dateStr.includes('/')) {
                return parseInt(dateStr.split('/')[0], 10);
            } else if (dateStr.includes('-')) {
                return parseInt(dateStr.split('-')[2], 10);
            }
            return 1;
        });
        
        const minDay = Math.min(...days);
        const maxDay = Math.max(...days);
        
        if (minDay === maxDay) {
            periodeText = `${minDay} ${currentMonthName} ${selectedYear}`;
        } else {
            periodeText = `${minDay} - ${maxDay} ${currentMonthName} ${selectedYear}`;
        }
    }

    // Konfigurasi Spesifik PDF
    const exportPDF = () => {
        const element = document.getElementById('pdf-export-only');
        if (!element) return;

        const clonedElement = element.cloneNode(true);
        // Memastikan lebar elemen adalah 180mm (A4 Portrait lebar 210mm - (15mm x 2 margin))
        // Lebar absolut ini menjamin html2canvas tidak memotong sisi kanan.
        clonedElement.style.width = '180mm';
        clonedElement.style.maxWidth = '180mm';
        clonedElement.style.position = 'relative';
        clonedElement.style.top = '0';
        clonedElement.style.left = '0';
        
        // Membungkus di dalam container layar lebar agar tidak terpotong oleh viewport asli browser
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.top = '0';
        tempContainer.style.left = '0';
        tempContainer.style.width = '1200px'; 
        tempContainer.style.height = '10px';
        tempContainer.style.overflow = 'hidden';
        tempContainer.style.zIndex = '-9999';
        
        tempContainer.appendChild(clonedElement);
        document.body.appendChild(tempContainer);

        const opt = {
            margin:       1.5, // Margin 1.5 cm
            filename:     `Laporan_Keuangan_${currentMonthName}_${selectedYear}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true, 
                windowWidth: 1000 // Menipu viewport agar membaca ruang lebih luas
            }, 
            jsPDF:        { unit: 'cm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(clonedElement).save().then(() => {
            document.body.removeChild(tempContainer);
        });
    };

    return (
        <div id="laporan-content" className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto print:p-0 print:max-w-full">
            {/* ── 1. HEADER (Tampilan Web) ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Report Keuangan
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                        Analisis lengkap transaksi bulanan
                    </p>
                </div>
                <div id="action-buttons" className="flex items-center gap-3">
                    <button 
                        onClick={exportPDF}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all"
                        style={{
                            backgroundColor: 'var(--accent-muted)',
                            color: 'var(--accent)',
                            border: '1px solid var(--accent-border)',
                        }}
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
                        }}
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* ── 2. DATE SELECTOR BAR (Tampilan Web) ── */}
            <div className="p-4 rounded-2xl flex items-center gap-3 print:hidden" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                <Calendar style={{ color: 'var(--text-muted)' }} size={22} />
                <div className="relative flex items-center">
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="appearance-none font-medium focus:outline-none cursor-pointer pr-8 pl-1 bg-transparent">
                        {MONTHS.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
                </div>
                <div className="w-px h-6" style={{ backgroundColor: 'var(--border-default)' }} />
                <div className="relative flex items-center">
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="appearance-none font-medium focus:outline-none cursor-pointer pr-8 pl-1 bg-transparent">
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
                </div>
            </div>

            {/* ── 3. SUMMARY CARDS (Tampilan Web) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
                <div className="rounded-2xl p-6 flex flex-col justify-between min-h-[140px]" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-border)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Total Pemasukan</p>
                    <p className="text-3xl font-bold text-center mt-4" style={{ color: 'var(--positive)' }}>{formatRupiah(totalPemasukan)}</p>
                </div>
                <div className="rounded-2xl p-6 flex flex-col justify-between min-h-[140px]" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Total Pengeluaran</p>
                    <p className="text-3xl font-bold text-center mt-4" style={{ color: 'var(--negative)' }}>{formatRupiah(totalPengeluaran)}</p>
                </div>
            </div>

            {/* ── 4. TABLE SECTION (Tampilan Web) ── */}
            <div className="space-y-4 print:hidden">
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Daftar Transaksi {currentMonthName} {selectedYear}
                </h2>
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-sm" style={{ backgroundColor: 'var(--bg-overlay)', borderBottom: '1px solid var(--border-default)' }}>
                                    <th className="px-6 py-4 font-bold">Tanggal</th>
                                    <th className="px-6 py-4 font-bold">Kategori</th>
                                    <th className="px-6 py-4 font-bold min-w-[200px]">Deskripsi</th>
                                    <th className="px-6 py-4 font-bold text-right">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                            Memuat data transaksi...
                                        </td>
                                    </tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Tidak ada transaksi pada bulan ini.</td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="text-sm" style={{ borderTop: '1px solid var(--border-default)' }}>
                                            <td className="px-6 py-4" style={{ color: 'var(--text-muted)' }}>{tx.date}</td>
                                            <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-body)' }}>{tx.category}</td>
                                            <td className="px-6 py-4" style={{ color: 'var(--text-muted)' }}>{tx.description}</td>
                                            <td className="px-6 py-4 font-bold text-right" style={{ color: tx.amount < 0 ? 'var(--negative)' : 'var(--positive)' }}>
                                                {(tx.amount < 0 ? '-' : '+') + 'Rp. ' + Math.abs(tx.amount).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── KOMPONEN PDF TERISOLASI (Off-Screen untuk html2pdf.js) ── */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', zIndex: -100, width: '100%', pointerEvents: 'none' }}>
                <div id="pdf-export-only" style={{ width: '180mm', backgroundColor: '#fff', color: '#000', fontFamily: 'Arial, Helvetica, sans-serif', padding: '0px' }}>
                    
                    {/* Header PDF */}
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h1 style={{ fontSize: '16pt', fontWeight: 'bold', margin: '0 0 5px 0' }}>LAPORAN KEUANGAN BULANAN</h1>
                        <p style={{ fontSize: '10pt', fontStyle: 'italic', color: '#333', margin: '0' }}>Periode Pemeriksaan Pembukuan Internal</p>
                    </div>

                    {/* Informasi Meta PDF */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '10pt' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', marginBottom: '8px' }}>
                                <div style={{ width: '100px', fontWeight: 'bold' }}>Periode:</div>
                                <div>{periodeText}</div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ width: '100px', fontWeight: 'bold' }}>Saldo Awal:</div>
                                <div>Rp {saldoAwal.toLocaleString('id-ID')}</div>
                            </div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '150px' }}>
                                <div style={{ display: 'flex', width: '100%', marginBottom: '8px' }}>
                                    <div style={{ width: '60px', fontWeight: 'bold' }}>Status:</div>
                                    <div style={{ color: '#16a34a', fontWeight: 'bold' }}>{status}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabel Data PDF */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10pt' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '15%', backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold', padding: '6px 8px', border: '1px solid #000', textAlign: 'center' }}>Tanggal</th>
                                <th style={{ width: '20%', backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold', padding: '6px 8px', border: '1px solid #000', textAlign: 'left' }}>Kategori</th>
                                <th style={{ width: '45%', backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold', padding: '6px 8px', border: '1px solid #000', textAlign: 'left' }}>Deskripsi</th>
                                <th style={{ width: '20%', backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold', padding: '6px 8px', border: '1px solid #000', textAlign: 'right' }}>Nominal (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'center' }}>Tidak ada transaksi</td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx, index) => {
                                    const isNegative = tx.amount < 0;
                                    const sign = isNegative ? '-' : '+';
                                    const color = isNegative ? '#dc2626' : '#16a34a'; 
                                    const amountText = `${sign} ${Math.abs(tx.amount).toLocaleString('id-ID')}`;
                                    
                                    const bgColor = index % 2 !== 0 ? '#f9f9f9' : '#ffffff';

                                    return (
                                        <tr key={tx.id} style={{ backgroundColor: bgColor }}>
                                            <td style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'center' }}>{tx.date}</td>
                                            <td style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'left' }}>{tx.category}</td>
                                            <td style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'left' }}>{tx.description}</td>
                                            <td style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'right', color: color }}>{amountText}</td>
                                        </tr>
                                    );
                                })
                            )}
                            
                            {/* Summary Footer di Tabel */}
                            <tr>
                                <td colSpan="3" style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'left', fontWeight: 'bold' }}>
                                    Total Perubahan Bulan Ini:
                                </td>
                                <td style={{ padding: '6px 8px', border: '1px solid #000', textAlign: 'right', fontWeight: 'bold', color: totalPerubahan < 0 ? '#dc2626' : '#16a34a' }}>
                                    {totalPerubahan < 0 ? '-' : '+'} {Math.abs(totalPerubahan).toLocaleString('id-ID')}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="3" style={{ padding: '8px 8px', border: '1px solid #000', textAlign: 'left', fontWeight: 'bold', fontSize: '11pt' }}>
                                    SALDO AKHIR:
                                </td>
                                <td style={{ padding: '8px 8px', border: '1px solid #000', textAlign: 'right', fontWeight: 'bold', fontSize: '11pt' }}>
                                    Rp {saldoAkhir.toLocaleString('id-ID')}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
