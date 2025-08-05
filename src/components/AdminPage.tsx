import React from 'react';
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from '../contexts/AuthContext';
import { getProviders, getPatients, getContactDetails, updateContactAdmin, ProvidersResponse, PatientsResponse, ContactDetailsResponse } from '../utils/api';

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const [providersData, setProvidersData] = React.useState<ProvidersResponse | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedProvider, setSelectedProvider] = React.useState<string>('');


    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [adminPatients, setAdminPatients] = React.useState<PatientsResponse | null>(null);
    const [filteredAdminPatients, setFilteredAdminPatients] = React.useState<PatientsResponse | null>(null);
    const [loadingAdminPatients, setLoadingAdminPatients] = React.useState(false);
    const [adminContactDetails, setAdminContactDetails] = React.useState<Record<string, ContactDetailsResponse>>({});
    const [loadingAdminDetails, setLoadingAdminDetails] = React.useState<Set<string>>(new Set());
    const [showAdminDetailsModal, setShowAdminDetailsModal] = React.useState(false);
    const [selectedAdminPatient, setSelectedAdminPatient] = React.useState<any>(null);
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [editedPatientData, setEditedPatientData] = React.useState<any>(null);
    const [savingChanges, setSavingChanges] = React.useState(false);

    // Fetch providers data when component mounts
    React.useEffect(() => {
        const fetchProviders = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getProviders();
                setProvidersData(data);
            } catch (err) {
                console.error('Failed to fetch providers:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch providers');
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
        fetchAdminPatients(); // Fetch all patients for admin
    }, []);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.dropdown-container')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Function to fetch patients for selected provider
    const fetchPatientsForProvider = async (providerName: string) => {
        try {
            const data = await getPatients(providerName);
            // Note: This function is not currently used in the admin flow
        } catch (err) {
            console.error('Failed to fetch patients for provider:', err);
        }
    };

    // Handle provider selection
    const handleProviderChange = (providerName: string) => {
        console.log('Selected provider name:', providerName);
        setSelectedProvider(providerName);
        setIsDropdownOpen(false);
        if (providerName) {
            // Fetch patients for the selected provider in the All Patients section
            fetchAdminPatientsForProvider(providerName);
        } else {
            setFilteredAdminPatients(null); // Reset filtered patients when no provider is selected
        }
    };

    // Fetch all patients for admin
    const fetchAdminPatients = async () => {
        try {
            setLoadingAdminPatients(true);
            const data = await getPatients(); // No provider name for admin - gets all patients
            setAdminPatients(data);
        } catch (err) {
            console.error('Failed to fetch admin patients:', err);
        } finally {
            setLoadingAdminPatients(false);
        }
    };

    // Fetch patients for a specific provider in the All Patients section
    const fetchAdminPatientsForProvider = async (providerName: string) => {
        try {
            setLoadingAdminPatients(true);
            const data = await getPatients(providerName); // Get patients for specific provider
            setFilteredAdminPatients(data);
        } catch (err) {
            console.error('Failed to fetch admin patients for provider:', err);
        } finally {
            setLoadingAdminPatients(false);
        }
    };

    // Fetch admin contact details
    const fetchAdminContactDetails = async (opportunityId: string, contactId: string) => {
        if (adminContactDetails[opportunityId]) return;

        try {
            setLoadingAdminDetails(prev => new Set(prev).add(opportunityId));
            const response = await getContactDetails(contactId);
            setAdminContactDetails(prev => ({
                ...prev,
                [opportunityId]: response
            }));
        } catch (error) {
            console.error('Failed to fetch admin contact details:', error);
        } finally {
            setLoadingAdminDetails(prev => {
                const newSet = new Set(prev);
                newSet.delete(opportunityId);
                return newSet;
            });
        }
    };

    // Handle admin patient details modal
    const openAdminDetailsModal = async (patient: any) => {
        setSelectedAdminPatient(patient);
        setShowAdminDetailsModal(true);

        if (!adminContactDetails[patient.opportunity_id]) {
            await fetchAdminContactDetails(patient.opportunity_id, patient.contact.id);
        }
    };

    const closeAdminDetailsModal = () => {
        setShowAdminDetailsModal(false);
        setSelectedAdminPatient(null);
        setIsEditMode(false);
        setEditedPatientData(null);
    };

    // Handle edit mode toggle
    const toggleEditMode = () => {
        if (!isEditMode) {
            // Enter edit mode - copy current data
            const currentData = adminContactDetails[selectedAdminPatient.opportunity_id]?.contact_data;
            setEditedPatientData(JSON.parse(JSON.stringify(currentData))); // Deep copy
        }
        setIsEditMode(!isEditMode);
    };

    // Handle field value changes
    const handleFieldChange = (fieldName: string, value: any) => {
        setEditedPatientData((prev: any) => ({
            ...prev,
            [fieldName]: value
        }));
    };

    // Handle custom field changes
    const handleCustomFieldChange = (fieldId: string, value: any) => {
        setEditedPatientData((prev: any) => ({
            ...prev,
            customField: prev.customField.map((field: any) =>
                field.id === fieldId ? { ...field, value } : field
            )
        }));
    };

    // Save changes
    const saveChanges = async () => {
        if (!selectedAdminPatient || !editedPatientData) return;

        try {
            setSavingChanges(true);

            // Prepare the update data according to the API specification
            const updateData: any = {};

            // Map basic fields
            if (editedPatientData.fullNameLowerCase !== undefined) {
                updateData.firstName = editedPatientData.fullNameLowerCase.split(' ')[0] || '';
                updateData.lastName = editedPatientData.fullNameLowerCase.split(' ').slice(1).join(' ') || '';
            }
            if (editedPatientData.email !== undefined) {
                updateData.email = editedPatientData.email;
            }
            if (editedPatientData.phone !== undefined) {
                updateData.phone = editedPatientData.phone;
            }
            if (editedPatientData.country !== undefined) {
                updateData.country = editedPatientData.country;
            }

            // Map custom fields
            if (editedPatientData.customField && editedPatientData.customField.length > 0) {
                updateData.customField = {};
                editedPatientData.customField.forEach((field: any) => {
                    if (field.value !== undefined) {
                        updateData.customField[field.id] = field.value;
                    }
                });
            }

            console.log('Accumulated changes:', updateData);

            // Make the API call to the admin endpoint
            await updateContactAdmin(selectedAdminPatient.contact.id, updateData);

            // Update the local state with new data
            setAdminContactDetails(prev => ({
                ...prev,
                [selectedAdminPatient.opportunity_id]: {
                    ...prev[selectedAdminPatient.opportunity_id],
                    contact_data: editedPatientData
                }
            }));

            setIsEditMode(false);
            setEditedPatientData(null);
        } catch (error) {
            console.error('Failed to save changes:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setSavingChanges(false);
        }
    };

    // Cancel edit mode
    const cancelEdit = () => {
        setIsEditMode(false);
        setEditedPatientData(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-white font-sans">
            <div className="container mx-auto px-6 py-8 max-w-7xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-gray-600 text-sm mt-1">Welcome, {user?.name} - Administrative Control Panel</p>
                    </div>
                </div>

                {/* Admin Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* System Overview Card */}
                    <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                        <CardBody className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
                                    <Icon icon="lucide:activity" className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
                                    <p className="text-gray-600 text-sm">Monitor system health</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin text-primary-600 mr-2" />
                                        <span className="text-gray-600 text-sm">Loading...</span>
                                    </div>
                                ) : error ? (
                                    <div className="flex items-center justify-center py-4 text-red-600">
                                        <Icon icon="lucide:alert-circle" className="w-4 h-4 mr-2" />
                                        <span className="text-sm">Error loading data</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Providers</span>
                                            <span className="font-semibold text-primary-600">{providersData?.count || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Active Providers</span>
                                            <span className="font-semibold text-primary-600">{providersData?.active_providers_count || 0}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardBody>
                    </Card>



                    {/* Recent Activity Card */}
                    <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                        <CardBody className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
                                    <Icon icon="lucide:clock" className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                                    <p className="text-gray-600 text-sm">Latest system events</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin text-primary-600 mr-2" />
                                        <span className="text-gray-600 text-sm">Loading...</span>
                                    </div>
                                ) : error ? (
                                    <div className="flex items-center justify-center py-4 text-red-600">
                                        <Icon icon="lucide:alert-circle" className="w-4 h-4 mr-2" />
                                        <span className="text-sm">Error loading data</span>
                                    </div>
                                ) : providersData?.providers && providersData.providers.length > 0 ? (
                                    providersData.providers.slice(0, 3).map((provider, index) => {
                                        // Parse the created_at timestamp
                                        const createdDate = new Date(provider.created_at);
                                        const now = new Date();

                                        // Calculate time difference in milliseconds
                                        const diffInMs = now.getTime() - createdDate.getTime();

                                        // Convert to different time units
                                        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
                                        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
                                        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

                                        // Debug: Log the timestamp values
                                        console.log('Provider:', provider.name);
                                        console.log('Created at:', provider.created_at);
                                        console.log('Parsed date:', createdDate);
                                        console.log('Current time:', now);
                                        console.log('Time difference (ms):', diffInMs);
                                        console.log('Days:', diffInDays, 'Hours:', diffInHours, 'Minutes:', diffInMinutes);

                                        // Format the time ago string
                                        let timeAgo = '';
                                        if (diffInMs < 0) {
                                            // If negative (future date), show the actual date
                                            timeAgo = createdDate.toLocaleDateString();
                                        } else if (diffInMinutes < 1) {
                                            timeAgo = 'Just now';
                                        } else if (diffInMinutes < 60) {
                                            timeAgo = `${diffInMinutes} min ago`;
                                        } else if (diffInHours < 24) {
                                            timeAgo = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
                                        } else {
                                            timeAgo = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
                                        }

                                        return (
                                            <div key={provider.email} className="flex items-center space-x-3 text-sm">
                                                <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                                                <span className="text-gray-600">{provider.name} registered</span>
                                                <span className="text-gray-400 text-xs">{timeAgo}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-gray-500 text-sm text-center py-2">No recent activity</div>
                                )}
                            </div>
                        </CardBody>
                    </Card>


                </div>

                {/* Provider Selection Dropdown */}
                <div className="mt-8">
                    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mr-3">
                                <Icon icon="lucide:users" className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Provider Management</h3>
                                <p className="text-gray-600 text-sm">Select a provider to view their patients</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin text-primary-600 mr-2" />
                                <span className="text-gray-600">Loading providers...</span>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center py-8 text-red-600">
                                <Icon icon="lucide:alert-circle" className="w-5 h-5 mr-2" />
                                <span>Error loading providers</span>
                            </div>
                        ) : providersData?.providers && providersData.providers.length > 0 ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Select Provider ({providersData.providers.length} total)
                                    </label>
                                    <div className="relative dropdown-container">
                                        {/* Custom Dropdown */}
                                        <div
                                            className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 cursor-pointer shadow-sm hover:border-primary-400 transition-colors duration-200 flex items-center justify-between"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        >
                                            <span className={selectedProvider ? "text-gray-900" : "text-gray-500"}>
                                                {selectedProvider
                                                    ? selectedProvider
                                                    : "Choose a provider..."
                                                }
                                            </span>
                                            <Icon
                                                icon="lucide:chevron-down"
                                                className={`w-4 h-4 text-primary-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                            />
                                        </div>

                                        {/* Dropdown Options */}
                                        {isDropdownOpen && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-primary-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {providersData.providers.map((provider) => (
                                                    <div
                                                        key={provider.email}
                                                        className="px-4 py-3 hover:bg-primary-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                                                        onClick={() => handleProviderChange(provider.name || `${provider.first_name || ''} ${provider.last_name || ''}`.trim() || provider.email)}
                                                    >
                                                        <div className="flex items-center">
                                                            <Icon icon="lucide:user" className="w-4 h-4 text-primary-600 mr-3" />
                                                            <div>
                                                                <div className="font-medium text-gray-900">{provider.name || `${provider.first_name || ''} ${provider.last_name || ''}`.trim() || provider.email}</div>
                                                                <div className="text-sm text-gray-500">{provider.email}</div>
                                                            </div>
                                                            {provider.is_active && (
                                                                <Icon icon="lucide:check-circle" className="w-4 h-4 text-green-500 ml-auto" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>




                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Icon icon="lucide:users" className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p>No providers found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Admin Patients Table */}
                <div className="mt-8">
                    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mr-3">
                                <Icon icon="lucide:users" className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {filteredAdminPatients ? `${filteredAdminPatients.provider_name} - Patients` : 'All Patients'}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {filteredAdminPatients
                                        ? `View and manage patients for ${filteredAdminPatients.provider_name}`
                                        : 'View and manage all patients in the system'
                                    }
                                </p>
                            </div>
                        </div>

                        {loadingAdminPatients ? (
                            <div className="flex items-center justify-center py-12">
                                <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin text-primary-600 mr-3" />
                                <span className="text-gray-600 font-medium">Loading all patients...</span>
                            </div>
                        ) : (filteredAdminPatients || adminPatients) ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-primary-100">
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Total Patients:</span>
                                        <span className="ml-2 text-lg font-bold text-primary-600">
                                            {filteredAdminPatients ? filteredAdminPatients.patients.length : adminPatients?.total_patients}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Provider:</span>
                                        <span className="ml-2 text-sm font-medium text-gray-900">
                                            {filteredAdminPatients ? filteredAdminPatients.provider_name : adminPatients?.provider_name}
                                        </span>
                                    </div>
                                </div>

                                {/* Patients Table */}
                                <div className="bg-white rounded-lg border border-primary-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Full Name
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Phone
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Email
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Details
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {(filteredAdminPatients || adminPatients)?.patients.map((patient) => (
                                                    <tr key={patient.opportunity_id} className="hover:bg-gray-50 transition-colors duration-200">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{patient.contact.name}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">{patient.contact.phone || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">{patient.contact.email || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => openAdminDetailsModal(patient)}
                                                                className="inline-flex items-center px-3 py-1 border border-primary-300 rounded-md text-xs font-medium text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                                                            >
                                                                <Icon icon="lucide:eye" className="w-3 h-3 mr-1" />
                                                                Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <Icon icon="lucide:users" className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p>No patients found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Admin Patient Details Modal */}
                {showAdminDetailsModal && selectedAdminPatient && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold">Patient Details</h2>
                                        <p className="text-white/80 mt-1">{selectedAdminPatient.contact.name}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {!isEditMode ? (
                                            <Button
                                                size="sm"
                                                variant="light"
                                                className="bg-white text-primary-600 hover:bg-gray-100"
                                                startContent={<Icon icon="lucide:edit" className="w-4 h-4" />}
                                                onClick={toggleEditMode}
                                            >
                                                Edit
                                            </Button>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    className="bg-white text-primary-600 hover:bg-gray-100"
                                                    startContent={<Icon icon="lucide:save" className="w-4 h-4" />}
                                                    onClick={saveChanges}
                                                    isLoading={savingChanges}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        )}
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            size="sm"
                                            className="text-white hover:bg-white/20"
                                            onClick={closeAdminDetailsModal}
                                        >
                                            <Icon icon="lucide:x" className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                                {loadingAdminDetails.has(selectedAdminPatient.opportunity_id) ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-primary-600 mr-3" />
                                        <span className="text-gray-600 font-medium text-lg">Loading patient details...</span>
                                    </div>
                                ) : adminContactDetails[selectedAdminPatient.opportunity_id] ? (
                                    <div className="space-y-6">
                                        {/* Basic Information */}
                                        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-xl">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                                <Icon icon="lucide:user" className="w-5 h-5 mr-2 text-primary-600" />
                                                Basic Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600 block mb-1">Full Name:</span>
                                                        {isEditMode ? (
                                                            <input
                                                                type="text"
                                                                value={editedPatientData?.fullNameLowerCase || ''}
                                                                onChange={(e) => handleFieldChange('fullNameLowerCase', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                            />
                                                        ) : (
                                                            <p className="text-lg font-semibold text-gray-900">{adminContactDetails[selectedAdminPatient.opportunity_id]?.contact_data?.fullNameLowerCase}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600 block mb-1">Email:</span>
                                                        {isEditMode ? (
                                                            <input
                                                                type="email"
                                                                value={editedPatientData?.email || ''}
                                                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                            />
                                                        ) : (
                                                            <p className="text-gray-900">{adminContactDetails[selectedAdminPatient.opportunity_id]?.contact_data?.email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600 block mb-1">Phone:</span>
                                                        {isEditMode ? (
                                                            <input
                                                                type="tel"
                                                                value={editedPatientData?.phone || ''}
                                                                onChange={(e) => handleFieldChange('phone', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                            />
                                                        ) : (
                                                            <p className="text-gray-900">{adminContactDetails[selectedAdminPatient.opportunity_id]?.contact_data?.phone}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600 block mb-1">Country:</span>
                                                        {isEditMode ? (
                                                            <input
                                                                type="text"
                                                                value={editedPatientData?.country || ''}
                                                                onChange={(e) => handleFieldChange('country', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                            />
                                                        ) : (
                                                            <p className="text-gray-900">{adminContactDetails[selectedAdminPatient.opportunity_id]?.contact_data?.country}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Custom Fields */}
                                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                                    <Icon icon="lucide:file-text" className="w-5 h-5 mr-2 text-primary-600" />
                                                    Additional Information
                                                </h3>
                                            </div>
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {(isEditMode ? editedPatientData?.customField : adminContactDetails[selectedAdminPatient.opportunity_id]?.contact_data?.customField)?.map((field: any) => (
                                                        <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                            <span className="text-sm font-semibold text-gray-700 block mb-2">{field.name}:</span>
                                                            <div className="text-gray-900">
                                                                {isEditMode ? (
                                                                    // Edit mode - show input fields
                                                                    typeof field.value === 'string' ? (
                                                                        <input
                                                                            type="text"
                                                                            value={field.value || ''}
                                                                            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                                                        />
                                                                    ) : typeof field.value === 'number' ? (
                                                                        <input
                                                                            type="number"
                                                                            value={field.value || ''}
                                                                            onChange={(e) => handleCustomFieldChange(field.id, Number(e.target.value))}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                                                        />
                                                                    ) : Array.isArray(field.value) ? (
                                                                        <input
                                                                            type="text"
                                                                            value={field.value.join(', ') || ''}
                                                                            onChange={(e) => handleCustomFieldChange(field.id, e.target.value.split(', ').filter(item => item.trim()))}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                                                            placeholder="Enter values separated by commas"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-gray-500 text-sm">Complex field - cannot edit</span>
                                                                    )
                                                                ) : (
                                                                    // View mode - show values
                                                                    typeof field.value === 'string' ? (
                                                                        <span className="text-sm">{field.value}</span>
                                                                    ) : typeof field.value === 'number' ? (
                                                                        <span className="text-sm font-medium">{field.value}</span>
                                                                    ) : Array.isArray(field.value) ? (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {field.value.map((item: any, idx: number) => (
                                                                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                                                                    {item}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    ) : typeof field.value === 'object' && field.value !== null ? (
                                                                        <div className="space-y-2">
                                                                            <span className="text-xs font-medium text-gray-600 block">Document/File:</span>
                                                                            {Object.entries(field.value).map(([key, fileData]) => (
                                                                                <div key={key} className="flex items-center space-x-2 p-2 bg-white rounded border">
                                                                                    <Icon icon="lucide:file-text" className="w-4 h-4 text-primary-600" />
                                                                                    <a
                                                                                        href={(fileData as any).url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="text-primary-600 hover:text-primary-800 underline text-sm"
                                                                                    >
                                                                                        {(fileData as any).meta.originalname}
                                                                                    </a>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-500 text-sm">No value</span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-12 text-red-600">
                                        <Icon icon="lucide:alert-circle" className="w-8 h-8 mr-3" />
                                        <span className="text-lg">Failed to load patient details</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage; 