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
    const actualPercent = total > 0 ? (used / total) * 100 : 0;
    const barPercent = Math.min(actualPercent, 100);
    const isWarning = actualPercent >= 70;
    const isDanger = actualPercent >= 90;

    const barColor = isDanger
        ? 'var(--negative)'
        : isWarning
        ? 'var(--warning)'
        : 'var(--accent)';

    const formatRp = (val) =>
        'Rp ' + (val || 0).toLocaleString('id-ID');

    return (
        <div
            className="rounded-2xl p-5"
            style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
            }}
        >
            <div className="flex items-center justify-between mb-3">
                <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-body)' }}
                >
                    {label}
                </p>
                <div className="flex items-center gap-1.5">
                    {isWarning && (
                        <AlertTriangle
                            size={14}
                            style={{ color: isDanger ? 'var(--negative)' : 'var(--warning)' }}
                        />
                    )}
                    <span
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {formatRp(used)}{' '}
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                            / {formatRp(total)}
                        </span>
                    </span>
                </div>
            </div>

            {/* Track */}
            <div
                className="relative h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--bg-overlay)' }}
            >
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${barPercent}%`, backgroundColor: barColor }}
                />
            </div>

            <div className="flex justify-end mt-2">
                <span
                    className="text-xs font-medium"
                    style={{
                        color: isDanger
                            ? 'var(--negative)'
                            : isWarning
                            ? 'var(--warning)'
                            : 'var(--text-muted)',
                    }}
                >
                    {actualPercent.toFixed(0)}% terpakai
                </span>
            </div>
        </div>
    );
}
