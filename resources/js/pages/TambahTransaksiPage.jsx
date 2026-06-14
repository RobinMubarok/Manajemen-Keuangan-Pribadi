import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';

/**
 * Kategori yang tersedia berdasarkan tipe transaksi.
 *
 * @type {Object<string, string[]>}
 */
const CATEGORIES = {
    Pemasukan: ['Gaji', 'Beasiswa', 'Bonus', 'Hasil Usaha', 'Investasi', 'Lainnya'],
    Pengeluaran: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya'],
};

/**
 * Konversi format tanggal "d/m/yyyy" ke "yyyy-mm-dd" untuk input date.
 *
 * @param {string} dateStr - Tanggal format "d/m/yyyy"
 * @returns {string} - Tanggal format "yyyy-mm-dd"
 */
function displayDateToInput(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Konversi format tanggal "yyyy-mm-dd" ke "d/m/yyyy" untuk penyimpanan.
 *
 * @param {string} dateStr - Tanggal format "yyyy-mm-dd"
 * @returns {string} - Tanggal format "d/m/yyyy"
 */
function inputDateToDisplay(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${day}/${month}/${year}`;
}

/**
 * TambahTransaksiPage
 *
 * Digunakan untuk menambah transaksi baru (Create) dan mengedit transaksi (Update).
 * Mode ditentukan oleh prop `editData`:
 *   - Jika editData ada → mode Edit
 *   - Jika tidak → mode Tambah
 *
 * @param {Function} onNavigate - Callback untuk navigasi halaman
 * @param {Function} onAdd      - Callback tambah transaksi baru (mode create)
 * @param {Function} onEdit     - Callback update transaksi (mode edit)
 * @param {Object}   editData   - Data transaksi yang akan di-edit (null = mode tambah)
 */
export default function TambahTransaksiPage({ onNavigate, onAdd, onEdit, editData }) {
    const isEditMode = Boolean(editData);

    const [tipe, setTipe] = useState('Pemasukan');
    const [jumlah, setJumlah] = useState('');
    const [kategori, setKategori] = useState('');
    const [tanggal, setTanggal] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    });
    const [deskripsi, setDeskripsi] = useState('');
    const [errors, setErrors] = useState({});

    // Pre-fill form saat mode edit
    useEffect(() => {
        if (editData) {
            setTipe(editData.type);
            setJumlah(String(Math.abs(editData.amount)));
            setKategori(editData.category);
            setTanggal(displayDateToInput(editData.date));
            setDeskripsi(editData.description);
        }
    }, [editData]);

    // Reset kategori saat tipe berubah (hanya di mode tambah)
    useEffect(() => {
        if (!isEditMode) {
            setKategori(CATEGORIES[tipe][0]);
        }
    }, [tipe, isEditMode]);

    const handleTipeChange = (newTipe) => {
        setTipe(newTipe);
        // Reset kategori ke opsi pertama dari tipe baru
        setKategori(CATEGORIES[newTipe][0]);
        // Clear errors
        setErrors((prev) => ({ ...prev, tipe: '' }));
    };

    /**
     * Validasi form sebelum submit.
     *
     * @returns {boolean} - True jika valid
     */
    const validateForm = () => {
        const newErrors = {};

        if (!jumlah || parseInt(jumlah, 10) <= 0) {
            newErrors.jumlah = 'Jumlah harus lebih dari 0';
        }
        if (!kategori) {
            newErrors.kategori = 'Pilih kategori';
        }
        if (!tanggal) {
            newErrors.tanggal = 'Pilih tanggal';
        }
        if (!deskripsi.trim()) {
            newErrors.deskripsi = 'Deskripsi tidak boleh kosong';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const amount = parseInt(jumlah, 10);
        const transaction = {
            date: inputDateToDisplay(tanggal),
            category: kategori,
            description: deskripsi.trim(),
            amount: tipe === 'Pengeluaran' ? -amount : amount,
            type: tipe,
        };

        if (isEditMode) {
            // Mode edit: sertakan id yang sudah ada
            onEdit({ ...transaction, id: editData.id });
        } else {
            // Mode tambah: id akan di-generate oleh handler di App.jsx
            onAdd(transaction);
        }

        onNavigate('transaksi');
    };

    /**
     * Format angka untuk tampilan di input jumlah.
     *
     * @param {string} value - Angka mentah
     * @returns {string}
     */
    const formatAmount = (value) => {
        if (!value) return '';
        const num = parseInt(value, 10);
        if (isNaN(num)) return '';
        return num.toLocaleString('id-ID');
    };

    const handleAmountChange = (rawValue) => {
        // Hanya izinkan angka
        const cleaned = rawValue.replace(/[^0-9]/g, '');
        setJumlah(cleaned);
        if (cleaned && parseInt(cleaned, 10) > 0) {
            setErrors((prev) => ({ ...prev, jumlah: '' }));
        }
    };

    return (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 pb-20">
            {/* Back button + Title */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => onNavigate('transaksi')}
                    className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors"
                    style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-muted)',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--accent-border)';
                        e.currentTarget.style.color = 'var(--accent)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-default)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                    title="Kembali ke transaksi"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1
                    className="text-3xl font-bold font-serif"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {isEditMode ? 'Edit Transaksi' : 'Tambah Transaksi'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipe Transaksi */}
                <div className="space-y-3">
                    <label
                        className="block font-bold font-serif text-lg"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Tipe Transaksi
                    </label>
                    <div className="grid grid-cols-2 gap-6 max-w-lg">
                        <button
                            type="button"
                            onClick={() => handleTipeChange('Pemasukan')}
                            className="py-3.5 px-4 rounded-md font-bold font-serif text-center transition-all"
                            style={
                                tipe === 'Pemasukan'
                                    ? {
                                          backgroundColor: 'var(--accent)',
                                          color: 'var(--text-on-accent)',
                                          border: 'none',
                                      }
                                    : {
                                          backgroundColor: 'var(--bg-elevated)',
                                          color: 'var(--text-muted)',
                                          border: '1px solid var(--border-default)',
                                      }
                            }
                        >
                            Pemasukan
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTipeChange('Pengeluaran')}
                            className="py-3.5 px-4 rounded-md font-bold font-serif text-center transition-all"
                            style={
                                tipe === 'Pengeluaran'
                                    ? {
                                          backgroundColor: 'var(--negative)',
                                          color: '#fff',
                                          border: 'none',
                                      }
                                    : {
                                          backgroundColor: 'var(--bg-elevated)',
                                          color: 'var(--text-muted)',
                                          border: '1px solid var(--border-default)',
                                      }
                            }
                        >
                            Pengeluaran
                        </button>
                    </div>
                </div>

                {/* Jumlah */}
                <div className="space-y-3 max-w-3xl">
                    <label
                        className="block font-bold font-serif text-lg"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Jumlah
                    </label>
                    <div className="relative">
                        <span
                            className="absolute left-4 top-1/2 -translate-y-1/2 font-medium"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Rp
                        </span>
                        <input 
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={formatAmount(jumlah)}
                            onChange={(e) => handleAmountChange(e.target.value.replace(/\./g, ''))}
                            className="w-full pl-12 pr-4 py-4 rounded-md font-medium transition-colors focus:outline-none"
                            style={{
                                backgroundColor: 'var(--bg-input)',
                                border: errors.jumlah
                                    ? '2px solid var(--negative)'
                                    : '2px solid var(--border-default)',
                                color: 'var(--text-primary)',
                                borderRadius: 'var(--r-md)',
                            }}
                            onFocus={e => !errors.jumlah && (e.target.style.borderColor = 'var(--border-strong)')}
                            onBlur={e => !errors.jumlah && (e.target.style.borderColor = 'var(--border-default)')}
                        />
                    </div>
                    {errors.jumlah && (
                        <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--negative)' }}
                        >
                            {errors.jumlah}
                        </p>
                    )}
                </div>

                {/* Kategori */}
                <div className="space-y-3 max-w-3xl">
                    <label
                        className="block font-bold font-serif text-lg"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Kategori
                    </label>
                    <div className="relative">
                        <select 
                            value={kategori}
                            onChange={(e) => {
                                setKategori(e.target.value);
                                setErrors((prev) => ({ ...prev, kategori: '' }));
                            }}
                            className="w-full appearance-none rounded-md px-4 py-4 pr-12 font-medium focus:outline-none cursor-pointer transition-colors"
                            style={{
                                backgroundColor: 'var(--bg-input)',
                                border: errors.kategori
                                    ? '2px solid var(--negative)'
                                    : '2px solid var(--border-default)',
                                color: 'var(--text-primary)',
                                borderRadius: 'var(--r-md)',
                            }}
                        >
                            {CATEGORIES[tipe].map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <ChevronDown
                            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                            size={24}
                            style={{ color: 'var(--text-muted)' }}
                        />
                    </div>
                    {errors.kategori && (
                        <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--negative)' }}
                        >
                            {errors.kategori}
                        </p>
                    )}
                </div>

                {/* Tanggal */}
                <div className="space-y-3 max-w-3xl">
                    <label
                        className="block font-bold font-serif text-lg"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Tanggal
                    </label>
                    <input 
                        type="date" 
                        value={tanggal}
                        onChange={(e) => {
                            setTanggal(e.target.value);
                            setErrors((prev) => ({ ...prev, tanggal: '' }));
                        }}
                        className="w-full px-4 py-4 rounded-md font-medium transition-colors focus:outline-none"
                        style={{
                            backgroundColor: 'var(--bg-input)',
                            border: errors.tanggal
                                ? '2px solid var(--negative)'
                                : '2px solid var(--border-default)',
                            color: 'var(--text-primary)',
                            borderRadius: 'var(--r-md)',
                        }}
                        onFocus={e => !errors.tanggal && (e.target.style.borderColor = 'var(--border-strong)')}
                        onBlur={e => !errors.tanggal && (e.target.style.borderColor = 'var(--border-default)')}
                    />
                    {errors.tanggal && (
                        <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--negative)' }}
                        >
                            {errors.tanggal}
                        </p>
                    )}
                </div>

                {/* Deskripsi */}
                <div className="space-y-3 max-w-3xl">
                    <label
                        className="block font-bold font-serif text-lg"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Deskripsi
                    </label>
                    <textarea 
                        rows={4}
                        placeholder="Catatan tambahan..."
                        value={deskripsi}
                        onChange={(e) => {
                            setDeskripsi(e.target.value);
                            if (e.target.value.trim()) {
                                setErrors((prev) => ({ ...prev, deskripsi: '' }));
                            }
                        }}
                        className="w-full px-4 py-4 rounded-md font-medium resize-none transition-colors focus:outline-none"
                        style={{
                            backgroundColor: 'var(--bg-input)',
                            border: errors.deskripsi
                                ? '2px solid var(--negative)'
                                : '2px solid var(--border-default)',
                            color: 'var(--text-primary)',
                            borderRadius: 'var(--r-md)',
                        }}
                        placeholder-style={{ color: 'var(--text-muted)' }}
                        onFocus={e => !errors.deskripsi && (e.target.style.borderColor = 'var(--border-strong)')}
                        onBlur={e => !errors.deskripsi && (e.target.style.borderColor = 'var(--border-default)')}
                    />
                    {errors.deskripsi && (
                        <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--negative)' }}
                        >
                            {errors.deskripsi}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="pt-8 max-w-3xl flex gap-4">
                    <button
                        type="button"
                        onClick={() => onNavigate('transaksi')}
                        className="flex-1 py-4 rounded-md font-bold font-serif text-lg transition-colors"
                        style={{
                            backgroundColor: 'var(--bg-elevated)',
                            color: 'var(--text-body)',
                            border: '1px solid var(--border-default)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                    >
                        Batal
                    </button>
                    <button 
                        type="submit"
                        className="flex-[2] py-4 rounded-md font-bold font-serif text-lg transition-all"
                        style={{
                            backgroundColor: 'var(--accent)',
                            color: 'var(--text-on-accent)',
                            border: 'none',
                            borderRadius: 'var(--r-pill)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
                    >
                        {isEditMode ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
