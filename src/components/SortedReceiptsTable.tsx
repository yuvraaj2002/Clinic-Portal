import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';
import {
    processReceiptsWithDates,
    sortReceiptsByDate,
    formatReceiptDate
} from '../utils/dateExtraction';

interface ReceiptData {
    url: string;
    original_name: string;
}

interface SortedReceiptsTableProps {
    receipts: ReceiptData[];
}

const SortedReceiptsTable: React.FC<SortedReceiptsTableProps> = ({ receipts }) => {
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Process receipts to extract dates
    const processedReceipts = useMemo(() => {
        return processReceiptsWithDates(receipts);
    }, [receipts]);

    // Sort receipts based on current sort order
    const sortedReceipts = useMemo(() => {
        return sortReceiptsByDate(processedReceipts, sortOrder);
    }, [processedReceipts, sortOrder]);

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    if (receipts.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-gray-500">
                <Icon icon="lucide:file-x" className="w-8 h-8 mr-3" />
                <span className="text-lg">No receipts available for this patient</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Sort controls */}
            <div className="flex items-center justify-end">
                <Button
                    variant="light"
                    size="sm"
                    onClick={toggleSortOrder}
                    className="flex items-center space-x-2"
                >
                    <Icon
                        icon={sortOrder === 'asc' ? 'lucide:arrow-up-down' : 'lucide:arrow-down-up'}
                        className="w-4 h-4"
                    />
                    <span>Sort by Date</span>
                    <Icon
                        icon={sortOrder === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down'}
                        className="w-3 h-3"
                    />
                </Button>
            </div>

            {/* Receipts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedReceipts.map((receipt, index) => (
                    <div
                        key={index}
                        className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center">
                            {/* Document Icon */}
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                                <Icon icon="lucide:file-text" className="w-8 h-8 text-primary-600" />
                            </div>

                            {/* Filename */}
                            <h4 className="font-semibold text-gray-900 text-base mb-2 group-hover:text-primary-600 transition-colors duration-200 break-words">
                                {receipt.original_name}
                            </h4>

                            {/* Date Information */}
                            <div className="mb-4">
                                {receipt.hasValidDate ? (
                                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                        <Icon icon="lucide:calendar" className="w-4 h-4" />
                                        <span className="font-medium">
                                            {formatReceiptDate(receipt.extractedDate!)}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                                        <Icon icon="lucide:calendar-x" className="w-4 h-4" />
                                        <span>No date found</span>
                                    </div>
                                )}
                            </div>

                            {/* View Document Button */}
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

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                        <span>
                            <span className="font-medium">{sortedReceipts.filter(r => r.hasValidDate).length}</span> documents with dates
                        </span>
                        <span>
                            <span className="font-medium">{sortedReceipts.filter(r => !r.hasValidDate).length}</span> documents without dates
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">
                        Sorted {sortOrder === 'asc' ? 'oldest first' : 'newest first'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortedReceiptsTable;
