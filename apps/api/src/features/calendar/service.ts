// 📅 Calendar and Scheduling service with intelligent features
import { AppDataSource } from '../../data-source';
import { Appointment } from '../../entities/Appointment';
import { Availability } from '../../entities/Availability';
import { Contact } from '../../entities/Contact';
import { User } from '../../entities/User';
import { LeadScore } from '../../entities/LeadScore';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

interface AppointmentFilters {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  status?: string;
}

interface AvailabilityFilters {
  startDate?: Date;
  endDate?: Date;
}

interface SlotRequest {
  userId: string;
  date: Date;
  duration: number;
  type?: string;
}

interface SmartScheduleRequest {
  contactId: string;
  type: 'viewing' | 'meeting' | 'call' | 'inspection' | 'signing' | 'consultation';
  preferredDates?: Date[];
  duration?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedToId?: string;
  propertyId?: string;
  requirements?: {
    location?: string;
    meetingUrl?: boolean;
    attendees?: Array<{ name: string; email: string; phone?: string }>;
  };
}

// Get appointments with filters
export async function getAppointments(workspaceId: string, filters: AppointmentFilters = {}) {
  const appointmentRepository = AppDataSource.getRepository(Appointment);
  
  const query = appointmentRepository.createQueryBuilder('appointment')
    .leftJoinAndSelect('appointment.contact', 'contact')
    .leftJoinAndSelect('appointment.assignedTo', 'assignedTo')
    .leftJoinAndSelect('appointment.property', 'property')
    .where('appointment.workspaceId = :workspaceId', { workspaceId });
  
  if (filters.startDate && filters.endDate) {
    query.andWhere('appointment.startTime BETWEEN :startDate AND :endDate', {
      startDate: filters.startDate,
      endDate: filters.endDate
    });
  } else if (filters.startDate) {
    query.andWhere('appointment.startTime >= :startDate', { startDate: filters.startDate });
  } else if (filters.endDate) {
    query.andWhere('appointment.startTime <= :endDate', { endDate: filters.endDate });
  }
  
  if (filters.type) {
    query.andWhere('appointment.type = :type', { type: filters.type });
  }
  
  if (filters.status) {
    query.andWhere('appointment.status = :status', { status: filters.status });
  }
  
  return query.orderBy('appointment.startTime', 'ASC').getMany();
}

// Get specific appointment
export async function getAppointment(id: string, workspaceId: string) {
  const appointmentRepository = AppDataSource.getRepository(Appointment);
  return appointmentRepository.findOne({
    where: { id, workspaceId },
    relations: ['contact', 'assignedTo', 'property']
  });
}

// Create appointment
export async function createAppointment(workspaceId: string, data: Partial<Appointment>) {
  const appointmentRepository = AppDataSource.getRepository(Appointment);
  
  const appointment = appointmentRepository.create({
    ...data,
    workspaceId,
    reminders: data.reminders || [
      { type: 'email', minutesBefore: 60, sent: false },
      { type: 'email', minutesBefore: 15, sent: false }
    ]
  });
  
  return appointmentRepository.save(appointment);
}

// Update appointment
export async function updateAppointment(id: string, workspaceId: string, data: Partial<Appointment>) {
  const appointmentRepository = AppDataSource.getRepository(Appointment);
  
  const appointment = await appointmentRepository.findOne({ where: { id, workspaceId } });
  if (!appointment) return null;
  
  Object.assign(appointment, data);
  return appointmentRepository.save(appointment);
}

// Delete appointment
export async function deleteAppointment(id: string, workspaceId: string) {
  const appointmentRepository = AppDataSource.getRepository(Appointment);
  const result = await appointmentRepository.delete({ id, workspaceId });
  return result.affected ? result.affected > 0 : false;
}

// Get user availability
export async function getUserAvailability(userId: string, workspaceId: string, filters: AvailabilityFilters = {}) {
  const availabilityRepository = AppDataSource.getRepository(Availability);
  const appointmentRepository = AppDataSource.getRepository(Appointment);
  
  const query = availabilityRepository.createQueryBuilder('availability')
    .where('availability.userId = :userId AND availability.workspaceId = :workspaceId', { userId, workspaceId });
  
  if (filters.startDate && filters.endDate) {
    query.andWhere('availability.startTime BETWEEN :startDate AND :endDate', {
      startDate: filters.startDate,
      endDate: filters.endDate
    });
  }
  
  const availability = await query.getMany();
  
  // Also get existing appointments as busy time
  const appointmentQuery = appointmentRepository.createQueryBuilder('appointment')
    .where('appointment.assignedToId = :userId AND appointment.workspaceId = :workspaceId', { userId, workspaceId })
    .andWhere('appointment.status IN (:...statuses)', { statuses: ['scheduled', 'confirmed'] });
  
  if (filters.startDate && filters.endDate) {
    appointmentQuery.andWhere('appointment.startTime BETWEEN :startDate AND :endDate', {
      startDate: filters.startDate,
      endDate: filters.endDate
    });
  }
  
  const appointments = await appointmentQuery.getMany();
  
  return { availability, appointments };
}

