import React from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    requireProviderAdmin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    requireAdmin = false,
    requireProviderAdmin = false
}) => {
    const { isAuthenticated, user, loading } = useAuth();
    const history = useHistory();

    // Show loading state while auth context is initializing
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
        // Redirect to login page
        React.useEffect(() => {
            history.push('/');
        }, [history]);

        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-white flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="lucide:lock" className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600 mb-4">You need to be logged in to access this page.</p>
                    <Button
                        color="primary"
                        onClick={() => history.push('/')}
                        startContent={<Icon icon="lucide:log-in" />}
                    >
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    // Check admin requirements
    if (requireAdmin && !user.admin_access) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-white flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="lucide:shield-x" className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-4">You don't have admin privileges to access this page.</p>
                    <Button
                        color="primary"
                        onClick={() => history.push('/')}
                        startContent={<Icon icon="lucide:arrow-left" />}
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    // Check provider admin requirements
    if (requireProviderAdmin && !user.provider_admin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-white flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="lucide:shield-x" className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-4">You don't have provider admin privileges to access this page.</p>
                    <Button
                        color="primary"
                        onClick={() => history.push('/')}
                        startContent={<Icon icon="lucide:arrow-left" />}
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    // If all checks pass, render the children
    return <>{children}</>;
};

export default AuthGuard;
