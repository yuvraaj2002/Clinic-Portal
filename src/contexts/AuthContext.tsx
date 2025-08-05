import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated as checkAuth, getUserProfile, logout as apiLogout } from '../utils/api';

interface User {
    id: number;
    name: string;
    email: string;
    admin_access: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    is_provider?: boolean;
    provider_admin_access?: boolean;
    username?: string;
    first_name?: string;
    last_name?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (userData: User) => void;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                if (checkAuth()) {
                    const userData = await getUserProfile();
                    console.log('Provider data from /provider/me:', userData);

                    // Update session storage with the latest provider data
                    sessionStorage.setItem('userData', JSON.stringify(userData));

                    setUser(userData);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                // Clear any invalid tokens
                await apiLogout();
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value: AuthContextType = {
        isAuthenticated,
        user,
        login,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 