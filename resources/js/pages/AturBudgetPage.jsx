import React, { useState } from 'react';
import { Calendar, ChevronDown, Bell, Info } from 'lucide-react';

/**
 * AturBudgetPage
 *
 * Halaman untuk mengatur budget harian dan bulanan.
 * Fitur:
 *   - Input budget harian & bulanan
 *   - Dropdown periode budget (Harian/Mingguan/Bulanan)
 *   - Toggle notifikasi
 *   - Alert pengeluaran dengan checkbox
 *   - Tombol Batal & Simpan
 *
 * @param {Function} onNavigate - Callback untuk navigasi antar halaman
 * @param {Object}   budgetData - Data budget dari parent (opsional)
 * @param {Function} onSave     - Callback saat budget disimpan (opsional)
 */
export default function AturBudgetPage({ onNavigate, budgetData, onSave }) {
    const [harianBudget, setHarianBudget] = useState(budgetData?.harian || '');
    const [bulananBudget, setBulananBudget] = useState(budgetData?.bulanan || '');
    const [kategoriBudget, setKategoriBudget] = useState(budgetData?.kategori || 'Harian');
    const [notifikasiAktif, setNotifikasiAktif] = useState(budgetData?.notifikasi ?? true);
    const [alertHampirHabis, setAlertHampirHabis] = useState(budgetData?.alertHampirHabis ?? true);
    const [alertMelebihi, setAlertMelebihi] = useState(budgetData?.alertMelebihi ?? true);

    /**
     * Format angka menjadi format Rupiah yang bersih untuk input.
     *
     * @param {string} value - Nilai mentah dari input
     * @returns {string} - Angka terformat (hanya digit)
     */
    const handleAmountChange = (value) => {
        return value.replace(/[^0-9]/g, '');
    };

    /**
     * Format angka ke tampilan Rupiah.
     *
     * @param {string|number} value - Angka mentah
     * @returns {string} - Tampilan format "Rp 1.000.000"
     */
    const formatDisplayValue = (value) => {
        if (!value) return '';
        const num = parseInt(value, 10);
        if (isNaN(num)) return '';
        return num.toLocaleString('id-ID');
    };

    const handleSimpan = () => {
        const data = {
            harian: harianBudget ? parseInt(harianBudget, 10) : 0,
            bulanan: bulananBudget ? parseInt(bulananBudget, 10) : 0,
            kategori: kategoriBudget,
            notifikasi: notifikasiAktif,
            alertHampirHabis,
            alertMelebihi,
        };

        if (onSave) {
            onSave(data);
        }

        onNavigate('transaksi');
    };

    const handleBatal = () => {
        onNavigate('transaksi');
    };

    return (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-slate-900 font-serif mb-8">Atur Budget</h1>

            {/* Budget Harian & Bulanan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Harian Budget */}
                <div className="space-y-3">
                    <label className="block text-slate-900 font-bold font-serif text-lg">
                        Harian Budget
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-medium text-sm">
                            Rp
                        </span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formatDisplayValue(harianBudget)}
                            onChange={(e) => setHarianBudget(handleAmountChange(e.target.value.replace(/\./g, '')))}
                            placeholder="0"
                            className="w-full pl-12 pr-4 py-4 rounded-md bg-[#DFDFDF] border-none text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] font-medium"
                        />
                    </div>
                    <p className="text-sm text-slate-500">Atur budget harian anda</p>
                </div>

                {/* Bulanan Budget */}
                <div className="space-y-3">
                    <label className="block text-slate-900 font-bold font-serif text-lg">
                        Bulanan Budget
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-medium text-sm">
                            Rp
                        </span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formatDisplayValue(bulananBudget)}
                            onChange={(e) => setBulananBudget(handleAmountChange(e.target.value.replace(/\./g, '')))}
                            placeholder="0"
                            className="w-full pl-12 pr-4 py-4 rounded-md bg-[#DFDFDF] border-none text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] font-medium"
                        />
                    </div>
                    <p className="text-sm text-slate-500">Atur budget bulanan anda</p>
                </div>
            </div>

            {/* Kategori Budget / Periode */}
            <div className="space-y-3 max-w-3xl">
                <label className="block text-slate-900 font-bold font-serif text-lg">
                    Kategori Budget
                </label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={20} />
                    <select
                        value={kategoriBudget}
                        onChange={(e) => setKategoriBudget(e.target.value)}
                        className="w-full appearance-none bg-[#DFDFDF] border-none rounded-md pl-12 pr-12 py-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] cursor-pointer"
                    >
                        <option value="Harian">Harian</option>
                        <option value="Mingguan">Mingguan</option>
                        <option value="Bulanan">Bulanan</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none" size={24} />
                </div>
                <p className="text-sm text-slate-500">Pilih periode budget</p>
            </div>

            {/* Notifikasi Toggle */}
            <div className="flex items-center justify-between max-w-3xl py-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <Bell size={22} className="text-slate-700" />
                    </div>
                    <div>
                        <p className="text-slate-900 font-bold font-serif">Aktifkan notifikasi</p>
                        <p className="text-sm text-slate-500">Aktifkan notifikasi untuk kontrol pengeluaran anda</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setNotifikasiAktif(!notifikasiAktif)}
                    className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] focus:ring-offset-2 ${
                        notifikasiAktif ? 'bg-slate-800' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={notifikasiAktif}
                    aria-label="Toggle notifikasi"
                >
                    <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            notifikasiAktif ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                </button>
            </div>

            {/* Alert Pengeluaran */}
            <div className="space-y-4 max-w-3xl">
                <h2 className="text-slate-900 font-bold font-serif text-lg">Alert Pengeluaran</h2>

                {/* Alert 1: Budget hampir habis */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={alertHampirHabis}
                            onChange={(e) => setAlertHampirHabis(e.target.checked)}
                            className="peer sr-only"
                        />
                        <div className="w-6 h-6 border-2 border-slate-400 rounded-md peer-checked:bg-slate-800 peer-checked:border-slate-800 transition-colors flex items-center justify-center">
                            {alertHampirHabis && (
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span className="text-sm text-slate-600 flex-1">
                        Aktifkan notifikasi untuk kontrol pengeluaran anda
                    </span>
                    <button
                        type="button"
                        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Notifikasi saat budget mendekati batas (80%)"
                    >
                        <Info size={18} />
                    </button>
                </label>

                {/* Alert 2: Budget melebihi batas */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={alertMelebihi}
                            onChange={(e) => setAlertMelebihi(e.target.checked)}
                            className="peer sr-only"
                        />
                        <div className="w-6 h-6 border-2 border-slate-400 rounded-md peer-checked:bg-slate-800 peer-checked:border-slate-800 transition-colors flex items-center justify-center">
                            {alertMelebihi && (
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span className="text-sm text-slate-600 flex-1">
                        Aktifkan notifikasi untuk kontrol pengeluaran anda
                    </span>
                    <button
                        type="button"
                        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Notifikasi saat budget sudah melebihi batas (100%)"
                    >
                        <Info size={18} />
                    </button>
                </label>
            </div>

            {/* Tombol Batal & Simpan */}
            <div className="flex items-center justify-end gap-4 pt-8 max-w-3xl">
                <button
                    type="button"
                    onClick={handleBatal}
                    className="px-8 py-3 bg-[#FFA93B] hover:bg-orange-500 text-white rounded-lg font-bold font-serif text-base transition-colors shadow-sm"
                >
                    Batal
                </button>
                <button
                    type="button"
                    onClick={handleSimpan}
                    className="px-8 py-3 bg-[#509C64] hover:bg-green-700 text-white rounded-lg font-bold font-serif text-base transition-colors shadow-sm"
                >
                    Simpan
                </button>
            </div>
        </div>
    );
}
