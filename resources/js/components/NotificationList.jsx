import React from 'react';
import { Info, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

/** Tipe notifikasi yang didukung */
const TYPE_CONFIG = {
    info: {
        Icon: Info,
        color: 'var(--accent)',
        bg: 'var(--accent-muted)',
        border: 'var(--accent-border)',
        dotColor: 'var(--accent)',
    },
    warning: {
        Icon: AlertTriangle,
        color: 'var(--warning)',
        bg: 'rgba(251,191,36,0.10)',
        border: 'rgba(251,191,36,0.25)',
        dotColor: 'var(--warning)',
    },
    reminder: {
        Icon: Clock,
        color: 'var(--text-muted)',
        bg: 'var(--bg-hover)',
        border: 'var(--border-default)',
        dotColor: 'var(--text-muted)',
    },
    success: {
        Icon: CheckCircle,
        color: 'var(--positive)',
        bg: 'var(--accent-muted)',
        border: 'var(--accent-border)',
        dotColor: 'var(--positive)',
    },
};

/**
 * NotificationList
 *
 * Daftar notifikasi di dashboard.
 *
 * @param {Array} notifications - Array of { id, message, time, type, read }
 */
export default function NotificationList({ notifications, onNavigate }) {
    return (
        <div
            className="rounded-2xl p-5"
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
                    Notifikasi Terbaru
                </h3>
                <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: 'var(--negative)', color: '#fff' }}
                >
                    {notifications.filter((n) => !n.read).length}
                </span>
            </div>

            {notifications.length === 0 ? (
                <div className="text-center p-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                    Tidak ada notifikasi baru
                </div>
            ) : (
                <ul className="space-y-2">
                    {notifications.slice(0, 5).map((notif) => {
                        const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info;
                        const { Icon, color, bg, border, dotColor } = config;

                        return (
                            <li
                                key={notif.id}
                                className="flex items-start gap-3 p-3 rounded-xl transition-opacity"
                                style={{
                                    backgroundColor: bg,
                                    border: `1px solid ${border}`,
                                }}
                            >
                                {/* Ikon */}
                                <span className="flex-shrink-0 mt-0.5">
                                    <Icon size={16} style={{ color }} />
                                </span>

                                {/* Konten */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="text-xs font-medium leading-snug"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {notif.message}
                                    </p>
                                    <p
                                        className="text-[11px] mt-0.5"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {notif.time}
                                    </p>
                                </div>

                                {/* Dot belum dibaca */}
                                {!notif.read && (
                                    <span
                                        className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full"
                                        style={{ backgroundColor: dotColor }}
                                    />
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Tombol Lihat Semua jika lebih dari 5 */}
            {notifications.length > 5 && onNavigate && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => onNavigate('notifikasi')}
                        className="text-xs font-semibold hover:underline transition-all"
                        style={{ color: 'var(--accent)' }}
                    >
                        Lihat Semua Notifikasi
                    </button>
                </div>
            )}
        </div>
    );
}
