import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Loader2, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function CustomDropdown({ value, options, onChange, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 sm:px-4 py-3 rounded-xl border text-[14px] transition-all outline-none cursor-pointer text-left font-medium"
                style={{
                    backgroundColor: 'var(--bg-base)',
                    borderColor: 'var(--border-default)',
                    color: value ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
            >
                <span>{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-muted)' }}
                />
            </button>

            {isOpen && (
                <div
                    className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl border shadow-xl max-h-60 overflow-y-auto py-1"
                    style={{
                        backgroundColor: 'var(--bg-elevated)',
                        borderColor: 'var(--border-default)',
                        color: 'var(--text-primary)',
                    }}
                >
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-[14px] transition-colors hover:bg-[var(--bg-hover)]"
                            style={{
                                color: opt.value === value ? 'var(--accent)' : 'var(--text-primary)',
                                fontWeight: opt.value === value ? '600' : '400',
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ProfilPage({ onNavigate }) {
    const { user, setUser, refreshUser, logout } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dobDay: '',
        dobMonth: '',
        dobYear: '',
        gender: '',
        photo: ''
    });
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Initialize form when user data changes
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                email: user.email || '',
                dobDay: user.date_of_birth ? user.date_of_birth.split('-')[2] : '',
                dobMonth: user.date_of_birth ? user.date_of_birth.split('-')[1] : '',
                dobYear: user.date_of_birth ? user.date_of_birth.split('-')[0] : '',
                gender: user.gender || '',
                photo: user.photo_url || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedPhoto(file);
            const imageUrl = URL.createObjectURL(file);
            setFormData((prev) => ({ ...prev, photo: imageUrl }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            // Update textual profile data
            const token = localStorage.getItem('auth_token');
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    date_of_birth: formData.dobYear && formData.dobMonth && formData.dobDay ? `${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}` : null,
                    gender: formData.gender
                })
            });
            if (res.status === 401) {
                await logout();
                return;
            }
            if (!res.ok) {
                const err = await res.json();
                setErrorMsg(err.message || 'Gagal memperbarui profil');
                setIsLoading(false);
                return;
            }
            // If a new photo was selected, upload it
            if (selectedPhoto) {
                const fd = new FormData();
                fd.append('photo', selectedPhoto);
                const photoRes = await fetch('/api/user/profile/photo', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: fd
                });
                if (photoRes.status === 401) {
                    await logout();
                    return;
                }
                if (!photoRes.ok) {
                    const err = await photoRes.json();
                    setErrorMsg(err.message || 'Gagal mengunggah foto');
                    setIsLoading(false);
                    return;
                }
                // Instantly sync new photo_url to AuthContext & sidebar
                const photoData = await photoRes.json();
                const newPhotoUrl = photoData.photo_url;
                setUser((prev) => ({ ...prev, photo_url: newPhotoUrl }));
                setFormData((prev) => ({ ...prev, photo: newPhotoUrl }));
                setSelectedPhoto(null);
            } else {
                // Refresh other profile fields
                await refreshUser();
            }
            setSuccessMsg('Profil berhasil di-update');
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            console.error(err);
            setErrorMsg('Terjadi kesalahan saat memperbarui profil');
        } finally {
            setIsLoading(false);
        }
    };

    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
    const months = [
        { label: 'January', value: '01' }, { label: 'February', value: '02' },
        { label: 'March', value: '03' }, { label: 'April', value: '04' },
        { label: 'May', value: '05' }, { label: 'June', value: '06' },
        { label: 'July', value: '07' }, { label: 'August', value: '08' },
        { label: 'September', value: '09' }, { label: 'October', value: '10' },
        { label: 'November', value: '11' }, { label: 'December', value: '12' }
    ];
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full h-full">
            <div className="rounded-[24px] border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                {/* Card header — tombol ✕ hanya tampil di mobile */}
                <div
                    className="lg:hidden flex items-center justify-between px-6 pt-5 pb-4"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                    <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Profil Pengguna</h1>
                    <button
                        type="button"
                        onClick={() => onNavigate('dashboard')}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-lg hover:bg-[var(--bg-hover)]"
                        title="Tutup"
                        aria-label="Tutup"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                    {/* Left Column: Profile Photo */}
                    <div className="flex flex-col items-center w-full lg:w-auto shrink-0">
                        <div className="relative group w-56 h-56 lg:w-[260px] lg:h-[260px] rounded-[36px] overflow-hidden flex items-center justify-center cursor-pointer transition-all border" style={{ backgroundColor: 'var(--accent-muted)', borderColor: 'var(--border-subtle)' }} onClick={() => fileInputRef.current.click()}>
                            {formData.photo ? (
                                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[5rem] font-bold" style={{ color: 'var(--accent)' }}>{formData.firstName?.charAt(0) || 'U'}</span>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-all group-hover:bg-black/60">
                                <Camera className="text-white mb-2" size={32} strokeWidth={1.5} />
                                <span className="text-white text-[13px] font-medium text-center leading-[1.3] px-4">Click to change<br/>photo</span>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                    </div>
                    {/* Right Column: Account Details Form */}
                    <div className="flex-1 w-full max-w-3xl">
                        <h2 className="text-2xl font-bold mb-6 tracking-tight text-center lg:text-left" style={{ color: 'var(--text-primary)' }}>Account Details</h2>
                        
                        {successMsg && (
                            <div className="mb-6 p-4 rounded-xl text-[14px] font-medium" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                {successMsg}
                            </div>
                        )}
                        {errorMsg && (
                            <div className="mb-6 p-4 rounded-xl text-[14px] font-medium" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* First & Last Name */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>First Name *</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border text-[14px] transition-all outline-none" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Last Name *</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border text-[14px] transition-all outline-none" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} required />
                                </div>
                            </div>
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>E‑Mail *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border text-[14px] transition-all outline-none" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} required />
                            </div>
                            {/* Date of Birth */}
                            <div className="space-y-2">
                                <label className="block text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Date of Birth (Optional)</label>
                                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                                                        <input
                                      type="number"
                                      name="dobDay"
                                      value={formData.dobDay}
                                      onChange={handleChange}
                                      min="1"
                                      max="31"
                                      placeholder="DD"
                                      className="w-full px-4 py-3 rounded-xl border text-[14px] transition-all outline-none"
                                      style={{
                                        backgroundColor: 'var(--bg-base)',
                                        borderColor: 'var(--border-default)',
                                        color: 'var(--text-primary)'
                                      }}
                                      required
                                    />
                                    <input
                                      type="number"
                                      name="dobMonth"
                                      value={formData.dobMonth}
                                      onChange={handleChange}
                                      min="1"
                                      max="12"
                                      placeholder="MM"
                                      className="w-full px-4 py-3 rounded-xl border text-[14px] transition-all outline-none"
                                      style={{
                                        backgroundColor: 'var(--bg-base)',
                                        borderColor: 'var(--border-default)',
                                        color: 'var(--text-primary)'
                                      }}
                                      required
                                    />
                                    <input
                                      type="number"
                                      name="dobYear"
                                      value={formData.dobYear}
                                      onChange={handleChange}
                                      min="1900"
                                      max={new Date().getFullYear()}
                                      placeholder="YYYY"
                                      className="w-full px-4 py-3 rounded-xl border text-[14px] transition-all outline-none"
                                      style={{
                                        backgroundColor: 'var(--bg-base)',
                                        borderColor: 'var(--border-default)',
                                        color: 'var(--text-primary)'
                                      }}
                                      required
                                    />
                                </div>
                            </div>
                            {/* Gender */}
                            <div className="space-y-2">
                                <label className="block text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Gender (Optional)</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border text-[14px] transition-all outline-none cursor-pointer" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                                    <option value="" disabled>Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            {/* Submit */}
                            <div className="flex justify-end pt-5">
                                <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-[14px] font-bold transition-all disabled:opacity-60" style={{ backgroundColor: 'var(--accent)', color: 'var(--text-on-accent)' }}>
                                    {isLoading ? <Loader2 size={18} strokeWidth={2.5} className="animate-spin" /> : <RefreshCw size={18} strokeWidth={2.5} />}
                                    {isLoading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
