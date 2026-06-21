import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilPage({ onNavigate }) {
    const { user, refreshUser, logout } = useAuth();
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
                alert(err.message || 'Gagal memperbarui profil');
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
                    alert(err.message || 'Gagal mengunggah foto');
                    return;
                }
            }
            // Refresh user data globally
            await refreshUser();
            alert('Profil berhasil di‑update');
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan saat memperbarui profil');
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
            <div className="rounded-[24px] p-6 sm:p-8 lg:p-10 border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
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
                                    <select name="dobDay" value={formData.dobDay} onChange={handleChange} className="w-full px-3 sm:px-4 py-3 rounded-xl border text-[14px] transition-all outline-none cursor-pointer" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                                        <option value="" disabled>Day</option>
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select name="dobMonth" value={formData.dobMonth} onChange={handleChange} className="w-full px-3 sm:px-4 py-3 rounded-xl border text-[14px] transition-all outline-none cursor-pointer" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                                        <option value="" disabled>Month</option>
                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                    <select name="dobYear" value={formData.dobYear} onChange={handleChange} className="w-full px-3 sm:px-4 py-3 rounded-xl border text-[14px] transition-all outline-none cursor-pointer" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                                        <option value="" disabled>Year</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
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
                                <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-[14px] font-bold" style={{ backgroundColor: 'var(--accent)', color: 'var(--text-on-accent)' }}>
                                    <RefreshCw size={18} strokeWidth={2.5} /> Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
