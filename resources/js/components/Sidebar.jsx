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
                'fixed inset-y-0 left-0 z-30 flex flex-col w-64',
                'transition-all duration-300 ease-in-out',
                'lg:relative lg:flex-shrink-0',
                isOpen ? 'translate-x-0 lg:ml-0' : '-translate-x-full lg:-ml-64',
            ].join(' ')}
            style={{
                backgroundColor: 'var(--bg-base)',
                borderRight: '1px solid var(--border-subtle)',
                color: 'var(--text-body)',
            }}
        >
            {/* ── Logo ── */}
            <div
                className="flex items-start justify-between px-5 pt-7 pb-6"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl"
                        style={{
                            backgroundColor: 'var(--accent-muted)',
                            color: 'var(--accent)',
                        }}
                    >
                        <Wallet size={20} />
                    </div>
                    <div>
                        <p
                            className="font-bold text-base leading-tight"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Money<br />Manager
                        </p>
                        <p
                            className="text-[10px] tracking-widest uppercase mt-0.5"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Personal Finance
                        </p>
                    </div>
                </div>
                {/* Tombol tutup – hanya tampil di mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden transition-colors p-1 rounded-lg"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
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
                    <p
                        className="px-3 pb-2 text-[10px] font-semibold tracking-widest uppercase"
                        style={{ color: 'var(--text-disabled)' }}
                    >
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
            <div
                className="px-3 pb-5 pt-4 space-y-1"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
                {/* User */}
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
                    <div
                        className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold flex-shrink-0"
                        style={{
                            backgroundColor: 'var(--accent)',
                            color: 'var(--text-on-accent)',
                        }}
                    >
                        U
                    </div>
                    <div className="min-w-0">
                        <p
                            className="text-sm font-semibold truncate"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            User
                        </p>
                        <p
                            className="text-xs truncate"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Administrator
                        </p>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={() => console.log('Logout clicked')}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 group"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        e.currentTarget.style.color = 'var(--text-body)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                >
                    <LogOut size={18} className="group-hover:text-[var(--negative)] transition-colors" />
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
            className="relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={{
                backgroundColor: isActive ? 'var(--accent-muted)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
            }}
            onMouseEnter={e => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-body)';
                }
            }}
            onMouseLeave={e => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                }
            }}
        >
            {/* Garis aksen kiri */}
            {isActive && (
                <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                />
            )}

            <Icon size={18} className="flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>

            {/* Badge notifikasi */}
            {item.badge ? (
                <span
                    className="flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[10px] font-bold"
                    style={{
                        backgroundColor: 'var(--negative)',
                        color: '#fff',
                    }}
                >
                    {item.badge}
                </span>
            ) : null}
        </button>
    );
}
