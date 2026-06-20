import React, { useState } from 'react';

export default function AuthPage({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);

    // Form inputs state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const toggleAuthMode = (e) => {
        e.preventDefault();
        setIsLogin(!isLogin);
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Client-side validation for register
        if (!isLogin && password !== confirmPassword) {
            setErrorMessage('Password dan konfirmasi password tidak cocok.');
            return;
        }

        setIsLoading(true);

        try {
            const endpoint = isLogin ? '/api/login' : '/api/register';
            const body = isLogin
                ? { email, password }
                : { name: fullName, email, password, password_confirmation: confirmPassword };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                // Laravel validation errors come as { errors: { field: [messages] } }
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0];
                    setErrorMessage(Array.isArray(firstError) ? firstError[0] : firstError);
                } else {
                    setErrorMessage(data.message || 'Terjadi kesalahan. Coba lagi.');
                }
                return;
            }

            // Save token and user to localStorage
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));

            if (onLogin) {
                onLogin('dashboard');
            }
        } catch (err) {
            setErrorMessage('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#070b09] relative overflow-hidden font-sans select-none">
            {/* Ambient glowing background effects */}
            <div className="absolute top-[-15%] left-[-15%] w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute bottom-[-15%] right-[-15%] w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute top-[25%] right-[5%] w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-[390px] mx-4 p-8 sm:p-9 bg-[#0d1310]/95 border border-[#1f2823] rounded-[32px] shadow-[0_12px_45px_-5px_rgba(0,0,0,0.8)]">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#121c17] border border-[#10b981]/40 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                        <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="14" x="2" y="5" rx="2" />
                            <line x1="2" x2="22" y1="10" y2="10" />
                            <line x1="6" x2="10" y1="15" y2="15" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Money Manager</h1>
                    <p className="text-emerald-400 text-xs font-medium max-w-[270px] mx-auto leading-relaxed">
                        {isLogin
                            ? "Masuk ke akun Anda untuk mengelola keuangan."
                            : "Buat akun baru untuk mulai mengelola keuangan Anda."
                        }
                    </p>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
                        {errorMessage}
                    </div>
                )}

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-3.5">

                    {/* REGISTER ONLY: Full Name */}
                    {!isLogin && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Nama Lengkap"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-[#121815] border border-[#202a24] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-sm transition-all duration-300"
                                required
                            />
                        </div>
                    )}

                    {/* EMAIL / USERNAME FIELD */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <input
                            type={isLogin ? "text" : "email"}
                            placeholder={isLogin ? "Email / Username" : "Email"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#121815] border border-[#202a24] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-sm transition-all duration-300"
                            required
                        />
                    </div>

                    {/* PASSWORD FIELD */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-11 pr-12 py-3.5 bg-[#121815] border border-[#202a24] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-sm transition-all duration-300"
                            required
                        />
                        <div
                            className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-500 hover:text-gray-300 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L1 1m22 22L14.12 14.12" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* CONFIRM PASSWORD (REGISTER ONLY) */}
                    {!isLogin && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Konfirmasi Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-3.5 bg-[#121815] border border-[#202a24] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-sm transition-all duration-300"
                                required
                            />
                            <div
                                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-500 hover:text-gray-300 transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L1 1m22 22L14.12 14.12" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SUBMIT BUTTON */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-4 bg-[#05cd99] hover:bg-[#04bd8d] disabled:opacity-60 disabled:cursor-not-allowed text-[#070b09] font-bold text-sm tracking-wide rounded-xl shadow-[0_0_20px_rgba(5,205,153,0.25)] hover:shadow-[0_0_25px_rgba(5,205,153,0.45)] transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                        >
                            {isLoading
                                ? (isLogin ? 'Masuk...' : 'Membuat Akun...')
                                : (isLogin ? 'Sign In' : 'Create Account')
                            }
                        </button>
                    </div>
                </form>

                {/* Footer Toggle */}
                <div className="mt-8 text-center text-xs text-gray-400">
                    {isLogin ? (
                        <p>
                            Belum punya akun?{' '}
                            <a href="#" onClick={toggleAuthMode} className="text-emerald-400 font-semibold hover:underline transition-colors ml-0.5">
                                Daftar gratis
                            </a>
                        </p>
                    ) : (
                        <p>
                            Sudah punya akun?{' '}
                            <a href="#" onClick={toggleAuthMode} className="text-emerald-400 font-semibold hover:underline transition-colors ml-0.5">
                                Sign In
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
