// API utility functions for making authenticated requests
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Debug: Log API base URL
console.log('API Base URL:', API_BASE_URL);

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
    const response = await fetch(`${API_BASE_URL}/provider/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
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
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Signup failed');
    }

    return response.json();
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
    tags?: string[];
}

export interface Patient {
    opportunity_id: string;
    contact: PatientContact;
}

export interface CustomField {
    id: string;
    name: string;
    value: string | number | string[] | object;
}

export interface ContactData {
    locationId: string;
    phone: string;
    country: string;
    fullNameLowerCase: string;
    emailLowerCase: string;
    email: string;
    customField: CustomField[];
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
    total_patients: number;
    patients: Patient[];
}

// Function to fetch patients from the API
export const getPatients = async (providerName?: string): Promise<PatientsResponse> => {
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

    console.log('Fetching patients with provider name:', finalProviderName);
    const endpoint = `/provider/provider-patients?provider_name=${encodeURIComponent(finalProviderName)}`;
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