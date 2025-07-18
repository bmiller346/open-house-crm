// 📅 Calendar and Scheduling controller with intelligent features
import { Request, Response } from 'express';
import * as calendarService from './service';
import { asyncHandler } from '../../utils/asyncHandler';

// Use the same AuthRequest type from other controllers
interface AuthRequest extends Request {
  user?: {
    id: string;
    workspaceId: string;
  };
}

// GET /api/calendar/appointments - List appointments
export const getAppointmentsHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { workspaceId } = authReq.user!;
  const { startDate, endDate, type, status } = req.query;
  
  const appointments = await calendarService.getAppointments(workspaceId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    type: type as any,
    status: status as any
  });
  
  res.json({
    success: true,
    data: appointments,
    count: appointments.length
  });
});

// GET /api/calendar/appointments/:id - Get specific appointment
export const getAppointmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const { workspaceId } = authReq.user!;
  
  const appointment = await calendarService.getAppointment(id, workspaceId);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }
  
  res.json({
    success: true,
    data: appointment
  });
});

// POST /api/calendar/appointments - Create appointment
export const createAppointmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { workspaceId } = authReq.user!;
  
  const appointment = await calendarService.createAppointment(workspaceId, req.body);
  
  res.status(201).json({
    success: true,
    data: appointment,
    message: 'Appointment created successfully'
  });
});

// PUT /api/calendar/appointments/:id - Update appointment
export const updateAppointmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const { workspaceId } = authReq.user!;
  
  const appointment = await calendarService.updateAppointment(id, workspaceId, req.body);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }
  
  res.json({
    success: true,
    data: appointment,
    message: 'Appointment updated successfully'
  });
});

// DELETE /api/calendar/appointments/:id - Delete appointment
export const deleteAppointmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const { workspaceId } = authReq.user!;
  
  const success = await calendarService.deleteAppointment(id, workspaceId);
  
  if (!success) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }
  
  res.status(204).send();
});

// GET /api/calendar/availability/:userId - Get user availability
export const getUserAvailabilityHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { userId } = req.params;
  const { workspaceId } = authReq.user!;
  const { startDate, endDate } = req.query;
  
  const availability = await calendarService.getUserAvailability(userId, workspaceId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined
  });
  
  res.json({
    success: true,
    data: availability
  });
});

// POST /api/calendar/availability - Set availability
export const setAvailabilityHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { workspaceId } = authReq.user!;
  
  const availability = await calendarService.setAvailability(workspaceId, req.body);
  
  res.status(201).json({
    success: true,
    data: availability,
    message: 'Availability set successfully'
  });
});

// GET /api/calendar/slots - Get available time slots
export const getAvailableSlotsHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { workspaceId } = authReq.user!;
  const { userId, date, duration, type } = req.query;
  
  if (!userId || !date) {
    return res.status(400).json({
      success: false,
      message: 'userId and date are required'
    });
  }
  
  const slots = await calendarService.getAvailableSlots(workspaceId, {
    userId: userId as string,
    date: new Date(date as string),
    duration: duration ? parseInt(duration as string) : 60,
    type: type as any
  });
  
  res.json({
    success: true,
    data: slots
  });
});

// POST /api/calendar/smart-schedule - Intelligent scheduling
export const smartScheduleHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { workspaceId } = authReq.user!;
  
  const result = await calendarService.smartSchedule(workspaceId, req.body);
  
  res.json({
    success: true,
    data: result,
    message: 'Smart scheduling completed'
  });
});

// GET /api/calendar/agenda/:userId - Get daily agenda
export const getDailyAgendaHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { userId } = req.params;
  const { workspaceId } = authReq.user!;
  const { date } = req.query;
  
  const targetDate = date ? new Date(date as string) : new Date();
  
  const agenda = await calendarService.getDailyAgenda(userId, workspaceId, targetDate);
  
  res.json({
    success: true,
    data: agenda
  });
});

// POST /api/calendar/reminders/send - Send appointment reminders
export const sendRemindersHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { workspaceId } = authReq.user!;
  
  const result = await calendarService.sendAppointmentReminders(workspaceId);
  
  res.json({
    success: true,
    data: result,
    message: `Sent ${result.sent} reminders`
  });
});

// GET /api/calendar/analytics - Calendar analytics
export const getCalendarAnalyticsHandler = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { workspaceId } = authReq.user!;
  const { startDate, endDate } = req.query;
  
  const analytics = await calendarService.getCalendarAnalytics(workspaceId, {
    startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: endDate ? new Date(endDate as string) : new Date()
  });
  
  res.json({
    success: true,
    data: analytics
  });
});
