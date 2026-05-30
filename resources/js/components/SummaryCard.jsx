import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * SummaryCard
 *
 * Card ringkasan keuangan (Pemasukan / Pengeluaran).
 *
 * @param {string} title    - Judul card
 * @param {string} amount   - Nominal formatted (e.g. "Rp 1.250.000")
 * @param {string} type     - "income" | "expense"
 * @param {string} subtitle - Teks kecil di bawah nominal
 */
export default function SummaryCard({ title, amount, type = 'income', subtitle }) {
    const isIncome = type === 'income';

    return (
        <div
            className={[
                'relative overflow-hidden rounded-2xl p-5 shadow-sm border transition-transform duration-200 hover:-translate-y-0.5',
                isIncome
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 border-indigo-400/30 text-white'
                    : 'bg-white border-slate-100 text-slate-800',
            ].join(' ')}
        >
            {/* Dekorasi lingkaran latar */}
            <span
                className={[
                    'absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10',
                    isIncome ? 'bg-white' : 'bg-indigo-100',
                ].join(' ')}
            />

            <div className="flex items-start justify-between">
                <p className={`text-sm font-medium ${isIncome ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {title}
                </p>
                <span
                    className={[
                        'flex items-center justify-center w-9 h-9 rounded-xl',
                        isIncome ? 'bg-white/20' : 'bg-emerald-50',
                    ].join(' ')}
                >
                    {isIncome
                        ? <TrendingUp size={18} className="text-white" />
                        : <TrendingDown size={18} className="text-red-500" />
                    }
                </span>
            </div>

            <p className={`mt-3 text-2xl font-bold tracking-tight ${isIncome ? 'text-white' : 'text-slate-800'}`}>
                {amount}
            </p>

            {subtitle && (
                <p className={`mt-1 text-xs ${isIncome ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}
