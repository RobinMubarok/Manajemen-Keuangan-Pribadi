import React from 'react';
import { Info, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

/** Tipe notifikasi yang didukung */
const TYPE_CONFIG = {
    info: {
        Icon: Info,
        iconClass: 'text-blue-500',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        dotColor: 'bg-blue-500',
    },
    warning: {
        Icon: AlertTriangle,
        iconClass: 'text-amber-500',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        dotColor: 'bg-amber-500',
    },
    reminder: {
        Icon: Clock,
        iconClass: 'text-slate-500',
        bg: 'bg-slate-50',
        border: 'border-slate-100',
        dotColor: 'bg-slate-500',
    },
    success: {
        Icon: CheckCircle,
        iconClass: 'text-indigo-500',
        bg: 'bg-indigo-50',
        border: 'border-indigo-100',
        dotColor: 'bg-indigo-500',
    },
};

/**
 * NotificationList
 *
 * Daftar notifikasi di dashboard.
 *
 * @param {Array} notifications - Array of { id, message, time, type, read }
 */
export default function NotificationList({ notifications }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Notifikasi</h3>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {notifications.filter((n) => !n.read).length}
                </span>
            </div>

            <ul className="space-y-2">
                {notifications.map((notif) => {
                    const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info;
                    const { Icon, iconClass, bg, border, dotColor } = config;

                    return (
                        <li
                            key={notif.id}
                            className={`flex items-start gap-3 p-3 rounded-xl border ${bg} ${border} transition-opacity`}
                        >
                            {/* Ikon */}
                            <span className="flex-shrink-0 mt-0.5">
                                <Icon size={16} className={iconClass} />
                            </span>

                            {/* Konten */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-700 leading-snug">
                                    {notif.message}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{notif.time}</p>
                            </div>

                            {/* Dot belum dibaca */}
                            {!notif.read && (
                                <span className={`flex-shrink-0 mt-1.5 w-2 h-2 rounded-full ${dotColor}`} />
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
