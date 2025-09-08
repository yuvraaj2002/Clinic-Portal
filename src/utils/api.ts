// API utility functions for making authenticated requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Helper function to extract date part from Date object or ISO string
const extractDatePart = (date: Date | string): string => {
    if (typeof date === 'string') {
        // If it's already a string, check if it contains time part
        return date.includes('T') ? date.split('T')[0]! : date;
    }
    // If it's a Date object, convert to ISO and extract date part
    return date.toISOString().split('T')[0]!;
};

// Debug: Log API base URL
console.log('API Base URL:', API_BASE_URL);
console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);

export const apiCall = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> => {
    const token = sessionStorage.getItem('access_token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making API call to:', url);
    console.log('Headers:', headers);

    return fetch(url, {
        ...options,
        headers,
    });
};

export const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, portal: true }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();

    // Store user data in session storage for later use
    if (data.user) {
        sessionStorage.setItem('userData', JSON.stringify(data.user));
    }

    return data;
};

export const signup = async (name: string, email: string, password: string, admin_access: boolean = false) => {
    const response = await fetch(`${API_BASE_URL}/provider/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            email,
            password,
            admin_access,
            portal: true,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Signup failed');
    }

    return response.json();
};

export const providerSignup = async (email: string, username: string, password: string, provider_tag: string) => {
    // Validate all parameters are provided
    if (!email || !username || !password || !provider_tag) {
        console.error('Missing required parameters:', { email: !!email, username: !!username, password: !!password, provider_tag: !!provider_tag });
        throw new Error('All fields are required for provider signup');
    }

    const requestPayload = {
        email,
        username,
        password,
        provider_tag,
    };

    console.log('Provider signup request payload:', requestPayload);
    console.log('Provider tag value:', provider_tag);
    console.log('Provider tag type:', typeof provider_tag);
    console.log('Provider tag length:', provider_tag.length);
    console.log('API endpoint:', `${API_BASE_URL}/auth/provider-signup`);
    console.log('JSON stringified payload:', JSON.stringify(requestPayload));

    const response = await fetch(`${API_BASE_URL}/auth/provider-signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
    });

    console.log('Provider signup response status:', response.status);
    console.log('Provider signup response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Provider signup error response:', errorData);

        // Check if the error is specifically about provider_tag
        if (errorData.detail && Array.isArray(errorData.detail)) {
            const providerTagError = errorData.detail.find((error: any) =>
                error.loc && error.loc.includes('provider_tag')
            );
            if (providerTagError) {
                console.error('Provider tag validation error:', providerTagError);
                throw new Error('Provider tag is required and cannot be empty');
            }
        }

        throw new Error(errorData.detail || 'Provider signup failed');
    }

    const data = await response.json();
    console.log('Provider signup success response:', data);
    return data;
};

export const logout = async () => {
    try {
        // Call the backend logout endpoint
        const response = await apiCall('/provider/logout', {
            method: 'POST',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('Backend logout failed:', errorData);
        } else {
            const data = await response.json();
            console.log('Backend logout successful:', data);
        }
    } catch (error) {
        console.error('Logout API call failed:', error);
    } finally {
        // Always clear session storage regardless of backend response
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('token_type');
        sessionStorage.removeItem('userData');
    }
};

export const getUserProfile = async () => {
    const response = await apiCall('/provider/me');

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch user profile');
    }

    return response.json();
};

export const updateUserProfile = async (updateData: { email?: string; name?: string }) => {
    const response = await apiCall('/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ ...updateData, portal: true })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update user profile');
    }

    return response.json();
};

export const isAuthenticated = (): boolean => {
    return !!sessionStorage.getItem('access_token');
};

export const getAuthToken = (): string | null => {
    return sessionStorage.getItem('access_token');
};

export const getTokenType = (): string | null => {
    return sessionStorage.getItem('token_type');
};

// Interface for the API response
export interface PatientContact {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    date: string;
    tags?: string[];
}

export interface Patient {
    opportunity_id: string;
    contact: PatientContact;
    provider_name?: string;
}

export type FlexibleValue = string | number | string[] | Record<string, any> | null | undefined;

export interface ContactData {
    Email: FlexibleValue;
    "Date Ordered": FlexibleValue;
    "Order Type": FlexibleValue;
    "Patient Name": FlexibleValue;
    DOB: FlexibleValue;
    "Phone Number": FlexibleValue;
    "Medication Ordered": FlexibleValue;
    "Patient Shipping Address": FlexibleValue;
    "Referred By": FlexibleValue;
    "Payment Status": FlexibleValue;
    "Payment Amount": FlexibleValue;
    "Shipping Payment": FlexibleValue;
    "Shipping Status": FlexibleValue;
    "Tracking Number": FlexibleValue;
    "Date Delivered": FlexibleValue;
    "Invoice/Receipt": FlexibleValue; // Legacy field
    "Invoice/Receipts": FlexibleValue; // New field with array structure
    "Pickup or Delivery": FlexibleValue;
}

