import React, { useState, useEffect } from 'react';
import { Card, CardBody, Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { validateResetToken, resetPassword } from '../utils/api';
import { useHistory, useLocation } from 'react-router-dom';

interface ResetPasswordProps {
    // Removed unused onAuthSuccess parameter
}

const ResetPassword: React.FC<ResetPasswordProps> = () => {
    const history = useHistory();
    const location = useLocation();
    const [token, setToken] = useState<string>('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isTokenValid, setIsTokenValid] = useState(false);

    // Extract token from URL
    useEffect(() => {
        console.log('ResetPassword component mounted, location:', location);
        const urlParams = new URLSearchParams(location.search);
        const tokenFromUrl = urlParams.get('token');
        console.log('Token from URL:', tokenFromUrl);

        if (tokenFromUrl) {
            console.log('Setting token and starting validation');
            setToken(tokenFromUrl);
            validateToken(tokenFromUrl);
        } else {
            console.log('No token found in URL, setting error');
            setError('No reset token found in URL');
            setIsValidating(false);
        }
    }, [location]);

    const validateToken = async (tokenToValidate: string) => {
        try {
            console.log('Starting token validation for token:', tokenToValidate);
            setIsValidating(true);
            setError('');
            const response = await validateResetToken(tokenToValidate);

            console.log('Token validation response:', response);

            if (response.valid) {
                console.log('Token is valid, setting user email:', response.user_email);
                setIsTokenValid(true);
                setUserEmail(response.user_email || '');
            } else {
                console.log('Token is invalid:', response.message);
                setError(response.message || 'Invalid or expired token');
                setIsTokenValid(false);
            }
        } catch (err) {
            console.error('Token validation error:', err);
            setError(err instanceof Error ? err.message : 'Failed to validate token');
            setIsTokenValid(false);
        } finally {
            console.log('Token validation completed, setting isValidating to false');
            setIsValidating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await resetPassword(token, newPassword);
            console.log('Password reset successful:', response);
            setSuccessMessage('Password reset successful! You can now sign in with your new password.');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                history.push('/');
            }, 3000);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-clinic-light to-white flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
                        <CardBody className="p-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Icon icon="lucide:loader-2" className="w-8 h-8 text-white animate-spin" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Validating Reset Link</h2>
                                <p className="text-gray-600 text-sm">Please wait while we verify your reset link...</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }

    if (!isTokenValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-clinic-light to-white flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
                        <CardBody className="p-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Icon icon="lucide:alert-circle" className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
                                <p className="text-red-600 text-sm mb-6">{error}</p>
                                <Button
                                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                    onClick={() => history.push('/')}
                                >
                                    Back to Sign In
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-clinic-light to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="w-48 h-16 mx-auto mb-4 shadow-lg">
                        <img
                            src="/ohc-logo-full.png"
                            alt="OHC Pharmacy Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <p className="text-gray-600 text-sm">Reset your password</p>
                </div>

                {/* Reset Password Card */}
                <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
                    <CardBody className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Reset Password
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {userEmail && `Reset password for ${userEmail}`}
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

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="New Password"
                                type="password"
                                placeholder="Enter your new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                                classNames={{
                                    label: "text-gray-700 font-medium",
                                    input: "text-gray-800 placeholder-gray-400 focus:outline-none",
                                    inputWrapper: "bg-white border border-gray-200 hover:border-clinic-purple-500 focus-within:border-clinic-purple-500 focus-within:ring-1 focus-within:ring-clinic-purple-500/20 focus:outline-none focus:ring-0",
                                    innerWrapper: "focus:outline-none focus:ring-0",
                                    mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:lock" className="text-primary-600 w-4 h-4" />}
                            />

                            <Input
                                label="Confirm New Password"
                                type="password"
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
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
                                        <span>Resetting Password...</span>
                                    </div>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>
                        </form>

                        {/* Back to Login Link */}
                        <div className="text-center mt-6">
                            <button
                                onClick={() => history.push('/')}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                            >
                                ← Back to Sign In
                            </button>
                        </div>
                    </CardBody>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-gray-400 text-xs">
                        Need help? Contact your administrator for support.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword; 