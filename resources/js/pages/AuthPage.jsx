import React, { useState } from 'react';

export default function AuthPage({ onLogin }) {
    const [isLogin, setIsLogin] = useState(false); // Default to false (Register) to display the requested page first
    
    // Form inputs state
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Visibility toggle states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const toggleAuthMode = (e) => {
        e.preventDefault();
        setIsLogin(!isLogin);
        // Clear all fields on toggle
        setFullName('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate successful login/register
        if (onLogin) {
            onLogin('dashboard');
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
                        {/* Custom Credit Card SVG Icon matching design */}
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

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                    
                    {/* REGISTER ONLY FIELDS */}
                    {!isLogin && (
                        <>
                            {/* Full Name */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-[#121815] border border-[#202a24] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-sm transition-all duration-300"
                                    required
                                />
                            </div>

                            {/* Username */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Username" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-[#121815] border border-[#202a24] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-sm transition-all duration-300"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* EMAIL FIELD */}
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
                                placeholder="Confirm Password" 
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

                    {/* Forgot Password Link (LOGIN ONLY) */}
                    {isLogin && (
                        <div className="flex justify-end pt-0.5">
                            <a href="#" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                                Forgot password?
                            </a>
                        </div>
                    )}

                    {/* SUBMIT BUTTON */}
                    <div className="pt-2">
                        <button 
                            type="submit" 
                            className="w-full py-3.5 px-4 bg-[#05cd99] hover:bg-[#04bd8d] text-[#070b09] font-bold text-sm tracking-wide rounded-xl shadow-[0_0_20px_rgba(5,205,153,0.25)] hover:shadow-[0_0_25px_rgba(5,205,153,0.45)] transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                        >
                            {isLogin ? "Sign In" : "Create Account"}
                        </button>
                    </div>
                </form>

                {/* Social Login Separator */}
                <div className="mt-6 mb-5 flex items-center justify-center space-x-3">
                    <div className="h-px bg-[#1f2823] w-full"></div>
                    <span className="text-gray-600 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">or continue with</span>
                    <div className="h-px bg-[#1f2823] w-full"></div>
                </div>

                {/* Google Button */}
                <button className="w-full py-3.5 px-4 bg-[#121815] hover:bg-white/[0.02] border border-[#1f2823] rounded-xl flex items-center justify-center space-x-3 text-white font-semibold text-xs tracking-wide transition-all duration-300 cursor-pointer">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                </button>

                {/* Footer Toggle */}
                <div className="mt-8 text-center text-xs text-gray-400">
                    {isLogin ? (
                        <p>
                            Don't have an account?{' '}
                            <a href="#" onClick={toggleAuthMode} className="text-emerald-400 font-semibold hover:underline transition-colors ml-0.5">
                                Sign up free
                            </a>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{' '}
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
