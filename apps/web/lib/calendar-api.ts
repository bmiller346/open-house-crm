// Calendar API Integration Service
// Connects the frontend calendar to our backend API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Types for API responses
export interface ApiAppointment {
  id: string;
  title: string;
  description?: string;
  type: 'viewing' | 'meeting' | 'call' | 'inspection' | 'signing' | 'consultation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  startTime: string;
  endTime: string;
  location?: string;
  contactId?: string;
  propertyId?: string;
  agentId: string;
  attendees?: string[];
  reminders?: any[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  title: string;
  description?: string;
  type: string;
  priority?: string;
  startTime: string;
  endTime: string;
  location?: string;
  contactId?: string;
  propertyId?: string;
  attendees?: string[];
  reminders?: any[];
  metadata?: Record<string, any>;
}

export interface UpdateAppointmentRequest extends Partial<CreateAppointmentRequest> {
  status?: string;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
  reason?: string;
}

export interface CalendarAnalytics {
  totalAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
  cancelledAppointments: number;
  appointmentsByType: Record<string, number>;
  appointmentsByPriority: Record<string, number>;
  busyHours: Record<string, number>;
  averageAppointmentDuration: number;
  conversionRate: number;
}

// API Error class
export class CalendarApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'CalendarApiError';
  }
}

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

// HTTP client with auth
const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new CalendarApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData.code
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof CalendarApiError) {
      throw error;
    }
    throw new CalendarApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
};

// Calendar API functions
export const calendarApi = {
  // Get appointments with filtering
  getAppointments: async (params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    status?: string;
    contactId?: string;
    propertyId?: string;
  }): Promise<ApiAppointment[]> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });
    }
    
    const queryString = query.toString();
    return apiClient(`/calendar/appointments${queryString ? `?${queryString}` : ''}`);
  },

  // Get single appointment
  getAppointment: async (id: string): Promise<ApiAppointment> => {
    return apiClient(`/calendar/appointments/${id}`);
  },

  // Create new appointment
  createAppointment: async (data: CreateAppointmentRequest): Promise<ApiAppointment> => {
    return apiClient('/calendar/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update appointment
  updateAppointment: async (
    id: string,
    data: UpdateAppointmentRequest
  ): Promise<ApiAppointment> => {
    return apiClient(`/calendar/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete appointment
  deleteAppointment: async (id: string): Promise<void> => {
    return apiClient(`/calendar/appointments/${id}`, {
      method: 'DELETE',
    });
  },

  // Smart scheduling - AI-powered appointment suggestion
  smartSchedule: async (data: {
    title: string;
    type: string;
    duration: number;
    preferredTimes?: string[];
    contactId?: string;
    propertyId?: string;
    priority?: string;
  }): Promise<{
    suggestedSlots: AvailabilitySlot[];
    appointment?: ApiAppointment;
    reasoning: string;
  }> => {
    return apiClient('/calendar/smart-schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get available time slots
  getAvailableSlots: async (params: {
    startDate: string;
    endDate: string;
    duration: number;
    bufferTime?: number;
  }): Promise<AvailabilitySlot[]> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    
    return apiClient(`/calendar/available-slots?${query.toString()}`);
  },

  // Get user availability
  getUserAvailability: async (params: {
    startDate: string;
    endDate: string;
  }): Promise<AvailabilitySlot[]> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      query.append(key, value);
    });
    
    return apiClient(`/calendar/availability?${query.toString()}`);
  },

  // Update user availability
  updateAvailability: async (data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[]): Promise<void> => {
    return apiClient('/calendar/availability', {
      method: 'PUT',
      body: JSON.stringify({ availability: data }),
    });
  },

  // Bulk operations
  bulkUpdateAppointments: async (data: {
    appointmentIds: string[];
    updates: UpdateAppointmentRequest;
  }): Promise<ApiAppointment[]> => {
    return apiClient('/calendar/appointments/bulk', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  bulkDeleteAppointments: async (appointmentIds: string[]): Promise<void> => {
    return apiClient('/calendar/appointments/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ appointmentIds }),
    });
  },

  // Analytics
  getAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<CalendarAnalytics> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });
    }
    
    const queryString = query.toString();
    return apiClient(`/calendar/analytics${queryString ? `?${queryString}` : ''}`);
  },

  // Calendar sync
  syncCalendar: async (data: {
    provider: 'google' | 'outlook' | 'apple';
    accessToken: string;
  }): Promise<{ synced: number; errors: any[] }> => {
    return apiClient('/calendar/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Conflict detection
  checkConflicts: async (data: {
    startTime: string;
    endTime: string;
    excludeId?: string;
  }): Promise<{
    hasConflicts: boolean;
    conflicts: ApiAppointment[];
    suggestions: AvailabilitySlot[];
  }> => {
    return apiClient('/calendar/conflicts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Reminders
  getReminders: async (): Promise<{
    upcoming: ApiAppointment[];
    overdue: ApiAppointment[];
  }> => {
    return apiClient('/calendar/reminders');
  },

  // Export calendar
  exportCalendar: async (params: {
    format: 'ics' | 'csv' | 'pdf';
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });
    
    const response = await fetch(`${API_BASE_URL}/calendar/export?${query.toString()}`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
    
    if (!response.ok) {
      throw new CalendarApiError('Export failed', response.status);
    }
    
    return response.blob();
  },
};

// React hooks for calendar API (if using React Query)
export const calendarQueries = {
  appointments: (params?: Parameters<typeof calendarApi.getAppointments>[0]) => ({
    queryKey: ['appointments', params],
    queryFn: () => calendarApi.getAppointments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }),

  appointment: (id: string) => ({
    queryKey: ['appointment', id],
    queryFn: () => calendarApi.getAppointment(id),
    enabled: !!id,
  }),

  availableSlots: (params: Parameters<typeof calendarApi.getAvailableSlots>[0]) => ({
    queryKey: ['available-slots', params],
    queryFn: () => calendarApi.getAvailableSlots(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  }),

  analytics: (params?: Parameters<typeof calendarApi.getAnalytics>[0]) => ({
    queryKey: ['calendar-analytics', params],
    queryFn: () => calendarApi.getAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  }),

  reminders: () => ({
    queryKey: ['calendar-reminders'],
    queryFn: () => calendarApi.getReminders(),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  }),
};

// Calendar mutations (if using React Query)
export const calendarMutations = {
  createAppointment: {
    mutationFn: calendarApi.createAppointment,
    onSuccess: () => {
      // Invalidate appointments query
    },
  },

  updateAppointment: {
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentRequest }) =>
      calendarApi.updateAppointment(id, data),
    onSuccess: () => {
      // Invalidate appointments query
    },
  },

  deleteAppointment: {
    mutationFn: calendarApi.deleteAppointment,
    onSuccess: () => {
      // Invalidate appointments query
    },
  },

  smartSchedule: {
    mutationFn: calendarApi.smartSchedule,
  },

  updateAvailability: {
    mutationFn: calendarApi.updateAvailability,
    onSuccess: () => {
      // Invalidate availability queries
    },
  },
};

export default calendarApi;
