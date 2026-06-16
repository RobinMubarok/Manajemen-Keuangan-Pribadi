import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

/**
 * Predefined icon options for categories.
 * @type {string[]}
 */
const ICON_OPTIONS = ['💰', '🏦', '📊', '💼', '💸', '📦', '🍳', '📁', '⚡', '🏠', '📱', '🎯'];

/**
 * Predefined color options for categories.
 * @type {string[]}
 */
const COLOR_OPTIONS = [
    '#3B3BBF', '#E74C3C', '#1ABC9C', '#F1C40F', '#2ECC71',
    '#00BCD4', '#FF9800', '#E91E63',
];

/**
 * KelolaCategoryModal
 *
 * Modal untuk menambah dan melihat semua kategori.
 * Desain sesuai mock-up: toggle tipe, nama, pilih icon, pilih warna, dan daftar kategori.
 *
 * @param {boolean}  isOpen         - Apakah modal terbuka
 * @param {Function} onClose        - Callback tutup modal
 * @param {Array}    categories     - Daftar semua kategori
 * @param {Function} onAddCategory  - Callback tambah kategori baru
 * @param {Function} onDeleteCategory - Callback hapus kategori
 */
export default function KelolaCategoryModal({ isOpen, onClose, categories = [], onAddCategory, onDeleteCategory }) {
    const [tipe, setTipe] = useState('Pemasukan');
    const [nama, setNama] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
    const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!nama.trim()) {
            setError('Nama kategori tidak boleh kosong');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            await onAddCategory({
                name: nama.trim(),
                type: tipe,
                icon: selectedIcon,
                color: selectedColor,
            });

            // Reset form
            setNama('');
            setSelectedIcon(ICON_OPTIONS[0]);
            setSelectedColor(COLOR_OPTIONS[0]);
        } catch {
            setError('Gagal menambah kategori. Coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    /** Filter kategori yang ditampilkan berdasarkan tipe aktif */
    const filteredCategories = categories;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div 
                className="relative rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-[modalIn_0.25s_ease-out] flex flex-col"
                style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)'
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <h2 className="text-xl font-bold font-serif" style={{ color: 'var(--text-primary)' }}>Kelola Kategori</h2>
                    <button
                        onClick={onClose}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-lg hover:bg-[var(--bg-hover)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                    {/* ── Tambah Kategori Baru ── */}
                    <div className="space-y-5">
                        <h3 className="text-base font-bold font-serif" style={{ color: 'var(--text-primary)' }}>Tambah Kategori Baru</h3>

                        {/* Tipe Kategori */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold" style={{ color: 'var(--text-body)' }}>Tipe Kategori</label>
                            <div 
                                className="grid grid-cols-2 gap-0 rounded-full p-1"
                                style={{
                                    backgroundColor: 'var(--bg-input)',
                                    border: '1px solid var(--border-default)'
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setTipe('Pemasukan')}
                                    className={`py-2.5 px-4 rounded-full text-sm font-bold transition-all duration-200 ${
                                        tipe === 'Pemasukan'
                                            ? 'bg-[var(--accent)] text-[var(--text-on-accent)] shadow-md'
                                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                    }`}
                                >
                                    Pemasukan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTipe('Pengeluaran')}
                                    className={`py-2.5 px-4 rounded-full text-sm font-bold transition-all duration-200 ${
                                        tipe === 'Pengeluaran'
                                            ? 'bg-[var(--accent)] text-[var(--text-on-accent)] shadow-md'
                                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                    }`}
                                >
                                    Pengeluaran
                                </button>
                            </div>
                        </div>

                        {/* Nama + Icon row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Nama Kategori */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold" style={{ color: 'var(--text-body)' }}>Nama Kategori</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Makanan"
                                    value={nama}
                                    onChange={(e) => {
                                        setNama(e.target.value);
                                        if (error) setError('');
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors text-sm"
                                    style={{
                                        backgroundColor: 'var(--bg-input)',
                                        borderColor: error ? 'var(--negative)' : 'var(--border-default)'
                                    }}
                                />
                            </div>

                            {/* Pilih Icon */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold" style={{ color: 'var(--text-body)' }}>Pilih Icon</label>
                                <div className="grid grid-cols-6 gap-1.5">
                                    {ICON_OPTIONS.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setSelectedIcon(icon)}
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-150 ${
                                                selectedIcon === icon
                                                    ? 'bg-[var(--accent-muted)] ring-2 ring-[var(--accent)] scale-110'
                                                    : 'bg-[var(--bg-input)] hover:bg-[var(--bg-hover)]'
                                            }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Pilih Warna */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold" style={{ color: 'var(--text-body)' }}>Pilih Warna</label>
                            <div className="flex items-center gap-2.5">
                                {COLOR_OPTIONS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-9 h-9 rounded-lg transition-all duration-150 ${
                                            selectedColor === color
                                                ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-elevated)] ring-[var(--accent)] scale-110'
                                                : 'hover:scale-105'
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <p className="text-sm font-medium" style={{ color: 'var(--negative)' }}>{error}</p>
                        )}

                        {/* Tambah Button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--text-disabled)] disabled:cursor-not-allowed text-[var(--text-on-accent)] rounded-xl font-bold text-sm transition-colors shadow-sm"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Tambah Kategori'}
                        </button>
                    </div>

                    {/* ── Divider ── */}
                    <hr style={{ borderColor: 'var(--border-default)' }} />

                    {/* ── Semua Kategori ── */}
                    <div className="space-y-3">
                        <h3 className="text-base font-bold font-serif" style={{ color: 'var(--text-primary)' }}>
                            Semua Kategori ({filteredCategories.length})
                        </h3>

                        {filteredCategories.length === 0 ? (
                            <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>Belum ada kategori</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {filteredCategories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="group flex items-center gap-3 p-3 rounded-xl transition-colors bg-[var(--bg-input)] hover:bg-[var(--bg-hover)]"
                                        style={{ border: '1px solid var(--border-subtle)' }}
                                    >
                                        {/* Icon circle */}
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                            style={{ backgroundColor: cat.color ? `${cat.color}20` : 'var(--bg-elevated)' }}
                                        >
                                            {cat.icon || '📂'}
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cat.type}</p>
                                        </div>

                                        {/* Delete button — visible on hover */}
                                        {onDeleteCategory && (
                                            <button
                                                onClick={() => onDeleteCategory(cat.id)}
                                                className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--negative)] transition-all p-1 rounded-md hover:bg-[var(--bg-hover)]"
                                                title="Hapus kategori"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
