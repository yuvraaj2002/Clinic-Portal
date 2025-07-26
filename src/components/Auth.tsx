import React, { useState } from 'react';
import { Card, CardBody, Input, Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

interface AuthProps {
    onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: 'john.doe@example.com',
        password: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically handle authentication
        console.log('Form submitted:', formData);
        onAuthSuccess();
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setFormData({
            firstName: '',
            lastName: '',
            email: isSignUp ? 'john.doe@example.com' : '',
            password: ''
        });
    };

    return (
        <div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#5A8B7B] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Icon icon="lucide:heart-pulse" className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#434242] mb-2">Clinic Portal</h1>
                    <p className="text-[#434242]/70 text-sm">Welcome back to your healthcare dashboard</p>
                </div>

                {/* Auth Card */}
                <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
                    <CardBody className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-[#434242] mb-2">
                                {isSignUp ? 'Create Account' : 'Sign In'}
                            </h2>
                            <p className="text-[#434242]/70 text-sm">
                                {isSignUp
                                    ? 'Join us to manage your healthcare journey'
                                    : 'Access your patient records and medications'
                                }
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {isSignUp && (
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="First Name"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
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
                                        label="Last Name"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        classNames={{
                                            label: "text-[#434242] font-medium",
                                            input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                                            inputWrapper: "bg-white border border-gray-200 hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                                            innerWrapper: "focus:outline-none focus:ring-0",
                                            mainWrapper: "focus:outline-none focus:ring-0",
                                        }}
                                        startContent={<Icon icon="lucide:user" className="text-[#5A8B7B] w-4 h-4" />}
                                    />
                                </div>
                            )}

                            <Input
                                label="Email Address"
                                type="email"
                                placeholder={isSignUp ? "Enter your email" : "john.doe@example.com"}
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                classNames={{
                                    label: "text-[#434242] font-medium",
                                    input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                                    inputWrapper: "bg-white border border-gray-200 hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                                    innerWrapper: "focus:outline-none focus:ring-0",
                                    mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:mail" className="text-[#5A8B7B] w-4 h-4" />}
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                classNames={{
                                    label: "text-[#434242] font-medium",
                                    input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                                    inputWrapper: "bg-white border border-gray-200 hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                                    innerWrapper: "focus:outline-none focus:ring-0",
                                    mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:lock" className="text-[#5A8B7B] w-4 h-4" />}
                            />

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-[#5A8B7B] hover:bg-[#4A7A6B] text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                size="lg"
                            >
                                {isSignUp ? 'Create Account' : 'Sign In'}
                            </Button>
                        </form>

                        {/* Divider */}
                        <Divider className="my-6" />

                        {/* Toggle Mode */}
                        <div className="text-center">
                            <p className="text-[#434242]/70 text-sm">
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                                <button
                                    onClick={toggleMode}
                                    className="ml-1 text-[#5A8B7B] hover:text-[#4A7A6B] font-medium transition-colors"
                                >
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </button>
                            </p>
                        </div>
                    </CardBody>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-[#434242]/50 text-xs">
                        By continuing, you agree to our{' '}
                        <a href="#" className="text-[#5A8B7B] hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-[#5A8B7B] hover:underline">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth; 