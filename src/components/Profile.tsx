import React, { useState } from 'react';
import { Card, CardBody, Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../utils/api';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    if (!email.trim()) {
      setError('Email cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserProfile({ email: email.trim() });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEmail(user?.email || '');
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-white font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Icon icon="lucide:user" className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-foreground text-xl tracking-tight">Profile</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="bg-white shadow-lg border border-gray-100">
          <CardBody className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="lucide:user" className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
              <p className="text-gray-600">Manage your account information</p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <Icon icon="lucide:check-circle" className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800">{success}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <Icon icon="lucide:alert-circle" className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      startContent={<Icon icon="lucide:mail" className="text-gray-400 w-4 h-4" />}
                      className="w-full"
                      classNames={{
                        input: "text-gray-900 placeholder-gray-400 focus:outline-none",
                        inputWrapper: "bg-white border border-gray-300 hover:border-primary-500 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500/20",
                      }}
                    />
                    <div className="flex space-x-3">
                      <Button
                        color="primary"
                        onClick={handleSave}
                        isLoading={isLoading}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
                        startContent={!isLoading && <Icon icon="lucide:save" className="w-4 h-4" />}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="bordered"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Icon icon="lucide:mail" className="text-gray-400 w-4 h-4" />
                      <span className="text-gray-900">{user?.email}</span>
                    </div>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-primary-600 hover:text-primary-700"
                      startContent={<Icon icon="lucide:edit" className="w-4 h-4" />}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Icon icon="lucide:shield" className="text-gray-400 w-4 h-4" />
                  <span className="text-gray-900">
                    {user?.admin_access ? 'Administrator' : 'Provider'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </label>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Icon
                    icon={user?.is_active ? "lucide:check-circle" : "lucide:x-circle"}
                    className={`w-4 h-4 ${user?.is_active ? 'text-green-500' : 'text-red-500'}`}
                  />
                  <span className={`font-medium ${user?.is_active ? 'text-green-700' : 'text-red-700'}`}>
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
