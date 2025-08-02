import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, Avatar, Tabs, Tab, Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Auth from './components/Auth';
import SetPassword from './components/SetPassword';
import { useAuth } from './contexts/AuthContext';
import { getPatients, Patient, PatientsResponse } from './utils/api';

// Sample medications data
const medications = [
  { id: 1, name: "Lisinopril", dosage: "10 MG", frequency: "ONCE A DAY", type: "ACE Inhibitor", description: "Used to treat high blood pressure and heart failure", stock: 150, status: "In Stock", color: "green" },
  { id: 2, name: "Amlodipine", dosage: "5 MG", frequency: "ONCE A DAY", type: "Calcium Channel Blocker", description: "Used to treat high blood pressure and angina", stock: 200, status: "In Stock", color: "blue" },
  { id: 3, name: "Metformin", dosage: "500 MG", frequency: "TWICE A DAY", type: "Antidiabetic", description: "Used to treat type 2 diabetes", stock: 300, status: "In Stock", color: "purple" },
  { id: 4, name: "Omeprazole", dosage: "20 MG", frequency: "ONCE A DAY", type: "Proton Pump Inhibitor", description: "Used to treat acid reflux and ulcers", stock: 180, status: "Low Stock", color: "orange" },
  { id: 5, name: "Simvastatin", dosage: "20 MG", frequency: "ONCE A DAY", type: "Statin", description: "Used to lower cholesterol levels", stock: 250, status: "In Stock", color: "indigo" },
  // Add more medications to reach 30 items...
].concat(
  Array.from({ length: 25 }, (_, i) => ({
    id: i + 6,
    name: `Medication ${i + 6}`,
    dosage: `${(i + 1) * 5} MG`,
    frequency: "ONCE A DAY",
    type: "Generic Type",
    description: "Generic medication description",
    stock: 100 + (i * 10),
    status: i % 3 === 0 ? "Low Stock" : "In Stock",
    color: ["green", "blue", "purple", "orange", "indigo"][i % 5]
  }))
);

// Patients will be loaded from API