export interface Provider {
    name?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

export interface ProvidersResponse {
    success: boolean;
    count: number;
    providers: Provider[];
    active_providers_count: number;
}

export interface ContactDetailsResponse {
    success: boolean;
    contact_data: ContactData;
    contact_id: string;
}

export interface PatientsResponse {
    success: boolean;
    provider_name: string;
    pipeline_id: string;
    filter_applied: string | null;
    total_patients: number;
    patients: Patient[];
}

// Function to fetch patients from the API
export const getPatients = async (providerName?: string, filter?: string | null, customDateRange?: { from: Date | null, to: Date | null }): Promise<PatientsResponse> => {
    // If no provider name is provided, try to get it from session storage
    let finalProviderName = providerName;

    if (!finalProviderName) {
        const userData = sessionStorage.getItem('userData');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                finalProviderName = user.name;
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        }
    }

    // Fallback to default if still no provider name
    if (!finalProviderName) {
        finalProviderName = "BridgeCreek Patient Tracker";
    }

    console.log('Fetching patients with provider name:', finalProviderName, 'and filter:', filter, 'custom range:', customDateRange);

    // Build endpoint with optional filter parameter
    const params = new URLSearchParams({ provider_name: finalProviderName });
    if (filter) {
        params.append('filter', filter);
    }
    if (customDateRange?.from && customDateRange?.to) {
        // Extract just the date part (YYYY-MM-DD) from Date objects
        const startDateOnly = extractDatePart(customDateRange.from);
        const endDateOnly = extractDatePart(customDateRange.to);
        console.log('Original dates:', {
            from: customDateRange.from.toISOString(),
            to: customDateRange.to.toISOString(),
            fromLocal: customDateRange.from.toLocaleDateString(),
            toLocal: customDateRange.to.toLocaleDateString(),
            fromDateOnly: customDateRange.from.toDateString(),
            toDateOnly: customDateRange.to.toDateString()
        });
        console.log('Extracted date parts:', {
            startDateOnly,
            endDateOnly
        });
        params.append('start_date', startDateOnly);
        params.append('end_date', endDateOnly);
    }
    const endpoint = `/provider/provider-patients?${params.toString()}`;
    console.log('API endpoint:', endpoint);

    const response = await apiCall(endpoint);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch patients');
    }

    const data = await response.json();
    console.log('API Success Response:', data);
    return data;
};

// Function to fetch contact details
export const getContactDetails = async (contactId: string): Promise<ContactDetailsResponse> => {
    console.log('Fetching contact details for contact ID:', contactId);
    const endpoint = `/provider/contact-data?contact_id=${encodeURIComponent(contactId)}`;
    console.log('Contact details API endpoint:', endpoint);

    const response = await apiCall(endpoint);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Contact Details API Error Response:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch contact details');
    }

    const data = await response.json();
    console.log('Contact Details API Success Response:', data);
    return data;
};

// Function to fetch providers for admin users
export const getProviders = async (): Promise<ProvidersResponse> => {
    console.log('Fetching providers for admin user');
    const endpoint = '/provider/non-admin-providers';
    console.log('Providers API endpoint:', endpoint);

    const response = await apiCall(endpoint);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Providers API Error Response:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch providers');
    }

    const data = await response.json();
    console.log('Providers API Success Response:', data);
    return data;
};

// Function to fetch all providers (admin only)
export const getAllProviders = async (): Promise<any> => {
    console.log('Fetching all providers for admin user');
    const endpoint = '/provider/all-providers';
    console.log('All providers API endpoint:', endpoint);

    const response = await apiCall(endpoint);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('All Providers API Error Response:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch all providers');
    }

    const data = await response.json();
    console.log('All Providers API Success Response:', data);
    return data;
};

// Function to fetch active non-admin providers (admin only)
export const getActiveNonAdminProviders = async (): Promise<any> => {
    console.log('Fetching active non-admin providers for admin user');
    const endpoint = '/provider/active-non-admin-providers';
    console.log('Active non-admin providers API endpoint:', endpoint);

    const response = await apiCall(endpoint);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Active Non-Admin Providers API Error Response:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch active non-admin providers');
    }

    const data = await response.json();
    console.log('Active Non-Admin Providers API Success Response:', data);
    return data;
};

