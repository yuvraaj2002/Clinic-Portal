import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, Avatar, Tabs, Tab, Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PatientDetail from './components/PatientDetail';
import Auth from './components/Auth';
import SetPassword from './components/SetPassword';
import { useAuth } from './contexts/AuthContext';

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

const patients = [
  { id: 1, fullName: "Emily Patel", dateOfBirth: "1990-01-20T00:00:00.000Z", email: "emily.patel@example.com", phoneNumber: "123-456-7890" },
  { id: 2, fullName: "Tyler Jackson", dateOfBirth: "1998-11-24T00:00:00.000Z", email: "tyler.jackson@example.com", phoneNumber: "987-654-3210" },
  { id: 3, fullName: "Sofia Rodriguez", dateOfBirth: "1995-03-19T00:00:00.000Z", email: "sofia.rodriguez@example.com", phoneNumber: "567-890-1234" },
  { id: 4, fullName: "Michael Davis", dateOfBirth: "1992-07-27T00:00:00.000Z", email: "michael.davis@example.com", phoneNumber: "345-678-9012" },
  { id: 5, fullName: "Jessica Martin", dateOfBirth: "1999-02-15T00:00:00.000Z", email: "jessica.martin@example.com", phoneNumber: "901-234-5678" },
  { id: 6, fullName: "Daniel Lee", dateOfBirth: "1997-12-17T00:00:00.000Z", email: "daniel.lee@example.com", phoneNumber: "111-222-3333" },
  { id: 7, fullName: "Sarah Wilson", dateOfBirth: "1988-05-10T00:00:00.000Z", email: "sarah.wilson@example.com", phoneNumber: "444-555-6666" },
  { id: 8, fullName: "James Brown", dateOfBirth: "1985-09-03T00:00:00.000Z", email: "james.brown@example.com", phoneNumber: "777-888-9999" },
  { id: 9, fullName: "Lisa Chen", dateOfBirth: "1993-12-25T00:00:00.000Z", email: "lisa.chen@example.com", phoneNumber: "222-333-4444" },
  { id: 10, fullName: "Robert Taylor", dateOfBirth: "1987-08-14T00:00:00.000Z", email: "robert.taylor@example.com", phoneNumber: "555-666-7777" },
  { id: 11, fullName: "Amanda Garcia", dateOfBirth: "1994-04-08T00:00:00.000Z", email: "amanda.garcia@example.com", phoneNumber: "888-999-0000" },
  { id: 12, fullName: "Kevin Martinez", dateOfBirth: "1991-01-30T00:00:00.000Z", email: "kevin.martinez@example.com", phoneNumber: "333-444-5555" },
  { id: 13, fullName: "Rachel Johnson", dateOfBirth: "1996-06-18T00:00:00.000Z", email: "rachel.johnson@example.com", phoneNumber: "666-777-8888" },
  { id: 14, fullName: "David Anderson", dateOfBirth: "1989-11-12T00:00:00.000Z", email: "david.anderson@example.com", phoneNumber: "999-000-1111" },
  { id: 15, fullName: "Maria Lopez", dateOfBirth: "1992-03-22T00:00:00.000Z", email: "maria.lopez@example.com", phoneNumber: "111-333-5555" },
  { id: 16, fullName: "Jennifer White", dateOfBirth: "1986-07-05T00:00:00.000Z", email: "jennifer.white@example.com", phoneNumber: "222-444-6666" },
  { id: 17, fullName: "Christopher Lee", dateOfBirth: "1990-10-12T00:00:00.000Z", email: "christopher.lee@example.com", phoneNumber: "333-555-7777" },
  { id: 18, fullName: "Nicole Thompson", dateOfBirth: "1988-12-03T00:00:00.000Z", email: "nicole.thompson@example.com", phoneNumber: "444-666-8888" },
  { id: 19, fullName: "Matthew Clark", dateOfBirth: "1993-02-28T00:00:00.000Z", email: "matthew.clark@example.com", phoneNumber: "555-777-9999" },
  { id: 20, fullName: "Ashley Hall", dateOfBirth: "1995-08-15T00:00:00.000Z", email: "ashley.hall@example.com", phoneNumber: "666-888-0000" },
  { id: 21, fullName: "Ryan Miller", dateOfBirth: "1987-04-20T00:00:00.000Z", email: "ryan.miller@example.com", phoneNumber: "777-999-1111" },
  { id: 22, fullName: "Stephanie Davis", dateOfBirth: "1991-06-14T00:00:00.000Z", email: "stephanie.davis@example.com", phoneNumber: "888-000-2222" },
  { id: 23, fullName: "Brandon Wilson", dateOfBirth: "1989-09-08T00:00:00.000Z", email: "brandon.wilson@example.com", phoneNumber: "999-111-3333" },
  { id: 24, fullName: "Melissa Moore", dateOfBirth: "1994-01-25T00:00:00.000Z", email: "melissa.moore@example.com", phoneNumber: "000-222-4444" },
  { id: 25, fullName: "Justin Taylor", dateOfBirth: "1992-11-30T00:00:00.000Z", email: "justin.taylor@example.com", phoneNumber: "111-333-5555" },
];

