'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
// Helper functions to replace date-fns
const formatDate = (date: Date, formatStr: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Use UTC methods to avoid timezone issues
    const month = months[date.getUTCMonth()];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    if (formatStr === 'MMM dd, yyyy') {
        return `${month} ${day.toString().padStart(2, '0')}, ${year}`;
    }
    return date.toLocaleDateString();
};

const differenceInDays = (date1: Date, date2: Date) => {
    const timeDiff = date1.getTime() - date2.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// Helper function to create a date at midnight UTC to avoid timezone issues
const createDateAtMidnight = (year: number, month: number, day: number): Date => {
    // Create date in UTC to avoid timezone conversion issues
    return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
};
import { cn } from '../../lib/utils';

interface DateRange {
    from: Date | null;
    to: Date | null;
}

interface DateRangePickerProps {
    value?: DateRange;
    onChange?: (range: DateRange) => void;
    className?: string;
    placeholder?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    value,
    onChange,
    className,
    placeholder = "Select date range"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tempRange, setTempRange] = useState<DateRange>(value || { from: null, to: null });

    const handleDateSelect = (date: Date) => {
        // Normalize the selected date to midnight UTC to avoid timezone issues
        const normalizedDate = createDateAtMidnight(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

        console.log('Date selected:', {
            original: date.toISOString(),
            normalized: normalizedDate.toISOString(),
            localDate: normalizedDate.toLocaleDateString()
        });

        if (!tempRange.from || (tempRange.from && tempRange.to)) {
            // Start new range
            setTempRange({ from: normalizedDate, to: null });
        } else if (tempRange.from && !tempRange.to) {
            // Complete the range
            const from = tempRange.from;
            const to = normalizedDate;

            if (from > to) {
                // Swap if from is after to
                setTempRange({ from: to, to: from });
            } else {
                setTempRange({ from, to });
            }
        }
    };

    const handleApply = () => {
        if (tempRange.from && tempRange.to) {
            console.log('Date range picker - applying range:', {
                from: tempRange.from.toISOString(),
                to: tempRange.to.toISOString(),
                fromLocal: tempRange.from.toLocaleDateString(),
                toLocal: tempRange.to.toLocaleDateString()
            });
            onChange?.(tempRange);
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        setTempRange({ from: null, to: null });
        onChange?.({ from: null, to: null });
        setIsOpen(false);
    };

    const formatRange = () => {
        if (!value?.from || !value?.to) return placeholder;

        const fromStr = formatDate(value.from, 'MMM dd, yyyy');
        const toStr = formatDate(value.to, 'MMM dd, yyyy');
        const days = differenceInDays(value.to, value.from) + 1;

        return `${fromStr} - ${toStr} (${days} days)`;
    };

    const generateCalendarDays = (year: number, month: number) => {
        const firstDay = new Date(year, month, 1);
        const startDayOfWeek = firstDay.getDay();
        const startDate = createDateAtMidnight(year, month, 1 - startDayOfWeek);

        const days = [];
        const today = new Date();

        for (let i = 0; i < 42; i++) {
            // Create date at midnight to avoid timezone issues
            const currentDay = startDate.getDate() + i;
            const currentMonth = startDate.getMonth();
            const currentYear = startDate.getFullYear();

            // Handle month overflow properly
            const tempDate = new Date(currentYear, currentMonth, currentDay);
            const date = createDateAtMidnight(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());

            const isCurrentMonth = date.getUTCMonth() === month;
            const isToday = date.toDateString() === today.toDateString();
            const isInRange = tempRange.from && tempRange.to &&
                date >= tempRange.from && date <= tempRange.to;
            const isStart = tempRange.from && date.toDateString() === tempRange.from.toDateString();
            const isEnd = tempRange.to && date.toDateString() === tempRange.to.toDateString();
            const isSelected = isStart || isEnd;

            days.push({
                date,
                isCurrentMonth,
                isToday,
                isInRange,
                isStart,
                isEnd,
                isSelected
            });
        }

        return days;
    };

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const calendarDays = generateCalendarDays(
        currentMonth.getFullYear(),
        currentMonth.getMonth()
    );

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev);
            if (direction === 'prev') {
                newMonth.setMonth(prev.getMonth() - 1);
            } else {
                newMonth.setMonth(prev.getMonth() + 1);
            }
            return newMonth;
        });
    };

    return (
        <div className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm font-medium",
                    "bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100",
                    "rounded-lg shadow-sm hover:bg-gradient-to-r hover:from-primary-100 hover:to-secondary-100",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                    "transition-all duration-200"
                )}
            >
                <span className="flex items-center space-x-2">
                    <Icon icon="lucide:calendar-range" className="w-4 h-4 text-primary-600" />
                    <span className={cn(
                        value?.from && value?.to ? "text-gray-900" : "text-gray-500"
                    )}>
                        {formatRange()}
                    </span>
                </span>
                <Icon
                    icon="lucide:chevron-down"
                    className={cn(
                        "w-4 h-4 text-primary-600 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-80">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={() => navigateMonth('prev')}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                        </button>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <button
                            type="button"
                            onClick={() => navigateMonth('next')}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                        {calendarDays.map((day, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleDateSelect(day.date)}
                                className={cn(
                                    "h-8 w-8 text-sm rounded-lg transition-all duration-200",
                                    "hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500",
                                    !day.isCurrentMonth && "text-gray-300",
                                    day.isCurrentMonth && "text-gray-900",
                                    day.isToday && !day.isSelected && "bg-primary-100 text-primary-700 font-semibold",
                                    day.isInRange && !day.isStart && !day.isEnd && "bg-primary-50",
                                    day.isStart && "bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold",
                                    day.isEnd && "bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold",
                                    day.isSelected && "ring-2 ring-primary-500 ring-offset-1"
                                )}
                            >
                                {day.date.getDate()}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Clear
                        </button>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleApply}
                                disabled={!tempRange.from || !tempRange.to}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200",
                                    "bg-gradient-to-r from-primary-500 to-secondary-500 text-white",
                                    "hover:from-primary-600 hover:to-secondary-600",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                )}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
