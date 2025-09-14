import React from 'react';
import { Button, Card, CardBody, Input, Pagination } from "@heroui/react";
import { Icon } from "@iconify/react";
import { getActiveNonAdminProviders, ActiveNonAdminProvidersResponse, getPatients, PatientsResponse, PatientData } from '../utils/api';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { DateRangePicker } from './ui/date-range-picker';
import AuthGuard from './AuthGuard';
import { useAuth } from '../contexts/AuthContext';

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const [activeProvidersData, setActiveProvidersData] = React.useState<ActiveNonAdminProvidersResponse | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Patient data state
    const [patientsData, setPatientsData] = React.useState<PatientsResponse | null>(null);
    const [patients, setPatients] = React.useState<PatientData[]>([]);
    const [totalPatients, setTotalPatients] = React.useState(0);
    const [patientsLoading, setPatientsLoading] = React.useState(false);
    const [patientsError, setPatientsError] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [dateFilter, setDateFilter] = React.useState<string>('month');
    const [customDateRange, setCustomDateRange] = React.useState<{ from: Date | null, to: Date | null }>({ from: null, to: null });
    const [currentPage, setCurrentPage] = React.useState(1);
    const [selectedProvider, setSelectedProvider] = React.useState<string | null>(null);
    const [selectedProviderTag, setSelectedProviderTag] = React.useState<string | null>(null);

    // Export functionality state
    const [isExporting, setIsExporting] = React.useState(false);
    const [exportError, setExportError] = React.useState<string | null>(null);
    const [showExportModal, setShowExportModal] = React.useState(false);

    // Edit patient modal state
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [editingPatient, setEditingPatient] = React.useState<PatientData | null>(null);
    const [editFormData, setEditFormData] = React.useState<Partial<PatientData>>({});
    const [isSaving, setIsSaving] = React.useState(false);

    const patientsPerPage = 20;

    // Fetch active non-admin providers data when component mounts
    React.useEffect(() => {
        const fetchActiveProviders = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching active non-admin providers...');
                const data = await getActiveNonAdminProviders();
                console.log('Active providers data received:', data);
                console.log('Provider tags in response:', data.provider_tags);
                console.log('Provider tags length:', data.provider_tags?.length);
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

    // Function to fetch patients from API
    const fetchPatients = async (providerTag: string, filter?: string, customRange?: { from: Date | null, to: Date | null }) => {
        try {
            setPatientsLoading(true);
            setPatientsError(null);

            console.log('Fetching patients for provider:', providerTag, 'Filter:', filter, 'Custom Range:', customRange);
            const filterParam = filter && filter !== 'all' ? filter : null;

            // Determine which provider tag to use based on user role
            // Admin is determined ONLY by provider_admin = True
            let searchProviderTag: string | null = null;
            if (user?.provider_admin) {
                // Admin users (provider_admin = True) use the selected provider tag
                searchProviderTag = selectedProviderTag || providerTag;
            } else {
                // Non-admin users (provider_admin = False) should NOT send provider_tag parameter
                searchProviderTag = null;
            }

            console.log('Using search provider tag:', searchProviderTag, 'User provider_admin:', user?.provider_admin, 'User is_admin:', user?.is_admin, 'User provider_tag:', user?.provider_tag);

            const response = await getPatients(filterParam, customRange, searchProviderTag);
            setPatientsData(response);
            setPatients(response.patients);
            setTotalPatients(response.total_patients);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            setPatientsError(error instanceof Error ? error.message : 'Failed to fetch patients');
        } finally {
            setPatientsLoading(false);
        }
    };

    // Handle provider selection - show patients for selected provider
    const handleProviderChange = (providerTag: string) => {
        console.log('Selected provider tag:', providerTag);
        setSelectedProvider(providerTag);
        setSelectedProviderTag(providerTag);
        fetchPatients(providerTag, dateFilter, customDateRange);
    };

    // Fetch patients when filter changes
    React.useEffect(() => {
        if (selectedProvider) {
            // For admin users (provider_admin = True), use selectedProviderTag if available, otherwise use selectedProvider
            // For non-admin users (provider_admin = False), just use selectedProvider (the provider tag is not sent to API)
            const providerTagToUse = user?.provider_admin ? (selectedProviderTag || selectedProvider) : selectedProvider;
            fetchPatients(providerTagToUse, dateFilter, customDateRange);
            setCurrentPage(1); // Reset to first page when filter changes
        }
    }, [dateFilter, customDateRange, selectedProviderTag]);

    // Reset to first page when search query changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Filter patients based on search query
    const filteredPatients = React.useMemo(() => {
        if (!searchQuery.trim()) return patients;

        const query = searchQuery.toLowerCase();
        return patients.filter(patient =>
            patient["Patient Name"]?.toLowerCase().includes(query) ||
            patient["Phone Number"]?.toLowerCase().includes(query) ||
            patient["Medication Ordered"]?.toLowerCase().includes(query) ||
            patient["Order Type"]?.toLowerCase().includes(query)
        );
    }, [patients, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
    const startIndex = (currentPage - 1) * patientsPerPage;
    const endIndex = startIndex + patientsPerPage;
    const currentPatients = filteredPatients.slice(startIndex, endIndex);

    // Format currency amounts with proper dollar sign and decimal formatting
    const formatCurrency = (value: any): string => {
        if (value === null || value === undefined) return 'Not available';
        if (typeof value === 'string') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) return value;
            return `$${numValue.toFixed(2)}`;
        }
        if (typeof value === 'number') {
            return `$${value.toFixed(2)}`;
        }
        return 'Not available';
    };

    // Format date strings properly
    const formatDate = (dateString: string): string => {
        if (!dateString) return 'Not available';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };


    // Get payment status display value and color
    const getPaymentStatusDisplay = (status: string | string[]): { text: string; color: string } => {
        let statusText = '';
        if (Array.isArray(status)) {
            statusText = status[0] || 'Unknown';
        } else {
            statusText = status || 'Unknown';
        }

        switch (statusText.toLowerCase()) {
            case 'paid':
                return { text: 'Paid', color: 'bg-green-100 text-green-800 border-green-200' };
            case 'pending':
                return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
            case 'failed':
            case 'declined':
                return { text: 'Failed', color: 'bg-red-100 text-red-800 border-red-200' };
            default:
                return { text: statusText, color: 'bg-gray-100 text-gray-800 border-gray-200' };
        }
    };

    // Get shipping status display value and color
    const getShippingStatusDisplay = (status: string): { text: string; color: string } => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return { text: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200' };
            case 'shipped':
                return { text: 'Shipped', color: 'bg-blue-100 text-blue-800 border-blue-200' };
            case 'processing':
                return { text: 'Processing', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
            case 'pending':
                return { text: 'Pending', color: 'bg-orange-100 text-orange-800 border-orange-200' };
            default:
                return { text: status || 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200' };
        }
    };



    // Function to create Excel-compatible HTML content from patient data
    const createExcelFromPatientData = (patientData: PatientData[]): string => {
        if (patientData.length === 0) return '';

        // Define Excel headers
        const headers = [
            'Patient Name',
            'Phone Number',
            'DOB',
            'Date Ordered',
            'Order Type',
            'Medication Ordered',
            'Payment Status',
            'Payment Amount',
            'Shipping Payment',
            'Shipping Status',
            'Tracking Number',
            'Date Delivered',
            'Pickup or Delivery',
            'Referred By',
            'Patient Shipping Address',
            'Contact ID'
        ];

        // Create Excel rows
        const rows = patientData.map(patient => [
            patient["Patient Name"] || '',
            patient["Phone Number"] || '',
            patient.DOB || '',
            formatDate(patient["Date Ordered"]) || '',
            patient["Order Type"] || '',
            patient["Medication Ordered"] || '',
            Array.isArray(patient["Payment Status"]) ? patient["Payment Status"].join(', ') : patient["Payment Status"] || '',
            formatCurrency(patient["Payment Amount"]) || '',
            formatCurrency(patient["Shipping Payment"]) || '',
            patient["Shipping Status"] || '',
            patient["Tracking Number"] || '',
            formatDate(patient["Date Delivered"]) || '',
            patient["Pickup or Delivery"] || '',
            patient["Referred By"] || '',
            patient["Patient Shipping Address"] || '',
            patient.contact_id || ''
        ]);

        // Create HTML table that Excel can open
        const htmlContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <meta charset="utf-8">
                    <meta name="ExcelCreated" content="true">
                    <meta name="ProgId" content="Excel.Sheet">
                    <meta name="Generator" content="Microsoft Excel 11">
                    <style>
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .number { text-align: right; }
                    </style>
                </head>
                <body>
                    <table>
                        <thead>
                            <tr>
                                ${headers.map(header => `<th>${header}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map(row => `
                                <tr>
                                    ${row.map(cell => `<td>${cell}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        return htmlContent;
    };


    // Export functionality
    const handleExport = async () => {
        if (!patients || patients.length === 0) {
            setExportError('No patients to export');
            return;
        }

        setIsExporting(true);
        setExportError(null);

        try {
            console.log('Exporting patients data:', patients);

            // Create Excel-compatible HTML content from the patient data
            const excelContent = createExcelFromPatientData(patients);
            const blob = new Blob([excelContent], {
                type: 'application/vnd.ms-excel;charset=utf-8;'
            });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Generate filename with current filter info
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const filterInfo = dateFilter === 'custom'
                ? 'custom-range'
                : dateFilter;
            link.download = `patients_${selectedProvider}_${filterInfo}_${timestamp}.xls`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Show success modal
            setShowExportModal(true);
        } catch (error) {
            console.error('Export failed:', error);
            setExportError(error instanceof Error ? error.message : 'Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    // Handle edit patient click
    const handleEditPatient = (patient: PatientData) => {
        setEditingPatient(patient);
        setEditFormData({
            "Patient Name": patient["Patient Name"] || '',
            "Phone Number": patient["Phone Number"] || '',
            DOB: patient.DOB || '',
            "Date Ordered": patient["Date Ordered"] || '',
            "Order Type": patient["Order Type"] || '',
            "Medication Ordered": patient["Medication Ordered"] || '',
            "Payment Status": patient["Payment Status"] || '',
            "Payment Amount": patient["Payment Amount"] || '',
            "Shipping Payment": patient["Shipping Payment"] || '',
            "Shipping Status": patient["Shipping Status"] || '',
            "Tracking Number": patient["Tracking Number"] || '',
            "Date Delivered": patient["Date Delivered"] || '',
            "Pickup or Delivery": patient["Pickup or Delivery"] || '',
            "Referred By": patient["Referred By"] || '',
            "Patient Shipping Address": patient["Patient Shipping Address"] || '',
        });
        setShowEditModal(true);
    };

    // Handle form input changes
    const handleEditInputChange = (field: string, value: string) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle save patient changes
    const handleSavePatient = async () => {
        if (!editingPatient) return;

        setIsSaving(true);
        try {
            // Here you would typically make an API call to update the patient
            console.log('Saving patient changes:', editFormData);

            // For now, just show success and close modal
            // In a real implementation, you'd call an API endpoint to update the patient
            setShowEditModal(false);
            setEditingPatient(null);
            setEditFormData({});

            // Optionally refresh the patient list
            if (selectedProvider) {
                // For admin users (provider_admin = True), use selectedProviderTag if available, otherwise use selectedProvider
                // For non-admin users (provider_admin = False), just use selectedProvider (the provider tag is not sent to API)
                const providerTagToUse = user?.provider_admin ? (selectedProviderTag || selectedProvider) : selectedProvider;
                fetchPatients(providerTagToUse, dateFilter, customDateRange);
            }
        } catch (error) {
            console.error('Failed to save patient changes:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle close edit modal
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingPatient(null);
        setEditFormData({});
    };

    // Deduplicate provider tags to fix the duplicate issue
    const uniqueProviderTags = React.useMemo(() => {
        if (!activeProvidersData?.provider_tags) return [];

        console.log('Raw provider tags from API:', activeProvidersData.provider_tags);
        console.log('Provider tags type:', typeof activeProvidersData.provider_tags);
        console.log('Provider tags length:', activeProvidersData.provider_tags.length);

        // Normalize and deduplicate provider tags
        const normalizedTags = activeProvidersData.provider_tags
            .map(tag => tag?.toString().trim()) // Convert to string and trim whitespace
            .filter(tag => tag && tag.length > 0); // Remove empty strings

        console.log('Normalized provider tags:', normalizedTags);

        const unique = [...new Set(normalizedTags)];
        console.log('Unique provider tags after deduplication:', unique);
        console.log('Unique count:', unique.length);

        return unique;
    }, [activeProvidersData?.provider_tags]);

    // Check if user has appropriate access
    // Allow access for provider_admin OR users with provider_tag (regular providers)
    if (!user || (!user.provider_admin && !user.provider_tag)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-white flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="lucide:shield-x" className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-4">You don't have the required privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <AuthGuard requireAdmin={false} requireProviderAdmin={false}>
            <div className="min-h-screen bg-gradient-to-br from-background to-white font-sans">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 shadow-sm">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {selectedProvider && (
                                    <Button
                                        isIconOnly
                                        variant="light"
                                        onClick={() => setSelectedProvider(null)}
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        <Icon icon="lucide:arrow-left" className="w-5 h-5" />
                                    </Button>
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {selectedProvider ? `Patients - ${selectedProvider}` : (user?.provider_admin ? 'Admin Dashboard' : 'Provider Dashboard')}
                                    </h1>
                                    <p className="text-gray-600 text-sm">
                                        {selectedProvider ? `${totalPatients} total patients` : (user?.provider_admin ? 'Manage providers and view their patients' : 'View your patients')}
                                        {patientsData?.filter_applied && (
                                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                                Filter: {patientsData.filter_applied}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-8 max-w-7xl">
                    {!selectedProvider ? (
                        // Provider Selection View
                        <>
                            {/* Admin User - Provider Selection */}
                            {user?.provider_admin ? (
                                <>
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
                                    ) : uniqueProviderTags && uniqueProviderTags.length > 0 ? (
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
                                                            {activeProvidersData?.statistics?.description} ({uniqueProviderTags.length} total)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Provider Cards Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {uniqueProviderTags.map((providerTag, index) => (
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
                                </>
                            ) : (
                                // Non-Admin User - Direct Patient View
                                <>
                                    {/* Provider Tag Selection for Non-Admin Users */}
                                    <div className="mb-6">
                                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                                            <CardBody className="p-6">
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <Icon icon="lucide:user-check" className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-semibold text-gray-900">Your Provider Tag</h2>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {user?.provider_tag || 'No provider tag assigned'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4">
                                                    <Button
                                                        color="primary"
                                                        onClick={() => {
                                                            if (user?.provider_tag) {
                                                                handleProviderChange(user.provider_tag);
                                                            }
                                                        }}
                                                        disabled={!user?.provider_tag}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                                                        startContent={<Icon icon="lucide:eye" className="w-4 h-4" />}
                                                    >
                                                        View My Patients
                                                    </Button>

                                                    {!user?.provider_tag && (
                                                        <p className="text-sm text-red-600">
                                                            Please contact an administrator to assign a provider tag.
                                                        </p>
                                                    )}
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        // Patient View
                        <>
                            {/* Compact Header Section */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                        Patients - {selectedProvider}
                                        {user?.provider_admin && (
                                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Admin View
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {totalPatients} total patients
                                        {patientsData?.filter_applied && (
                                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                                Filter: {patientsData.filter_applied}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex space-x-3">
                                    {/* Export Button */}
                                    <Button
                                        onClick={handleExport}
                                        disabled={isExporting || !patients || patients.length === 0}
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        size="sm"
                                        startContent={
                                            isExporting ? (
                                                <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Icon icon="lucide:download" className="w-4 h-4" />
                                            )
                                        }
                                    >
                                        {isExporting ? 'Exporting...' : 'Export Excel'}
                                    </Button>

                                    {/* Compact Search Bar */}
                                    <Input
                                        placeholder="Search patients..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        startContent={<Icon icon="lucide:search" className="text-foreground w-4 h-4" />}
                                        className="w-64 premium-input"
                                        size="sm"
                                        classNames={{
                                            input: "text-foreground placeholder-muted focus:outline-none",
                                            inputWrapper: "bg-white border border-primary-500 hover:border-primary-500 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500/20 focus:outline-none focus:ring-0",
                                            innerWrapper: "focus:outline-none focus:ring-0",
                                            mainWrapper: "focus:outline-none focus:ring-0",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Date Filter Tabs */}
                            <div className="mb-6">
                                <div className="flex flex-col space-y-4">
                                    {/* Quick Filter Tabs */}
                                    <Tabs value={dateFilter} onValueChange={(value) => {
                                        setDateFilter(value);
                                        if (value !== 'custom') {
                                            setCustomDateRange({ from: null, to: null });
                                        }
                                    }}>
                                        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 p-1 rounded-xl shadow-sm">
                                            <TabsTrigger
                                                value="today"
                                                className="flex items-center justify-center space-x-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-500 data-[state=active]:to-secondary-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-white/50 rounded-lg"
                                            >
                                                <Icon icon="lucide:calendar-days" className="w-4 h-4" />
                                                <span>Today</span>
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="week"
                                                className="flex items-center justify-center space-x-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-500 data-[state=active]:to-secondary-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-white/50 rounded-lg"
                                            >
                                                <Icon icon="lucide:calendar-range" className="w-4 h-4" />
                                                <span>This Week</span>
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="month"
                                                className="flex items-center justify-center space-x-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-500 data-[state=active]:to-secondary-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-white/50 rounded-lg"
                                            >
                                                <Icon icon="lucide:calendar" className="w-4 h-4" />
                                                <span>This Month</span>
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="year"
                                                className="flex items-center justify-center space-x-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-500 data-[state=active]:to-secondary-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-white/50 rounded-lg"
                                            >
                                                <Icon icon="lucide:calendar-check" className="w-4 h-4" />
                                                <span>This Year</span>
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>

                                    {/* Custom Date Range Picker */}
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="custom-range"
                                                name="date-filter"
                                                checked={dateFilter === 'custom'}
                                                onChange={() => setDateFilter('custom')}
                                                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                            />
                                            <label htmlFor="custom-range" className="text-sm font-medium text-gray-700">
                                                Custom Date Range:
                                            </label>
                                        </div>
                                        <DateRangePicker
                                            value={customDateRange}
                                            onChange={(range) => {
                                                setCustomDateRange(range);
                                                setDateFilter('custom');
                                            }}
                                            className="flex-1 max-w-md"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Patient Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {patientsLoading ? (
                                    <div className="col-span-full flex items-center justify-center py-12">
                                        <div className="flex items-center">
                                            <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin text-primary-600 mr-2" />
                                            <span className="text-gray-600">Loading patients...</span>
                                        </div>
                                    </div>
                                ) : patientsError ? (
                                    <div className="col-span-full flex items-center justify-center py-12 text-red-600">
                                        <Icon icon="lucide:alert-circle" className="w-6 h-6 mr-2" />
                                        <span>{patientsError}</span>
                                    </div>
                                ) : currentPatients.length === 0 ? (
                                    <div className="col-span-full flex items-center justify-center py-12 text-gray-600">
                                        <Icon icon="lucide:users" className="w-6 h-6 mr-2" />
                                        <span>No patients found</span>
                                    </div>
                                ) : (
                                    currentPatients.map((patient, index) => {
                                        const paymentStatus = getPaymentStatusDisplay(patient["Payment Status"]);
                                        const shippingStatus = getShippingStatusDisplay(patient["Shipping Status"]);

                                        return (
                                            <Card key={index} className="bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 group">
                                                <CardBody className="p-4">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                                                                {patient["Patient Name"] || 'Unknown Patient'}
                                                            </h3>
                                                        </div>
                                                        <div className="ml-3">
                                                            <div
                                                                className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditPatient(patient);
                                                                }}
                                                            >
                                                                <Icon icon="lucide:edit" className="w-5 h-5 text-white" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Patient Info */}
                                                    <div className="space-y-2 mb-3">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Icon icon="lucide:calendar" className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
                                                            <span className="font-medium">Order Date:</span>
                                                            <span className="ml-1">{formatDate(patient["Date Ordered"])}</span>
                                                        </div>

                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Icon icon="lucide:phone" className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
                                                            <span className="font-medium">Phone:</span>
                                                            <span className="ml-1">{patient["Phone Number"] || 'Not provided'}</span>
                                                        </div>

                                                        <div className="flex items-start text-sm text-gray-600">
                                                            <Icon icon="lucide:package" className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0 mt-0.5" />
                                                            <div className="flex-1">
                                                                <span className="font-medium">Medication:</span>
                                                                <span className="ml-1">{patient["Medication Ordered"] || 'Not specified'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Icon icon="lucide:shopping-cart" className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
                                                            <span className="font-medium">Order Type:</span>
                                                            <span className="ml-1">{patient["Order Type"] || 'Not specified'}</span>
                                                        </div>

                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Icon icon="lucide:calendar-days" className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
                                                            <span className="font-medium">DOB:</span>
                                                            <span className="ml-1">{patient.DOB || 'Not provided'}</span>
                                                        </div>

                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Icon icon="lucide:map-pin" className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
                                                            <span className="font-medium">Delivery:</span>
                                                            <span className="ml-1">{patient["Pickup or Delivery"] || 'Not specified'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Status and Payment */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm font-medium text-gray-700">Payment:</span>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${paymentStatus.color}`}>
                                                                    {paymentStatus.text}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm font-semibold text-primary-600">
                                                                {formatCurrency(patient["Payment Amount"])}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm font-medium text-gray-700">Shipping:</span>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${shippingStatus.color}`}>
                                                                    {shippingStatus.text}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                {formatCurrency(patient["Shipping Payment"])}
                                                            </div>
                                                        </div>
                                                    </div>

                                                </CardBody>
                                            </Card>
                                        );
                                    })
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-between items-center mt-8 px-6 py-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-sm text-gray-600">
                                    Showing {startIndex + 1} to {Math.min(startIndex + patientsPerPage, filteredPatients.length)} of {filteredPatients.length} patients
                                    {searchQuery && ` (search filtered)`}
                                    {patientsData?.filter_applied && ` (${patientsData.filter_applied} filter applied)`}
                                </div>
                                <Pagination
                                    total={totalPages}
                                    page={currentPage}
                                    onChange={setCurrentPage}
                                    size="sm"
                                    showControls
                                    classNames={{
                                        wrapper: "gap-0 overflow-visible h-8",
                                        item: "w-8 h-8 text-small rounded-none bg-transparent text-muted hover:text-primary-600",
                                        cursor: "bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium",
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>


                {/* Export Success Modal */}
                {showExportModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Icon icon="lucide:check" className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Export Successful!</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Your Excel file has been downloaded successfully.
                                </p>
                                <p className="text-gray-500 text-xs mb-6">
                                    {patients?.length} patients exported with {dateFilter} filter
                                </p>
                                <Button
                                    onClick={() => setShowExportModal(false)}
                                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Export Error Display */}
                {exportError && (
                    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
                        <Card className="bg-gradient-to-r from-red-500/90 to-pink-500/90 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden min-w-80">
                            <CardBody className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Icon icon="lucide:alert-circle" className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-1">
                                            Export Failed
                                        </h3>
                                        <p className="text-white/80 text-sm">
                                            {exportError}
                                        </p>
                                    </div>
                                    <Button
                                        isIconOnly
                                        variant="light"
                                        size="sm"
                                        className="text-white hover:bg-white/20"
                                        onClick={() => setExportError(null)}
                                    >
                                        <Icon icon="lucide:x" className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {/* Edit Patient Modal */}
                {showEditModal && editingPatient && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold">Edit Patient</h2>
                                        <p className="text-white/80 mt-1">Patient: {editingPatient["Patient Name"]}</p>
                                    </div>
                                    <Button
                                        isIconOnly
                                        variant="light"
                                        size="sm"
                                        className="text-white hover:bg-white/20"
                                        onClick={handleCloseEditModal}
                                    >
                                        <Icon icon="lucide:x" className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Modal Body - Edit Form */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Patient Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                                        <Input
                                            value={editFormData["Patient Name"] || ''}
                                            onChange={(e) => handleEditInputChange("Patient Name", e.target.value)}
                                            placeholder="Enter patient name"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <Input
                                            value={editFormData["Phone Number"] || ''}
                                            onChange={(e) => handleEditInputChange("Phone Number", e.target.value)}
                                            placeholder="Enter phone number"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* DOB */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                        <Input
                                            value={editFormData.DOB || ''}
                                            onChange={(e) => handleEditInputChange("DOB", e.target.value)}
                                            placeholder="MM/DD/YYYY"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Date Ordered */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Ordered</label>
                                        <Input
                                            value={editFormData["Date Ordered"] || ''}
                                            onChange={(e) => handleEditInputChange("Date Ordered", e.target.value)}
                                            placeholder="Enter order date"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Order Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                                        <Input
                                            value={editFormData["Order Type"] || ''}
                                            onChange={(e) => handleEditInputChange("Order Type", e.target.value)}
                                            placeholder="Enter order type"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Medication Ordered */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Medication Ordered</label>
                                        <Input
                                            value={editFormData["Medication Ordered"] || ''}
                                            onChange={(e) => handleEditInputChange("Medication Ordered", e.target.value)}
                                            placeholder="Enter medication"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Payment Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                                        <Input
                                            value={Array.isArray(editFormData["Payment Status"]) ? editFormData["Payment Status"].join(', ') : (editFormData["Payment Status"] || '')}
                                            onChange={(e) => handleEditInputChange("Payment Status", e.target.value)}
                                            placeholder="Enter payment status"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Payment Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                                        <Input
                                            value={String(editFormData["Payment Amount"] || '')}
                                            onChange={(e) => handleEditInputChange("Payment Amount", e.target.value)}
                                            placeholder="Enter payment amount"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Shipping Payment */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Payment</label>
                                        <Input
                                            value={String(editFormData["Shipping Payment"] || '')}
                                            onChange={(e) => handleEditInputChange("Shipping Payment", e.target.value)}
                                            placeholder="Enter shipping payment"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Shipping Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Status</label>
                                        <Input
                                            value={editFormData["Shipping Status"] || ''}
                                            onChange={(e) => handleEditInputChange("Shipping Status", e.target.value)}
                                            placeholder="Enter shipping status"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Tracking Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                                        <Input
                                            value={editFormData["Tracking Number"] || ''}
                                            onChange={(e) => handleEditInputChange("Tracking Number", e.target.value)}
                                            placeholder="Enter tracking number"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Date Delivered */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Delivered</label>
                                        <Input
                                            value={editFormData["Date Delivered"] || ''}
                                            onChange={(e) => handleEditInputChange("Date Delivered", e.target.value)}
                                            placeholder="Enter delivery date"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Pickup or Delivery */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Pickup or Delivery</label>
                                        <Input
                                            value={editFormData["Pickup or Delivery"] || ''}
                                            onChange={(e) => handleEditInputChange("Pickup or Delivery", e.target.value)}
                                            placeholder="Enter delivery method"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Referred By */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Referred By</label>
                                        <Input
                                            value={editFormData["Referred By"] || ''}
                                            onChange={(e) => handleEditInputChange("Referred By", e.target.value)}
                                            placeholder="Enter referral source"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Patient Shipping Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Patient Shipping Address</label>
                                        <Input
                                            value={editFormData["Patient Shipping Address"] || ''}
                                            onChange={(e) => handleEditInputChange("Patient Shipping Address", e.target.value)}
                                            placeholder="Enter shipping address"
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                                    <Button
                                        variant="bordered"
                                        onClick={handleCloseEditModal}
                                        className="px-6 py-2"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        color="primary"
                                        onClick={handleSavePatient}
                                        disabled={isSaving}
                                        className="px-6 py-2"
                                        startContent={isSaving ? <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> : <Icon icon="lucide:save" className="w-4 h-4" />}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
};

export default AdminPage;