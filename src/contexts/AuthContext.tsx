import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated as checkAuth, getUserProfile, logout as apiLogout } from '../utils/api';

interface User {
    id: number;
    name: string;
    email: string;
    admin_access: boolean;
    is_admin?: boolean; // API returns this field
    provider_admin?: boolean; // API returns this field
    is_active: boolean;
    created_at: string;
    updated_at: string;
    is_provider?: boolean;
    username?: string;
    first_name?: string;
    last_name?: string;
    provider_tag?: string; // Provider tag for non-admin users
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
                console.log('Checking authentication...');
                if (checkAuth()) {
                    console.log('User is authenticated, fetching profile...');
                    const userData = await getUserProfile();
                    console.log('Provider data from /provider/me:', userData);
                    console.log('Raw user data keys:', Object.keys(userData));
                    console.log('is_admin value:', userData.is_admin);
                    console.log('admin_access value:', userData.admin_access);

                    // Map the API response to match our User interface
                    const mappedUserData = {
                        ...userData,
                        admin_access: userData.is_admin || userData.admin_access || false,
                        provider_admin: userData.provider_admin || false
                    };
                    console.log('Mapped user data:', mappedUserData);

                    // Update session storage with the latest provider data
                    sessionStorage.setItem('userData', JSON.stringify(mappedUserData));

                    setUser(mappedUserData);
                    setIsAuthenticated(true);
                } else {
                    console.log('User is not authenticated');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                // Clear any invalid tokens
                try {
                    await apiLogout();
                } catch (logoutError) {
                    console.error('Logout during auth check failed:', logoutError);
                }
                // Ensure we're in a clean state
                setUser(null);
                setIsAuthenticated(false);
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