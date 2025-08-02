// API utility functions for making authenticated requests
const API_BASE_URL = import.meta.env.VITE_API_URL;

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

    return fetch(`${API_BASE_URL}${endpoint}`, {
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
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
};

export const logout = async () => {
    try {
        // Call the backend logout endpoint
        const response = await apiCall('/auth/logout', {
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
    const response = await apiCall('/auth/me');

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch user profile');
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
    company_name: string | null;
    phone: string;
    email: string | null;
    tags: string[];
}

export interface Patient {
    opportunity_id: string;
    name: string;
    monetary_value: number;
    status: string;
    source: string | null;
    created_at: string;
    last_status_change: string;
    contact: PatientContact;
}

export interface PatientsResponse {
    success: boolean;
    provider_name: string;
    pipeline_id: string;
    total_patients: number;
    patients: Patient[];
}

// Function to fetch patients from the API
export const getPatients = async (providerName: string = "BridgeCreek Patient"): Promise<PatientsResponse> => {
    const response = await apiCall(`/ghl/provider-patients?provider_name=${encodeURIComponent(providerName)}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch patients');
    }

    return response.json();
}; 