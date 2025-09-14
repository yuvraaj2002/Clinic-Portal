// Utility functions for extracting dates from PDF filenames

export interface ReceiptWithDate {
    url: string;
    original_name: string;
    extractedDate?: Date | null;
    hasValidDate: boolean;
}

/**
 * Extracts date from PDF filename patterns
 * Specifically handles MM-DD-YY format like "8-29-25"
 */
export function extractDateFromFilename(filename: string): Date | null {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.(pdf|PDF)$/, '');

    // Look for MM-DD-YY pattern (with optional spaces around it)
    const pattern = /(\d{1,2})-(\d{1,2})-(\d{2})/;
    const match = nameWithoutExt.match(pattern);

    if (match) {
        const [, monthStr, dayStr, yearStr] = match;

        if (!monthStr || !dayStr || !yearStr) {
            return null;
        }

        const month = parseInt(monthStr);
        const day = parseInt(dayStr);
        const year = 2000 + parseInt(yearStr); // Convert YY to 20YY

        // Validate the date
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            const date = new Date(year, month - 1, day);

            // Check if the date is valid (handles cases like Feb 30)
            if (date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day) {
                return date;
            }
        }
    }

    return null;
}

/**
 * Processes receipts array to extract dates and sort them
 */
export function processReceiptsWithDates(receipts: Array<{ url: string; original_name: string }>): ReceiptWithDate[] {
    const processedReceipts: ReceiptWithDate[] = receipts.map(receipt => {
        const extractedDate = extractDateFromFilename(receipt.original_name);
        return {
            ...receipt,
            extractedDate,
            hasValidDate: extractedDate !== null
        };
    });

    // Sort: receipts with valid dates first (ascending), then receipts without dates
    return processedReceipts.sort((a, b) => {
        if (a.hasValidDate && b.hasValidDate) {
            // Both have dates, sort by date ascending
            return a.extractedDate!.getTime() - b.extractedDate!.getTime();
        } else if (a.hasValidDate && !b.hasValidDate) {
            // a has date, b doesn't - a comes first
            return -1;
        } else if (!a.hasValidDate && b.hasValidDate) {
            // b has date, a doesn't - b comes first
            return 1;
        } else {
            // Neither has date, maintain original order
            return 0;
        }
    });
}

/**
 * Sorts receipts by date in specified order
 */
export function sortReceiptsByDate(
    receipts: ReceiptWithDate[],
    order: 'asc' | 'desc' = 'asc'
): ReceiptWithDate[] {
    return [...receipts].sort((a, b) => {
        if (a.hasValidDate && b.hasValidDate) {
            const comparison = a.extractedDate!.getTime() - b.extractedDate!.getTime();
            return order === 'asc' ? comparison : -comparison;
        } else if (a.hasValidDate && !b.hasValidDate) {
            return order === 'asc' ? -1 : 1;
        } else if (!a.hasValidDate && b.hasValidDate) {
            return order === 'asc' ? 1 : -1;
        } else {
            return 0;
        }
    });
}

/**
 * Formats date for display
 */
export function formatReceiptDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
