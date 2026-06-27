import React, { useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, Bell } from 'lucide-react';

/**
 * NotifikasiPage
 *
 * Halaman Notifikasi untuk aplikasi keuangan pribadi dengan styling warna,
 * bentuk ikon square-rounded (border-radius: 10px, 40x40px), padding kartu,
 * dan jarak/spacing yang presisi sesuai instruksi.
 *
 * @param {Array}    notifications    - List notifikasi dari App.jsx
 * @param {Function} onMarkRead       - Callback untuk menandai dibaca
 * @param {Object}   dashboardSummary - Data dashboard (dailyBudgetUsed, dailyBudgetTotal)
 * @param {Object}   budgetData       - Data budget (harian, bulanan)
 * @param {Function} onNavigate       - Callback navigasi
 */
export default function NotifikasiPage({ notifications = [], onMarkRead, onMarkAllRead, dashboardSummary = null, budgetData = null, onNavigate }) {
    const unreadNotifications = notifications.filter(n => !n.read);
    const readNotifications = notifications.filter(n => n.read);
    const unreadCount = unreadNotifications.length;

    // Otomatis tandai semua sudah dibaca saat halaman notifikasi dibuka
    useEffect(() => {
        if (notifications.length > 0 && onMarkAllRead) {
            onMarkAllRead();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Helper untuk merender container ikon berbentuk rounded square berwarna (border-radius: 10px, 40x40px)
    const renderIconContainer = (type) => {
        let bgColor = '';
        let strokeColor = '';
        let IconComponent = Bell;

        switch (type) {
            case 'warning':
            case 'alert':
                bgColor = 'rgba(251, 191, 36, 0.12)';
                strokeColor = 'var(--warning)';
                IconComponent = AlertTriangle;
                break;
            case 'reminder':
                bgColor = 'var(--accent-muted)';
                strokeColor = 'var(--accent)';
                IconComponent = Clock;
                break;
            case 'success':
                bgColor = 'rgba(74, 222, 128, 0.12)';
                strokeColor = 'var(--positive)';
                IconComponent = CheckCircle;
                break;
            default:
                bgColor = 'var(--accent-muted)';
                strokeColor = 'var(--accent)';
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
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Notifikasi</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi telah dibaca'}
                </p>
            </header>


            {/* ── SEKSI: BELUM DIBACA ── */}
            {unreadNotifications.length > 0 && (
                <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Belum Dibaca</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {unreadNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => onMarkRead(notif.id)}
                                className="flex items-center gap-4 transition-all duration-200 cursor-pointer group"
                                style={{
                                    border: '1px solid var(--accent)',
                                    backgroundColor: 'var(--bg-elevated)',
                                    padding: '16px',
                                    borderRadius: 'var(--r-md)',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.15)'
                                }}
                                title="Klik untuk tandai sudah dibaca"
                            >
                                {renderIconContainer(notif.type)}
                                <div className="flex-1 min-w-0">
                                    {notif.title ? (
                                        <>
                                            <h3 className="font-bold text-sm sm:text-base leading-snug group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                                                {notif.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm mt-1 leading-snug" style={{ color: 'var(--text-body)' }}>
                                                {notif.message}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="font-semibold text-sm sm:text-base leading-snug group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                                            {notif.message}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                        <span>{notif.time}</span>
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-strong)' }} />
                                        <span className="font-medium px-2 py-0.5" style={{ color: 'var(--text-on-accent)', backgroundColor: 'var(--accent)', borderRadius: 'var(--r-sm)' }}>Baru</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── SEKSI: SUDAH DIBACA (riwayat) ── */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Sudah Dibaca</h2>
                {readNotifications.length === 0 ? (
                    <div
                        className="p-6 text-center text-sm"
                        style={{
                            color: 'var(--text-muted)',
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--r-md)',
                        }}
                    >
                        Belum ada notifikasi yang dibaca
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {readNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                className="flex items-center gap-4 transition-all duration-200"
                                style={{
                                    border: '1px solid var(--border-default)',
                                    backgroundColor: 'var(--bg-elevated)',
                                    padding: '16px',
                                    borderRadius: 'var(--r-md)',
                                    opacity: 0.75,
                                }}
                            >
                                {renderIconContainer(notif.type)}
                                <div className="flex-1 min-w-0">
                                    {notif.title ? (
                                        <>
                                            <h3 className="font-semibold text-sm sm:text-base leading-snug" style={{ color: 'var(--text-primary)' }}>
                                                {notif.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm mt-1 leading-snug" style={{ color: 'var(--text-body)' }}>
                                                {notif.message}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm sm:text-base leading-snug" style={{ color: 'var(--text-body)' }}>
                                            {notif.message}
                                        </p>
                                    )}
                                    <span className="text-xs mt-1 block" style={{ color: 'var(--text-muted)' }}>{notif.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── INFO BOX: TENTANG NOTIFIKASI ── */}
            <section>
                <div 
                    style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--r-md)',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}
                >
                    <div className="flex items-center gap-2.5">
                        <Bell size={20} color="var(--accent)" className="stroke-[1.5]" />
                        <h3 className="font-bold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>Tentang Notifikasi</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div className="flex items-center gap-3">
                            {renderIconContainer('warning')}
                            <p className="text-xs sm:text-sm leading-normal" style={{ color: 'var(--text-body)' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>Budget Hampir Habis:</strong> Dikirim saat budget mencapai 80%
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {renderIconContainer('reminder')}
                            <p className="text-xs sm:text-sm leading-normal" style={{ color: 'var(--text-body)' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>Pengingat Harian:</strong> Setiap hari pukul 20.00 untuk mengingatkan mencatat pengeluaran
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {renderIconContainer('success')}
                            <p className="text-xs sm:text-sm leading-normal" style={{ color: 'var(--text-body)' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>Konfirmasi:</strong> Setiap kali transaksi berhasil disimpan
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
