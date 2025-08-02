import React from 'react';
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from '../contexts/AuthContext';

const AdminPage: React.FC = () => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-white font-sans">
            <div className="container mx-auto px-6 py-8 max-w-7xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-gray-600 text-sm mt-1">Welcome, {user?.name} - Administrative Control Panel</p>
                    </div>
                    <Button
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                        onClick={handleLogout}
                        startContent={<Icon icon="lucide:log-out" className="w-4 h-4" />}
                    >
                        Sign Out
                    </Button>
                </div>

                {/* Admin Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* System Overview Card */}
                    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                        <CardBody className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
                                    <Icon icon="lucide:activity" className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
                                    <p className="text-gray-600 text-sm">Monitor system health</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Active Providers</span>
                                    <span className="font-semibold text-primary-600">24</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Patients</span>
                                    <span className="font-semibold text-primary-600">1,247</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">System Status</span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <Icon icon="lucide:check-circle" className="w-3 h-3 mr-1" />
                                        Online
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* User Management Card */}
                    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                        <CardBody className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
                                    <Icon icon="lucide:users" className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                                    <p className="text-gray-600 text-sm">Manage providers</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Button
                                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
                                    size="sm"
                                    startContent={<Icon icon="lucide:user-plus" className="w-4 h-4" />}
                                >
                                    Add New Provider
                                </Button>
                                <Button
                                    className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                                    size="sm"
                                    startContent={<Icon icon="lucide:list" className="w-4 h-4" />}
                                >
                                    View All Providers
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Analytics Card */}
                    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                        <CardBody className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
                                    <Icon icon="lucide:bar-chart-3" className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                                    <p className="text-gray-600 text-sm">View system metrics</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Monthly Growth</span>
                                    <span className="font-semibold text-green-600">+12.5%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Active Sessions</span>
                                    <span className="font-semibold text-primary-600">18</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Data Usage</span>
                                    <span className="font-semibold text-primary-600">2.4 GB</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Settings Card */}
                    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                        <CardBody className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
                                    <Icon icon="lucide:settings" className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
                                    <p className="text-gray-600 text-sm">Configure system</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Button
                                    className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                                    size="sm"
                                    startContent={<Icon icon="lucide:shield" className="w-4 h-4" />}
                                >
                                    Security Settings
                                </Button>
                                <Button
                                    className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                                    size="sm"
                                    startContent={<Icon icon="lucide:database" className="w-4 h-4" />}
                                >
                                    Database Management
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Recent Activity Card */}
                    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                        <CardBody className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
                                    <Icon icon="lucide:clock" className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                                    <p className="text-gray-600 text-sm">Latest system events</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-600">New provider registered</span>
                                    <span className="text-gray-400 text-xs">2 min ago</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-gray-600">System backup completed</span>
                                    <span className="text-gray-400 text-xs">15 min ago</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-gray-600">Database maintenance</span>
                                    <span className="text-gray-400 text-xs">1 hour ago</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Quick Actions Card */}
                    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                        <CardBody className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
                                    <Icon icon="lucide:zap" className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                                    <p className="text-gray-600 text-sm">Common tasks</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Button
                                    className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                                    size="sm"
                                    startContent={<Icon icon="lucide:download" className="w-4 h-4" />}
                                >
                                    Export Data
                                </Button>
                                <Button
                                    className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                                    size="sm"
                                    startContent={<Icon icon="lucide:refresh-cw" className="w-4 h-4" />}
                                >
                                    System Restart
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminPage; 