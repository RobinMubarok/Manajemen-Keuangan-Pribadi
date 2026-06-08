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
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#5E6AD2] hover:border-[#5E6AD2] transition-colors shadow-sm"
                    title="Kembali ke transaksi"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-3xl font-bold text-slate-900 font-serif">
                    {isEditMode ? 'Edit Transaksi' : 'Tambah Transaksi'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipe Transaksi */}
                <div className="space-y-3">
                    <label className="block text-slate-900 font-bold font-serif text-lg">Tipe Transaksi</label>
                    <div className="grid grid-cols-2 gap-6 max-w-lg">
                        <button
                            type="button"
                            onClick={() => handleTipeChange('Pemasukan')}
                            className={`py-3.5 px-4 rounded-md font-bold font-serif text-center transition-colors ${
                                tipe === 'Pemasukan' 
                                ? 'bg-[#509C64] text-white shadow-sm' 
                                : 'bg-[#DFDFDF] text-slate-700 hover:bg-slate-300'
                            }`}
                        >
                            Pemasukan
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTipeChange('Pengeluaran')}
                            className={`py-3.5 px-4 rounded-md font-bold font-serif text-center transition-colors ${
                                tipe === 'Pengeluaran' 
                                ? 'bg-[#EA543F] text-white shadow-sm' 
                                : 'bg-[#DFDFDF] text-slate-700 hover:bg-slate-300'
                            }`}
                        >
                            Pengeluaran
                        </button>
                    </div>
                </div>

                {/* Jumlah */}
                <div className="space-y-3 max-w-3xl">
                    <label className="block text-slate-900 font-bold font-serif text-lg">Jumlah</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-medium">Rp</span>
                        <input 
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={formatAmount(jumlah)}
                            onChange={(e) => handleAmountChange(e.target.value.replace(/\./g, ''))}
                            className={`w-full pl-12 pr-4 py-4 rounded-md bg-[#DFDFDF] border-2 text-slate-800 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] font-medium transition-colors ${
                                errors.jumlah ? 'border-red-400' : 'border-transparent'
                            }`}
                        />
                    </div>
                    {errors.jumlah && (
                        <p className="text-sm text-red-500 font-medium">{errors.jumlah}</p>
                    )}
                </div>

                {/* Kategori */}
                <div className="space-y-3 max-w-3xl">
                    <label className="block text-slate-900 font-bold font-serif text-lg">Kategori</label>
                    <div className="relative">
                        <select 
                            value={kategori}
                            onChange={(e) => {
                                setKategori(e.target.value);
                                setErrors((prev) => ({ ...prev, kategori: '' }));
                            }}
                            className={`w-full appearance-none bg-[#DFDFDF] rounded-md px-4 py-4 pr-12 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] cursor-pointer border-2 transition-colors ${
                                errors.kategori ? 'border-red-400' : 'border-transparent'
                            }`}
                        >
                            {CATEGORIES[tipe].map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none" size={24} />
                    </div>
                    {errors.kategori && (
                        <p className="text-sm text-red-500 font-medium">{errors.kategori}</p>
                    )}
                </div>

                {/* Tanggal */}
                <div className="space-y-3 max-w-3xl">
                    <label className="block text-slate-900 font-bold font-serif text-lg">Tanggal</label>
                    <input 
                        type="date" 
                        value={tanggal}
                        onChange={(e) => {
                            setTanggal(e.target.value);
                            setErrors((prev) => ({ ...prev, tanggal: '' }));
                        }}
                        className={`w-full px-4 py-4 rounded-md bg-[#DFDFDF] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] font-medium border-2 transition-colors ${
                            errors.tanggal ? 'border-red-400' : 'border-transparent'
                        }`}
                    />
                    {errors.tanggal && (
                        <p className="text-sm text-red-500 font-medium">{errors.tanggal}</p>
                    )}
                </div>

                {/* Deskripsi */}
                <div className="space-y-3 max-w-3xl">
                    <label className="block text-slate-900 font-bold font-serif text-lg">Deskripsi</label>
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
                        className={`w-full px-4 py-4 rounded-md bg-[#DFDFDF] text-slate-800 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] font-medium resize-none border-2 transition-colors ${
                            errors.deskripsi ? 'border-red-400' : 'border-transparent'
                        }`}
                    ></textarea>
                    {errors.deskripsi && (
                        <p className="text-sm text-red-500 font-medium">{errors.deskripsi}</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="pt-8 max-w-3xl flex gap-4">
                    <button
                        type="button"
                        onClick={() => onNavigate('transaksi')}
                        className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold font-serif text-lg transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit"
                        className="flex-[2] py-4 bg-[#5E6AD2] hover:bg-indigo-600 text-white rounded-md font-bold font-serif text-lg transition-colors shadow-sm"
                    >
                        {isEditMode ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
