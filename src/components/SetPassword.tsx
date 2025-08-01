import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardBody, Input, Button, Alert } from "@heroui/react";
import { Icon } from "@iconify/react";

interface SetPasswordProps {
    onAuthSuccess: () => void;
}

interface UserData {
    first_name: string;
    last_name: string;
}

const SetPassword: React.FC<SetPasswordProps> = ({ onAuthSuccess }) => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        // Get token from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        console.log('Token from URL:', token);

        if (!token) {
            console.error('No token found in URL');
            return;
        }

        // Decode JWT to extract email and user data
        try {
            const tokenParts = token.split('.');
            console.log('Token parts length:', tokenParts.length);

            if (tokenParts.length !== 3) {
                throw new Error('Invalid token format');
            }

            // Decode the payload (middle part)
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('JWT Payload:', payload);

            // Check for email in different possible fields
            const userEmail = payload.email || payload.sub || payload.user_email;
            console.log('Extracted email:', userEmail);

            if (userEmail) {
                setEmail(userEmail);
                // Store user data from JWT payload
                setUserData({
                    first_name: payload.first_name || '',
                    last_name: payload.last_name || ''
                });
            } else {
                throw new Error('Email not found in token');
            }
        } catch (error) {
            console.error('JWT Decode Error:', error);
            setPasswordError('The invite link is invalid or has expired.');
        }
    }, [location]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear password error when user starts typing
        if (passwordError) {
            setPasswordError('');
        }
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setPasswordError('Username is required');
            return false;
        }
        if (formData.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const token = new URLSearchParams(location.search).get('token');
            const apiUrl = 'https://ohc-backend.blyssbot.com';

            const response = await fetch(`${apiUrl}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: userData?.first_name || '',
                    last_name: userData?.last_name || '',
                    username: formData.username,
                    email: email,
                    password: formData.newPassword,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to set password.');
            }

            const data = await response.json();

            // Store token in session storage
            sessionStorage.setItem('access_token', data.access_token);
            sessionStorage.setItem('token_type', data.token_type);

            // Fetch user info and update AuthProvider state
            const userRes = await fetch(`${apiUrl}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${data.access_token}`,
                },
            });

            if (userRes.ok) {
                const userData = await userRes.json();
                sessionStorage.setItem('userData', JSON.stringify(userData));
            }

            console.log('Password set successfully');
            onAuthSuccess();
        } catch (error: any) {
            console.error('Error setting password:', error);
            setPasswordError(error.message || 'Failed to set password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5A8B7B] mx-auto"></div>
                    <p className="mt-4 text-[#434242]">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#5A8B7B] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Icon icon="lucide:lock" className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#434242] mb-2">Clinic Portal</h1>
                    <p className="text-[#434242]/70 text-sm">Set your password to complete account setup</p>
                </div>

                {/* Set Password Card */}
                <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
                    <CardBody className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-[#434242] mb-2">
                                Set Your Password
                            </h2>
                            <p className="text-[#434242]/70 text-sm">
                                Welcome! Please set your password to complete your account setup
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#434242]">Email</label>
                                <Input
                                    type="email"
                                    value={email}
                                    disabled
                                    classNames={{
                                        input: "text-[#434242] bg-gray-100 cursor-not-allowed",
                                        inputWrapper: "bg-gray-100 border border-gray-200",
                                    }}
                                />
                                <p className="text-xs text-gray-500">This email was extracted from your invite link</p>
                            </div>

                            <Input
                                label="Username"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={(e) => handleChange(e)}
                                name="username"
                                required
                                classNames={{
                                    label: "text-[#434242] font-medium",
                                    input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                                    inputWrapper: "bg-white border border-gray-200 hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                                    innerWrapper: "focus:outline-none focus:ring-0",
                                    mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:user" className="text-[#5A8B7B] w-4 h-4" />}
                            />

                            <Input
                                label="New Password"
                                type="password"
                                placeholder="Enter your new password"
                                value={formData.newPassword}
                                onChange={(e) => handleChange(e)}
                                name="newPassword"
                                required
                                classNames={{
                                    label: "text-[#434242] font-medium",
                                    input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                                    inputWrapper: "bg-white border border-gray-200 hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                                    innerWrapper: "focus:outline-none focus:ring-0",
                                    mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:lock" className="text-[#5A8B7B] w-4 h-4" />}
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your new password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange(e)}
                                name="confirmPassword"
                                required
                                classNames={{
                                    label: "text-[#434242] font-medium",
                                    input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                                    inputWrapper: "bg-white border border-gray-200 hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                                    innerWrapper: "focus:outline-none focus:ring-0",
                                    mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:lock" className="text-[#5A8B7B] w-4 h-4" />}
                            />

                            {passwordError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-center space-x-2">
                                        <Icon icon="lucide:alert-circle" className="w-4 h-4 text-red-600 flex-shrink-0" />
                                        <span className="text-sm font-medium text-red-700">{passwordError}</span>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-[#5A8B7B] hover:bg-[#4A7A6B] text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                size="lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Setting Password...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span>Set Password & Login</span>
                                        <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                                    </div>
                                )}
                            </Button>
                        </form>

                        {/* Footer */}
                        <div className="text-center mt-8">
                            <p className="text-[#434242]/50 text-xs">
                                By continuing, you agree to our{' '}
                                <a href="#" className="text-[#5A8B7B] hover:underline">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="text-[#5A8B7B] hover:underline">Privacy Policy</a>
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default SetPassword; 