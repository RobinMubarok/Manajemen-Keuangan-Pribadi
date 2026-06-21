import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch('/api/user/profile', {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                // Invalid or expired token
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                setUser(null);
            } else if (res.ok) {
                const data = await res.json();
                setUser(data);
                localStorage.setItem('auth_user', JSON.stringify(data));
            } else {
                // Other error, check localStorage as fallback
                const stored = localStorage.getItem('auth_user');
                if (stored) {
                    setUser(JSON.parse(stored));
                }
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            // Network error fallback
            const stored = localStorage.getItem('auth_user');
            if (stored) {
                setUser(JSON.parse(stored));
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        await fetchUser();
    }, [fetchUser]);

    const logout = useCallback(async () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
            } catch (err) {
                console.error('Logout error:', err);
            }
        }
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
    }, []);

    // Fetch user on initial load
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, fetchUser, refreshUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
