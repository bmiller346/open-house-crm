// 📅 Calendar types - Enhanced to match backend API
export interface Appointment {
  id: string;
  title: string;
  description?: string;
  type: 'viewing' | 'meeting' | 'call' | 'inspection' | 'signing' | 'consultation';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startTime: string;
  endTime: string;
  location?: string;
  meetingUrl?: string;
  contactId?: string;
  assignedToId: string;
  propertyId?: string;
  attendees?: AttendeeInfo[];
  reminders?: ReminderInfo[];
  metadata?: Record<string, any>;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  createdAt: string;
  updatedAt: string;
}

export interface AttendeeInfo {
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface ReminderInfo {
  type: 'email' | 'sms' | 'notification';
  time: number; // minutes before appointment
  sent?: boolean;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  daysOfWeek?: number[];
}

export interface Availability {
  id: string;
  userId: string;
  type: 'available' | 'busy' | 'break' | 'vacation';
  dayOfWeek?: number;
  startTime: string;
  endTime: string;
  date?: string;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  timezone?: string;
  metadata?: Record<string, any>;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
  available: boolean;
  conflictReason?: string;
}

export interface SmartScheduleRequest {
  contactId: string;
  type: Appointment['type'];
  preferredDates?: string[];
  duration?: number;
  priority?: Appointment['priority'];
  assignedToId?: string;
  propertyId?: string;
  requirements?: {
    location?: string;
    meetingUrl?: boolean;
    attendees?: AttendeeInfo[];
  };
}

export interface SmartScheduleResponse {
  appointment: Appointment;
  recommendation: {
    priority: string;
    reason: string;
    suggestedPreparation: string[];
  };
}

export interface CalendarAnalytics {
  summary: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
  };
  conversionRate: {
    total: number;
    completed: number;
    rate: number;
  };
  trends: {
    dailyAverage: number;
    peakDays: string[];
    peakHours: number[];
  };
}

export interface DailyAgenda {
  date: string;
  appointments: Appointment[];
  summary: {
    total: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  };
  insights: {
    busyPercentage: number;
    highPriorityCount: number;
    preparationRequired: number;
  };
}

// Calendar view types
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

// Filter and sort options
export interface CalendarFilters {
  startDate?: string;
  endDate?: string;
  type?: Appointment['type'];
  status?: Appointment['status'];
  priority?: Appointment['priority'];
  assignedToId?: string;
  contactId?: string;
}

export interface CalendarState {
  appointments: Appointment[];
  availability: Availability[];
  selectedDate: Date;
  currentView: CalendarView;
  filters: CalendarFilters;
  isLoading: boolean;
  error: string | null;
}
