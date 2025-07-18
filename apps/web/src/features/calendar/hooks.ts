// 📅 Calendar hooks - Full integration with backend API
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { 
  Appointment, 
  Availability, 
  CalendarFilters, 
  SmartScheduleRequest, 
  SmartScheduleResponse,
  CalendarAnalytics,
  DailyAgenda,
  TimeSlot,
  CalendarView
} from './types';

// API base URL - should come from environment
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Calendar API functions
const calendarAPI = {
  // Appointments
  getAppointments: async (filters: CalendarFilters = {}): Promise<{ data: Appointment[], count: number }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    const response = await fetch(`${API_BASE}/calendar/appointments?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (!response.ok) throw new Error('Failed to fetch appointments');
    return response.json();
  },

  createAppointment: async (appointment: Partial<Appointment>): Promise<{ data: Appointment }> => {
    const response = await fetch(`${API_BASE}/calendar/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(appointment)
    });
    
    if (!response.ok) throw new Error('Failed to create appointment');
    return response.json();
  },

  updateAppointment: async ({ id, ...appointment }: Partial<Appointment> & { id: string }): Promise<{ data: Appointment }> => {
    const response = await fetch(`${API_BASE}/calendar/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(appointment)
    });
    
    if (!response.ok) throw new Error('Failed to update appointment');
    return response.json();
  },

  deleteAppointment: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/calendar/appointments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (!response.ok) throw new Error('Failed to delete appointment');
  },

  // Smart scheduling
  smartSchedule: async (request: SmartScheduleRequest): Promise<SmartScheduleResponse> => {
    const response = await fetch(`${API_BASE}/calendar/smart-schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) throw new Error('Failed to smart schedule appointment');
    return response.json();
  },

  // Availability
  getAvailableSlots: async (userId: string, date: string, duration = 60): Promise<{ data: TimeSlot[] }> => {
    const response = await fetch(`${API_BASE}/calendar/slots?userId=${userId}&date=${date}&duration=${duration}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (!response.ok) throw new Error('Failed to fetch available slots');
    return response.json();
  },

  getDailyAgenda: async (userId: string, date?: string): Promise<{ data: DailyAgenda }> => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const response = await fetch(`${API_BASE}/calendar/agenda/${userId}?date=${targetDate}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (!response.ok) throw new Error('Failed to fetch daily agenda');
    return response.json();
  },

  getAnalytics: async (startDate?: string, endDate?: string): Promise<{ data: CalendarAnalytics }> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_BASE}/calendar/analytics?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  }
};

// Main calendar hook
export function useCalendar(initialFilters: CalendarFilters = {}) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CalendarFilters>(initialFilters);
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Query appointments
  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    error: appointmentsError,
    refetch: refetchAppointments
  } = useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => calendarAPI.getAppointments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutations
  const createAppointmentMutation = useMutation({
    mutationFn: calendarAPI.createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: calendarAPI.updateAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: calendarAPI.deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  const smartScheduleMutation = useMutation({
    mutationFn: calendarAPI.smartSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });

  // Helper functions
  const updateFilters = useCallback((newFilters: Partial<CalendarFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const getAppointmentsForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointmentsData?.data?.filter(apt => 
      apt.startTime.startsWith(dateStr)
    ) || [];
  }, [appointmentsData]);

  return {
    // Data
    appointments: appointmentsData?.data || [],
    appointmentsCount: appointmentsData?.count || 0,
    selectedDate,
    currentView,
    filters,
    
    // Loading states
    isLoading: appointmentsLoading,
    error: appointmentsError,
    
    // Actions
    createAppointment: createAppointmentMutation.mutate,
    updateAppointment: updateAppointmentMutation.mutate,
    deleteAppointment: deleteAppointmentMutation.mutate,
    smartSchedule: smartScheduleMutation.mutate,
    refetch: refetchAppointments,
    
    // Mutation states
    isCreating: createAppointmentMutation.isPending,
    isUpdating: updateAppointmentMutation.isPending,
    isDeleting: deleteAppointmentMutation.isPending,
    isSmartScheduling: smartScheduleMutation.isPending,
    
    // View controls
    setSelectedDate,
    setCurrentView,
    updateFilters,
    clearFilters,
    
    // Helpers
    getAppointmentsForDate
  };
}

// Hook for available time slots
export function useAvailableSlots(userId: string, date: string, duration = 60) {
  return useQuery({
    queryKey: ['available-slots', userId, date, duration],
    queryFn: () => calendarAPI.getAvailableSlots(userId, date, duration),
    enabled: !!(userId && date),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for daily agenda
export function useDailyAgenda(userId: string, date?: string) {
  return useQuery({
    queryKey: ['daily-agenda', userId, date],
    queryFn: () => calendarAPI.getDailyAgenda(userId, date),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for calendar analytics
export function useCalendarAnalytics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['calendar-analytics', startDate, endDate],
    queryFn: () => calendarAPI.getAnalytics(startDate, endDate),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for smart scheduling
export function useSmartScheduling() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: calendarAPI.smartSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    }
  });
}
