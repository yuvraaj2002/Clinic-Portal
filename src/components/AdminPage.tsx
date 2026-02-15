import React from 'react';
import { Button, Card, CardBody, Input, Pagination } from "@heroui/react";
import { Icon } from "@iconify/react";
import { getActiveNonAdminProviders, ActiveNonAdminProvidersResponse, getPatients, PatientsResponse, PatientData, updateContactOnly, addHistoricalData } from '../utils/api';
import HistoricalDataModal from './HistoricalDataModal';
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
    // NOTE: These state variables are PER-USER because:
    // 1. Each user has their own browser session
    // 2. Each user has their own authentication context
    // 3. Data is fetched per user based on their provider_tag
    // 4. If same user opens multiple tabs, each tab has its own component instance
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [editingPatient, setEditingPatient] = React.useState<PatientData | null>(null);
    const [originalPatientData, setOriginalPatientData] = React.useState<PatientData | null>(null);
    const [updatedPatientData, setUpdatedPatientData] = React.useState<PatientData | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);

    // Historical data modal state
    const [showHistoricalModal, setShowHistoricalModal] = React.useState(false);
    const [historicalContactId, setHistoricalContactId] = React.useState<string>('');
    const [historicalPatientName, setHistoricalPatientName] = React.useState<string>('');

    // Confirmation modal state
    const [showUpdateConfirmation, setShowUpdateConfirmation] = React.useState(false);
    const [showHistoricalConfirmation, setShowHistoricalConfirmation] = React.useState(false);

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

        // Store original data (immutable copy)
        setOriginalPatientData({ ...patient });

        // Initialize updated data (mutable copy)
        setUpdatedPatientData({ ...patient });

        setShowEditModal(true);
    };

    // Reset all fields to original values
    const resetToOriginal = () => {
        if (originalPatientData) {
            setUpdatedPatientData({ ...originalPatientData });
        }
    };

    // Handle form input changes
    const handleEditInputChange = (field: string, value: string) => {
        updateField(field, value);
    };

    // Check if a field has been modified
    const isFieldModified = (field: string): boolean => {
        if (!originalPatientData || !updatedPatientData) return false;
        const originalValue = originalPatientData[field as keyof PatientData];
        const currentValue = updatedPatientData[field as keyof PatientData];

        // Handle array fields (like Payment Status)
        if (Array.isArray(originalValue) && Array.isArray(currentValue)) {
            return JSON.stringify(originalValue) !== JSON.stringify(currentValue);
        }

        // Handle string comparison
        return String(originalValue || '') !== String(currentValue || '');
    };

    // Get the current value for a field (from updated data)
    const getFieldValue = (field: string): string => {
        if (!updatedPatientData) return '';
        const value = updatedPatientData[field as keyof PatientData];

        // Handle array fields (like Payment Status)
        if (Array.isArray(value)) {
            return value.join(', ');
        }

        return String(value || '');
    };

    // Update a specific field in the updated data
    const updateField = (field: string, value: string) => {
        if (!updatedPatientData) return;

        setUpdatedPatientData(prev => {
            if (!prev) return prev;

            // Handle array fields (like Payment Status)
            if (field === "Payment Status") {
                return {
                    ...prev,
                    [field]: value.split(',').map(item => item.trim()).filter(item => item)
                };
            }

            return {
                ...prev,
                [field]: value
            };
        });
    };

    // Get only the modified fields for API payload
    const getModifiedFields = (): Record<string, any> => {
        if (!originalPatientData || !updatedPatientData) return {};

        const modifiedFields: Record<string, any> = {};
        const allFields = [
            "Patient Name", "Phone Number", "DOB", "Date Ordered", "Order Type",
            "Medication Ordered", "Payment Status", "Payment Amount", "Shipping Payment",
            "Shipping Status", "Tracking Number", "Date Delivered", "Pickup or Delivery",
            "Referred By", "Patient Shipping Address"
        ];

        allFields.forEach(field => {
            if (isFieldModified(field)) {
                const key = field as keyof PatientData;
                modifiedFields[field] = updatedPatientData[key];
            }
        });

        return modifiedFields;
    };

    // Handle save patient changes (Scenario 1: Update Current Data)
    const handleSavePatient = async () => {
        if (!editingPatient || !updatedPatientData) return;

        // Check if contact_id exists
        if (!editingPatient.contact_id) {
            console.error('Contact ID is missing from patient data');
            return;
        }

        setIsSaving(true);
        try {
            // Get only the modified fields
            const modifiedFields = getModifiedFields();

            if (Object.keys(modifiedFields).length === 0) {
                console.log('No fields were modified, skipping update');
                setShowEditModal(false);
                setEditingPatient(null);
                setOriginalPatientData(null);
                setUpdatedPatientData(null);
                return;
            }

            console.log('Updating contact with modified fields:', modifiedFields);
            console.log('Contact ID:', editingPatient.contact_id);

            // Call API to update contact data only
            await updateContactOnly(editingPatient.contact_id, modifiedFields);

            console.log('Contact update successful');

            // Close modal and reset state
            setShowEditModal(false);
            setEditingPatient(null);
            setOriginalPatientData(null);
            setUpdatedPatientData(null);

            // Refresh the patient list
            if (selectedProvider) {
                const providerTagToUse = user?.provider_admin ? (selectedProviderTag || selectedProvider) : selectedProvider;
                fetchPatients(providerTagToUse, dateFilter, customDateRange);
            }
        } catch (error) {
            console.error('Failed to save patient changes:', error);
            // You could show an error toast here
        } finally {
            setIsSaving(false);
        }
    };

    // Handle add historical data (Scenario 2: Add Historical Data)
    const handleAddHistoricalData = async () => {
        if (!editingPatient || !updatedPatientData || !originalPatientData) return;

        // Check if contact_id exists
        if (!editingPatient.contact_id) {
            console.error('Contact ID is missing from patient data');
            return;
        }

        setIsSaving(true);
        try {
            // Get only the modified fields for update_data (new values to GoHighLevel)
            const modifiedFields = getModifiedFields();

            // Use ORIGINAL data for add_data (historical record in database)
            const addData = { ...originalPatientData };

            console.log('Adding historical data:');
            console.log('Contact ID:', editingPatient.contact_id);
            console.log('Update data (modified fields - NEW values for GHL):', modifiedFields);
            console.log('Add data (ORIGINAL values for database):', addData);

            // Call API to add historical data
            await addHistoricalData(editingPatient.contact_id, modifiedFields, addData);

            console.log('Historical data added successfully');

            // Close modal and reset state
            setShowEditModal(false);
            setEditingPatient(null);
            setOriginalPatientData(null);
            setUpdatedPatientData(null);

            // Refresh the patient list
            if (selectedProvider) {
                const providerTagToUse = user?.provider_admin ? (selectedProviderTag || selectedProvider) : selectedProvider;
                fetchPatients(providerTagToUse, dateFilter, customDateRange);
            }
        } catch (error) {
            console.error('Failed to add historical data:', error);
            // You could show an error toast here
        } finally {
            setIsSaving(false);
        }
    };

    // Handle close edit modal
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingPatient(null);
        setOriginalPatientData(null);
        setUpdatedPatientData(null);
    };

    // Handle view historical data
    const handleViewHistoricalData = (patient: PatientData) => {
        if (!patient.contact_id) {
            console.error('Contact ID is missing from patient data');
            return;
        }

        setHistoricalContactId(patient.contact_id);
        setHistoricalPatientName(patient["Patient Name"] || 'Unknown Patient');
        setShowHistoricalModal(true);
    };

    // Handle close historical data modal
    const handleCloseHistoricalModal = () => {
        setShowHistoricalModal(false);
        setHistoricalContactId('');
        setHistoricalPatientName('');
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
                                                            Provider tags for your account ({uniqueProviderTags.length} total)
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
                                                        <div className="ml-3 flex space-x-2">
                                                            {/* Historical Data Icon */}
                                                            <div
                                                                className="w-10 h-10 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewHistoricalData(patient);
                                                                }}
                                                                title="View Historical Data"
                                                            >
                                                                <Icon icon="lucide:history" className="w-5 h-5 text-white" />
                                                            </div>

                                                            {/* Edit Icon */}
                                                            <div
                                                                className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditPatient(patient);
                                                                }}
                                                                title="Edit Patient"
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
                                {/* Modification Summary */}
                                {(() => {
                                    const modifiedFields = [
                                        "Patient Name", "Phone Number", "DOB", "Date Ordered", "Order Type",
                                        "Medication Ordered", "Payment Status", "Payment Amount", "Shipping Payment",
                                        "Shipping Status", "Tracking Number", "Date Delivered", "Pickup or Delivery",
                                        "Referred By", "Patient Shipping Address"
                                    ].filter(field => isFieldModified(field));

                                    return modifiedFields.length > 0 && (
                                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Icon icon="lucide:alert-triangle" className="w-5 h-5 text-yellow-600 mr-2" />
                                                    <span className="text-sm font-medium text-yellow-800">
                                                        {modifiedFields.length} field{modifiedFields.length !== 1 ? 's' : ''} modified
                                                    </span>
                                                </div>
                                                <div className="text-xs text-yellow-600">
                                                    Original vs Updated Data
                                                </div>
                                            </div>

                                            {/* Show detailed changes */}
                                            <div className="mt-3 space-y-2">
                                                {modifiedFields.slice(0, 3).map(field => (
                                                    <div key={field} className="text-xs bg-white p-2 rounded border">
                                                        <div className="font-medium text-gray-700">{field}:</div>
                                                        <div className="text-gray-600">
                                                            <span className="text-red-600">Original: </span>
                                                            {String(originalPatientData?.[field as keyof PatientData] || 'N/A')}
                                                        </div>
                                                        <div className="text-gray-600">
                                                            <span className="text-green-600">Updated: </span>
                                                            {getFieldValue(field)}
                                                        </div>
                                                    </div>
                                                ))}
                                                {modifiedFields.length > 3 && (
                                                    <div className="text-xs text-yellow-600">
                                                        ... and {modifiedFields.length - 3} more fields
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Patient Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Patient Name
                                            {isFieldModified("Patient Name") && (
                                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <Icon icon="lucide:edit" className="w-3 h-3 mr-1" />
                                                    Modified
                                                </span>
                                            )}
                                        </label>
                                        <Input
                                            value={getFieldValue("Patient Name")}
                                            onChange={(e) => handleEditInputChange("Patient Name", e.target.value)}
                                            placeholder="Enter patient name"
                                            className={`w-full ${isFieldModified("Patient Name") ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                            {isFieldModified("Phone Number") && (
                                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <Icon icon="lucide:edit" className="w-3 h-3 mr-1" />
                                                    Modified
                                                </span>
                                            )}
                                        </label>
                                        <Input
                                            value={getFieldValue("Phone Number")}
                                            onChange={(e) => handleEditInputChange("Phone Number", e.target.value)}
                                            placeholder="Enter phone number"
                                            className={`w-full ${isFieldModified("Phone Number") ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}
                                        />
                                    </div>

                                    {/* DOB */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date of Birth
                                            {isFieldModified("DOB") && (
                                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <Icon icon="lucide:edit" className="w-3 h-3 mr-1" />
                                                    Modified
                                                </span>
                                            )}
                                        </label>
                                        <Input
                                            value={getFieldValue("DOB")}
                                            onChange={(e) => handleEditInputChange("DOB", e.target.value)}
                                            placeholder="MM/DD/YYYY"
                                            className={`w-full ${isFieldModified("DOB") ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}
                                        />
                                    </div>

                                    {/* Date Ordered */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Ordered</label>
                                        <Input
                                            value={getFieldValue("Date Ordered")}
                                            onChange={(e) => handleEditInputChange("Date Ordered", e.target.value)}
                                            placeholder="Enter order date"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Order Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                                        <Input
                                            value={getFieldValue("Order Type")}
                                            onChange={(e) => handleEditInputChange("Order Type", e.target.value)}
                                            placeholder="Enter order type"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Medication Ordered */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Medication Ordered
                                            {isFieldModified("Medication Ordered") && (
                                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <Icon icon="lucide:edit" className="w-3 h-3 mr-1" />
                                                    Modified
                                                </span>
                                            )}
                                        </label>
                                        <Input
                                            value={getFieldValue("Medication Ordered")}
                                            onChange={(e) => handleEditInputChange("Medication Ordered", e.target.value)}
                                            placeholder="Enter medication"
                                            className={`w-full ${isFieldModified("Medication Ordered") ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}
                                        />
                                    </div>

                                    {/* Payment Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                                        <Input
                                            value={getFieldValue("Payment Status")}
                                            onChange={(e) => handleEditInputChange("Payment Status", e.target.value)}
                                            placeholder="Enter payment status"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Payment Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Amount
                                            {isFieldModified("Payment Amount") && (
                                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <Icon icon="lucide:edit" className="w-3 h-3 mr-1" />
                                                    Modified
                                                </span>
                                            )}
                                        </label>
                                        <Input
                                            value={getFieldValue("Payment Amount")}
                                            onChange={(e) => handleEditInputChange("Payment Amount", e.target.value)}
                                            placeholder="Enter payment amount"
                                            className={`w-full ${isFieldModified("Payment Amount") ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}
                                        />
                                    </div>

                                    {/* Shipping Payment */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Payment</label>
                                        <Input
                                            value={getFieldValue("Shipping Payment")}
                                            onChange={(e) => handleEditInputChange("Shipping Payment", e.target.value)}
                                            placeholder="Enter shipping payment"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Shipping Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Status</label>
                                        <Input
                                            value={getFieldValue("Shipping Status")}
                                            onChange={(e) => handleEditInputChange("Shipping Status", e.target.value)}
                                            placeholder="Enter shipping status"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Tracking Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                                        <Input
                                            value={getFieldValue("Tracking Number")}
                                            onChange={(e) => handleEditInputChange("Tracking Number", e.target.value)}
                                            placeholder="Enter tracking number"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Date Delivered */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Delivered</label>
                                        <Input
                                            value={getFieldValue("Date Delivered")}
                                            onChange={(e) => handleEditInputChange("Date Delivered", e.target.value)}
                                            placeholder="Enter delivery date"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Pickup or Delivery */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Pickup or Delivery</label>
                                        <Input
                                            value={getFieldValue("Pickup or Delivery")}
                                            onChange={(e) => handleEditInputChange("Pickup or Delivery", e.target.value)}
                                            placeholder="Enter delivery method"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Referred By */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Referred By</label>
                                        <Input
                                            value={getFieldValue("Referred By")}
                                            onChange={(e) => handleEditInputChange("Referred By", e.target.value)}
                                            placeholder="Enter referral source"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Patient Shipping Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Patient Shipping Address</label>
                                        <Input
                                            value={getFieldValue("Patient Shipping Address")}
                                            onChange={(e) => handleEditInputChange("Patient Shipping Address", e.target.value)}
                                            placeholder="Enter shipping address"
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                                    {/* Reset Button */}
                                    <Button
                                        variant="light"
                                        onClick={resetToOriginal}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                        startContent={<Icon icon="lucide:undo" className="w-4 h-4" />}
                                    >
                                        Reset to Original
                                    </Button>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-3">
                                        <Button
                                            variant="bordered"
                                            onClick={() => setShowUpdateConfirmation(true)}
                                            disabled={isSaving}
                                            className="px-6 py-2 min-w-[180px]"
                                            startContent={<Icon icon="lucide:edit" className="w-4 h-4" />}
                                        >
                                            Update Current Data
                                        </Button>
                                        <Button
                                            color="primary"
                                            onClick={() => setShowHistoricalConfirmation(true)}
                                            disabled={isSaving}
                                            className="px-6 py-2 min-w-[180px] bg-blue-600 hover:bg-blue-700"
                                            startContent={<Icon icon="lucide:history" className="w-4 h-4" />}
                                        >
                                            Add Historical Data
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Historical Data Modal */}
                <HistoricalDataModal
                    isOpen={showHistoricalModal}
                    onClose={handleCloseHistoricalModal}
                    contactId={historicalContactId}
                    patientName={historicalPatientName}
                />

                {/* Update Current Data Confirmation Modal */}
                {showUpdateConfirmation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon icon="lucide:edit" className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Update Current Data</h3>
                                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                    The changes you made will be updated directly in <strong>GoHighLevel</strong>.
                                    This will modify the existing contact information.
                                </p>
                                <div className="flex space-x-3">
                                    <Button
                                        variant="bordered"
                                        onClick={() => setShowUpdateConfirmation(false)}
                                        className="flex-1 px-4 py-2"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            setShowUpdateConfirmation(false);
                                            handleSavePatient();
                                        }}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700"
                                        startContent={<Icon icon="lucide:check" className="w-4 h-4" />}
                                    >
                                        Confirm Update
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Historical Data Confirmation Modal */}
                {showHistoricalConfirmation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon icon="lucide:history" className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Add Historical Data</h3>
                                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                    Your <strong>new values</strong> will update the contact in <strong>GoHighLevel</strong>,
                                    and the <strong>original data</strong> (before your changes) will be saved in the
                                    <strong>database</strong> as historical order data.
                                </p>
                                <div className="flex space-x-3">
                                    <Button
                                        variant="bordered"
                                        onClick={() => setShowHistoricalConfirmation(false)}
                                        className="flex-1 px-4 py-2"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            setShowHistoricalConfirmation(false);
                                            handleAddHistoricalData();
                                        }}
                                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700"
                                        startContent={<Icon icon="lucide:check" className="w-4 h-4" />}
                                    >
                                        Confirm & Add
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