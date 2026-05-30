import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu, Bell, Info, AlertCircle, Check } from 'lucide-react';

const PAGE_TITLES = {
    dashboard: 'Dashboard Keuangan',
    transaksi: 'Riwayat Transaksi',
    kategori: 'Kategori Anggaran',
    laporan: 'Analisis & Laporan',
    notifikasi: 'Pemberitahuan Sistem',
};

const TYPE_CONFIG = {
    info: {
        Icon: Info,
        iconClass: 'text-indigo-500 bg-indigo-50 border-indigo-100',
    },
    warning: {
        Icon: AlertCircle,
        iconClass: 'text-amber-500 bg-amber-50 border-amber-100',
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
    onMarkRead 
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
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* ── Overlay mobile ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
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
            />

            {/* ── Area konten utama ── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                
                {/* ── Top Unified Navbar ── */}
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-100 shadow-sm flex-shrink-0 z-10">
                    <div className="flex items-center min-w-0">
                        {/* Hamburger menu button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200"
                            aria-label="Toggle Menu"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="ml-3 font-semibold text-slate-800 text-sm sm:text-base lg:text-lg truncate">
                            {pageTitle}
                        </h2>
                    </div>

                    {/* Nav actions (Notification & Profile) */}
                    <div className="flex items-center gap-3">
                        {/* Notification Bell with Dropdown */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className={[
                                    'relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 focus:outline-none',
                                    notifOpen 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' 
                                        : 'bg-white border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm'
                                ].join(' ')}
                                aria-label="Notifikasi"
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold ring-2 ring-white animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown panel */}
                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-40 transform origin-top-right transition-all">
                                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                        <span className="text-xs font-semibold text-slate-700">Notifikasi</span>
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={() => {
                                                    onMarkAllRead();
                                                    setNotifOpen(false);
                                                }}
                                                className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none"
                                            >
                                                Tandai semua dibaca
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-xs text-slate-400">Tidak ada notifikasi</div>
                                        ) : (
                                            notifications.map((notif) => {
                                                const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
                                                const IconComp = config.Icon;
                                                return (
                                                    <div 
                                                        key={notif.id} 
                                                        onClick={() => {
                                                            onMarkRead(notif.id);
                                                            // Optional: don't close so they can mark multiple
                                                        }}
                                                        className={[
                                                            'flex gap-3 p-3.5 hover:bg-slate-50/60 transition-colors cursor-pointer',
                                                            !notif.read ? 'bg-indigo-50/[0.08]' : ''
                                                        ].join(' ')}
                                                    >
                                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center ${config.iconClass}`}>
                                                            <IconComp size={14} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs leading-normal ${!notif.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                                                {notif.message}
                                                            </p>
                                                            <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                                                        </div>
                                                        {!notif.read && (
                                                            <div className="flex-shrink-0 flex items-center">
                                                                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <div className="p-2 bg-slate-50/30 border-t border-slate-100 text-center">
                                        <button 
                                            onClick={() => {
                                                onNavigate('notifikasi');
                                                setNotifOpen(false);
                                            }}
                                            className="w-full py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/40 rounded-xl transition-all focus:outline-none"
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
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
