import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumbs, BreadcrumbItem, Avatar, Button, Card, CardBody, Input } from "@heroui/react";
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
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Patient not found</h1>
          <Link to="/" className="premium-button inline-flex items-center">
            <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 py-12 max-w-7xl">
      {/* Premium Breadcrumbs */}
      <Breadcrumbs className="mb-8">
        <BreadcrumbItem>
          <Link to="/" className="flex items-center text-gray-600 hover:text-clinic-green-500 transition-colors">
            <Icon icon="lucide:chevron-left" className="w-4 h-4 mr-2" />
            Patients
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem className="text-gray-900 font-medium">{patient.fullName}</BreadcrumbItem>
      </Breadcrumbs>

      {/* Patient Header Section */}
      <div className="text-center mb-12">
        <Avatar
          src={`https://img.heroui.chat/image/avatar?w=200&h=200&u=${patient.id}`}
          className="w-32 h-32 mx-auto border-4 border-clinic-green-100 shadow-lg"
        />
        <h1 className="text-4xl font-bold text-gray-900 mt-6 mb-2">{patient.fullName}</h1>
        <p className="text-gray-600 text-lg">Patient ID: {patient.id}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-6 mb-12">
        {[
          { icon: "lucide:credit-card", text: "Update Credit Card", color: "bg-blue-500 hover:bg-blue-600" },
          { icon: "lucide:edit", text: "Edit Patient", color: "bg-clinic-green-500 hover:bg-clinic-green-600" },
          { icon: "lucide:mail", text: "Send Email", color: "bg-purple-500 hover:bg-purple-600" },
          { icon: "lucide:phone", text: "Call Patient", color: "bg-orange-500 hover:bg-orange-600" },
        ].map((action, index) => (
          <Button
            key={index}
            className={`${action.color} text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 ease-in-out shadow-sm hover:shadow-md flex items-center space-x-2`}
            startContent={<Icon icon={action.icon} className="w-4 h-4" />}
          >
            {action.text}
          </Button>
        ))}
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Icon icon="lucide:user" className="w-5 h-5 mr-2 text-clinic-green-500" />
              Patient Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
                <p className="text-gray-900 font-medium">{patient.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Date of Birth</p>
                <p className="text-gray-900">{new Date(patient.dateOfBirth).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Email</p>
                <p className="text-gray-900">{patient.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Phone Number</p>
                <p className="text-gray-900">{patient.phoneNumber}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Icon icon="lucide:credit-card" className="w-5 h-5 mr-2 text-clinic-green-500" />
              Order & Payment Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Order Status</p>
                <p className="text-clinic-green-600 font-medium">Processed</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Amount Paid</p>
                <p className="text-gray-900 font-semibold text-lg">$130.00</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Shipping Cost</p>
                <p className="text-gray-900">$19.99</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Icon icon="lucide:activity" className="w-5 h-5 mr-2 text-clinic-green-500" />
              Health Summary
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Last Visit</p>
                <p className="text-gray-900">March 15, 2024</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Blood Pressure</p>
                <p className="text-gray-900">120/80 mmHg</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Weight</p>
                <p className="text-gray-900">68 kg</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Medications Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Icon icon="lucide:pill" className="w-6 h-6 mr-3 text-clinic-green-500" />
            Medications
          </h2>
          <div className="flex space-x-4">
            <Input
              placeholder="Search medications..."
              startContent={<Icon icon="lucide:search" className="text-gray-400 w-4 h-4" />}
              className="w-80 premium-input"
              classNames={{
                input: "text-gray-700 placeholder-gray-400",
                inputWrapper: "bg-white border-gray-200 hover:border-gray-300 focus-within:border-clinic-green-500 focus-within:ring-2 focus-within:ring-clinic-green-500/20",
              }}
            />
            <Button
              className="premium-button"
              startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
            >
              Add Medication
            </Button>
          </div>
        </div>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardBody className="p-6">
            <div className="flex items-center space-x-6">
              <Avatar
                src="https://img.heroui.chat/image/ai?w=80&h=80&u=1"
                size="lg"
                className="rounded-full border-2 border-clinic-green-100"
              />
              <div className="flex-grow">
                <p className="text-clinic-green-600 font-semibold text-sm uppercase tracking-wider mb-1">500 MG ORALLY TWICE A DAY</p>
                <p className="text-xl font-bold text-gray-900 mb-2">Clarithromycin</p>
                <p className="text-gray-600">This medication is used to treat bacterial infections.</p>
              </div>
              <Icon icon="lucide:chevron-right" className="text-gray-400 w-5 h-5" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PatientDetail;