const App: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState("patients");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
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

  const handlePatientClick = (patient: any) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMedicationsView = () => (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#434242] tracking-tight">Medications</h2>
          <p className="text-[#434242]/70 text-sm mt-1">Manage and track medication inventory</p>
        </div>
        <div className="flex space-x-3">
          <Input
            placeholder="Search medications..."
            startContent={<Icon icon="lucide:search" className="text-[#434242] w-4 h-4" />}
            className="w-64 premium-input"
            size="sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            classNames={{
              input: "text-[#434242] placeholder-gray-400 outline-none focus:outline-none",
              inputWrapper: "bg-white border border-[#5A8B7B] hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
              innerWrapper: "outline-none focus:outline-none focus:ring-0",
              mainWrapper: "outline-none focus:outline-none focus:ring-0",
            }}
          />
          <Button
            className="bg-[#5A8B7B] hover:bg-[#4A7A6B] text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 ease-in-out shadow-sm hover:shadow-md flex items-center space-x-2"
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
                <div className="w-10 h-10 bg-[#5A8B7B]/10 rounded-lg flex items-center justify-center">
                  <Icon icon="lucide:pill" className="w-5 h-5 text-[#5A8B7B]" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${medication.status === "In Stock"
                  ? "bg-[#5A8B7B]/10 text-[#5A8B7B]"
                  : "bg-orange-100 text-orange-800"
                  }`}>
                  {medication.status}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <h3 className="text-lg font-semibold text-[#434242]">{medication.name}</h3>
                  <p className="text-[#5A8B7B] text-xs font-medium uppercase tracking-wider">
                    {medication.dosage} {medication.frequency}
                  </p>
                </div>

                <p className="text-[#434242]/70 text-sm line-clamp-2">{medication.description}</p>

                <div className="pt-2">
                  <p className="text-xs font-medium text-[#434242]/50 uppercase tracking-wider">Stock Level</p>
                  <p className="text-[#434242] font-medium">{medication.stock} units</p>
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
            <div className="min-h-screen bg-[#F9F9F8] font-sans">
              {/* Premium Header & Navigation */}
              <Navbar maxWidth="full" className="bg-white border-b border-gray-100 shadow-sm">
                <NavbarBrand className="px-6">
                  <h1 className="font-bold text-[#434242] text-xl tracking-tight">Clinic Portal</h1>
                </NavbarBrand>
                <NavbarContent justify="center" className="px-6">
                  <Tabs
                    aria-label="Navigation tabs"
                    color="primary"
                    variant="solid"
                    selectedKey={activeTab}
                    onSelectionChange={setActiveTab as any}
                    classNames={{
                      tabList: "bg-[#F9F9F8] p-1 rounded-lg",
                      tab: "text-[#434242] hover:text-[#5A8B7B]",
                      cursor: "bg-[#5A8B7B]",
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
                    variant="light"
                    className="text-[#434242] hover:text-[#5A8B7B] mr-2"
                    onClick={handleLogout}
                    startContent={<Icon icon="lucide:log-out" className="w-4 h-4" />}
                  >
                    Logout
                  </Button>
                  <Avatar
                    name="Y"
                    size="sm"
                    className="bg-[#5A8B7B] text-white cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md"
                  />
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
                            startContent={<Icon icon="lucide:search" className="text-[#434242] w-4 h-4" />}
                            className="w-64 premium-input"
                            size="sm"
                            classNames={{
                              input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                              inputWrapper: "bg-white border border-[#5A8B7B] hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                              innerWrapper: "focus:outline-none focus:ring-0",
                              mainWrapper: "focus:outline-none focus:ring-0",
                            }}
                          />
                          {/* Add Patient Button */}
                          <Button
                            className="bg-[#5A8B7B] hover:bg-[#4A7A6B] text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 ease-in-out shadow-sm hover:shadow-md flex items-center space-x-2"
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
                            thead: "bg-[#F9F9F8]",
                            th: "bg-[#F9F9F8] text-[#434242] font-semibold text-xs uppercase tracking-wider py-3 px-4 border-b border-gray-100",
                            td: "py-3 px-4 border-b border-gray-50 text-[#434242] text-sm",
                            tr: "hover:bg-[#5A8B7B]/10 transition-colors duration-200",
                          }}
                        >
                          <TableHeader>
                            <TableColumn className="font-semibold">FULL NAME</TableColumn>
                            <TableColumn className="font-semibold">DATE OF BIRTH</TableColumn>
                            <TableColumn className="font-semibold">EMAIL</TableColumn>
                            <TableColumn className="font-semibold">PHONE</TableColumn>
                            <TableColumn className="font-semibold w-16 text-center">ACTION</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {currentPatients.map((patient) => (
                              <TableRow key={patient.id} className="cursor-pointer">
                                <TableCell className="font-medium">{patient.fullName}</TableCell>
                                <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}</TableCell>
                                <TableCell className="text-gray-600">{patient.email}</TableCell>
                                <TableCell className="text-gray-600">{patient.phoneNumber}</TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    size="sm"
                                    className="bg-[#5A8B7B] hover:bg-[#5A8B7B]/80 text-white transition-all duration-200 ease-in-out shadow-sm hover:shadow-md px-3"
                                    onClick={() => handlePatientClick(patient)}
                                  >
                                    DETAILS
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
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
                              item: "w-8 h-8 text-small rounded-none bg-transparent text-[#434242] hover:text-[#5A8B7B]",
                              cursor: "bg-[#5A8B7B] text-white font-medium",
                            }}
                          />
                        </div>
                      </div>
                    </main>
                  )}
                </Route>
                <Route path="/patient/:id">
                  <PatientDetail patients={patients} />
                </Route>
              </Switch>

              {/* Patient Details Modal */}
              <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                size="4xl"
                scrollBehavior="inside"
                classNames={{
                  wrapper: "bg-[rgba(90,139,123,0.25)] p-6 flex items-center justify-center",
                  base: "bg-white max-w-6xl rounded-2xl shadow-2xl border border-gray-200 my-4",
                  header: "border-b border-gray-100 bg-[#F9F9F8] rounded-t-2xl",
                  body: "p-0 max-h-[calc(90vh-200px)] overflow-y-auto",
                  footer: "border-t border-gray-100 rounded-b-2xl",
                }}
              >
                <ModalContent>
                  {selectedPatient && (
                    <>
                      <ModalHeader className="flex items-center justify-center px-6 py-4">
                        <div className="text-center">
                          <h3 className="text-xl font-bold text-[#434242]">{selectedPatient.fullName}</h3>
                        </div>
                      </ModalHeader>
                      <ModalBody>
                        <div className="p-6 space-y-4">
                          {/* Action Buttons */}
                          <div className="flex justify-center space-x-3 border-b border-gray-100 pb-4">
                            {[
                              { icon: "lucide:credit-card", text: "Update Credit Card" },
                              { icon: "lucide:edit", text: "Edit Patient" },
                              { icon: "lucide:mail", text: "Send Email" },
                              { icon: "lucide:phone", text: "Call Patient" },
                            ].map((action, index) => (
                              <Button
                                key={index}
                                className="bg-white hover:bg-[#F9F9F8] text-[#5A8B7B] border border-[#5A8B7B] hover:border-[#5A8B7B] font-medium px-3 py-2 rounded-lg transition-all duration-200 ease-in-out shadow-sm hover:shadow-md flex items-center space-x-2"
                                size="sm"
                                startContent={<Icon icon={action.icon} className="w-4 h-4" />}
                              >
                                <span className="text-sm">{action.text}</span>
                              </Button>
                            ))}
                          </div>

                          {/* Two-Column Layout */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Left Column - Primary Information (2/3 width) */}
                            <div className="lg:col-span-2 space-y-4">
                              {/* Patient Information */}
                              <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                                <CardHeader className="pb-3">
                                  <h4 className="text-base font-semibold text-[#5A8B7B] flex items-center">
                                    <Icon icon="lucide:user" className="w-4 h-4 mr-2 text-[#5A8B7B]" />
                                    Patient Information
                                  </h4>
                                </CardHeader>
                                <CardBody className="pt-0">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">Full Name</span>
                                      <span className="text-sm font-medium text-[#434242]">{selectedPatient.fullName}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">Date of Birth</span>
                                      <span className="text-sm font-medium text-[#434242]">{new Date(selectedPatient.dateOfBirth).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">Email Address</span>
                                      <span className="text-sm font-medium text-[#5A8B7B] break-all">{selectedPatient.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">Phone Number</span>
                                      <span className="text-sm font-medium text-[#434242]">{selectedPatient.phoneNumber}</span>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>

                              {/* Current Medications Section */}
                              <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                                <CardHeader className="pb-3">
                                  <div className="flex justify-between items-center w-full">
                                    <h4 className="text-base font-semibold text-[#5A8B7B] flex items-center">
                                      <Icon icon="lucide:pill" className="w-4 h-4 mr-2 text-[#5A8B7B]" />
                                      Current Medications
                                    </h4>
                                    <div className="flex space-x-2 ml-4">
                                      <Input
                                        placeholder="Search medications..."
                                        startContent={<Icon icon="lucide:search" className="text-gray-400 w-3 h-3" />}
                                        className="w-40"
                                        size="sm"
                                        classNames={{
                                          input: "text-gray-700 placeholder-gray-400 outline-none",
                                          inputWrapper: "bg-white border border-[#5A8B7B] hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 rounded-lg focus:outline-none",
                                          innerWrapper: "outline-none",
                                          mainWrapper: "outline-none",
                                        }}
                                      />
                                      <Button
                                        className="bg-[#5A8B7B] hover:bg-[#5A8B7B]/80 text-white border border-[#5A8B7B] hover:border-[#5A8B7B] font-medium px-2 py-1 rounded-lg transition-all duration-200"
                                        size="sm"
                                        startContent={<Icon icon="lucide:plus" className="w-3 h-3" />}
                                      >
                                        <span className="text-sm">Add</span>
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardBody className="pt-0">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-3 p-2 bg-[#F9F9F8] rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                                      <div className="w-8 h-8 bg-[#5A8B7B]/10 rounded-lg flex items-center justify-center">
                                        <Icon icon="lucide:pill" className="w-4 h-4 text-[#5A8B7B]" />
                                      </div>
                                      <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-grow min-w-0">
                                            <p className="text-[#5A8B7B] font-medium text-xs uppercase tracking-wider">10 MG ORALLY ONCE A DAY</p>
                                            <p className="text-sm font-semibold text-[#434242] truncate">Lisinopril</p>
                                            <p className="text-xs text-[#434242]/70 truncate">This medication is used to treat high blood pressure and congestive heart failure.</p>
                                          </div>
                                          <Icon icon="lucide:chevron-right" className="text-gray-400 w-4 h-4 flex-shrink-0 ml-2" />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-2 bg-[#F9F9F8] rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                                      <div className="w-8 h-8 bg-[#5A8B7B]/10 rounded-lg flex items-center justify-center">
                                        <Icon icon="lucide:heart" className="w-4 h-4 text-[#5A8B7B]" />
                                      </div>
                                      <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-grow min-w-0">
                                            <p className="text-[#5A8B7B] font-medium text-xs uppercase tracking-wider">5 MG ORALLY ONCE A DAY</p>
                                            <p className="text-sm font-semibold text-[#434242] truncate">Amlodipine</p>
                                            <p className="text-xs text-[#434242]/70 truncate">Calcium channel blocker used to treat high blood pressure and chest pain.</p>
                                          </div>
                                          <Icon icon="lucide:chevron-right" className="text-gray-400 w-4 h-4 flex-shrink-0 ml-2" />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-2 bg-[#F9F9F8] rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                                      <div className="w-8 h-8 bg-[#5A8B7B]/10 rounded-lg flex items-center justify-center">
                                        <Icon icon="lucide:shield" className="w-4 h-4 text-[#5A8B7B]" />
                                      </div>
                                      <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-grow min-w-0">
                                            <p className="text-[#5A8B7B] font-medium text-xs uppercase tracking-wider">20 MG ORALLY ONCE A DAY</p>
                                            <p className="text-sm font-semibold text-[#434242] truncate">Atorvastatin</p>
                                            <p className="text-xs text-[#434242]/70 truncate">Statin medication used to prevent cardiovascular disease and lower cholesterol.</p>
                                          </div>
                                          <Icon icon="lucide:chevron-right" className="text-gray-400 w-4 h-4 flex-shrink-0 ml-2" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            </div>

                            {/* Right Column - Secondary/Summary Information (1/3 width) */}
                            <div className="lg:col-span-1 space-y-4">
                              {/* Health Summary - Top Priority in Right Column */}
                              <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                                <CardHeader className="pb-3">
                                  <h4 className="text-base font-semibold text-[#5A8B7B] flex items-center">
                                    <Icon icon="lucide:activity" className="w-4 h-4 mr-2 text-[#5A8B7B]" />
                                    Health Summary
                                  </h4>
                                </CardHeader>
                                <CardBody className="pt-0">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">Last Visit</span>
                                      <span className="text-sm font-medium text-[#434242]">March 15, 2024</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">Blood Pressure</span>
                                      <span className="text-sm font-medium text-[#434242]">120/80 mmHg</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">Weight</span>
                                      <span className="text-sm font-medium text-[#434242]">68 kg</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">BMI</span>
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#5A8B7B]/10 text-[#5A8B7B]">
                                        Normal (22.4)
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">Heart Rate</span>
                                      <span className="text-sm font-medium text-[#434242]">72 bpm</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">Temperature</span>
                                      <span className="text-sm font-medium text-[#434242]">98.6°F</span>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>

                              {/* Payment Details - Secondary Information */}
                              <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                                <CardHeader className="pb-3">
                                  <h4 className="text-base font-semibold text-[#5A8B7B] flex items-center">
                                    <Icon icon="lucide:credit-card" className="w-4 h-4 mr-2 text-[#5A8B7B]" />
                                    Payment Details
                                  </h4>
                                </CardHeader>
                                <CardBody className="pt-0">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">Order Status</span>
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#5A8B7B]/10 text-[#5A8B7B]">
                                        Processed
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">Amount Paid</span>
                                      <span className="text-sm font-bold text-[#434242]">$150.00</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">Shipping Cost</span>
                                      <span className="text-sm font-medium text-[#434242]">$20.99</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                      <span className="text-xs text-[#434242]/60 uppercase tracking-wider">Total Amount</span>
                                      <span className="text-sm font-semibold text-[#434242]">$170.99</span>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            </div>
                          </div>
                        </div>
                      </ModalBody>
                      <ModalFooter className="px-6 py-4">
                        <div className="w-full flex justify-end">
                          <Button
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 hover:border-gray-300 font-medium px-4 py-2 rounded-lg transition-all duration-200"
                            size="sm"
                            onClick={closeModal}
                          >
                            <span className="text-sm">Close</span>
                          </Button>
                        </div>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>

              {/* Sidebar Modal */}
              {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
                  <div className="bg-white w-96 h-full shadow-2xl transform transition-transform duration-300 ease-in-out">
                    <div className="p-6 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#434242]">
                          {sidebarType === 'patient' ? 'Add New Patient' : 'Add New Medication'}
                        </h2>
                        <Button
                          isIconOnly
                          variant="light"
                          onClick={closeSidebar}
                          className="text-[#434242] hover:text-[#5A8B7B]"
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
                                  required
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
                              <Input
                                label="Email Address"
                                type="email"
                                placeholder="john.doe@example.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
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
                                label="Phone Number"
                                placeholder="123-456-7890"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                required
                                classNames={{
                                  label: "text-[#434242] font-medium",
                                  input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                                  inputWrapper: "bg-white border border-gray-200 hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                                  innerWrapper: "focus:outline-none focus:ring-0",
                                  mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:phone" className="text-[#5A8B7B] w-4 h-4" />}
                              />
                              <Input
                                label="Date of Birth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                required
                                classNames={{
                                  label: "text-[#434242] font-medium",
                                  input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                                  inputWrapper: "bg-white border border-gray-200 hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                                  innerWrapper: "focus:outline-none focus:ring-0",
                                  mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:calendar" className="text-[#5A8B7B] w-4 h-4" />}
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
                                  label: "text-[#434242] font-medium",
                                  input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                                  inputWrapper: "bg-white border border-gray-200 hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                                  innerWrapper: "focus:outline-none focus:ring-0",
                                  mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:pill" className="text-[#5A8B7B] w-4 h-4" />}
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <Input
                                  label="Dosage"
                                  placeholder="10 MG"
                                  value={formData.dosage}
                                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                                  required
                                  classNames={{
                                    label: "text-[#434242] font-medium",
                                    input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                                    inputWrapper: "bg-white border border-gray-200 hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                                    innerWrapper: "focus:outline-none focus:ring-0",
                                    mainWrapper: "focus:outline-none focus:ring-0",
                                  }}
                                  startContent={<Icon icon="lucide:activity" className="text-[#5A8B7B] w-4 h-4" />}
                                />
                                <Input
                                  label="Frequency"
                                  placeholder="ONCE A DAY"
                                  value={formData.frequency}
                                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                                  required
                                  classNames={{
                                    label: "text-[#434242] font-medium",
                                    input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                                    inputWrapper: "bg-white border border-gray-200 hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                                    innerWrapper: "focus:outline-none focus:ring-0",
                                    mainWrapper: "focus:outline-none focus:ring-0",
                                  }}
                                  startContent={<Icon icon="lucide:clock" className="text-[#5A8B7B] w-4 h-4" />}
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
                                  label: "text-[#434242] font-medium",
                                  input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                                  inputWrapper: "bg-white border border-gray-200 hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                                  innerWrapper: "focus:outline-none focus:ring-0",
                                  mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:package" className="text-[#5A8B7B] w-4 h-4" />}
                              />
                              <Input
                                label="Description"
                                placeholder="Used to treat high blood pressure and heart failure"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                classNames={{
                                  label: "text-[#434242] font-medium",
                                  input: "text-[#434242] placeholder-gray-400 focus:outline-none",
                                  inputWrapper: "bg-white border border-gray-200 hover:border-[#5A8B7B] focus-within:border-[#5A8B7B] focus-within:ring-1 focus-within:ring-[#5A8B7B]/20 focus:outline-none focus:ring-0",
                                  innerWrapper: "focus:outline-none focus:ring-0",
                                  mainWrapper: "focus:outline-none focus:ring-0",
                                }}
                                startContent={<Icon icon="lucide:file-text" className="text-[#5A8B7B] w-4 h-4" />}
                              />
                            </>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="pt-6 border-t border-gray-100">
                          <div className="flex space-x-3">
                            <Button
                              variant="bordered"
                              className="flex-1 border-[#5A8B7B] text-[#5A8B7B] hover:bg-[#5A8B7B]/10"
                              onClick={closeSidebar}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="flex-1 bg-[#5A8B7B] hover:bg-[#4A7A6B] text-white"
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
              <footer className="bg-[#5A8B7B] text-white mt-16">
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