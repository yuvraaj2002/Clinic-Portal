import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumbs, BreadcrumbItem, Button, Card, CardBody, Input, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

interface Patient {
  id: number;
  fullName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
}

interface PatientDetailProps {
  patients: Patient[];
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patients }) => {
  const { id } = useParams<{ id: string }>();
  const patient = patients.find(p => p.id === parseInt(id, 10));

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-8 py-16 max-w-4xl">
          <div className="text-center bg-white rounded-2xl shadow-xl p-12 border border-slate-200/60">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icon icon="lucide:user-x" className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Patient Record Not Found</h1>
            <p className="text-slate-600 mb-8">The requested patient record could not be located in our system.</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-clinic-purple-600 to-clinic-purple-700 text-white font-semibold rounded-xl hover:from-clinic-purple-700 hover:to-clinic-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Icon icon="lucide:arrow-left" className="w-5 h-5 mr-2" />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Generate initials for privacy-friendly avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Premium Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs
            separator="/"
            classNames={{
              list: "bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm",
              separator: "text-slate-400"
            }}
          >
            <BreadcrumbItem>
              <Link
                to="/"
                className="flex items-center text-slate-600 hover:text-clinic-purple-600 transition-all duration-200 font-medium"
              >
                <Icon icon="lucide:chevron-left" className="w-4 h-4 mr-1" />
                Patient Directory
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <span className="text-slate-800 font-semibold">Medical Profile</span>
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>

        {/* Patient Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-700 mb-2">
              {patient.fullName}
            </h1>
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              <Chip
                variant="flat"
                className="bg-clinic-purple-100 text-clinic-purple-700 font-semibold px-4 py-1"
                startContent={<Icon icon="lucide:shield-check" className="w-4 h-4" />}
              >
                Active Patient
              </Chip>
              <Chip
                variant="flat"
                className="bg-clinic-purple-100 text-clinic-purple-700 font-semibold px-4 py-1"
                startContent={<Icon icon="lucide:calendar" className="w-4 h-4" />}
              >
                Regular Checkups
              </Chip>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Personal Information */}
          <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <CardBody className="p-6">
              <div className="flex items-center mb-4">
                <Icon icon="lucide:user" className="w-5 h-5 mr-2 text-clinic-purple-600" />
                <h3 className="text-lg font-semibold text-gray-700">Patient Information</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
                  <p className="text-gray-700 font-medium">{patient.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Date of Birth</p>
                  <p className="text-gray-700">{new Date(patient.dateOfBirth).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Email</p>
                  <p className="text-gray-700">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Phone Number</p>
                  <p className="text-gray-700">{patient.phoneNumber}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Medical Summary */}
          <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <CardBody className="p-6">
              <div className="flex items-center mb-4">
                <Icon icon="lucide:activity" className="w-5 h-5 mr-2 text-clinic-purple-600" />
                <h3 className="text-lg font-semibold text-gray-700">Health Summary</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Last Visit</p>
                  <p className="text-gray-700">March 15, 2024</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Blood Pressure</p>
                  <p className="text-gray-700">120/80 mmHg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Weight</p>
                  <p className="text-gray-700">68 kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">BMI</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-clinic-purple-600/10 text-clinic-purple-600">
                    Normal (22.4)
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Payment Details */}
          <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <CardBody className="p-6">
              <div className="flex items-center mb-4">
                <Icon icon="lucide:credit-card" className="w-5 h-5 mr-2 text-clinic-purple-600" />
                <h3 className="text-lg font-semibold text-gray-700">Payment Details</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Order Status</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-clinic-purple-600/10 text-clinic-purple-600">
                    Processed
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Amount Paid</p>
                  <p className="text-gray-700 font-semibold text-lg">$150.00</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Shipping Cost</p>
                  <p className="text-gray-700">$20.99</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Amount</p>
                  <p className="text-gray-700 font-semibold text-lg">$170.99</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Medications Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Icon icon="lucide:pill" className="w-6 h-6 mr-3 text-clinic-purple-600" />
              Current Medications
            </h2>
            <div className="flex space-x-4">
              <Input
                placeholder="Search medications..."
                startContent={<Icon icon="lucide:search" className="text-clinic-purple-600 w-4 h-4" />}
                className="w-96"
                classNames={{
                  input: "text-gray-700 placeholder-gray-500 font-medium",
                  inputWrapper: "bg-white border-2 border-clinic-purple-600 hover:border-clinic-purple-700 focus-within:border-clinic-purple-600 focus-within:ring-4 focus-within:ring-clinic-purple-600/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-200",
                }}
              />
            </div>
          </div>

          {/* Medications List */}
          <div className="space-y-4">
            {/* Current Medication Card */}
            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
              <CardBody className="p-6">
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-clinic-purple-600/10 rounded-lg flex items-center justify-center">
                    <Icon icon="lucide:pill" className="w-6 h-6 text-clinic-purple-600" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-clinic-purple-600 font-semibold text-sm uppercase tracking-wider mb-1">500 MG ORALLY TWICE A DAY</p>
                    <p className="text-xl font-bold text-gray-900 mb-2">Clarithromycin</p>
                    <p className="text-gray-600">This medication is used to treat bacterial infections.</p>
                  </div>
                  <Icon icon="lucide:chevron-right" className="text-gray-400 w-5 h-5" />
                </div>
              </CardBody>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;