// Set availability
export async function setAvailability(workspaceId: string, data: Partial<Availability>) {
  const availabilityRepository = AppDataSource.getRepository(Availability);
  
  const availability = availabilityRepository.create({
    ...data,
    workspaceId
  });
  
  return availabilityRepository.save(availability);
}

// Get available time slots
export async function getAvailableSlots(workspaceId: string, request: SlotRequest) {
  const { userId, date, duration } = request;
  
  // Get user availability and appointments for the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const { availability, appointments } = await getUserAvailability(userId, workspaceId, {
    startDate: startOfDay,
    endDate: endOfDay
  });
  
  // Generate available slots
  const slots = [];
  const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM default
  
  for (let hour = workingHours.start; hour < workingHours.end; hour++) {
    for (let minute = 0; minute < 60; minute += 30) { // 30-minute intervals
      const slotStart = new Date(date);
      slotStart.setHours(hour, minute, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);
      
      // Check if slot conflicts with existing appointments
      const hasConflict = appointments.some(appointment => {
        return (slotStart < appointment.endTime && slotEnd > appointment.startTime);
      });
      
      // Check if slot is during available time
      const isAvailable = availability.length === 0 || availability.some(avail => {
        return avail.type === 'available' && 
               slotStart >= avail.startTime && 
               slotEnd <= avail.endTime;
      });
      
      if (!hasConflict && isAvailable) {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          duration,
          available: true
        });
      }
    }
  }
  
  return slots;
}

// Smart scheduling with AI integration
export async function smartSchedule(workspaceId: string, request: SmartScheduleRequest) {
  const { contactId, type, preferredDates, duration = 60, priority = 'medium', assignedToId } = request;
  
  // Get contact and their lead score for priority
  const contactRepository = AppDataSource.getRepository(Contact);
  const leadScoreRepository = AppDataSource.getRepository(LeadScore);
  
  const contact = await contactRepository.findOne({ where: { id: contactId, workspaceId } });
  if (!contact) throw new Error('Contact not found');
  
  const leadScore = await leadScoreRepository.findOne({ where: { contactId, workspaceId } });
  
  // Determine priority based on lead score
  let computedPriority = priority;
  if (leadScore) {
    if (leadScore.score >= 80) computedPriority = 'urgent';
    else if (leadScore.score >= 60) computedPriority = 'high';
    else if (leadScore.score >= 40) computedPriority = 'medium';
    else computedPriority = 'low';
  }
  
  // Find best available agent if not specified
  let selectedAgentId = assignedToId;
  if (!selectedAgentId) {
    const userRepository = AppDataSource.getRepository(User);
    // Get users from workspace_users table instead
    const agents = await userRepository.createQueryBuilder('user')
      .innerJoin('workspace_users', 'wu', 'wu.userId = user.id')
      .where('wu.workspaceId = :workspaceId', { workspaceId })
      .getMany();
    
    // Simple logic: find agent with least appointments
    let bestAgent = agents[0];
    let minAppointments = Infinity;
    
    for (const agent of agents) {
      const appointmentCount = await AppDataSource.getRepository(Appointment)
        .count({ where: { assignedToId: agent.id, workspaceId } });
      
      if (appointmentCount < minAppointments) {
        minAppointments = appointmentCount;
        bestAgent = agent;
      }
    }
    
    selectedAgentId = bestAgent.id;
  }
  
  // Find best time slot
  const dates = preferredDates || [
    new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)  // 3 days out
  ];
  
  let bestSlot = null;
  for (const date of dates) {
    const slots = await getAvailableSlots(workspaceId, {
      userId: selectedAgentId!,
      date,
      duration,
      type
    });
    
    if (slots.length > 0) {
      // For high priority, prefer morning slots
      bestSlot = computedPriority === 'urgent' || computedPriority === 'high' 
        ? slots[0] 
        : slots[Math.floor(slots.length / 2)];
      break;
    }
  }
  
  if (!bestSlot) {
    throw new Error('No available slots found');
  }
  
  // Create the appointment
  const appointment = await createAppointment(workspaceId, {
    title: `${type} with ${contact.name || contact.email}`,
    description: `AI-scheduled ${type} appointment`,
    type,
    priority: computedPriority,
    startTime: bestSlot.startTime,
    endTime: bestSlot.endTime,
    contactId,
    assignedToId: selectedAgentId,
    propertyId: request.propertyId,
    attendees: request.requirements?.attendees?.map(attendee => ({
      ...attendee,
      confirmed: false
    })),
    metadata: {
      source: 'smart_schedule',
      leadScore: leadScore?.score,
      estimatedDuration: duration
    }
  });
  
  return {
    appointment,
    recommendation: {
      priority: computedPriority,
      reason: leadScore 
        ? `Based on lead score of ${leadScore.score}, ${leadScore.insights.nextBestAction}`
        : 'Standard scheduling based on availability',
      suggestedPreparation: leadScore?.insights.recommendations || []
    }
  };
}

