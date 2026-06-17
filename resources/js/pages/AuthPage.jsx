import React, { useState } from 'react';

export default function AuthPage({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);

    const toggleAuthMode = (e) => {
        e.preventDefault();
        setIsLogin(!isLogin);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulasi login sukses, tidak peduli apa username/password yang dimasukkan
        if (onLogin) {
            onLogin('dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a110d] relative overflow-hidden font-sans">
            {/* Ambient glowing background effects */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/20 rounded-full blur-[120px]"></div>
            <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-green-500/10 rounded-full blur-[80px]"></div>

            <div className="relative z-10 w-full max-w-[360px] p-6 sm:p-8 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                
                {/* Header Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-500/30 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        {/* Icon dompet/uang */}
                        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Money Manager</h1>
                    <p className="text-emerald-500/80 text-xs font-medium">Kelola keuangan jadi lebih mudah</p>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* REGISTER ONLY FIELDS */}
                        {!isLogin && (
                            <div className="space-y-4 animate-fadeIn">
                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Nama Lengkap" 
                                            className="w-full pl-11 pr-4 py-3 bg-[#131b17] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* EMAIL FIELD */}
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder={isLogin ? "Email/Username" : "Email"} 
                                    className="w-full pl-11 pr-4 py-3 bg-[#131b17] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>

                        {/* PASSWORD FIELD */}
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input 
                                    type="password" 
                                    placeholder="Password" 
                                    className="w-full pl-11 pr-12 py-3 bg-[#131b17] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer">
                                    <svg className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD (REGISTER ONLY) */}
                        {!isLogin && (
                            <div className="animate-fadeIn">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input 
                                        type="password" 
                                        placeholder="Confirm Password" 
                                        className="w-full pl-11 pr-4 py-3 bg-[#131b17] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Forgot Password Link */}
                        {isLogin && (
                            <div className="flex justify-end pt-1">
                                <a href="#" className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors">Forgot password?</a>
                            </div>
                        )}

                        {/* SUBMIT BUTTON */}
                        <div className="pt-2">
                            <button 
                                type="submit" 
                                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-[#0a110d] font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transform hover:-translate-y-0.5 transition-all duration-300"
                            >
                                {isLogin ? "Sign In" : "Sign Up"}
                            </button>
                        </div>
                    </form>

                    {/* Social Login Separator */}
                    <div className="mt-6 flex items-center justify-center space-x-3">
                        <div className="h-px bg-white/10 w-full"></div>
                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider whitespace-nowrap">or continue with</span>
                        <div className="h-px bg-white/10 w-full"></div>
                    </div>

                    {/* Google Button */}
                    <button className="mt-6 w-full py-3 px-4 bg-[#131b17] hover:bg-white/5 border border-white/10 rounded-xl flex items-center justify-center space-x-3 text-white font-medium transition-all duration-300">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>Continue with Google</span>
                    </button>
                </div>

                {/* Toggle Register/Login */}
                <div className="mt-8 text-center text-sm">
                    {isLogin ? (
                        <p className="text-gray-400">
                            Don't have an account?{' '}
                            <a href="#" onClick={toggleAuthMode} className="text-emerald-500 font-semibold hover:text-emerald-400 transition-colors">Sign up free</a>
                        </p>
                    ) : (
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <a href="#" onClick={toggleAuthMode} className="text-emerald-500 font-semibold hover:text-emerald-400 transition-colors">Sign In</a>
                        </p>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
