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
            className="relative overflow-hidden rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5"
            style={{
                backgroundColor: isIncome ? 'var(--bg-overlay)' : 'var(--bg-elevated)',
                border: isIncome
                    ? '1px solid var(--accent-border)'
                    : '1px solid var(--border-default)',
            }}
        >
            {/* Dekorasi lingkaran latar */}
            <span
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
                style={{ backgroundColor: isIncome ? 'var(--accent)' : 'var(--negative)' }}
            />

            <div className="flex items-start justify-between">
                <p
                    className="text-sm font-medium"
                    style={{ color: isIncome ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                    {title}
                </p>
                <span
                    className="flex items-center justify-center w-9 h-9 rounded-xl"
                    style={{
                        backgroundColor: isIncome
                            ? 'var(--accent-muted)'
                            : 'rgba(248,113,113,0.12)',
                    }}
                >
                    {isIncome
                        ? <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
                        : <TrendingDown size={18} style={{ color: 'var(--negative)' }} />
                    }
                </span>
            </div>

            <p
                className="mt-3 text-2xl font-bold tracking-tight"
                style={{ color: isIncome ? 'var(--accent)' : 'var(--text-primary)' }}
            >
                {amount}
            </p>

            {subtitle && (
                <p
                    className="mt-1 text-xs"
                    style={{ color: 'var(--text-muted)' }}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}
