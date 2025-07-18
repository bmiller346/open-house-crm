// API integration utilities for Open House CRM

const API_BASE_URL = 'http://localhost:3001';

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// Get auth headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  // Attach workspace ID header if available
  try {
    const user = getCurrentUser();
    if (user?.workspaces?.length) {
      headers['X-Workspace-ID'] = user.workspaces[0];
    }
  } catch {}
  return headers;
};

// API request wrapper
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Dashboard API
export const dashboardApi = {
  getStats: () => apiRequest('/api/dashboard/stats'),
  getActivity: () => apiRequest('/api/dashboard/activity')
};

// Contacts API
export const contactsApi = {
  getContacts: (params?: any) => apiRequest(`/api/contacts${params ? `?${new URLSearchParams(params)}` : ''}`),
  getContact: (id: string) => apiRequest(`/api/contacts/${id}`),
  createContact: (data: any) => apiRequest('/api/contacts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateContact: (id: string, data: any) => apiRequest(`/api/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteContact: (id: string) => apiRequest(`/api/contacts/${id}`, {
    method: 'DELETE'
  })
};

// Transactions API
export const transactionsApi = {
  getTransactions: (params?: any) => apiRequest(`/api/transactions${params ? `?${new URLSearchParams(params)}` : ''}`),
  getTransaction: (id: string) => apiRequest(`/api/transactions/${id}`),
  createTransaction: (data: any) => apiRequest('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTransaction: (id: string, data: any) => apiRequest(`/api/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTransaction: (id: string) => apiRequest(`/api/transactions/${id}`, {
    method: 'DELETE'
  })
};

// Inventory API (Properties)
export const inventoryApi = {
  getProperties: (params?: any) => apiRequest(`/api/inventory${params ? `?${new URLSearchParams(params)}` : ''}`),
  getProperty: (id: string) => apiRequest(`/api/inventory/${id}`),
  createProperty: (data: any) => apiRequest('/api/inventory', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProperty: (id: string, data: any) => apiRequest(`/api/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteProperty: (id: string) => apiRequest(`/api/inventory/${id}`, {
    method: 'DELETE'
  })
};

// Calendar API
export const calendarApi = {
  getAppointments: (params?: any) => apiRequest(`/api/calendar/appointments${params ? `?${new URLSearchParams(params)}` : ''}`),
  createAppointment: (data: any) => apiRequest('/api/calendar/appointments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateAppointment: (id: string, data: any) => apiRequest(`/api/calendar/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteAppointment: (id: string) => apiRequest(`/api/calendar/appointments/${id}`, {
    method: 'DELETE'
  })
};

// User/Workspace API
export const userApi = {
  getProfile: () => apiRequest('/api/users/profile'),
  updateProfile: (data: any) => apiRequest('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  getWorkspaces: () => apiRequest('/api/workspaces'),
  createWorkspace: (data: any) => apiRequest('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Authentication check
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    return payload.exp > now;
  } catch {
    return false;
  }
};

// Get current user from token
export const getCurrentUser = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.userId,
      email: payload.email,
      workspaces: payload.workspaces || []
    };
  } catch {
    return null;
  }
};
