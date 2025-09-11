import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { getPatients, PatientsResponse, PatientData } from '../utils/api';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { DateRangePicker } from './ui/date-range-picker';
import AuthGuard from './AuthGuard';

const ProviderPatientsPage: React.FC = () => {
    const { providerTag } = useParams<{ providerTag: string }>();
    const history = useHistory();

    // State for API data
    const [patientsData, setPatientsData] = React.useState<PatientsResponse | null>(null);
    const [patients, setPatients] = React.useState<PatientData[]>([]);
    const [totalPatients, setTotalPatients] = React.useState(0);
    const [patientsLoading, setPatientsLoading] = React.useState(true);
    const [patientsError, setPatientsError] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [dateFilter, setDateFilter] = React.useState<string>('month');
    const [customDateRange, setCustomDateRange] = React.useState<{ from: Date | null, to: Date | null }>({ from: null, to: null });
    const [currentPage, setCurrentPage] = React.useState(1);

    const patientsPerPage = 20;

    // Function to fetch patients from API
    const fetchPatients = async (filter?: string, customRange?: { from: Date | null, to: Date | null }) => {
        try {
            setPatientsLoading(true);
            setPatientsError(null);

            console.log('Fetching patients for provider:', providerTag, 'Filter:', filter, 'Custom Range:', customRange);
            const filterParam = filter && filter !== 'all' ? filter : null;
            const response = await getPatients(filterParam, customRange);
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

    // Load patients when component mounts
    React.useEffect(() => {
        if (providerTag) {
            fetchPatients(dateFilter, customDateRange);
        }
    }, [providerTag]);

    // Fetch patients when filter changes
    React.useEffect(() => {
        if (providerTag) {
            fetchPatients(dateFilter, customDateRange);
            setCurrentPage(1); // Reset to first page when filter changes
        }
    }, [dateFilter, customDateRange]);

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

    // Format currency
    const formatCurrency = (amount: string | number | null | undefined): string => {
        if (!amount) return '$0.00';
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
    };

    // Format date
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    // Get payment status display
    const getPaymentStatusDisplay = (status: any) => {
        if (Array.isArray(status)) {
            return status.join(', ');
        }
        return status || 'Unknown';
    };

    // Get shipping status display
    const getShippingStatusDisplay = (status: any) => {
        if (Array.isArray(status)) {
            return status.join(', ');
        }
        return status || 'Unknown';
    };

    // Get status color
    const getStatusColor = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('paid') || lowerStatus.includes('delivered')) {
            return 'bg-green-100 text-green-800 border-green-200';
        } else if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        } else if (lowerStatus.includes('failed') || lowerStatus.includes('cancelled')) {
            return 'bg-red-100 text-red-800 border-red-200';
        }
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Handle patient click
    const handlePatientClick = (patient: PatientData) => {
        // For now, just log the patient - can be extended later
        console.log('Patient clicked:', patient);
    };

    if (patientsLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading patients...</p>
                </div>
            </div>
        );
    }

    if (patientsError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-white flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="lucide:alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Patients</h2>
                    <p className="text-gray-600 mb-4">{patientsError}</p>
                    <Button
                        color="primary"
                        onClick={() => fetchPatients(dateFilter, customDateRange)}
                        startContent={<Icon icon="lucide:refresh-cw" />}
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-background to-white">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 shadow-sm">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    onClick={() => history.goBack()}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <Icon icon="lucide:arrow-left" className="w-5 h-5" />
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Patients - {providerTag}</h1>
                                    <p className="text-gray-600 text-sm">
                                        {totalPatients} total patients
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

                {/* Main Content */}
                <main className="container mx-auto px-6 py-8 max-w-7xl">
                    {/* Filters and Search */}
                    <div className="mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            {/* Date Filter Tabs */}
                            <div className="mb-6">
                                <Tabs
                                    value={dateFilter}
                                    onValueChange={(value) => {
                                        setDateFilter(value);
                                        if (value !== 'custom') {
                                            setCustomDateRange({ from: null, to: null });
                                        }
                                    }}
                                >
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
                            </div>

                            {/* Custom Date Range Picker */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="custom-range"
                                        name="dateFilter"
                                        value="custom"
                                        checked={dateFilter === 'custom'}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                    />
                                    <label htmlFor="custom-range" className="text-sm font-medium text-gray-700">
                                        Custom Date Range:
                                    </label>
                                </div>
                                {dateFilter === 'custom' && (
                                    <DateRangePicker
                                        value={customDateRange}
                                        onChange={setCustomDateRange}
                                    />
                                )}
                            </div>

                            {/* Search Bar */}
                            <div className="mt-6">
                                <div className="relative">
                                    <Icon
                                        icon="lucide:search"
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search patients..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Patients Grid */}
                    {filteredPatients.length === 0 ? (
                        <div className="text-center py-12">
                            <Icon icon="lucide:users" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                            <p className="text-gray-500">
                                {searchQuery ? 'Try adjusting your search terms' : 'No patients match the current filter'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Patients Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {currentPatients.map((patient, index) => (
                                    <div
                                        key={patient.contact_id || index}
                                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handlePatientClick(patient)}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Icon icon="lucide:user" className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {patient["Patient Name"] || 'Unknown Patient'}
                                                </h3>
                                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-2">
                                                        <Icon icon="lucide:calendar" className="w-4 h-4" />
                                                        <span>Order Date: {formatDate(patient["Date Ordered"])}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Icon icon="lucide:phone" className="w-4 h-4" />
                                                        <span>{patient["Phone Number"] || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Icon icon="lucide:pill" className="w-4 h-4" />
                                                        <span className="truncate">{patient["Medication Ordered"] || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Icon icon="lucide:package" className="w-4 h-4" />
                                                        <span>{patient["Order Type"] || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Icon icon="lucide:calendar-days" className="w-4 h-4" />
                                                        <span>DOB: {patient.DOB || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Icon icon="lucide:truck" className="w-4 h-4" />
                                                        <span>{patient["Pickup or Delivery"] || 'N/A'}</span>
                                                    </div>
                                                </div>

                                                {/* Status Pills */}
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(getPaymentStatusDisplay(patient["Payment Status"]))}`}>
                                                        Payment: {getPaymentStatusDisplay(patient["Payment Status"])} - {formatCurrency(patient["Payment Amount"])}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(getShippingStatusDisplay(patient["Shipping Status"]))}`}>
                                                        Shipping: {getShippingStatusDisplay(patient["Shipping Status"])} - {formatCurrency(patient["Shipping Payment"])}
                                                    </span>
                                                </div>

                                                {/* View Details Link */}
                                                <div className="mt-3 flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium">
                                                    <span>View Invoices or Receipts</span>
                                                    <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center space-x-2">
                                    <Button
                                        isIconOnly
                                        variant="light"
                                        isDisabled={currentPage === 1}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                    >
                                        <Icon icon="lucide:chevron-left" />
                                    </Button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "solid" : "light"}
                                            color={currentPage === page ? "primary" : "default"}
                                            onClick={() => setCurrentPage(page)}
                                            className="min-w-10"
                                        >
                                            {page}
                                        </Button>
                                    ))}

                                    <Button
                                        isIconOnly
                                        variant="light"
                                        isDisabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                    >
                                        <Icon icon="lucide:chevron-right" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </AuthGuard>
    );
};

export default ProviderPatientsPage;
