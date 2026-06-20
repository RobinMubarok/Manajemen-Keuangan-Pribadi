import React, { useState, useRef } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

export default function ProfilPage({ userProfile, onUpdateProfile }) {
    const [formData, setFormData] = useState(userProfile || {
        firstName: 'Felecia',
        lastName: 'Burke',
        email: 'example@mail.com',
        dobDay: '10',
        dobMonth: 'June',
        dobYear: '1990',
        gender: 'Female',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=260&h=260' // Menggunakan gambar dummy mirip referensi
    });

    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, photo: imageUrl }));
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (onUpdateProfile) {
            onUpdateProfile(formData);
        }
        alert('Profil berhasil di-update!');
    };

    // Helper arrays for DOB
    const days = Array.from({length: 31}, (_, i) => i + 1);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = Array.from({length: 100}, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full h-full">
            {/* Card Container - Exactly matching the screenshot layout style */}
            <div 
                className="rounded-[24px] p-6 sm:p-8 lg:p-10 border transition-all"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
            >
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                    
                    {/* Left Column: Profile Photo */}
                    <div className="flex flex-col items-center w-full lg:w-auto shrink-0">
                        {/* Photo Box - Large squircle like the screenshot */}
                        <div 
                            className="relative group w-56 h-56 lg:w-[260px] lg:h-[260px] rounded-[36px] overflow-hidden flex items-center justify-center cursor-pointer transition-all border"
                            style={{ backgroundColor: 'var(--accent-muted)', borderColor: 'var(--border-subtle)' }}
                            onClick={() => fileInputRef.current.click()}
                        >
                            {/* Image or Initial */}
                            {formData.photo ? (
                                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[5rem] font-bold" style={{ color: 'var(--accent)' }}>
                                    {formData.firstName.charAt(0)}
                                </span>
                            )}
                            
                            {/* Overlay Click to change photo */}
                            {/* The screenshot shows this overlay prominently visible */}
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-all group-hover:bg-black/60">
                                <Camera className="text-white mb-2" size={32} strokeWidth={1.5} />
                                <span className="text-white text-[13px] font-medium text-center leading-[1.3] px-4">
                                    Click to change<br/>photo
                                </span>
                            </div>
                        </div>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handlePhotoChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>

                    {/* Right Column: Account Details Form */}
                    <div className="flex-1 w-full max-w-3xl">
                        <h2 className="text-2xl font-bold mb-6 tracking-tight text-center lg:text-left" style={{ color: 'var(--text-primary)' }}>
                            Account Details
                        </h2>

                        <form onSubmit={handleUpdate} className="space-y-5">
                            
                            {/* Row 1: First Name & Last Name */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>First Name *</label>
                                    <input 
                                        type="text" 
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border text-[14px] transition-all outline-none"
                                        style={{ 
                                            backgroundColor: 'var(--bg-base)', 
                                            borderColor: 'var(--border-default)', 
                                            color: 'var(--text-primary)' 
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = 'var(--accent)';
                                            e.target.style.boxShadow = '0 0 0 1px var(--accent)';
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = 'var(--border-default)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Last Name *</label>
                                    <input 
                                        type="text" 
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border text-[14px] transition-all outline-none"
                                        style={{ 
                                            backgroundColor: 'var(--bg-base)', 
                                            borderColor: 'var(--border-default)', 
                                            color: 'var(--text-primary)' 
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = 'var(--accent)';
                                            e.target.style.boxShadow = '0 0 0 1px var(--accent)';
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = 'var(--border-default)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 2: Email */}
                            <div className="space-y-2">
                                <label className="block text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>E-Mail *</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border text-[14px] transition-all outline-none"
                                    style={{ 
                                        backgroundColor: 'var(--bg-base)', 
                                        borderColor: 'var(--border-default)', 
                                        color: 'var(--text-primary)' 
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = 'var(--accent)';
                                        e.target.style.boxShadow = '0 0 0 1px var(--accent)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = 'var(--border-default)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    required
                                />
                            </div>

                            {/* Row 3: Date of Birth */}
                            <div className="space-y-2">
                                <label className="block text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Date of Birth (Optional):</label>
                                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                    <select 
                                        name="dobDay"
                                        value={formData.dobDay}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-3 rounded-xl border text-[14px] transition-all outline-none cursor-pointer"
                                        style={{ 
                                            backgroundColor: 'var(--bg-base)', 
                                            borderColor: 'var(--border-default)', 
                                            color: 'var(--text-primary)' 
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = 'var(--accent)';
                                            e.target.style.boxShadow = '0 0 0 1px var(--accent)';
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = 'var(--border-default)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="" disabled>Day</option>
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    
                                    <select 
                                        name="dobMonth"
                                        value={formData.dobMonth}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-3 rounded-xl border text-[14px] transition-all outline-none cursor-pointer"
                                        style={{ 
                                            backgroundColor: 'var(--bg-base)', 
                                            borderColor: 'var(--border-default)', 
                                            color: 'var(--text-primary)' 
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = 'var(--accent)';
                                            e.target.style.boxShadow = '0 0 0 1px var(--accent)';
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = 'var(--border-default)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="" disabled>Month</option>
                                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>

                                    <select 
                                        name="dobYear"
                                        value={formData.dobYear}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-3 rounded-xl border text-[14px] transition-all outline-none cursor-pointer"
                                        style={{ 
                                            backgroundColor: 'var(--bg-base)', 
                                            borderColor: 'var(--border-default)', 
                                            color: 'var(--text-primary)' 
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = 'var(--accent)';
                                            e.target.style.boxShadow = '0 0 0 1px var(--accent)';
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = 'var(--border-default)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="" disabled>Year</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Row 4: Gender */}
                            <div className="space-y-2">
                                <label className="block text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Gender (Optional):</label>
                                <select 
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border text-[14px] transition-all outline-none cursor-pointer"
                                    style={{ 
                                        backgroundColor: 'var(--bg-base)', 
                                        borderColor: 'var(--border-default)', 
                                        color: 'var(--text-primary)' 
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = 'var(--accent)';
                                        e.target.style.boxShadow = '0 0 0 1px var(--accent)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = 'var(--border-default)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Update Button */}
                            <div className="flex justify-end pt-5">
                                <button 
                                    type="submit" 
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-[14px] font-bold transition-all focus:outline-none"
                                    style={{ backgroundColor: 'var(--accent)', color: 'var(--text-on-accent)' }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.filter = 'brightness(1.1)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.filter = 'brightness(1)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
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
