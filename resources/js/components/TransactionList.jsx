import React from 'react';
import { ShoppingBag, Fuel, Pill } from 'lucide-react';

/** Map ikon berdasarkan nama transaksi (bisa diperluas) */
const ICON_MAP = {
    Gacoan:       { icon: ShoppingBag, bg: 'bg-orange-50', color: 'text-orange-500' },
    'Isi Bensin': { icon: Fuel,         bg: 'bg-blue-50',   color: 'text-blue-500' },
    'Beli Vitamin':{ icon: Pill,        bg: 'bg-green-50',  color: 'text-green-500' },
};

const DEFAULT_ICON = { icon: ShoppingBag, bg: 'bg-slate-50', color: 'text-slate-400' };

/**
 * TransactionList
 *
 * Daftar transaksi terbaru.
 *
 * @param {Array} transactions - Array of { id, name, amount, date, category }
 */
export default function TransactionList({ transactions }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Transaksi Terbaru</h3>
                <button className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                    Lihat semua
                </button>
            </div>

            <ul className="space-y-1">
                {transactions.map((tx) => {
                    const { icon: Icon, bg, color } = ICON_MAP[tx.name] ?? DEFAULT_ICON;
                    const isExpense = tx.amount < 0;

                    return (
                        <li
                            key={tx.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                            {/* Ikon kategori */}
                            <span className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${bg}`}>
                                <Icon size={16} className={color} />
                            </span>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{tx.name}</p>
                                <p className="text-xs text-slate-400">{tx.date}</p>
                            </div>

                            {/* Nominal */}
                            <span
                                className={`text-sm font-semibold flex-shrink-0 ${
                                    isExpense ? 'text-red-500' : 'text-emerald-500'
                                }`}
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
