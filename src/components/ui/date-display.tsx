import React from 'react';
import { Icon } from '@iconify/react';
import { cn } from '../../lib/utils';

interface DateDisplayProps {
    date: string | Date;
    format?: 'short' | 'long' | 'time' | 'relative';
    className?: string;
    timeZone?: string;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({
    date,
    format = 'short',
    className,
    timeZone = 'America/New_York'
}) => {
    const formatDate = (dateInput: string | Date) => {
        const dateObj = new Date(dateInput);

        if (isNaN(dateObj.getTime())) {
            return 'Invalid Date';
        }

        switch (format) {
            case 'short':
                return dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    timeZone
                });
            case 'long':
                return dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone
                });
            case 'time':
                return dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone
                });
            case 'relative':
                const now = new Date();
                const diffInMs = now.getTime() - dateObj.getTime();
                const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
                const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
                const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

                if (diffInMs < 0) {
                    return dateObj.toLocaleDateString('en-US', { timeZone });
                } else if (diffInMinutes < 1) {
                    return 'Just now';
                } else if (diffInMinutes < 60) {
                    return `${diffInMinutes} min ago`;
                } else if (diffInHours < 24) {
                    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
                } else if (diffInDays < 7) {
                    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
                } else {
                    return dateObj.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        timeZone
                    });
                }
            default:
                return dateObj.toLocaleDateString('en-US', { timeZone });
        }
    };

    return (
        <div className={cn('text-sm text-gray-600 flex items-center', className)}>
            <Icon icon="lucide:calendar" className="w-3 h-3 mr-1 text-gray-400" />
            {formatDate(date)}
        </div>
    );
};
