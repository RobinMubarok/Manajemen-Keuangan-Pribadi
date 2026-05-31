import React from 'react';
import { AlertTriangle, Clock, CheckCircle, Bell } from 'lucide-react';

/**
 * NotifikasiPage
 *
 * Halaman Notifikasi untuk aplikasi keuangan pribadi dengan styling warna,
 * bentuk ikon square-rounded (border-radius: 10px, 40x40px), padding kartu,
 * dan jarak/spacing yang presisi sesuai instruksi.
 *
 * @param {Array}    notifications - List notifikasi dari App.jsx
 * @param {Function} onMarkRead    - Callback untuk menandai dibaca
 */
export default function NotifikasiPage({ notifications = [], onMarkRead }) {
    const unreadNotifications = notifications.filter(n => !n.read);
    const readNotifications = notifications.filter(n => n.read);
    const unreadCount = unreadNotifications.length;

    // Helper untuk merender container ikon berbentuk rounded square berwarna (border-radius: 10px, 40x40px)
    const renderIconContainer = (type) => {
        let bgColor = '';
        let strokeColor = '';
        let IconComponent = Bell;

        switch (type) {
            case 'warning':
                bgColor = '#FEF3C7';
                strokeColor = '#F59E0B';
                IconComponent = AlertTriangle;
                break;
            case 'reminder':
                bgColor = '#EEF2FF';
                strokeColor = '#4F46E5';
                IconComponent = Clock;
                break;
            case 'success':
                bgColor = '#F0FDF4';
                strokeColor = '#16A34A';
                IconComponent = CheckCircle;
                break;
            default:
                bgColor = '#EEF2FF';
                strokeColor = '#4F46E5';
                IconComponent = Bell;
                break;
        }

        return (
            <div 
                className="flex items-center justify-center flex-shrink-0"
                style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: bgColor, 
                    borderRadius: '10px'
                }}
            >
                <IconComponent size={20} color={strokeColor} className="stroke-[1.5]" />
            </div>
        );
    };

    return (
        <div style={{ width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* ── HEADER Halaman ── */}
            <header>
                <h1 className="text-2xl font-bold text-slate-800">Notifikasi</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi telah dibaca'}
                </p>
            </header>

            {/* ── SEKSI: BELUM DIBACA ── */}
            {unreadNotifications.length > 0 && (
                <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h2 className="text-sm font-semibold text-slate-800">Belum Dibaca</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}> {/* Gap antar card: 10px */}
                        {unreadNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => onMarkRead(notif.id)}
                                className="flex items-center gap-4 transition-all duration-200 cursor-pointer group"
                                style={{
                                    border: '1px solid #6366F1',
                                    backgroundColor: '#FFFFFF',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
                                }}
                                title="Klik untuk tandai sudah dibaca"
                            >
                                {renderIconContainer(notif.type)}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-indigo-600 transition-colors">
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                        <span>{notif.time}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        <span className="font-medium text-indigo-600 bg-indigo-50/60 px-2 py-0.5 rounded-md">Baru</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── SEKSI: SUDAH DIBACA ── */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h2 className="text-sm font-semibold text-slate-800">Sudah Dibaca</h2>
                {readNotifications.length === 0 ? (
                    <div 
                        className="p-6 text-center text-sm text-slate-400 bg-white"
                        style={{
                            border: '1px solid #F1F5F9',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        Belum ada notifikasi yang dibaca
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}> {/* Gap antar card: 16px */}
                        {readNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                className="flex items-center gap-4 transition-all duration-200"
                                style={{
                                    border: '1px solid #F1F5F9',
                                    backgroundColor: '#FFFFFF',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                {renderIconContainer(notif.type)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-600 text-sm sm:text-base leading-snug">
                                        {notif.message}
                                    </p>
                                    <span className="text-xs text-slate-400 mt-1 block">{notif.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── INFO BOX: TENTANG NOTIFIKASI ── */}
            <section>
                <div 
                    className="bg-slate-100/60"
                    style={{
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}
                >
                    <div className="flex items-center gap-2.5">
                        <Bell size={20} color="#4F46E5" className="stroke-[1.5]" />
                        <h3 className="font-bold text-slate-800 text-sm sm:text-base">Tentang Notifikasi</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div className="flex items-center gap-3">
                            {renderIconContainer('warning')}
                            <p className="text-xs sm:text-sm text-slate-600 leading-normal">
                                <strong className="text-slate-700">Budget Hampir Habis:</strong> Dikirim saat budget mencapai 80%
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {renderIconContainer('reminder')}
                            <p className="text-xs sm:text-sm text-slate-600 leading-normal">
                                <strong className="text-slate-700">Pengingat Harian:</strong> Setiap hari pukul 20.00 untuk mengingatkan mencatat pengeluaran
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {renderIconContainer('success')}
                            <p className="text-xs sm:text-sm text-slate-600 leading-normal">
                                <strong className="text-slate-700">Konfirmasi:</strong> Setiap kali transaksi berhasil disimpan
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
