import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { getContactHistoricalData, HistoricalDataRecord } from '../utils/api';

interface HistoricalDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactId: string;
    patientName: string;
}

const HistoricalDataModal: React.FC<HistoricalDataModalProps> = ({
    isOpen,
    onClose,
    contactId,
    patientName
}) => {
    const [historicalData, setHistoricalData] = useState<HistoricalDataRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Format currency for display
    const formatCurrency = (value: number | null): string => {
        if (value === null || value === undefined) return 'N/A';
        return `$${value.toFixed(2)}`;
    };

    // Format date for display
    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Format date to YYYY-MM-DD format
    const formatDateSimple = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0] || 'N/A';
        } catch {
            return dateString;
        }
    };

    // Fetch historical data when modal opens
    useEffect(() => {
        if (isOpen && contactId) {
            fetchHistoricalData();
        }
    }, [isOpen, contactId]);

    const fetchHistoricalData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getContactHistoricalData(contactId);
            setHistoricalData(response.records);
        } catch (err) {
            console.error('Failed to fetch historical data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Historical Data</h2>
                            <p className="text-white/80 mt-1">Patient: {patientName}</p>
                        </div>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={onClose}
                        >
                            <Icon icon="lucide:x" className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-primary-600 mr-3" />
                            <span className="text-gray-600 font-medium text-lg">Loading historical data...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-12 text-red-600">
                            <Icon icon="lucide:alert-circle" className="w-8 h-8 mr-3" />
                            <div className="text-center">
                                <span className="text-lg font-medium block">Failed to load historical data</span>
                                <span className="text-sm text-red-500 mt-1">{error}</span>
                                <Button
                                    color="primary"
                                    size="sm"
                                    onClick={fetchHistoricalData}
                                    className="mt-3"
                                    startContent={<Icon icon="lucide:refresh-cw" className="w-4 h-4" />}
                                >
                                    Retry
                                </Button>
                            </div>
                        </div>
                    ) : historicalData.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-gray-500">
                            <Icon icon="lucide:history" className="w-8 h-8 mr-3" />
                            <span className="text-lg">No historical data found for this patient</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Summary Header */}
                            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                            <Icon icon="lucide:database" className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {historicalData.length} Historical Record{historicalData.length !== 1 ? 's' : ''}
                                            </h3>
                                            <p className="text-sm text-gray-600">Complete order history for this patient</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-primary-600 bg-white px-3 py-1 rounded-full border border-primary-200">
                                        Newest First
                                    </div>
                                </div>
                            </div>

                            {/* Timeline View */}
                            <div className="relative">
                                {/* Timeline Line */}
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-300 to-transparent"></div>

                                {/* Historical Records */}
                                <div className="space-y-6">
                                    {historicalData.map((record, index) => (
                                        <div key={record.id} className="relative">
                                            {/* Timeline Dot */}
                                            <div className="absolute left-4 w-4 h-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full border-2 border-white shadow-lg"></div>

                                            {/* Record Card */}
                                            <div className="ml-12 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                                                {/* Card Header */}
                                                <div className="bg-gradient-to-r from-gray-50 to-primary-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-sm font-bold text-primary-600">#{historicalData.length - index}</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-semibold text-gray-900">
                                                                    Order #{record.id}
                                                                </h4>
                                                                <p className="text-sm text-gray-500">
                                                                    Created {formatDate(record.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-semibold text-gray-900">
                                                                {formatDateSimple(record.date_ordered)}
                                                            </div>
                                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Order Date</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Body */}
                                                <div className="p-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                        {/* Order Information */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center space-x-2 mb-3">
                                                                <Icon icon="lucide:package" className="w-5 h-5 text-primary-600" />
                                                                <h5 className="font-semibold text-gray-900 uppercase tracking-wide text-sm">Order Info</h5>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs text-gray-500 font-medium">Type</span>
                                                                    <span className="text-sm font-semibold text-gray-900">{record.order_type}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs text-gray-500 font-medium">Medication</span>
                                                                    <span className="text-sm font-semibold text-gray-900">{record.medication_ordered}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs text-gray-500 font-medium">Referred By</span>
                                                                    <span className="text-sm font-semibold text-gray-900">{record.referred_by || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Payment & Shipping */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center space-x-2 mb-3">
                                                                <Icon icon="lucide:credit-card" className="w-5 h-5 text-green-600" />
                                                                <h5 className="font-semibold text-gray-900 uppercase tracking-wide text-sm">Payment & Shipping</h5>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg">
                                                                    <span className="text-sm font-medium text-gray-700">Payment</span>
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.payment_status.toLowerCase() === 'paid'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                            }`}>
                                                                            {record.payment_status}
                                                                        </span>
                                                                        <span className="text-lg font-bold text-green-600">{formatCurrency(record.payment_amount)}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                                                                    <span className="text-sm font-medium text-gray-700">Shipping</span>
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.shipping_status.toLowerCase() === 'delivered'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-blue-100 text-blue-800'
                                                                            }`}>
                                                                            {record.shipping_status}
                                                                        </span>
                                                                        <span className="text-sm font-semibold text-gray-700">{formatCurrency(record.shipping_payment)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Delivery Information */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center space-x-2 mb-3">
                                                                <Icon icon="lucide:truck" className="w-5 h-5 text-blue-600" />
                                                                <h5 className="font-semibold text-gray-900 uppercase tracking-wide text-sm">Delivery Info</h5>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs text-gray-500 font-medium">Method</span>
                                                                    <span className="text-sm font-semibold text-gray-900">{record.pickup_or_delivery}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs text-gray-500 font-medium">Tracking Number</span>
                                                                    <span className="text-sm font-semibold text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                                                                        {record.tracking_number || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs text-gray-500 font-medium">Delivered</span>
                                                                    <span className="text-sm font-semibold text-gray-900">
                                                                        {record.date_delivered ? formatDateSimple(record.date_delivered) : 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Shipping Address */}
                                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                                        <div className="flex items-start space-x-3">
                                                            <Icon icon="lucide:map-pin" className="w-5 h-5 text-gray-600 mt-0.5" />
                                                            <div>
                                                                <h6 className="text-sm font-medium text-gray-700 mb-1">Shipping Address</h6>
                                                                <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                                                    {record.patient_shipping_address}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoricalDataModal;