// Get daily agenda
export async function getDailyAgenda(userId: string, workspaceId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const appointments = await getAppointments(workspaceId, {
    startDate: startOfDay,
    endDate: endOfDay
  });
  
  const userAppointments = appointments.filter(apt => apt.assignedToId === userId);
  
  // Group by time and add AI insights
  const agenda = {
    date,
    appointments: userAppointments,
    summary: {
      total: userAppointments.length,
      byType: userAppointments.reduce((acc, apt) => {
        acc[apt.type] = (acc[apt.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPriority: userAppointments.reduce((acc, apt) => {
        acc[apt.priority] = (acc[apt.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    },
    insights: {
      busyPercentage: Math.round((userAppointments.length / 8) * 100), // Assuming 8-hour workday
      highPriorityCount: userAppointments.filter(apt => apt.priority === 'urgent' || apt.priority === 'high').length,
      preparationRequired: userAppointments.filter(apt => apt.metadata?.preparationNotes).length
    }
  };
  
  return agenda;
}

// Send appointment reminders
export async function sendAppointmentReminders(workspaceId: string) {
  const appointmentRepository = AppDataSource.getRepository(Appointment);
  
  // Find appointments with pending reminders in the next 2 hours
  const now = new Date();
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  const appointments = await appointmentRepository.find({
    where: {
      workspaceId,
      startTime: Between(now, twoHoursFromNow),
      status: 'scheduled'
    },
    relations: ['contact', 'assignedTo']
  });
  
  let sent = 0;
  
  for (const appointment of appointments) {
    if (appointment.reminders) {
      for (const reminder of appointment.reminders) {
        const reminderTime = new Date(appointment.startTime.getTime() - reminder.minutesBefore * 60 * 1000);
        
        if (!reminder.sent && now >= reminderTime) {
          // TODO: Implement actual email/SMS sending
          console.log(`Sending ${reminder.type} reminder for appointment ${appointment.id}`);
          reminder.sent = true;
          sent++;
        }
      }
      
      await appointmentRepository.save(appointment);
    }
  }
  
  return { sent, total: appointments.length };
}

// Calendar analytics
export async function getCalendarAnalytics(workspaceId: string, filters: { startDate: Date; endDate: Date }) {
  const appointmentRepository = AppDataSource.getRepository(Appointment);
  
  const appointments = await appointmentRepository.find({
    where: {
      workspaceId,
      startTime: Between(filters.startDate, filters.endDate)
    },
    relations: ['contact', 'assignedTo']
  });
  
  const analytics = {
    summary: {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
      noShowAppointments: appointments.filter(apt => apt.status === 'no_show').length
    },
    byType: appointments.reduce((acc, apt) => {
      acc[apt.type] = (acc[apt.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byPriority: appointments.reduce((acc, apt) => {
      acc[apt.priority] = (acc[apt.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    conversionRate: {
      total: appointments.length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      rate: appointments.length > 0 
        ? Math.round((appointments.filter(apt => apt.status === 'completed').length / appointments.length) * 100)
        : 0
    },
    trends: {
      dailyAverage: Math.round(appointments.length / 30), // Assuming 30-day period
      peakDays: getWeekdayDistribution(appointments),
      peakHours: getHourlyDistribution(appointments)
    }
  };
  
  return analytics;
}

function getWeekdayDistribution(appointments: Appointment[]) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const distribution = appointments.reduce((acc, apt) => {
    const day = days[apt.startTime.getDay()];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(distribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([day, count]) => ({ day, count }));
}

function getHourlyDistribution(appointments: Appointment[]) {
  const distribution = appointments.reduce((acc, apt) => {
    const hour = apt.startTime.getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  return Object.entries(distribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }));
}

// Legacy function for compatibility
export async function listAppointments(): Promise<any[]> {
  return [];
}
