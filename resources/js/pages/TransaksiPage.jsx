import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Edit2, Trash2, Settings, Plus, ArrowUpDown, X, AlertTriangle, FolderOpen } from 'lucide-react';
import KelolaCategoryModal from '../components/KelolaCategoryModal';

/**
 * TransaksiPage
 *
 * Halaman daftar transaksi dengan fitur:
 *   - Search (cari berdasarkan deskripsi & kategori)
 *   - Filter by tipe (Pemasukan / Pengeluaran)
 *   - Filter by kategori (auto-populated)
 *   - Sort by kolom (klik header)
 *   - Delete dengan konfirmasi modal
 *   - Edit via navigasi ke halaman edit
 *
 * @param {Function} onNavigate       - Callback navigasi halaman
 * @param {Array}    transactions     - Data transaksi dari App.jsx
 * @param {Function} onDelete         - Callback hapus transaksi (id)
 * @param {Function} onNavigateToEdit - Callback navigasi ke edit (transaction object)
 */
export default function TransaksiPage({ onNavigate, transactions = [], onDelete, onNavigateToEdit, categories = [], onAddCategory, onDeleteCategory }) {
    // Filter & search state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTipe, setFilterTipe] = useState('Semua Tipe');
    const [filterKategori, setFilterKategori] = useState('Semua Kategori');

    // Sort state: { key: string, direction: 'asc' | 'desc' } | null
    const [sortConfig, setSortConfig] = useState(null);

    // Delete confirmation modal
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, transaction: null });

    // Category modal state
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    /**
     * Parse tanggal format "d/m/yyyy" ke Date object untuk perbandingan sort.
     *
     * @param {string} dateStr - Tanggal format "d/m/yyyy"
     * @returns {Date}
     */
    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    };

    /** Daftar kategori unik dari data transaksi */
    const uniqueCategories = useMemo(() => {
        const cats = [...new Set(transactions.map((tx) => tx.category))];
        return cats.sort();
    }, [transactions]);

    /**
     * Handler sort kolom. Klik pertama = asc, kedua = desc, ketiga = reset.
     *
     * @param {string} key - Nama kolom ('date' | 'category' | 'description' | 'amount' | 'type')
     */
    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (!prev || prev.key !== key) {
                return { key, direction: 'asc' };
            }
            if (prev.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            return null;
        });
    };

    /**
     * Render ikon sort pada header kolom.
     *
     * @param {string} key - Nama kolom
     * @returns {React.ReactNode}
     */
    const renderSortIcon = (key) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown size={14} className="text-slate-400 ml-1 inline-block" />;
        }
        if (sortConfig.direction === 'asc') {
            return <ChevronUp size={14} className="text-[#5E6AD2] ml-1 inline-block" />;
        }
        return <ChevronDown size={14} className="text-[#5E6AD2] ml-1 inline-block" />;
    };

    /** Transaksi setelah filter + search + sort */
    const filteredTransactions = useMemo(() => {
        let result = [...transactions];

        // 1. Filter by search query (description + category)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (tx) =>
                    tx.description.toLowerCase().includes(query) ||
                    tx.category.toLowerCase().includes(query)
            );
        }

        // 2. Filter by tipe
        if (filterTipe !== 'Semua Tipe') {
            result = result.filter((tx) => tx.type === filterTipe);
        }

        // 3. Filter by kategori
        if (filterKategori !== 'Semua Kategori') {
            result = result.filter((tx) => tx.category === filterKategori);
        }

        // 4. Sort
        if (sortConfig) {
            result.sort((a, b) => {
                let comparison = 0;

                switch (sortConfig.key) {
                    case 'date':
                        comparison = parseDate(a.date) - parseDate(b.date);
                        break;
                    case 'category':
                        comparison = a.category.localeCompare(b.category, 'id');
                        break;
                    case 'description':
                        comparison = a.description.localeCompare(b.description, 'id');
                        break;
                    case 'amount':
                        comparison = a.amount - b.amount;
                        break;
                    case 'type':
                        comparison = a.type.localeCompare(b.type, 'id');
                        break;
                    default:
                        comparison = 0;
                }

                return sortConfig.direction === 'desc' ? -comparison : comparison;
            });
        }

        return result;
    }, [transactions, searchQuery, filterTipe, filterKategori, sortConfig]);

    const formatRupiah = (amount) => {
        const isNegative = amount < 0;
        const absValue = Math.abs(amount).toLocaleString('id-ID');
        return `${isNegative ? '-' : '+'}Rp ${absValue}`;
    };

    /** Class helper untuk header kolom yang bisa di-sort */
    const sortableHeaderClass = (key) => {
        const isActive = sortConfig?.key === key;
        return `px-6 py-4 font-bold font-serif whitespace-nowrap cursor-pointer select-none transition-colors hover:text-[#5E6AD2] ${
            isActive ? 'text-[#5E6AD2]' : 'text-slate-800'
        }`;
    };

    /** Buka modal konfirmasi delete */
    const openDeleteModal = (transaction) => {
        setDeleteModal({ isOpen: true, transaction });
    };

    /** Tutup modal konfirmasi delete */
    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, transaction: null });
    };

    /** Konfirmasi dan hapus transaksi */
    const confirmDelete = () => {
        if (deleteModal.transaction && onDelete) {
            onDelete(deleteModal.transaction.id);
        }
        closeDeleteModal();
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
                    <button 
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm border border-slate-200"
                    >
                        <FolderOpen size={18} />
                        Kelola Kategori
                    </button>
                    <button 
                        onClick={() => onNavigate('atur-budget')}
                        className="flex items-center gap-2 bg-[#FFA93B] hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
                    >
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-transparent focus:outline-none text-slate-700"
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-40 flex items-center justify-between">
                        <select 
                            value={filterTipe}
                            onChange={(e) => setFilterTipe(e.target.value)}
                            className="w-full appearance-none bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer pr-8 font-medium"
                        >
                            <option>Semua Tipe</option>
                            <option>Pemasukan</option>
                            <option>Pengeluaran</option>
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none" size={20} />
                    </div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="relative w-full md:w-44 flex items-center justify-between">
                        <select 
                            value={filterKategori}
                            onChange={(e) => setFilterKategori(e.target.value)}
                            className="w-full appearance-none bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer pr-8 font-medium"
                        >
                            <option>Semua Kategori</option>
                            {uniqueCategories.map((cat) => (
                                <option key={cat}>{cat}</option>
                            ))}
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
                                <th className={sortableHeaderClass('date')} onClick={() => handleSort('date')}>
                                    Tanggal {renderSortIcon('date')}
                                </th>
                                <th className={sortableHeaderClass('category')} onClick={() => handleSort('category')}>
                                    Kategori {renderSortIcon('category')}
                                </th>
                                <th className={`${sortableHeaderClass('description')} min-w-[200px]`} onClick={() => handleSort('description')}>
                                    Deskripsi {renderSortIcon('description')}
                                </th>
                                <th className={`${sortableHeaderClass('amount')} text-center`} onClick={() => handleSort('amount')}>
                                    Jumlah {renderSortIcon('amount')}
                                </th>
                                <th className={`${sortableHeaderClass('type')} text-center`} onClick={() => handleSort('type')}>
                                    Tipe {renderSortIcon('type')}
                                </th>
                                <th className="px-6 py-4 font-bold font-serif text-center whitespace-nowrap">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={32} className="text-slate-300" />
                                            <p className="font-medium">Tidak ada transaksi ditemukan</p>
                                            <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
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
                                                <button 
                                                    onClick={() => onNavigateToEdit(tx)}
                                                    className="text-[#5E6AD2] hover:text-indigo-700 transition-colors bg-indigo-50 p-1.5 rounded-md"
                                                    title="Edit transaksi"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(tx)}
                                                    className="text-[#e87c7c] hover:text-red-600 transition-colors bg-red-50 p-1.5 rounded-md"
                                                    title="Hapus transaksi"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer: result count */}
                {filteredTransactions.length > 0 && (
                    <div className="px-6 py-3 bg-[#F8F9FA] border-t border-slate-100 text-xs text-slate-500">
                        Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
                    </div>
                )}
            </div>

            {/* ── Delete Confirmation Modal ── */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeDeleteModal}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-0 overflow-hidden animate-[modalIn_0.2s_ease-out]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                    <AlertTriangle size={20} className="text-[#e87c7c]" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 font-serif">Hapus Transaksi</h3>
                            </div>
                            <button 
                                onClick={closeDeleteModal}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5">
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Apakah anda yakin ingin menghapus transaksi berikut?
                            </p>
                            {deleteModal.transaction && (
                                <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{deleteModal.transaction.description}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {deleteModal.transaction.category} • {deleteModal.transaction.date}
                                            </p>
                                        </div>
                                        <span className={`font-bold text-sm ${deleteModal.transaction.amount < 0 ? 'text-[#e87c7c]' : 'text-[#6cc28a]'}`}>
                                            {formatRupiah(deleteModal.transaction.amount)}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <p className="text-xs text-slate-400 mt-3">
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center gap-3 px-6 pb-6">
                            <button
                                onClick={closeDeleteModal}
                                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 px-4 bg-[#e87c7c] hover:bg-red-500 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Kelola Kategori Modal ── */}
            <KelolaCategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categories={categories}
                onAddCategory={onAddCategory}
                onDeleteCategory={onDeleteCategory}
            />
        </div>
    );
}
