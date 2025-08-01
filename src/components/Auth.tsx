import React, { useState } from 'react';
import { Card, CardBody, Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { login, getUserProfile } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

interface AuthProps {
    onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const { login: authLogin } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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

                // Store user data in session storage
                if (userData) {
                    sessionStorage.setItem('userData', JSON.stringify(userData));
                }

                // Update authentication context
                authLogin(userData);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-clinic-light to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Icon icon="lucide:rocket" className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">OHC Pharmacy</h1>
                    <p className="text-gray-600 text-sm">Welcome back to your healthcare dashboard</p>
                </div>

                {/* Auth Card */}
                <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
                    <CardBody className="p-8">
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

                        {/* Footer */}
                        <div className="text-center mt-8">
                            <p className="text-gray-400 text-xs">
                                By continuing, you agree to our{' '}
                                <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                            </p>
                        </div>
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