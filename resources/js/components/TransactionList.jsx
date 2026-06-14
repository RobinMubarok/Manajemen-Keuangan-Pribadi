import React from 'react';
import { ShoppingBag, Fuel, Pill } from 'lucide-react';

/** Map ikon berdasarkan nama transaksi (bisa diperluas) */
const ICON_MAP = {
    Gacoan:        { icon: ShoppingBag, bgColor: 'rgba(251,191,36,0.15)', color: 'var(--warning)' },
    'Isi Bensin':  { icon: Fuel,         bgColor: 'rgba(74,222,128,0.12)', color: 'var(--accent)' },
    'Beli Vitamin':{ icon: Pill,         bgColor: 'rgba(74,222,128,0.12)', color: 'var(--positive)' },
};

const DEFAULT_ICON = {
    icon: ShoppingBag,
    bgColor: 'var(--bg-hover)',
    color: 'var(--text-muted)',
};

/**
 * TransactionList
 *
 * Daftar transaksi terbaru.
 *
 * @param {Array} transactions - Array of { id, name, amount, date, category }
 */
export default function TransactionList({ transactions }) {
    return (
        <div
            className="rounded-2xl p-5 h-full"
            style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3
                    className="text-sm font-semibold"
                    style={{ color: 'var(--text-body)' }}
                >
                    Transaksi Terbaru
                </h3>
                <button
                    className="text-xs font-medium transition-colors"
                    style={{ color: 'var(--accent)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-hover)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
                >
                    Lihat semua
                </button>
            </div>

            <ul className="space-y-1">
                {transactions.map((tx) => {
                    const { icon: Icon, bgColor, color } = ICON_MAP[tx.name] ?? DEFAULT_ICON;
                    const isExpense = tx.amount < 0;

                    return (
                        <li
                            key={tx.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                            style={{ cursor: 'default' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {/* Ikon kategori */}
                            <span
                                className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                                style={{ backgroundColor: bgColor }}
                            >
                                <Icon size={16} style={{ color }} />
                            </span>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-sm font-medium truncate"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {tx.name}
                                </p>
                                <p
                                    className="text-xs"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {tx.date}
                                </p>
                            </div>

                            {/* Nominal */}
                            <span
                                className="text-sm font-semibold flex-shrink-0"
                                style={{ color: isExpense ? 'var(--negative)' : 'var(--positive)' }}
                            >
                                {isExpense ? '-' : '+'}Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
