import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu, Bell, Info, AlertCircle, Check, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const PAGE_TITLES = {
    dashboard: 'Dashboard Keuangan',
    transaksi: 'Riwayat Transaksi',
    kategori: 'Kategori Anggaran',
    laporan: 'Analisis & Laporan',
    notifikasi: 'Notifikasi',
    profil: 'Profil Pengguna',
};

const TYPE_CONFIG = {
    info: {
        Icon: Info,
        iconClass: 'text-[var(--accent)] bg-[var(--accent-muted)] border-[var(--accent-border)]',
    },
    warning: {
        Icon: AlertTriangle,
        iconClass: 'text-[var(--warning)] bg-[rgba(251,191,36,0.12)] border-[rgba(251,191,36,0.25)]',
    },
    reminder: {
        Icon: Clock,
        iconClass: 'text-[var(--text-muted)] bg-[var(--bg-hover)] border-[var(--border-default)]',
    },
    success: {
        Icon: CheckCircle,
        iconClass: 'text-[var(--accent)] bg-[var(--accent-muted)] border-[var(--accent-border)]',
    },
};

/**
 * MainLayout
 *
 * Layout utama aplikasi yang membungkus semua halaman.
 * Anggota tim TIDAK perlu mengubah file ini untuk menambah halaman baru.
 * Cukup tambahkan navigasi baru di Sidebar dan halaman baru di App.jsx.
 *
 * @param {React.ReactNode} children      - Konten halaman yang aktif
 * @param {string}          currentPage   - Nama halaman aktif (dioper dari App)
 * @param {Function}        onNavigate    - Callback untuk berpindah halaman
 * @param {Array}           notifications - Daftar notifikasi aktif
 * @param {Function}        onMarkAllRead - Callback menandai semua dibaca
 * @param {Function}        onMarkRead    - Callback menandai satu dibaca
 */
export default function MainLayout({ 
    children, 
    currentPage, 
    onNavigate, 
    notifications = [], 
    onMarkAllRead, 
    onMarkRead,
    userProfile
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);

    // Initialize sidebar based on screen size on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSidebarOpen(window.innerWidth >= 1024);
        }
    }, []);

    // Close notifications dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;
    const pageTitle = PAGE_TITLES[currentPage] || 'Money Manager';

    return (
        <div
            className="flex h-screen font-sans overflow-hidden"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            {/* ── Overlay mobile ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 backdrop-blur-sm lg:hidden"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <Sidebar
                currentPage={currentPage}
                onNavigate={(page) => {
                    onNavigate(page);
                    // Close only on mobile when navigating
                    if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                    }
                }}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                unreadCount={unreadCount}
                userProfile={userProfile}
            />

            {/* ── Area konten utama ── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                
                {/* ── Top Unified Navbar ── */}
                <header
                    className="flex items-center justify-between h-16 px-6 flex-shrink-0 z-10"
                    style={{
                        backgroundColor: 'var(--bg-base)',
                        borderBottom: '1px solid var(--border-subtle)',
                    }}
                >
                    <div className="flex items-center min-w-0">
                        {/* Hamburger menu button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 -ml-2 rounded-xl transition-all duration-200"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                e.currentTarget.style.color = 'var(--accent)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                            aria-label="Toggle Menu"
                        >
                            <Menu size={20} />
                        </button>
                        <h2
                            className="ml-3 font-semibold text-sm sm:text-base lg:text-lg truncate"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {pageTitle}
                        </h2>
                    </div>

                    {/* Nav actions (Notification & Profile) */}
                    <div className="flex items-center gap-3">
                        {/* Notification Bell with Dropdown */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 focus:outline-none"
                                style={{
                                    backgroundColor: notifOpen ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                                    borderColor: notifOpen ? 'var(--accent-border)' : 'var(--border-default)',
                                    color: notifOpen ? 'var(--accent)' : 'var(--text-muted)',
                                }}
                                aria-label="Notifikasi"
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span
                                        className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold ring-2 animate-pulse"
                                        style={{
                                            backgroundColor: 'var(--negative)',
                                            color: '#fff',
                                            ringColor: 'var(--bg-base)',
                                        }}
                                    >
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown panel */}
                            {notifOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden z-40 transform origin-top-right transition-all"
                                    style={{
                                        backgroundColor: 'var(--bg-elevated)',
                                        border: '1px solid var(--border-default)',
                                        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                                    }}
                                >
                                    <div
                                        className="flex items-center justify-between px-4 py-3"
                                        style={{
                                            backgroundColor: 'var(--bg-overlay)',
                                            borderBottom: '1px solid var(--border-default)',
                                        }}
                                    >
                                        <span
                                            className="text-xs font-semibold"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            Notifikasi
                                        </span>
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={() => {
                                                    onMarkAllRead();
                                                    setNotifOpen(false);
                                                }}
                                                className="text-[10px] font-medium transition-colors focus:outline-none"
                                                style={{ color: 'var(--accent)' }}
                                            >
                                                Tandai semua dibaca
                                            </button>
                                        )}
                                    </div>
                                    <div
                                        className="max-h-72 overflow-y-auto"
                                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                                    >
                                        {notifications.length === 0 ? (
                                            <div
                                                className="p-6 text-center text-xs"
                                                style={{ color: 'var(--text-muted)' }}
                                            >
                                                Tidak ada notifikasi
                                            </div>
                                        ) : (
                                            notifications.map((notif) => {
                                                const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
                                                const IconComp = config.Icon;
                                                return (
                                                    <div 
                                                        key={notif.id} 
                                                        onClick={() => {
                                                            onMarkRead(notif.id);
                                                        }}
                                                        className="flex gap-3 p-3.5 transition-colors cursor-pointer"
                                                        style={{
                                                            backgroundColor: !notif.read ? 'var(--accent-muted)' : 'transparent',
                                                            borderBottom: '1px solid var(--border-subtle)',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = !notif.read ? 'var(--accent-muted)' : 'transparent'}
                                                    >
                                                        <div
                                                            className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center ${config.iconClass}`}
                                                        >
                                                            <IconComp size={14} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p
                                                                className="text-xs leading-normal"
                                                                style={{
                                                                    color: !notif.read ? 'var(--text-primary)' : 'var(--text-body)',
                                                                    fontWeight: !notif.read ? '600' : '400',
                                                                }}
                                                            >
                                                                {notif.message}
                                                            </p>
                                                            <span
                                                                className="text-[10px] mt-1 block"
                                                                style={{ color: 'var(--text-muted)' }}
                                                            >
                                                                {notif.time}
                                                            </span>
                                                        </div>
                                                        {!notif.read && (
                                                            <div className="flex-shrink-0 flex items-center">
                                                                <span
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{ backgroundColor: 'var(--accent)' }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <div className="p-2 text-center">
                                        <button 
                                            onClick={() => {
                                                onNavigate('notifikasi');
                                                setNotifOpen(false);
                                            }}
                                            className="w-full py-2 text-xs font-semibold rounded-xl transition-all focus:outline-none"
                                            style={{ color: 'var(--accent)' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-muted)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            Lihat Semua Notifikasi
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Slot halaman */}
                <main
                    className="flex-1 overflow-y-auto"
                    style={{ backgroundColor: 'var(--bg-primary)' }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
