import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Auth from './components/Auth';
import SetPassword from './components/SetPassword';
import ResetPassword from './components/ResetPassword';
import AdminPage from './components/AdminPage';
import { useAuth } from './contexts/AuthContext';
import { getPatients, getContactDetails, Patient, ContactDetailsResponse } from './utils/api';

// Safely render any value coming from contact_data
const renderValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined) return <span className="text-gray-500 text-sm">Not available</span>;
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return <span className="text-gray-700 text-sm break-all">{JSON.stringify(value)}</span>;
  return String(value);
};

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

const App: React.FC = () => {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showWelcomeCard, setShowWelcomeCard] = React.useState(false);

  // State for API data
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = React.useState(0);
  const [patientsLoading, setPatientsLoading] = React.useState(true);
  const [patientsError, setPatientsError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [contactDetails, setContactDetails] = React.useState<Record<string, ContactDetailsResponse>>({});
  const [loadingDetails, setLoadingDetails] = React.useState<Set<string>>(new Set());
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);

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

  // Function to fetch patients from API
  const fetchPatients = async () => {
    try {
      setPatientsLoading(true);
      setPatientsError(null);

      // For non-admin users, use their name as provider parameter
      let providerName;
      if (user && !user.admin_access) {
        providerName = user.name;
      }

      console.log('Fetching patients for user:', user?.name, 'Admin:', user?.admin_access);
      const response = await getPatients(providerName);
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
      fetchPatients();
      // Show welcome card for new login/signup
      setShowWelcomeCard(true);
      // Hide welcome card after 5 seconds
      setTimeout(() => {
        setShowWelcomeCard(false);
      }, 5000);
    }
  }, [isAuthenticated, user]);

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

  const openDetailsModal = async (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);

    // Fetch contact details if not already loaded
    if (!contactDetails[patient.opportunity_id]) {
      await fetchContactDetails(patient.opportunity_id, patient.contact.id);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPatient(null);
  };

  const fetchContactDetails = async (opportunityId: string, contactId: string) => {
    // Don't fetch if already loaded
    if (contactDetails[opportunityId]) return;

    try {
      setLoadingDetails(prev => new Set(prev).add(opportunityId));
      const response = await getContactDetails(contactId);
      setContactDetails(prev => ({
        ...prev,
        [opportunityId]: response
      }));
    } catch (error) {
      console.error('Failed to fetch contact details:', error);
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(opportunityId);
        return newSet;
      });
    }
  };

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient =>
    patient.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (patient.contact.phone && patient.contact.phone.includes(searchQuery)) ||
    (patient.contact.email && patient.contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + patientsPerPage);

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
                    <img
                      src="/ohc-logo-full.png"
                      alt="OHC Pharmacy Logo"
                      className="h-8 w-auto"
                    />
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
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Patients</h2>
                          <p className="text-gray-600 text-sm mt-1">
                            {user?.provider_admin
                              ? "Manage and view patient records"
                              : `Your patients (${totalPatients} total)`
                            }
                          </p>
                        </div>
                        <div className="flex space-x-3">
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

                      {/* Premium Compact Table Design */}
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <Table
                          aria-label="Patients table"
                          removeWrapper
                          classNames={{
                            wrapper: "bg-white",
                            thead: "bg-background",
                            th: "bg-background text-foreground font-semibold text-xs uppercase tracking-wider py-3 px-4 border-b border-border",
                            td: "py-3 px-4 border-b border-border text-foreground text-sm",
                            tr: "hover:bg-primary-50 transition-colors duration-200",
                          }}
                        >
                          <TableHeader>
                            <TableColumn className="font-semibold">FULL NAME</TableColumn>
                            <TableColumn className="font-semibold">DETAILS</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {patientsLoading ? (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center py-8">
                                  <div className="flex items-center justify-center">
                                    <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin text-primary-600 mr-2" />
                                    <span className="text-gray-600">Loading patients...</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : patientsError ? (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center py-8">
                                  <div className="flex items-center justify-center text-red-600">
                                    <Icon icon="lucide:alert-circle" className="w-6 h-6 mr-2" />
                                    <span>{patientsError}</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : currentPatients.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center py-8">
                                  <div className="flex items-center justify-center text-gray-600">
                                    <Icon icon="lucide:users" className="w-6 h-6 mr-2" />
                                    <span>No patients found</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : (
                              currentPatients.map((patient) => (
                                <TableRow key={patient.opportunity_id} className="hover:bg-primary-50 transition-colors duration-200">
                                  <TableCell className="font-medium">{patient.contact.name}</TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      variant="light"
                                      className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
                                      startContent={<Icon icon="lucide:eye" className="w-4 h-4" />}
                                      onClick={() => openDetailsModal(patient)}
                                    >
                                      Details
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>

                        {/* Premium Pagination */}
                        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100">
                          <div className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {Math.min(startIndex + patientsPerPage, filteredPatients.length)} of {filteredPatients.length} patients
                            {searchQuery && ` (filtered from ${totalPatients} total)`}
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
                          <h2 className="text-2xl font-bold">Patient Details</h2>
                          <p className="text-white/80 mt-1">{selectedPatient.contact.name}</p>
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

                    {/* Modal Body */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                      {loadingDetails.has(selectedPatient.opportunity_id) ? (
                        <div className="flex items-center justify-center py-12">
                          <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-primary-600 mr-3" />
                          <span className="text-gray-600 font-medium text-lg">Loading patient details...</span>
                        </div>
                      ) : contactDetails[selectedPatient.opportunity_id] ? (
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
                                  <span className="text-sm font-medium text-gray-600 block mb-1">Patient Name:</span>
                                  <p className="text-lg font-semibold text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Patient Name"])}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-600 block mb-1">Email:</span>
                                  <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.Email)}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-600 block mb-1">Phone Number:</span>
                                  <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Phone Number"])}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-600 block mb-1">Date of Birth:</span>
                                  <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.DOB)}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <span className="text-sm font-medium text-gray-600 block mb-1">Order Type:</span>
                                  <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Order Type"])}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-600 block mb-1">Date Ordered:</span>
                                  <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Date Ordered"])}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-600 block mb-1">Medication Ordered:</span>
                                  <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Medication Ordered"])}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-600 block mb-1">Referred By:</span>
                                  <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Referred By"])}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order & Payment Information */}
                          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <Icon icon="lucide:credit-card" className="w-5 h-5 mr-2 text-primary-600" />
                                Order & Payment Information
                              </h3>
                            </div>
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Payment Status:</span>
                                    <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Payment Status"])}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Payment Amount:</span>
                                    <p className="text-gray-900">{formatCurrency(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Payment Amount"])}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Invoice/Receipt:</span>
                                    <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Invoice/Receipt"])}</p>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Shipping Payment:</span>
                                    <p className="text-gray-900">{formatCurrency(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Shipping Payment"])}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Pickup or Delivery:</span>
                                    <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Pickup or Delivery"])}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Shipping Information */}
                          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <Icon icon="lucide:truck" className="w-5 h-5 mr-2 text-primary-600" />
                                Shipping Information
                              </h3>
                            </div>
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Shipping Status:</span>
                                    <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Shipping Status"])}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Tracking Number:</span>
                                    <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Tracking Number"])}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Date Delivered:</span>
                                    <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Date Delivered"])}</p>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Patient Shipping Address:</span>
                                    <p className="text-gray-900">{renderValue(contactDetails[selectedPatient.opportunity_id]?.contact_data?.["Patient Shipping Address"])}</p>
                                  </div>
                                </div>
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
    </Router>
  );
};

export default App;
