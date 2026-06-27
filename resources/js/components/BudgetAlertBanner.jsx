import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';

/**
 * BudgetAlertBanner
 *
 * Banner peringatan yang muncul di atas konten halaman ketika
 * penggunaan budget bulanan mencapai >= 80%.
 *
 * @param {number}   totalSpent   - Total pengeluaran bulan ini
 * @param {number}   totalBudget  - Total budget bulanan yang di-set user
 * @param {Function} onNavigate   - Callback navigasi ke halaman budget
 */
export default function BudgetAlertBanner({ 
    totalSpent, 
    totalBudget, 
    onNavigate,
    alertHampirHabis = true,
    alertMelebihi = true,
    budgetLabel = 'Budget'
}) {
    const [dismissed, setDismissed] = useState(false);
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    
    // Tentukan apakah alert perlu muncul berdasarkan persentase dan setelan user
    const isOver100 = percentage >= 100;
    const isNearLimit = percentage >= 80 && percentage < 100;
    
    let shouldShow = false;
    if (totalBudget > 0) {
        if (isOver100 && alertMelebihi) shouldShow = true;
        if (isNearLimit && alertHampirHabis) shouldShow = true;
    }

    const remaining = Math.max(totalBudget - totalSpent, 0);

    // Reset dismissed state if totalSpent increases (user added new transaction)
    const prevSpent = React.useRef(totalSpent);
    useEffect(() => {
        if (totalSpent > prevSpent.current) {
            setDismissed(false);
            setClosing(false);
        }
        prevSpent.current = totalSpent;
    }, [totalSpent]);

    // Slide-in animation on mount or when shouldShow becomes true
    useEffect(() => {
        if (shouldShow && !dismissed) {
            const timer = setTimeout(() => setVisible(true), 50);
            return () => clearTimeout(timer);
        } else if (!shouldShow) {
            setVisible(false);
        }
    }, [shouldShow, dismissed]);

    // Dismiss handler with fade-out
    const handleDismiss = () => {
        setClosing(true);
        setTimeout(() => {
            setDismissed(true);
            setClosing(false);
            setVisible(false);
        }, 300);
    };

    if (!shouldShow || dismissed) return null;

    const formatRupiah = (amount) =>
        'Rp ' + Math.abs(amount).toLocaleString('id-ID');



    return (
        <div
            style={{
                maxHeight: visible && !closing ? '200px' : '0px',
                opacity: visible && !closing ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.4s ease, opacity 0.3s ease',
            }}
        >
            <div
                style={{
                    backgroundColor: isOver100
                        ? 'rgba(220, 38, 38, 0.12)'
                        : 'rgba(251, 191, 36, 0.10)',
                    borderLeft: `4px solid ${isOver100 ? 'var(--negative)' : 'var(--warning)'}`,
                    borderBottom: '1px solid var(--border-default)',
                    padding: '14px 20px',
                    position: 'relative',
                }}
            >
                <div className="flex items-start gap-3 max-w-6xl mx-auto">
                    {/* Icon */}
                    <div
                        className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg mt-0.5"
                        style={{
                            backgroundColor: isOver100
                                ? 'rgba(220, 38, 38, 0.18)'
                                : 'rgba(251, 191, 36, 0.18)',
                        }}
                    >
                        <AlertTriangle
                            size={18}
                            style={{ color: isOver100 ? 'var(--negative)' : 'var(--warning)' }}
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p
                            className="text-sm font-bold"
                            style={{ color: isOver100 ? 'var(--negative)' : 'var(--warning)' }}
                        >
                            Peringatan Budget
                        </p>
                        <p
                            className="text-xs mt-1"
                            style={{ color: 'var(--text-body)' }}
                        >
                            {isOver100
                                ? `${budgetLabel} sudah melebihi batas (${percentage}% terpakai)`
                                : `${budgetLabel} hampir habis (${percentage}% terpakai)`
                            }
                        </p>
                        <p
                            className="text-xs mt-0.5"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Sisa budget: <strong>{formatRupiah(remaining)}</strong> dari <strong>{formatRupiah(totalBudget)}</strong>
                        </p>
                        <button
                            onClick={() => onNavigate && onNavigate('atur-budget')}
                            className="inline-flex items-center gap-1 text-xs font-semibold mt-2 px-3 py-1.5 rounded-lg transition-all duration-200"
                            style={{
                                backgroundColor: isOver100
                                    ? 'rgba(220, 38, 38, 0.15)'
                                    : 'rgba(251, 191, 36, 0.15)',
                                color: isOver100 ? 'var(--negative)' : 'var(--warning)',
                                border: `1px solid ${isOver100 ? 'rgba(220, 38, 38, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = isOver100
                                    ? 'rgba(220, 38, 38, 0.25)'
                                    : 'rgba(251, 191, 36, 0.25)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = isOver100
                                    ? 'rgba(220, 38, 38, 0.15)'
                                    : 'rgba(251, 191, 36, 0.15)';
                            }}
                        >
                            Atur Budget <ArrowRight size={12} />
                        </button>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                        aria-label="Tutup peringatan"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