const App: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState("patients");
  const [currentPage, setCurrentPage] = React.useState(1);

  // State for API data
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = React.useState(true);
  const [patientsError, setPatientsError] = React.useState<string | null>(null);
  const [patientsResponse, setPatientsResponse] = React.useState<PatientsResponse | null>(null);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [sidebarType, setSidebarType] = React.useState<'patient' | 'medication'>('patient');
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
      const response = await getPatients();
      setPatientsResponse(response);
      setPatients(response.patients);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setPatientsError(error instanceof Error ? error.message : 'Failed to fetch patients');
    } finally {
      setPatientsLoading(false);
    }
  };

  // Load patients when component mounts
  React.useEffect(() => {
    if (isAuthenticated) {
      fetchPatients();
    }
  }, [isAuthenticated]);

  const handleAuthSuccess = () => {
    // Authentication is now handled by the context
    console.log('Authentication successful');
  };

  const handleLogout = async () => {
    // Clear stored authentication data using the API utility
    await logout();
  };

  const openSidebar = (type: 'patient' | 'medication') => {
    setSidebarType(type);
    setIsSidebarOpen(true);
    setFormData({
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

  const totalPages = Math.ceil(patients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const currentPatients = patients.slice(startIndex, startIndex + patientsPerPage);





  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMedicationsView = () => (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Medications</h2>
          <p className="text-gray-600 text-sm mt-1">Manage and track medication inventory</p>
        </div>
        <div className="flex space-x-3">
          <Input
            placeholder="Search medications..."
            startContent={<Icon icon="lucide:search" className="text-[gray-700] w-4 h-4" />}
            className="w-64 premium-input"
            size="sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            classNames={{
              input: "text-[gray-700] placeholder-gray-400 outline-none focus:outline-none",
              inputWrapper: "bg-white border border-[clinic-purple-600] hover:border-[clinic-purple-600] focus-within:border-[clinic-purple-600] focus-within:ring-1 focus-within:ring-[clinic-purple-600]/20 focus:outline-none focus:ring-0",
              innerWrapper: "outline-none focus:outline-none focus:ring-0",
              mainWrapper: "outline-none focus:outline-none focus:ring-0",
            }}
          />
          <Button
            className="bg-[clinic-purple-600] hover:bg-[clinic-purple-700] text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 ease-in-out shadow-sm hover:shadow-md flex items-center space-x-2"
            size="sm"
            startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
            onClick={() => openSidebar('medication')}
          >
            Add Medication
          </Button>
        </div>
      </div>

      {/* Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(100vh-220px)]">
        {filteredMedications.map((medication) => (
          <Card
            key={medication.id}
            className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl cursor-pointer"
          >
            <CardBody className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-[clinic-purple-600]/10 rounded-lg flex items-center justify-center">
                  <Icon icon="lucide:pill" className="w-5 h-5 text-[clinic-purple-600]" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${medication.status === "In Stock"
                  ? "bg-[clinic-purple-600]/10 text-[clinic-purple-600]"
                  : "bg-orange-100 text-orange-800"
                  }`}>
                  {medication.status}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <h3 className="text-lg font-semibold text-[gray-700]">{medication.name}</h3>
                  <p className="text-[clinic-purple-600] text-xs font-medium uppercase tracking-wider">
                    {medication.dosage} {medication.frequency}
                  </p>
                </div>

                <p className="text-[gray-700]/70 text-sm line-clamp-2">{medication.description}</p>

                <div className="pt-2">
                  <p className="text-xs font-medium text-[gray-700]/50 uppercase tracking-wider">Stock Level</p>
                  <p className="text-[gray-700] font-medium">{medication.stock} units</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <Router>
      <Switch>
        <Route path="/set-password">
          <SetPassword onAuthSuccess={handleAuthSuccess} />
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
                <NavbarContent justify="center" className="px-6">
                  <Tabs
                    aria-label="Navigation tabs"
                    color="primary"
                    variant="solid"
                    selectedKey={activeTab}
                    onSelectionChange={setActiveTab as any}
                    classNames={{
                      tabList: "bg-white border border-border p-1 rounded-lg shadow-sm",
                      tab: "text-muted hover:text-primary-600 hover:bg-primary-50 data-[selected=true]:text-white data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-primary-500 data-[selected=true]:to-secondary-500 data-[selected=true]:shadow-md",
                      cursor: "bg-gradient-to-r from-primary-500 to-secondary-500",
                    }}
                  >
                    <Tab
                      key="patients"
                      title={
                        <div className="flex items-center space-x-2 px-3 py-2">
                          <Icon icon="lucide:users" className="w-4 h-4" />
                          <span className="font-medium">Patients</span>
                        </div>
                      }
                    />
                    <Tab
                      key="medications"
                      title={
                        <div className="flex items-center space-x-2 px-3 py-2">
                          <Icon icon="lucide:pill" className="w-4 h-4" />
                          <span className="font-medium">Medications</span>
                        </div>
                      }
                    />
                  </Tabs>
                </NavbarContent>
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

              <Switch>
                <Route exact path="/">
                  {activeTab === "medications" ? renderMedicationsView() : (
                    /* Main Content Area */
                    <main className="container mx-auto px-6 py-8 max-w-7xl min-h-[calc(100vh-200px)]">
                      {/* Compact Header Section */}
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Patients</h2>
                          <p className="text-gray-600 text-sm mt-1">Manage and view patient records</p>
                        </div>
                        <div className="flex space-x-3">
                          {/* Compact Search Bar */}
                          <Input
                            placeholder="Search patients..."
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
                          {/* Add Patient Button */}
                          <Button
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 ease-in-out shadow-sm hover:shadow-md flex items-center space-x-2"
                            size="sm"
                            startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
                            onClick={() => openSidebar('patient')}
                          >
                            Add Patient
                          </Button>
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
                            <TableColumn className="font-semibold">CREATED DATE</TableColumn>
                            <TableColumn className="font-semibold">PHONE</TableColumn>
                            <TableColumn className="font-semibold">EMAIL</TableColumn>
                            <TableColumn className="font-semibold">STATUS</TableColumn>
                            <TableColumn className="font-semibold">TAGS</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {patientsLoading ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                  <div className="flex items-center justify-center">
                                    <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin text-primary-600 mr-2" />
                                    <span className="text-gray-600">Loading patients...</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : patientsError ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                  <div className="flex items-center justify-center text-red-600">
                                    <Icon icon="lucide:alert-circle" className="w-6 h-6 mr-2" />
                                    <span>{patientsError}</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : currentPatients.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                  <div className="flex items-center justify-center text-gray-600">
                                    <Icon icon="lucide:users" className="w-6 h-6 mr-2" />
                                    <span>No patients found</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : (
                              currentPatients.map((patient) => (
                                <TableRow key={patient.opportunity_id} className="hover:bg-primary-50 transition-colors duration-200">
                                  <TableCell className="font-medium">{patient.name}</TableCell>
                                  <TableCell>{new Date(patient.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}</TableCell>
                                  <TableCell className="text-gray-600">{patient.contact.phone}</TableCell>
                                  <TableCell className="text-gray-600">{patient.contact.email || 'N/A'}</TableCell>
                                  <TableCell>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-600/10 text-primary-600">
                                      {patient.status}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {patient.contact.tags.map((tag: string, index: number) => (
                                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-600/10 text-secondary-600">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>

                        {/* Premium Pagination */}
                        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100">
                          <div className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {Math.min(startIndex + patientsPerPage, patients.length)} of {patients.length} patients
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

              {/* Sidebar Modal */}
              {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
                  <div className="bg-white w-96 h-full shadow-2xl transform transition-transform duration-300 ease-in-out">
                    <div className="p-6 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[gray-700]">
                          {sidebarType === 'patient' ? 'Add New Patient' : 'Add New Medication'}
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
                          {sidebarType === 'patient' ? (
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
                          ) : (
                            <>
                              <Input
                                label="Medication Name"
                                placeholder="Lisinopril"
                                value={formData.medicationName}
                                onChange={(e) => handleInputChange('medicationName', e.target.value)}
                                required
                                classNames={{
                                  label: "text-[gray-700] font-medium",
                                  input: "text-[gray-700] placeholder-gray-400 focus:outline-none",
                                  inputWrapper: "bg-white border border-gray-200 hover:border-[clinic-purple-600] focus-within:border-[clinic-purple-600] focus-within:ring-1 focus-within:ring-[clinic-purple-600]/20 focus:outline-none focus:ring-0",
                                  innerWrapper: "focus:outline-none focus:ring-0",
                                  mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:pill" className="text-[clinic-purple-600] w-4 h-4" />}
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <Input
                                  label="Dosage"
                                  placeholder="10 MG"
                                  value={formData.dosage}
                                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                                  required
                                  classNames={{
                                    label: "text-[gray-700] font-medium",
                                    input: "text-[gray-700] placeholder-gray-400 focus:outline-none",
                                    inputWrapper: "bg-white border border-gray-200 hover:border-[clinic-purple-600] focus-within:border-[clinic-purple-600] focus-within:ring-1 focus-within:ring-[clinic-purple-600]/20 focus:outline-none focus:ring-0",
                                    innerWrapper: "focus:outline-none focus:ring-0",
                                    mainWrapper: "focus:outline-none focus:ring-0",
                                  }}
                                  startContent={<Icon icon="lucide:activity" className="text-[clinic-purple-600] w-4 h-4" />}
                                />
                                <Input
                                  label="Frequency"
                                  placeholder="ONCE A DAY"
                                  value={formData.frequency}
                                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                                  required
                                  classNames={{
                                    label: "text-[gray-700] font-medium",
                                    input: "text-[gray-700] placeholder-gray-400 focus:outline-none",
                                    inputWrapper: "bg-white border border-gray-200 hover:border-[clinic-purple-600] focus-within:border-[clinic-purple-600] focus-within:ring-1 focus-within:ring-[clinic-purple-600]/20 focus:outline-none focus:ring-0",
                                    innerWrapper: "focus:outline-none focus:ring-0",
                                    mainWrapper: "focus:outline-none focus:ring-0",
                                  }}
                                  startContent={<Icon icon="lucide:clock" className="text-[clinic-purple-600] w-4 h-4" />}
                                />
                              </div>
                              <Input
                                label="Stock Level"
                                type="number"
                                placeholder="150"
                                value={formData.stock}
                                onChange={(e) => handleInputChange('stock', e.target.value)}
                                required
                                classNames={{
                                  label: "text-[gray-700] font-medium",
                                  input: "text-[gray-700] placeholder-gray-400 focus:outline-none",
                                  inputWrapper: "bg-white border border-gray-200 hover:border-[clinic-purple-600] focus-within:border-[clinic-purple-600] focus-within:ring-1 focus-within:ring-[clinic-purple-600]/20 focus:outline-none focus:ring-0",
                                  innerWrapper: "focus:outline-none focus:ring-0",
                                  mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:package" className="text-[clinic-purple-600] w-4 h-4" />}
                              />
                              <Input
                                label="Description"
                                placeholder="Used to treat high blood pressure and heart failure"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                classNames={{
                                  label: "text-[gray-700] font-medium",
                                  input: "text-[gray-700] placeholder-gray-400 focus:outline-none",
                                  inputWrapper: "bg-white border border-gray-200 hover:border-[clinic-purple-600] focus-within:border-[clinic-purple-600] focus-within:ring-1 focus-within:ring-[clinic-purple-600]/20 focus:outline-none focus:ring-0",
                                  innerWrapper: "focus:outline-none focus:ring-0",
                                  mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:file-text" className="text-[clinic-purple-600] w-4 h-4" />}
                              />
                            </>
                          )}
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
                              {sidebarType === 'patient' ? 'Add Patient' : 'Add Medication'}
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
    </Router >
  );
};

export default App;