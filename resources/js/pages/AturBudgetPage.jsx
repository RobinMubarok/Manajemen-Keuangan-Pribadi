import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Bell, X } from 'lucide-react';

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
 * @param {Object}   budgetData - Data budget dari parent (async fetch dari App.jsx)
 * @param {Function} onSave     - Callback saat budget disimpan
 */
export default function AturBudgetPage({ onNavigate, budgetData, onSave }) {
    const [harianBudget, setHarianBudget] = useState('');
    const [bulananBudget, setBulananBudget] = useState('');
    const [kategoriBudget, setKategoriBudget] = useState('Harian');
    const [notifikasiAktif, setNotifikasiAktif] = useState(true);
    const [alertHampirHabis, setAlertHampirHabis] = useState(true);
    const [alertMelebihi, setAlertMelebihi] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Sync form fields when budgetData loads (fetched async from App.jsx)
    useEffect(() => {
        if (budgetData) {
            setHarianBudget(budgetData.harian ? String(budgetData.harian) : '');
            setBulananBudget(budgetData.bulanan ? String(budgetData.bulanan) : '');
            setKategoriBudget(budgetData.kategori || 'Harian');
            setNotifikasiAktif(budgetData.notifikasi ?? true);
            setAlertHampirHabis(budgetData.alertHampirHabis ?? true);
            setAlertMelebihi(budgetData.alertMelebihi ?? true);
        }
    }, [budgetData]);

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

    const handleSimpan = async () => {
        const data = {
            harian: harianBudget ? parseInt(harianBudget, 10) : 0,
            bulanan: bulananBudget ? parseInt(bulananBudget, 10) : 0,
            kategori: kategoriBudget,
            notifikasi: notifikasiAktif,
            alertHampirHabis,
            alertMelebihi,
        };

        setSaveError('');
        setIsSaving(true);

        try {
            if (onSave) {
                await onSave(data);
            }
            onNavigate('transaksi');
        } catch {
            setSaveError('Gagal menyimpan budget. Coba lagi.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBatal = () => {
        onNavigate('transaksi');
    };

    const inputStyle = {
        backgroundColor: 'var(--bg-input)',
        border: '2px solid var(--border-default)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--r-md)',
    };

    return (
        <div className="p-4 max-w-[500px] mx-auto pb-20">
            <div 
                className="rounded-2xl shadow-xl flex flex-col animate-[modalIn_0.25s_ease-out]"
                style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)'
                }}
            >
                {/* Header Card */}
                <div 
                    className="flex items-center justify-between px-5 pt-5 pb-4"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                    <h1
                        className="text-xl font-bold font-serif"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Atur Budget
                    </h1>
                    <button
                        onClick={handleBatal}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-lg hover:bg-[var(--bg-hover)]"
                        title="Tutup"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Form */}
                <div className="p-5 space-y-5">
                    {/* Harian Budget */}
                    <div className="space-y-2">
                        <label
                            className="block font-semibold text-sm"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Harian Budget
                        </label>
                        <div className="relative">
                            <span
                                className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-sm"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formatDisplayValue(harianBudget)}
                                onChange={(e) => setHarianBudget(handleAmountChange(e.target.value.replace(/\./g, '')))}
                                placeholder="0"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg font-bold focus:outline-none transition-colors text-xl"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                            />
                        </div>
                    </div>

                    {/* Bulanan Budget */}
                    <div className="space-y-2">
                        <label
                            className="block font-semibold text-sm"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Bulanan Budget
                        </label>
                        <div className="relative">
                            <span
                                className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-sm"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formatDisplayValue(bulananBudget)}
                                onChange={(e) => setBulananBudget(handleAmountChange(e.target.value.replace(/\./g, '')))}
                                placeholder="0"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg font-bold focus:outline-none transition-colors text-xl"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                            />
                        </div>
                    </div>

                    {/* Kategori Budget / Periode */}
                    <div className="space-y-2">
                        <label
                            className="block font-semibold text-sm"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Kategori Budget
                        </label>
                        <div className="relative">
                            <Calendar
                                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                size={18}
                                style={{ color: 'var(--text-muted)' }}
                            />
                            <select
                                value={kategoriBudget}
                                onChange={(e) => setKategoriBudget(e.target.value)}
                                className="w-full appearance-none rounded-lg pl-10 pr-10 py-2.5 font-medium focus:outline-none cursor-pointer transition-colors text-sm"
                                style={inputStyle}
                            >
                                <option value="Harian">Harian</option>
                                <option value="Mingguan">Mingguan</option>
                                <option value="Bulanan">Bulanan</option>
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                size={20}
                                style={{ color: 'var(--text-muted)' }}
                            />
                        </div>
                    </div>

                    <hr style={{ borderColor: 'var(--border-default)' }} />

                    {/* Notifikasi Toggle */}
                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3">
                            <Bell size={18} style={{ color: 'var(--text-muted)' }} />
                            <div>
                                <p
                                    className="font-semibold text-sm"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Aktifkan Notifikasi
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setNotifikasiAktif(!notifikasiAktif)}
                            className="relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                            style={{
                                width: '34px',
                                height: '20px',
                                backgroundColor: notifikasiAktif ? 'var(--accent)' : 'var(--bg-overlay)',
                            }}
                            role="switch"
                            aria-checked={notifikasiAktif}
                            aria-label="Toggle notifikasi"
                        >
                            <span
                                className="pointer-events-none inline-block transform rounded-full shadow ring-0 transition duration-200 ease-in-out"
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    backgroundColor: notifikasiAktif ? 'var(--text-on-accent)' : 'var(--text-muted)',
                                    transform: notifikasiAktif ? 'translateX(14px)' : 'translateX(0)',
                                }}
                            />
                        </button>
                    </div>

                    <hr style={{ borderColor: 'var(--border-default)' }} />

                    {/* Alert Pengeluaran */}
                    <div className="space-y-3">
                        <h2
                            className="font-semibold text-sm"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Alert Pengeluaran
                        </h2>

                        {/* Alert 1: Budget hampir habis */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex-shrink-0 mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={alertHampirHabis}
                                    onChange={(e) => setAlertHampirHabis(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div
                                    className="w-5 h-5 border-2 rounded transition-colors flex items-center justify-center"
                                    style={{
                                        borderColor: alertHampirHabis ? 'var(--accent)' : 'var(--border-strong)',
                                        backgroundColor: alertHampirHabis ? 'var(--accent)' : 'transparent',
                                    }}
                                >
                                    {alertHampirHabis && (
                                        <svg
                                            className="w-3.5 h-3.5"
                                            style={{ color: 'var(--text-on-accent)' }}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span
                                className="text-xs leading-relaxed flex-1"
                                style={{ color: 'var(--text-body)' }}
                            >
                                Notifikasi saat budget mendekati batas (80%)
                            </span>
                        </label>

                        {/* Alert 2: Budget melebihi batas */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex-shrink-0 mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={alertMelebihi}
                                    onChange={(e) => setAlertMelebihi(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div
                                    className="w-5 h-5 border-2 rounded transition-colors flex items-center justify-center"
                                    style={{
                                        borderColor: alertMelebihi ? 'var(--accent)' : 'var(--border-strong)',
                                        backgroundColor: alertMelebihi ? 'var(--accent)' : 'transparent',
                                    }}
                                >
                                    {alertMelebihi && (
                                        <svg
                                            className="w-3.5 h-3.5"
                                            style={{ color: 'var(--text-on-accent)' }}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span
                                className="text-xs leading-relaxed flex-1"
                                style={{ color: 'var(--text-body)' }}
                            >
                                Notifikasi saat budget sudah melebihi batas (100%)
                            </span>
                        </label>
                    </div>

                    {/* Error message */}
                    {saveError && (
                        <p className="text-xs text-center" style={{ color: 'var(--negative)' }}>
                            {saveError}
                        </p>
                    )}

                    {/* Tombol Batal & Simpan */}
                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleBatal}
                            disabled={isSaving}
                            className="flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors"
                            style={{
                                backgroundColor: 'var(--bg-input)',
                                color: 'var(--text-body)',
                                border: '1px solid var(--border-default)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-input)'}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSimpan}
                            disabled={isSaving}
                            className="flex-[2] py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: 'var(--accent)',
                                color: 'var(--text-on-accent)',
                                border: 'none',
                            }}
                            onMouseEnter={e => { if (!isSaving) e.currentTarget.style.backgroundColor = 'var(--accent-hover)'; }}
                            onMouseLeave={e => { if (!isSaving) e.currentTarget.style.backgroundColor = 'var(--accent)'; }}
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
