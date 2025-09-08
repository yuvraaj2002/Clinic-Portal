import React, { useState } from 'react';
import { Card, CardBody, Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { login, getUserProfile, forgotPassword } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

interface AuthProps {
    onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const { login: authLogin } = useAuth();
    const [view, setView] = useState<'login' | 'reset'>('login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [resetEmail, setResetEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (error) setError('');
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Login and get access token
            const loginData = await login(formData.email, formData.password);
            console.log('Login successful:', loginData);

            // Store the access token and token type in session storage
            if (loginData.access_token) {
                sessionStorage.setItem('access_token', loginData.access_token);
            }

            if (loginData.token_type) {
                sessionStorage.setItem('token_type', loginData.token_type);
            }

            // Fetch user profile data
            try {
                const userData = await getUserProfile();
                console.log('User profile fetched:', userData);
                console.log('Admin access:', userData.admin_access);
                console.log('Is admin:', userData.is_admin);
                console.log('Is provider:', userData.is_provider);

                // Map the API response to match our User interface
                const mappedUserData = {
                    ...userData,
                    admin_access: userData.is_admin || userData.admin_access || false
                };
                console.log('Mapped user data for login:', mappedUserData);

                // Store user data in session storage
                if (mappedUserData) {
                    sessionStorage.setItem('userData', JSON.stringify(mappedUserData));
                }

                // Update authentication context
                authLogin(mappedUserData);
            } catch (profileError) {
                console.warn('Failed to fetch user profile:', profileError);
                // Don't fail the login if profile fetch fails
            }

            onAuthSuccess();
        } catch (err) {
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await forgotPassword(resetEmail);
            console.log('Reset password successful:', response);
            setSuccessMessage(response.message || 'If an account with that email exists, a password reset link has been sent.');
        } catch (err) {
            console.error('Reset password error:', err);
            setError(err instanceof Error ? err.message : 'Failed to send password reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    const handleBackToLogin = () => {
        setView('login');
        setError('');
        setSuccessMessage('');
        setResetEmail('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-clinic-light to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="w-48 h-16 mx-auto mb-4">
                        <img
                            src="/ohc-logo-full.png"
                            alt="OHC Pharmacy Logo"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    </div>
                    <p className="text-gray-600 text-sm">Welcome back to your healthcare dashboard</p>
                </div>

                {/* Auth Card */}
                <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
                    <CardBody className="p-8">
                        {view === 'login' ? (
                            <>
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        Sign In
                                    </h2>
                                    <p className="text-gray-600 text-sm">
                                        Access your patient records and medications
                                    </p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-600 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="john.doe@example.com"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                        classNames={{
                                            label: "text-gray-700 font-medium",
                                            input: "text-gray-800 placeholder-gray-400 focus:outline-none",
                                            inputWrapper: "bg-white border border-gray-200 hover:border-clinic-purple-500 focus-within:border-clinic-purple-500 focus-within:ring-1 focus-within:ring-clinic-purple-500/20 focus:outline-none focus:ring-0",
                                            innerWrapper: "focus:outline-none focus:ring-0",
                                            mainWrapper: "focus:outline-none focus:ring-0",
                                        }}
                                        startContent={<Icon icon="lucide:mail" className="text-primary-600 w-4 h-4" />}
                                    />

                                    <Input
                                        label="Password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        required
                                        classNames={{
                                            label: "text-gray-700 font-medium",
                                            input: "text-gray-800 placeholder-gray-400 focus:outline-none",
                                            inputWrapper: "bg-white border border-gray-200 hover:border-clinic-purple-500 focus-within:border-clinic-purple-500 focus-within:ring-1 focus-within:ring-clinic-purple-500/20 focus:outline-none focus:ring-0",
                                            innerWrapper: "focus:outline-none focus:ring-0",
                                            mainWrapper: "focus:outline-none focus:ring-0",
                                        }}
                                        startContent={<Icon icon="lucide:lock" className="text-primary-600 w-4 h-4" />}
                                    />

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        size="lg"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center space-x-2">
                                                <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                                                <span>Signing In...</span>
                                            </div>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </form>

                                {/* Reset Password Link */}
                                <div className="text-center mt-6">
                                    <button
                                        onClick={() => setView('reset')}
                                        className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                                    >
                                        Forgot your password?
                                    </button>
                                </div>

                                {/* Footer */}
                                <div className="text-center mt-8">
                                    <p className="text-gray-400 text-xs">
                                        By continuing, you agree to our{' '}
                                        <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
                                        {' '}and{' '}
                                        <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Reset Password Header */}
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        Reset Password
                                    </h2>
                                    <p className="text-gray-600 text-sm">
                                        Enter your email to receive a password reset link
                                    </p>
                                </div>

                                {/* Success Message */}
                                {successMessage && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-600 text-sm">{successMessage}</p>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-600 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Reset Password Form */}
                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="john.doe@example.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        required
                                        classNames={{
                                            label: "text-gray-700 font-medium",
                                            input: "text-gray-800 placeholder-gray-400 focus:outline-none",
                                            inputWrapper: "bg-white border border-gray-200 hover:border-clinic-purple-500 focus-within:border-clinic-purple-500 focus-within:ring-1 focus-within:ring-clinic-purple-500/20 focus:outline-none focus:ring-0",
                                            innerWrapper: "focus:outline-none focus:ring-0",
                                            mainWrapper: "focus:outline-none focus:ring-0",
                                        }}
                                        startContent={<Icon icon="lucide:mail" className="text-primary-600 w-4 h-4" />}
                                    />

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        size="lg"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center space-x-2">
                                                <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                                                <span>Sending Reset Link...</span>
                                            </div>
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </Button>
                                </form>

                                {/* Back to Login Link */}
                                <div className="text-center mt-6">
                                    <button
                                        onClick={handleBackToLogin}
                                        className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                                    >
                                        ← Back to Sign In
                                    </button>
                                </div>
                            </>
                        )}
                    </CardBody>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-gray-400 text-xs">
                        Need access? Contact your administrator for an invite.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth; 