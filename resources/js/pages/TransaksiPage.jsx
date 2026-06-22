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
            return <ArrowUpDown size={14} className="ml-1 inline-block" style={{ color: 'var(--text-disabled)' }} />;
        }
        if (sortConfig.direction === 'asc') {
            return <ChevronUp size={14} className="ml-1 inline-block" style={{ color: 'var(--accent)' }} />;
        }
        return <ChevronDown size={14} className="ml-1 inline-block" style={{ color: 'var(--accent)' }} />;
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
    const sortableHeaderStyle = (key) => {
        const isActive = sortConfig?.key === key;
        return {
            color: isActive ? 'var(--accent)' : 'var(--text-primary)',
        };
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
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Transaksi
                    </h1>
                    <p
                        className="mt-1"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Kelola semua transaksi keuangan anda
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors"
                        style={{
                            backgroundColor: 'var(--bg-elevated)',
                            color: 'var(--text-body)',
                            border: '1px solid var(--border-default)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                    >
                        <FolderOpen size={18} />
                        Kelola Kategori
                    </button>
                    <button 
                        onClick={() => onNavigate('atur-budget')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors"
                        style={{
                            backgroundColor: 'rgba(251,191,36,0.15)',
                            color: 'var(--warning)',
                            border: '1px solid rgba(251,191,36,0.25)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(251,191,36,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(251,191,36,0.15)'}
                    >
                        <Settings size={18} />
                        Set Budget
                    </button>
                    <button 
                        onClick={() => onNavigate('tambah-transaksi')}
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
                        <Plus size={18} />
                        Tambah Transaksi
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div
                className="p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4"
                style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                }}
            >
                <div className="relative w-full md:w-96">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        size={20}
                        style={{ color: 'var(--text-muted)' }}
                    />
                    <input 
                        type="text" 
                        placeholder="Cari transaksi..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl focus:outline-none"
                        style={{
                            backgroundColor: 'var(--bg-input)',
                            border: '1px solid var(--border-default)',
                            color: 'var(--text-primary)',
                            borderRadius: 'var(--r-md)',
                        }}
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-40 flex items-center justify-between">
                        <select 
                            value={filterTipe}
                            onChange={(e) => setFilterTipe(e.target.value)}
                            className="w-full appearance-none focus:outline-none cursor-pointer pr-8 font-medium bg-transparent"
                            style={{ color: 'var(--text-body)', border: 'none' }}
                        >
                            <option>Semua Tipe</option>
                            <option>Pemasukan</option>
                            <option>Pengeluaran</option>
                        </select>
                        <ChevronDown
                            className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
                            size={20}
                            style={{ color: 'var(--text-body)' }}
                        />
                    </div>
                    <div
                        className="w-px h-6"
                        style={{ backgroundColor: 'var(--border-default)' }}
                    />
                    <div className="relative w-full md:w-44 flex items-center justify-between">
                        <select 
                            value={filterKategori}
                            onChange={(e) => setFilterKategori(e.target.value)}
                            className="w-full appearance-none focus:outline-none cursor-pointer pr-8 font-medium bg-transparent"
                            style={{ color: 'var(--text-body)', border: 'none' }}
                        >
                            <option>Semua Kategori</option>
                            {uniqueCategories.map((cat) => (
                                <option key={cat}>{cat}</option>
                            ))}
                        </select>
                        <ChevronDown
                            className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
                            size={20}
                            style={{ color: 'var(--text-body)' }}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
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
                                }}
                            >
                                <th
                                    className="px-6 py-4 font-bold whitespace-nowrap cursor-pointer select-none transition-colors"
                                    style={sortableHeaderStyle('date')}
                                    onClick={() => handleSort('date')}
                                >
                                    Tanggal {renderSortIcon('date')}
                                </th>
                                <th
                                    className="px-6 py-4 font-bold whitespace-nowrap cursor-pointer select-none transition-colors"
                                    style={sortableHeaderStyle('category')}
                                    onClick={() => handleSort('category')}
                                >
                                    Kategori {renderSortIcon('category')}
                                </th>
                                <th
                                    className="px-6 py-4 font-bold min-w-[200px] cursor-pointer select-none transition-colors"
                                    style={sortableHeaderStyle('description')}
                                    onClick={() => handleSort('description')}
                                >
                                    Deskripsi {renderSortIcon('description')}
                                </th>
                                <th
                                    className="px-6 py-4 font-bold text-center whitespace-nowrap cursor-pointer select-none transition-colors"
                                    style={sortableHeaderStyle('amount')}
                                    onClick={() => handleSort('amount')}
                                >
                                    Jumlah {renderSortIcon('amount')}
                                </th>
                                <th
                                    className="px-6 py-4 font-bold text-center whitespace-nowrap cursor-pointer select-none transition-colors"
                                    style={sortableHeaderStyle('type')}
                                    onClick={() => handleSort('type')}
                                >
                                    Tipe {renderSortIcon('type')}
                                </th>
                                <th
                                    className="px-6 py-4 font-bold text-center whitespace-nowrap"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={32} style={{ color: 'var(--text-disabled)' }} />
                                            <p className="font-medium">Tidak ada transaksi ditemukan</p>
                                            <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
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
                                            className="px-6 py-4 font-bold text-center whitespace-nowrap"
                                            style={{
                                                color: tx.amount < 0 ? 'var(--negative)' : 'var(--positive)',
                                            }}
                                        >
                                            {formatRupiah(tx.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span
                                                className="inline-flex px-4 py-1.5 rounded-full text-xs font-semibold"
                                                style={
                                                    tx.type === 'Pemasukan'
                                                        ? {
                                                              backgroundColor: 'var(--accent-muted)',
                                                              color: 'var(--positive)',
                                                          }
                                                        : {
                                                              backgroundColor: 'rgba(248,113,113,0.12)',
                                                              color: 'var(--negative)',
                                                          }
                                                }
                                            >
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-4">
                                                <button 
                                                    onClick={() => onNavigateToEdit(tx)}
                                                    className="p-1.5 rounded-md transition-colors"
                                                    style={{
                                                        color: 'var(--accent)',
                                                        backgroundColor: 'var(--accent-muted)',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-border)'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent-muted)'}
                                                    title="Edit transaksi"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(tx)}
                                                    className="p-1.5 rounded-md transition-colors"
                                                    style={{
                                                        color: 'var(--negative)',
                                                        backgroundColor: 'rgba(248,113,113,0.12)',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.22)'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.12)'}
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
                    <div
                        className="px-6 py-3 text-xs"
                        style={{
                            backgroundColor: 'var(--bg-overlay)',
                            borderTop: '1px solid var(--border-default)',
                            color: 'var(--text-muted)',
                        }}
                    >
                        Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
                    </div>
                )}
            </div>

            {/* ── Delete Confirmation Modal ── */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 backdrop-blur-sm"
                        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                        onClick={closeDeleteModal}
                    />

                    {/* Modal */}
                    <div
                        className="relative rounded-2xl shadow-2xl max-w-md w-full p-0 overflow-hidden animate-[modalIn_0.2s_ease-out]"
                        style={{
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-default)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-0">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(248,113,113,0.15)' }}
                                >
                                    <AlertTriangle size={20} style={{ color: 'var(--negative)' }} />
                                </div>
                                <h3
                                    className="text-lg font-bold"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Hapus Transaksi
                                </h3>
                            </div>
                            <button 
                                onClick={closeDeleteModal}
                                className="transition-colors p-1"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-body)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5">
                            <p
                                className="text-sm leading-relaxed"
                                style={{ color: 'var(--text-body)' }}
                            >
                                Apakah anda yakin ingin menghapus transaksi berikut?
                            </p>
                            {deleteModal.transaction && (
                                <div
                                    className="mt-4 rounded-xl p-4"
                                    style={{
                                        backgroundColor: 'var(--bg-overlay)',
                                        border: '1px solid var(--border-default)',
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p
                                                className="font-semibold text-sm"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                {deleteModal.transaction.description}
                                            </p>
                                            <p
                                                className="text-xs mt-1"
                                                style={{ color: 'var(--text-muted)' }}
                                            >
                                                {deleteModal.transaction.category} • {deleteModal.transaction.date}
                                            </p>
                                        </div>
                                        <span
                                            className="font-bold text-sm"
                                            style={{
                                                color: deleteModal.transaction.amount < 0
                                                    ? 'var(--negative)'
                                                    : 'var(--positive)',
                                            }}
                                        >
                                            {formatRupiah(deleteModal.transaction.amount)}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <p
                                className="text-xs mt-3"
                                style={{ color: 'var(--text-disabled)' }}
                            >
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center gap-3 px-6 pb-6">
                            <button
                                onClick={closeDeleteModal}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-colors"
                                style={{
                                    backgroundColor: 'var(--bg-overlay)',
                                    color: 'var(--text-body)',
                                    border: '1px solid var(--border-default)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-overlay)'}
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-colors"
                                style={{
                                    backgroundColor: 'var(--negative)',
                                    color: '#fff',
                                    border: 'none',
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ef4444'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--negative)'}
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
