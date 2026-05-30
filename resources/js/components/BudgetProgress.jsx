import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * BudgetProgress
 *
 * Bar progress untuk budget harian.
 *
 * @param {number} used   - Nominal yang sudah digunakan (angka, tanpa format)
 * @param {number} total  - Total budget (angka, tanpa format)
 * @param {string} label  - Label di kiri (default: "Pengeluaran budget harian")
 */
export default function BudgetProgress({ used, total, label = 'Pengeluaran budget harian' }) {
    const percent = Math.min((used / total) * 100, 100);
    const isWarning = percent >= 70;
    const isDanger = percent >= 90;

    const barColor = isDanger
        ? 'bg-red-500'
        : isWarning
        ? 'bg-amber-400'
        : 'bg-indigo-500';

    const formatRp = (val) =>
        'Rp ' + val.toLocaleString('id-ID');

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-700">{label}</p>
                <div className="flex items-center gap-1.5">
                    {isWarning && (
                        <AlertTriangle
                            size={14}
                            className={isDanger ? 'text-red-500' : 'text-amber-400'}
                        />
                    )}
                    <span className="text-sm font-semibold text-slate-800">
                        {formatRp(used)}{' '}
                        <span className="font-normal text-slate-400">/ {formatRp(total)}</span>
                    </span>
                </div>
            </div>

            {/* Track */}
            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                    style={{ width: `${percent}%` }}
                />
            </div>

            <div className="flex justify-between mt-2">
                <span className="text-xs text-slate-400">0%</span>
                <span className={`text-xs font-medium ${isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-slate-400'}`}>
                    {percent.toFixed(0)}% terpakai
                </span>
            </div>
        </div>
    );
}
