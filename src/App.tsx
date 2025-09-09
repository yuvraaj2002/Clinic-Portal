import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, Input, Button, Pagination, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Auth from './components/Auth';
import SetPassword from './components/SetPassword';
import ResetPassword from './components/ResetPassword';
import AdminPage from './components/AdminPage';
import { useAuth } from './contexts/AuthContext';
import { getPatients, getContactReceipts, PatientData, PatientsResponse, ReceiptData } from './utils/api';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { DateRangePicker } from './components/ui/date-range-picker';


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


const App: React.FC = () => {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showWelcomeCard, setShowWelcomeCard] = React.useState(false);

  // State for API data
  const [patientsData, setPatientsData] = React.useState<PatientsResponse | null>(null);
  const [patients, setPatients] = React.useState<PatientData[]>([]);
  const [totalPatients, setTotalPatients] = React.useState(0);
  const [patientsLoading, setPatientsLoading] = React.useState(true);
  const [patientsError, setPatientsError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState<string>('month');
  const [customDateRange, setCustomDateRange] = React.useState<{ from: Date | null, to: Date | null }>({ from: null, to: null });
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<PatientData | null>(null);
  const [receipts, setReceipts] = React.useState<ReceiptData[]>([]);
  const [receiptsLoading, setReceiptsLoading] = React.useState(false);
  const [receiptsError, setReceiptsError] = React.useState<string | null>(null);

  // Export functionality state
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const [showExportModal, setShowExportModal] = React.useState(false);

  // Reset to first page when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    description: '',
    stock: '',
  });
  const patientsPerPage = 20;

  // Function to create Excel-compatible HTML content from patient data
  const createExcelFromPatientData = (patientData: PatientData[]): string => {
    if (patientData.length === 0) return '';

    // Define Excel headers
    const headers = [
      'Patient Name',
      'Email',
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
      patient.Email || '',
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

  // Function to fetch patients from API
  const fetchPatients = async (filter?: string, customRange?: { from: Date | null, to: Date | null }) => {
    try {
      setPatientsLoading(true);
      setPatientsError(null);

      console.log('Fetching patients for user:', user?.name, 'Admin:', user?.admin_access, 'Filter:', filter, 'Custom Range:', customRange);
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
    if (isAuthenticated && user) {
      fetchPatients(dateFilter, customDateRange);
      // Show welcome card for new login/signup
      setShowWelcomeCard(true);
      // Hide welcome card after 5 seconds
      setTimeout(() => {
        setShowWelcomeCard(false);
      }, 5000);
    }
  }, [isAuthenticated, user]);

  // Fetch patients when filter changes
  React.useEffect(() => {
    if (isAuthenticated && user) {
      fetchPatients(dateFilter, customDateRange);
      setCurrentPage(1); // Reset to first page when filter changes
    }
  }, [dateFilter, customDateRange]);

  const handleAuthSuccess = () => {
    // Authentication is now handled by the context
    console.log('Authentication successful');
    // Show welcome card for new authentication
    setShowWelcomeCard(true);
    // Hide welcome card after 5 seconds
    setTimeout(() => {
      setShowWelcomeCard(false);
    }, 5000);
  };

  const handleLogout = async () => {
    // Clear stored authentication data using the API utility
    await logout();
  };



  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically handle the form submission
    closeSidebar();
  };

  const openDetailsModal = async (patient: PatientData) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);

    // Fetch receipts using the contact_id
    if (patient.contact_id) {
      await fetchReceipts(patient.contact_id);
    } else {
      setReceipts([]);
      setReceiptsError('Contact ID is missing from patient data.');
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPatient(null);
    setReceipts([]);
    setReceiptsError(null);
  };

  const fetchReceipts = async (contactId: string) => {
    try {
      setReceiptsLoading(true);
      setReceiptsError(null);

      console.log('Fetching receipts for contact ID:', contactId);
      const response = await getContactReceipts(contactId);
      console.log('Receipts response:', response);
      setReceipts(response.receipts);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
      setReceiptsError(error instanceof Error ? error.message : 'Failed to fetch receipts');
      setReceipts([]);
    } finally {
      setReceiptsLoading(false);
    }
  };

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient =>
    patient["Patient Name"].toLowerCase().includes(searchQuery.toLowerCase()) ||
    (patient["Phone Number"] && patient["Phone Number"].includes(searchQuery)) ||
    (patient.Email && patient.Email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + patientsPerPage);

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
      link.download = `patients_${filterInfo}_${timestamp}.xls`;

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

  // Show loading state while auth context is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-clinic-light to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icon icon="lucide:loader-2" className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600 text-sm">Initializing application</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Switch>
        <Route path="/set-password">
          <SetPassword onAuthSuccess={handleAuthSuccess} />
        </Route>

        <Route path="/reset-password">
          <ResetPassword />
        </Route>



        <Route path="/">
          {!isAuthenticated ? (
            <Auth onAuthSuccess={handleAuthSuccess} />
          ) : (
            <div className="min-h-screen bg-gradient-to-br from-background to-white font-sans">
              {/* Premium Header & Navigation */}
              <Navbar maxWidth="full" className="bg-white border-b border-gray-100 shadow-sm">
                <NavbarBrand className="px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <Icon icon="lucide:rocket" className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="font-bold text-foreground text-xl tracking-tight">OHC Pharmacy</h1>
                  </div>
                </NavbarBrand>
                <NavbarContent justify="end" className="px-6">
                  <Button
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    onClick={handleLogout}
                    startContent={<Icon icon="lucide:log-out" className="w-4 h-4" />}
                  >
                    Sign Out
                  </Button>
                </NavbarContent>
              </Navbar>

              {/* Welcome Card */}
              {showWelcomeCard && user && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
                  <Card className="bg-gradient-to-r from-primary-500/90 to-secondary-500/90 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden min-w-80">
                    <CardBody className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <Icon icon="lucide:user-check" className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">
                            Welcome back, {user.name}!
                          </h3>
                          <p className="text-white/80 text-sm">
                            {user.provider_admin
                              ? "You're now logged in to OHC Pharmacy Admin Dashboard"
                              : "You're now logged in to OHC Pharmacy Dashboard"
                            }
                          </p>
                        </div>
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={() => setShowWelcomeCard(false)}
                        >
                          <Icon icon="lucide:x" className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}

              <Switch>
                <Route exact path="/">
                  {user?.provider_admin ? (
                    <AdminPage />
                  ) : (
                    /* Main Content Area */
                    <main className="container mx-auto px-6 py-8 max-w-7xl min-h-[calc(100vh-200px)]">
                      {/* Compact Header Section */}
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Patients</h2>
                          <p className="text-gray-600 text-sm mt-1">
                            {user?.provider_admin
                              ? "Manage and view patient records"
                              : `Your patients (${totalPatients} total)`
                            }
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
                            <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 p-1 rounded-xl shadow-sm">
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
                                <span>Last 7 Days</span>
                              </TabsTrigger>
                              <TabsTrigger
                                value="month"
                                className="flex items-center justify-center space-x-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-500 data-[state=active]:to-secondary-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-white/50 rounded-lg"
                              >
                                <Icon icon="lucide:calendar" className="w-4 h-4" />
                                <span>Last 30 Days</span>
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
                                      <p className="text-sm text-gray-600 mt-0.5">
                                        {patient.Email || 'No email provided'}
                                      </p>
                                    </div>
                                    <div className="ml-3">
                                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-sm">
                                        <Icon icon="lucide:user" className="w-5 h-5 text-white" />
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

                                  {/* Footer - Clickable Receipts Section */}
                                  <div
                                    className="mt-3 pt-3 border-t border-gray-100 cursor-pointer hover:bg-purple-50 -mx-4 px-4 py-1.5 transition-all duration-200 group/receipt"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDetailsModal(patient);
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500 group-hover/receipt:text-purple-600 transition-colors duration-200">View Invoices or Receipts</span>
                                      <Icon icon="lucide:arrow-right" className="w-4 h-4 text-gray-400 group-hover/receipt:text-purple-500 transition-colors duration-200" />
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
                    </main>
                  )}
                </Route>
              </Switch>

              {/* Patient Details Modal */}
              {showDetailsModal && selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold">Invoices & Receipts</h2>
                          <p className="text-white/80 mt-1">Patient: {selectedPatient["Patient Name"]}</p>
                        </div>
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={closeDetailsModal}
                        >
                          <Icon icon="lucide:x" className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Modal Body - Only Receipts */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                      {/* Receipts Section */}
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                          <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <Icon icon="lucide:file-text" className="w-5 h-5 mr-2 text-primary-600" />
                            Documents & Receipts
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">Download or view patient documents</p>
                        </div>
                        <div className="p-6">
                          {receiptsLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-primary-600 mr-3" />
                              <span className="text-gray-600 font-medium text-lg">Loading receipts...</span>
                            </div>
                          ) : receiptsError ? (
                            <div className="flex items-center justify-center py-12 text-red-600">
                              <Icon icon="lucide:alert-circle" className="w-8 h-8 mr-3" />
                              <div className="text-center">
                                <span className="text-lg font-medium block">Failed to load receipts</span>
                                <span className="text-sm text-red-500 mt-1">{receiptsError}</span>
                              </div>
                            </div>
                          ) : receipts.length === 0 ? (
                            <div className="flex items-center justify-center py-12 text-gray-500">
                              <Icon icon="lucide:file-x" className="w-8 h-8 mr-3" />
                              <span className="text-lg">No receipts available for this patient</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {receipts.map((receipt, index) => (
                                <div key={index} className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-300">
                                  <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                                      <Icon icon="lucide:file-text" className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 text-base mb-4 group-hover:text-primary-600 transition-colors duration-200 break-words">
                                      {receipt.original_name}
                                    </h4>
                                    <a
                                      href={receipt.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-6 py-3 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors duration-200 shadow-sm hover:shadow-md"
                                    >
                                      <Icon icon="lucide:external-link" className="w-4 h-4 mr-2" />
                                      View Document
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sidebar Modal */}
              {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
                  <div className="bg-white w-96 h-full shadow-2xl transform transition-transform duration-300 ease-in-out">
                    <div className="p-6 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[gray-700]">
                          Add New Patient
                        </h2>
                        <Button
                          isIconOnly
                          variant="light"
                          onClick={closeSidebar}
                          className="text-[gray-700] hover:text-[clinic-purple-600]"
                        >
                          <Icon icon="lucide:x" className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                        <div className="flex-1 space-y-4">
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                label="First Name"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                required
                                classNames={{
                                  label: "text-[gray-700] font-medium",
                                  input: "text-[gray-700] placeholder-gray-400 focus:outline-none",
                                  inputWrapper: "bg-white border border-gray-200 hover:border-[clinic-purple-600] focus-within:border-[clinic-purple-600] focus-within:ring-1 focus-within:ring-[clinic-purple-600]/20 focus:outline-none focus:ring-0",
                                  innerWrapper: "focus:outline-none focus:ring-0",
                                  mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:user" className="text-[clinic-purple-600] w-4 h-4" />}
                              />
                              <Input
                                label="Last Name"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                required
                                classNames={{
                                  label: "text-[gray-700] font-medium",
                                  input: "text-[gray-700] placeholder-gray-400 focus:outline-none",
                                  inputWrapper: "bg-white border border-gray-200 hover:border-[clinic-purple-600] focus-within:border-[clinic-purple-600] focus-within:ring-1 focus-within:ring-[clinic-purple-600]/20 focus:outline-none focus:ring-0",
                                  innerWrapper: "focus:outline-none focus:ring-0",
                                  mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:user" className="text-[clinic-purple-600] w-4 h-4" />}
                              />
                            </div>
                            <Input
                              label="Email Address"
                              type="email"
                              placeholder="john.doe@example.com"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              required
                              classNames={{
                                label: "text-[gray-700] font-medium",
                                input: "text-[gray-700] placeholder-gray-400 focus:outline-none",
                                inputWrapper: "bg-white border border-gray-200 hover:border-[clinic-purple-600] focus-within:border-[clinic-purple-600] focus-within:ring-1 focus-within:ring-[clinic-purple-600]/20 focus:outline-none focus:ring-0",
                                innerWrapper: "focus:outline-none focus:ring-0",
                                mainWrapper: "focus:outline-none focus:ring-0",
                              }}
                              startContent={<Icon icon="lucide:mail" className="text-[clinic-purple-600] w-4 h-4" />}
                            />
                            <Input
                              label="Phone Number"
                              placeholder="123-456-7890"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              required
                              classNames={{
                                label: "text-[gray-700] font-medium",
                                input: "text-[gray-700] placeholder-gray-400 focus:outline-none",
                                inputWrapper: "bg-white border border-gray-200 hover:border-[clinic-purple-600] focus-within:border-[clinic-purple-600] focus-within:ring-1 focus-within:ring-[clinic-purple-600]/20 focus:outline-none focus:ring-0",
                                innerWrapper: "focus:outline-none focus:ring-0",
                                mainWrapper: "focus:outline-none focus:ring-0",
                              }}
                              startContent={<Icon icon="lucide:phone" className="text-[clinic-purple-600] w-4 h-4" />}
                            />
                            <Input
                              label="Date of Birth"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                              required
                              classNames={{
                                label: "text-[gray-700] font-medium",
                                input: "text-[gray-700] placeholder-gray-400 focus:outline-none",
                                inputWrapper: "bg-white border border-gray-200 hover:border-[clinic-purple-600] focus-within:border-[clinic-purple-600] focus-within:ring-1 focus-within:ring-[clinic-purple-600]/20 focus:outline-none focus:ring-0",
                                innerWrapper: "focus:outline-none focus:ring-0",
                                mainWrapper: "focus:outline-none focus:ring-0",
                              }}
                              startContent={<Icon icon="lucide:calendar" className="text-[clinic-purple-600] w-4 h-4" />}
                            />
                          </>
                        </div>

                        {/* Footer */}
                        <div className="pt-6 border-t border-gray-100">
                          <div className="flex space-x-3">
                            <Button
                              variant="bordered"
                              className="flex-1 border-[clinic-purple-600] text-[clinic-purple-600] hover:bg-[clinic-purple-600]/10"
                              onClick={closeSidebar}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="flex-1 bg-[clinic-purple-600] hover:bg-[clinic-purple-700] text-white"
                            >
                              Add Patient
                            </Button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Premium Footer */}
              <footer className="bg-[clinic-purple-600] text-white mt-16">
                <div className="container mx-auto px-6 py-8 max-w-7xl">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                      <h3 className="text-xl font-bold mb-3">Clinic Portal</h3>
                      <p className="text-white/80 text-sm leading-relaxed">
                        Advanced patient management system designed for modern healthcare practices.
                        Streamline your workflow with our comprehensive patient records and medication tracking.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Quick Links</h4>
                      <ul className="space-y-2 text-sm">
                        <li><a href="#" className="text-white/80 hover:text-white transition-colors">Patients</a></li>
                        <li><a href="#" className="text-white/80 hover:text-white transition-colors">Medications</a></li>
                        <li><a href="#" className="text-white/80 hover:text-white transition-colors">Reports</a></li>
                        <li><a href="#" className="text-white/80 hover:text-white transition-colors">Settings</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Support</h4>
                      <ul className="space-y-2 text-sm">
                        <li><a href="#" className="text-white/80 hover:text-white transition-colors">Help Center</a></li>
                        <li><a href="#" className="text-white/80 hover:text-white transition-colors">Contact Us</a></li>
                        <li><a href="#" className="text-white/80 hover:text-white transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="text-white/80 hover:text-white transition-colors">Terms of Service</a></li>
                      </ul>
                    </div>
                  </div>
                  <div className="border-t border-white/20 mt-8 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <p className="text-white/80 text-sm">
                        © 2024 Clinic Portal. All rights reserved.
                      </p>
                      <div className="flex space-x-6 mt-4 md:mt-0">
                        <Icon icon="lucide:facebook" className="w-5 h-5 text-white/80 hover:text-white cursor-pointer transition-colors" />
                        <Icon icon="lucide:twitter" className="w-5 h-5 text-white/80 hover:text-white cursor-pointer transition-colors" />
                        <Icon icon="lucide:linkedin" className="w-5 h-5 text-white/80 hover:text-white cursor-pointer transition-colors" />
                        <Icon icon="lucide:mail" className="w-5 h-5 text-white/80 hover:text-white cursor-pointer transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          )}
        </Route>
      </Switch>

      {/* Export Success Modal */}
      {
        showExportModal && (
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
        )
      }

      {/* Export Error Display */}
      {
        exportError && (
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
        )
      }
    </Router >
  );
};

export default App;