// Field ID mapping for transforming to GHL API format
export const FIELD_ID_MAPPING: Record<string, string> = {
    "Date Ordered": "3L9XfcLE9YnJkIcKMikl",
    "Order Type": "ihPgOEFYsHfJBXBWSExr",
    "Patient Name": "tOSe4kGY8AXqqFtDtv9Q",
    "DOB": "JM9Qi30fiHvv4kbocCG5",
    "Phone Number": "DE4VA2NCCwp2Z15JlMzB",
    "Medication Ordered": "AfctuG4osa1YP0WlhmTu",
    "Patient Shipping Address": "a9A5pbPilOwaEJbtUpS9",
    "Referred By": "t41bERLhv9RaMzBeOHUH",
    "Payment Status": "DzlxhiFcXqKsMDSTBKHT",
    "Payment Amount": "Q2D8aa75BpHYyUxNNKkK",
    "Shipping Payment": "FDdiCWYri6rjpUn3KNIS",
    "Shipping Status": "jqzO2CJuwdi1vRJQdiKp",
    "Tracking Number": "hqyAyDL8kYzytWheHjhO",
    "Date Delivered": "uxDE2aB3j7XaCLIy0jGk",
    "Invoice/Receipt": "bAzVoq0S0QQcdyz80hnL",
    "Pickup or Delivery": "Bxgse825AkpLtcVitLHs"
};

// Function to update contact data using admin endpoint (accepts flat field map or pre-built customField)
export const updateContactAdmin = async (contactId: string, updateData: any): Promise<any> => {
    console.log('Updating contact data for contact ID:', contactId);
    console.log('Raw update data from UI:', updateData);

    // If caller already provided GHL shape, pass through
    let updatePayload: any;
    if (updateData && typeof updateData === 'object' && Array.isArray(updateData.customField)) {
        updatePayload = { customField: updateData.customField };
    } else if (updateData && typeof updateData === 'object') {
        // Transform flat { "Field Name": value } to GHL { customField: [{ id, value }] }
        const customFields = Object.entries(updateData)
            .filter(([_, value]) => value !== null && value !== undefined && value !== '')
            .map(([fieldName, value]) => ({ id: FIELD_ID_MAPPING[fieldName], value }))
            .filter((cf) => Boolean(cf.id));
        updatePayload = customFields.length > 0 ? { customField: customFields } : {};
    } else {
        updatePayload = {};
    }

    const endpoint = `/provider/update-contact`;
    console.log('Update contact admin API endpoint:', endpoint);
    console.log('Transformed update payload:', updatePayload);

    const response = await apiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify({
            contact_id: contactId,
            update_data: updatePayload
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update Contact Admin API Error Response:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Failed to update contact data');
    }

    const data = await response.json();
    console.log('Update Contact Admin API Success Response:', data);
    return data;
};

// Function to handle forgot password request
export const forgotPassword = async (email: string) => {
    console.log('Forgot password called with email:', email);
    console.log('API Base URL:', API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, portal: true }),
    });

    console.log('Forgot password response status:', response.status);
    console.log('Forgot password response headers:', response.headers);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Forgot password error response:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Failed to send password reset email');
    }

    const data = await response.json();
    console.log('Forgot password API Success Response:', data);
    return data;
};

// Function to validate reset token
export const validateResetToken = async (token: string) => {
    console.log('Validate reset token called with token:', token);
    console.log('API Base URL:', API_BASE_URL);

    const url = `${API_BASE_URL}/auth/validate-reset-token/${token}`;
    console.log('Making validate token request to:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    console.log('Validate token response status:', response.status);
    console.log('Validate token response headers:', response.headers);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Validate token error response:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Failed to validate reset token');
    }

    const data = await response.json();
    console.log('Validate reset token API Success Response:', data);
    return data;
};

// Function to reset password with token
export const resetPassword = async (token: string, newPassword: string) => {
    console.log('Reset password called with token:', token);
    console.log('API Base URL:', API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: newPassword, portal: true }),
    });

    console.log('Reset password response status:', response.status);
    console.log('Reset password response headers:', response.headers);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Reset password error response:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Failed to reset password');
    }

    const data = await response.json();
    console.log('Reset password API Success Response:', data);
    return data;
};

// Function to export contacts as Excel file
export const exportContacts = async (contactIds: string[]): Promise<Blob> => {
    console.log('Exporting contacts with IDs:', contactIds);
    console.log('API endpoint:', `${API_BASE_URL}/provider/export-contacts`);

    if (!contactIds || contactIds.length === 0) {
        throw new Error('No contact IDs provided for export');
    }

    const response = await apiCall('/provider/export-contacts', {
        method: 'POST',
        body: JSON.stringify(contactIds),
    });

    console.log('Export contacts response status:', response.status);
    console.log('Export contacts response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Export contacts error response:', errorData);
        throw new Error(errorData.detail || 'Failed to export contacts');
    }

    // Get the blob from the response
    const blob = await response.blob();
    console.log('Export contacts success - blob size:', blob.size, 'bytes');
    return blob;
}; 