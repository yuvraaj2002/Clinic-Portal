import React from 'react';
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useHistory } from 'react-router-dom';
import { getActiveNonAdminProviders, ActiveNonAdminProvidersResponse } from '../utils/api';
import AuthGuard from './AuthGuard';

const AdminPage: React.FC = () => {
    const history = useHistory();
    const [activeProvidersData, setActiveProvidersData] = React.useState<ActiveNonAdminProvidersResponse | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Fetch active non-admin providers data when component mounts
    React.useEffect(() => {
        const fetchActiveProviders = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching active non-admin providers...');
                const data = await getActiveNonAdminProviders();
                console.log('Active providers data:', data);
                setActiveProvidersData(data);
            } catch (err) {
                console.error('Error fetching active providers:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch providers');
            } finally {
                setLoading(false);
            }
        };

        fetchActiveProviders();
    }, []);

    // Handle provider selection - navigate to patients page
    const handleProviderChange = (providerTag: string) => {
        console.log('Selected provider tag:', providerTag);
        history.push(`/provider-patients/${encodeURIComponent(providerTag)}`);
    };

    return (
        <AuthGuard requireProviderAdmin={true}>
            <div className="min-h-screen bg-gradient-to-br from-background to-white font-sans">
                <div className="container mx-auto px-6 py-8 max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                        <p className="text-gray-600">Manage providers and view their patients</p>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading providers...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <Icon icon="lucide:alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Providers</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Button
                                color="primary"
                                onClick={() => window.location.reload()}
                                startContent={<Icon icon="lucide:refresh-cw" />}
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : activeProvidersData?.provider_tags && activeProvidersData.provider_tags.length > 0 ? (
                        <div className="space-y-6">
                            {/* Header Card */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Icon icon="lucide:users" className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">Active Provider Tags</h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {activeProvidersData.statistics.description} ({activeProvidersData.statistics.total_unique_provider_tags} total)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Provider Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeProvidersData.provider_tags.map((providerTag, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-blue-300 group"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                                                        <Icon icon="lucide:user-check" className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 text-lg">{providerTag}</h3>
                                                        <p className="text-sm text-gray-500">Provider Tag</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-gray-500">
                                                    Active Provider
                                                </div>
                                                <Button
                                                    color="primary"
                                                    size="sm"
                                                    onClick={() => handleProviderChange(providerTag)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                                                    startContent={<Icon icon="lucide:eye" className="w-4 h-4" />}
                                                >
                                                    View Patients
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Icon icon="lucide:users" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
                            <p className="text-gray-500">There are no active providers to display.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
};

export default AdminPage;