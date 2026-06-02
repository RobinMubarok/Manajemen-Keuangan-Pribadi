import React, { useState } from 'react';
import { Search, ChevronDown, Edit2, Trash2, Settings, Plus } from 'lucide-react';

export default function TransaksiPage({ onNavigate }) {
    const [transactions] = useState([
        { id: 1, date: '19/5/2026', category: 'Hiburan', description: 'Langganan Streaming', amount: -350000, type: 'Pengeluaran' },
        { id: 2, date: '18/5/2026', category: 'Beasiswa', description: 'Beasiswa Indonesia Jaya', amount: 5800000, type: 'Pemasukan' },
        { id: 3, date: '17/5/2026', category: 'Makanan', description: 'Kopi & Snack', amount: -50000, type: 'Pengeluaran' },
        { id: 4, date: '17/5/2026', category: 'Belanja', description: 'Beli Baju', amount: -750000, type: 'Pengeluaran' },
        { id: 5, date: '16/5/2026', category: 'Transportasi', description: 'Grab ke kampus', amount: -50000, type: 'Pengeluaran' },
        { id: 6, date: '15/5/2026', category: 'Makanan', description: 'DO Gacoan', amount: -50000, type: 'Pengeluaran' },
        { id: 7, date: '14/5/2026', category: 'Kesehatan', description: 'Vitamin C', amount: -200000, type: 'Pengeluaran' },
    ]);

    const formatRupiah = (amount) => {
        const isNegative = amount < 0;
        const absValue = Math.abs(amount).toLocaleString('id-ID');
        return `${isNegative ? '-' : '+'}Rp ${absValue}`;
    };

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 font-serif">Transaksi</h1>
                    <p className="text-slate-600 mt-1">Kelola semua transaksi keuangan anda</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-[#FFA93B] hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                        <Settings size={18} />
                        Set Budget
                    </button>
                    <button 
                        onClick={() => onNavigate('tambah-transaksi')}
                        className="flex items-center gap-2 bg-[#5E6AD2] hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Tambah Transaksi
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari transaksi..." 
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-transparent focus:outline-none text-slate-700"
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-40 flex items-center justify-between">
                        <select className="w-full appearance-none bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer pr-8 font-medium">
                            <option>Semua Tipe</option>
                            <option>Pemasukan</option>
                            <option>Pengeluaran</option>
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none" size={20} />
                    </div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="relative w-full md:w-44 flex items-center justify-between">
                        <select className="w-full appearance-none bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer pr-8 font-medium">
                            <option>Semua Kategori</option>
                            <option>Hiburan</option>
                            <option>Makanan</option>
                            <option>Transportasi</option>
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none" size={20} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8F9FA] border-b border-slate-100 text-slate-800 text-sm">
                                <th className="px-6 py-4 font-bold font-serif whitespace-nowrap">Tanggal</th>
                                <th className="px-6 py-4 font-bold font-serif whitespace-nowrap">Kategori</th>
                                <th className="px-6 py-4 font-bold font-serif min-w-[200px]">Deskripsi</th>
                                <th className="px-6 py-4 font-bold font-serif text-center whitespace-nowrap">Jumlah</th>
                                <th className="px-6 py-4 font-bold font-serif text-center whitespace-nowrap">Tipe</th>
                                <th className="px-6 py-4 font-bold font-serif text-center whitespace-nowrap">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{tx.date}</td>
                                    <td className="px-6 py-4 text-slate-800 font-medium whitespace-nowrap">{tx.category}</td>
                                    <td className="px-6 py-4 text-slate-600">{tx.description}</td>
                                    <td className={`px-6 py-4 font-bold text-center whitespace-nowrap ${tx.amount < 0 ? 'text-[#e87c7c]' : 'text-[#6cc28a]'}`}>
                                        {formatRupiah(tx.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold ${
                                            tx.type === 'Pemasukan' 
                                            ? 'bg-[#e7f5eb] text-[#6cc28a]' 
                                            : 'bg-[#fbeaea] text-[#e87c7c]'
                                        }`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-4">
                                            <button className="text-[#5E6AD2] hover:text-indigo-700 transition-colors bg-indigo-50 p-1.5 rounded-md">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="text-[#e87c7c] hover:text-red-600 transition-colors bg-red-50 p-1.5 rounded-md">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
