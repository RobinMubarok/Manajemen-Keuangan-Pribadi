import React from 'react';
import {
    LayoutDashboard,
    ArrowLeftRight,
    FileText,
    Bell,
    LogOut,
    X,
    Wallet,
} from 'lucide-react';

/** Daftar item navigasi utama */
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

/** Daftar item navigasi "Manage" */
const MANAGE_ITEMS = [
    { id: 'transaksi',  label: 'Transaksi',  icon: ArrowLeftRight },
    { id: 'laporan',   label: 'Laporan',    icon: FileText },
    { id: 'notifikasi',label: 'Notifikasi', icon: Bell, badge: 2 },
];

/**
 * Sidebar
 *
 * Komponen reusable yang menangani navigasi aplikasi.
 * Untuk menambah item menu baru, cukup tambahkan entri ke array NAV_ITEMS
 * atau MANAGE_ITEMS di atas — komponen tidak perlu diubah.
 *
 * @param {string}   currentPage  - Halaman aktif
 * @param {Function} onNavigate   - Callback pindah halaman
 * @param {boolean}  isOpen       - Apakah sidebar terbuka (mobile)
 * @param {Function} onClose      - Callback tutup sidebar (mobile)
 */
export default function Sidebar({ currentPage, onNavigate, isOpen, onClose, unreadCount = 0 }) {
    return (
        <aside
            className={[
                'fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-[#1a2035] text-white',
                'transition-all duration-300 ease-in-out',
                'lg:relative lg:flex-shrink-0',
                isOpen ? 'translate-x-0 lg:ml-0' : '-translate-x-full lg:-ml-64',
            ].join(' ')}
        >
            {/* ── Logo ── */}
            <div className="flex items-start justify-between px-5 pt-7 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400">
                        <Wallet size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-base leading-tight text-white">
                            Money<br />Manager
                        </p>
                        <p className="text-[10px] tracking-widest text-slate-400 uppercase mt-0.5">
                            Personal Finance
                        </p>
                    </div>
                </div>
                {/* Tombol tutup – hanya tampil di mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    aria-label="Tutup sidebar"
                >
                    <X size={18} />
                </button>
            </div>

            {/* ── Navigasi ── */}
            <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
                {/* Grup utama */}
                {NAV_ITEMS.map((item) => (
                    <NavItem
                        key={item.id}
                        item={item}
                        isActive={currentPage === item.id}
                        onClick={() => onNavigate(item.id)}
                    />
                ))}

                {/* Grup Manage */}
                <div className="pt-5">
                    <p className="px-3 pb-2 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                        Manage
                    </p>
                    {MANAGE_ITEMS.map((item) => {
                        const dynamicItem = item.id === 'notifikasi'
                            ? { ...item, badge: unreadCount }
                            : item;
                        return (
                            <NavItem
                                key={dynamicItem.id}
                                item={dynamicItem}
                                isActive={currentPage === dynamicItem.id}
                                onClick={() => onNavigate(dynamicItem.id)}
                            />
                        );
                    })}
                </div>
            </nav>

            {/* ── Profil & Logout ── */}
            <div className="px-3 pb-5 border-t border-white/10 pt-4 space-y-1">
                {/* User */}
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-500 text-white text-sm font-bold flex-shrink-0">
                        U
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">User</p>
                        <p className="text-xs text-slate-400 truncate">Administrator</p>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={() => console.log('Logout clicked')}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-150 group"
                >
                    <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}

/**
 * NavItem — item navigasi tunggal di dalam Sidebar.
 * Komponen private, tidak diekspor.
 */
function NavItem({ item, isActive, onClick }) {
    const Icon = item.icon;

    return (
        <button
            onClick={onClick}
            className={[
                'relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/10',
            ].join(' ')}
        >
            {/* Garis aksen kiri */}
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-300 rounded-r-full" />
            )}

            <Icon size={18} className="flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>

            {/* Badge notifikasi */}
            {item.badge ? (
                <span className="flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {item.badge}
                </span>
            ) : null}
        </button>
    );
}
