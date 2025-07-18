// 📅 Appointment Form Modal - Create/Edit appointments with AI integration
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Stack,
  Typography,
  Box,
  Alert,
  Autocomplete,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  Home as PropertyIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Appointment, AttendeeInfo, SmartScheduleRequest } from '../types';
import { useCalendar, useSmartScheduling } from '../hooks';

// Form validation schema
const appointmentSchema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string(),
  type: yup.string().required('Type is required'),
  priority: yup.string().required('Priority is required'),
  startTime: yup.string().required('Start time is required'),
  endTime: yup.string().required('End time is required'),
  location: yup.string(),
  meetingUrl: yup.string().url('Must be a valid URL'),
  contactId: yup.string(),
  assignedToId: yup.string().required('Assigned agent is required'),
  propertyId: yup.string()
});

interface AppointmentFormModalProps {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  defaultStartTime?: Date;
  defaultEndTime?: Date;
  contactId?: string;
  propertyId?: string;
}

export function AppointmentFormModal({
  open,
  onClose,
  appointment,
  defaultStartTime,
  defaultEndTime,
  contactId,
  propertyId
}: AppointmentFormModalProps) {
  const { createAppointment, updateAppointment, isCreating, isUpdating } = useCalendar();
  const { mutate: smartSchedule, isPending: isSmartScheduling } = useSmartScheduling();
  const [showSmartSchedule, setShowSmartSchedule] = useState(false);
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([]);
  const [smartScheduleResult, setSmartScheduleResult] = useState<any>(null);

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(appointmentSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'viewing',
      priority: 'medium',
      startTime: formatDateTimeLocal(defaultStartTime || new Date()),
      endTime: formatDateTimeLocal(defaultEndTime || new Date(Date.now() + 60 * 60 * 1000)),
      location: '',
      meetingUrl: '',
      contactId: contactId || '',
      assignedToId: '',
      propertyId: propertyId || ''
    }
  });

  const watchedType = watch('type');
  const watchedContactId = watch('contactId');

  // Initialize form when appointment changes
  useEffect(() => {
    if (appointment) {
      reset({
        title: appointment.title,
        description: appointment.description || '',
        type: appointment.type,
        priority: appointment.priority,
        startTime: formatDateTimeLocal(new Date(appointment.startTime)),
        endTime: formatDateTimeLocal(new Date(appointment.endTime)),
        location: appointment.location || '',
        meetingUrl: appointment.meetingUrl || '',
        contactId: appointment.contactId || '',
        assignedToId: appointment.assignedToId,
        propertyId: appointment.propertyId || ''
      });
      setAttendees(appointment.attendees || []);
    } else {
      reset({
        title: '',
        description: '',
        type: 'viewing',
        priority: 'medium',
        startTime: formatDateTimeLocal(defaultStartTime || new Date()),
        endTime: formatDateTimeLocal(defaultEndTime || new Date(Date.now() + 60 * 60 * 1000)),
        location: '',
        meetingUrl: '',
        contactId: contactId || '',
        assignedToId: '',
        propertyId: propertyId || ''
      });
      setAttendees([]);
    }
  }, [appointment, defaultStartTime, defaultEndTime, contactId, propertyId, reset]);

  // Handle form submission
  const onSubmit = (data: any) => {
    const appointmentData = {
      ...data,
      attendees: attendees.length > 0 ? attendees : undefined,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString()
    };

    if (appointment) {
      updateAppointment({ ...appointmentData, id: appointment.id });
    } else {
      createAppointment(appointmentData);
    }
    
    onClose();
  };

  // Handle smart scheduling
  const handleSmartSchedule = () => {
    const formData = watch();
    
    if (!formData.contactId || !formData.type) {
      alert('Please select a contact and appointment type for smart scheduling');
      return;
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    const smartRequest: SmartScheduleRequest = {
      contactId: formData.contactId,
      type: formData.type as any,
      duration: duration,
      priority: formData.priority as any,
      assignedToId: formData.assignedToId,
      propertyId: formData.propertyId,
      requirements: {
        location: formData.location,
        meetingUrl: !!formData.meetingUrl,
        attendees: attendees
      }
    };

    smartSchedule(smartRequest, {
      onSuccess: (result) => {
        setSmartScheduleResult(result);
        // Update form with AI-suggested values
        setValue('startTime', formatDateTimeLocal(new Date(result.appointment.startTime)));
        setValue('endTime', formatDateTimeLocal(new Date(result.appointment.endTime)));
        setValue('title', result.appointment.title);
        setValue('description', result.appointment.description || '');
        setShowSmartSchedule(false);
      },
      onError: (error) => {
        console.error('Smart scheduling failed:', error);
        alert('Smart scheduling failed. Please try manual scheduling.');
      }
    });
  };

  const isLoading = isCreating || isUpdating || isSmartScheduling;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { maxHeight: '90vh' } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <ScheduleIcon />
            <Typography variant="h6">
              {appointment ? 'Edit Appointment' : 'New Appointment'}
            </Typography>
            {!appointment && (
              <Button
                startIcon={<AIIcon />}
                variant="outlined"
                size="small"
                onClick={() => setShowSmartSchedule(true)}
                disabled={!watchedContactId}
              >
                AI Schedule
              </Button>
            )}
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {smartScheduleResult && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">AI Recommendation:</Typography>
              <Typography variant="body2">{smartScheduleResult.data.recommendation.reason}</Typography>
              {smartScheduleResult.data.recommendation.suggestedPreparation.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Suggested preparation: {smartScheduleResult.data.recommendation.suggestedPreparation.join(', ')}
                </Typography>
              )}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={8}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Title"
                      fullWidth
                      required
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select {...field} label="Priority">
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                    />
                  )}
                />
              </Grid>

              {/* Scheduling */}
              <Grid item xs={12}>
                <Divider />
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Scheduling
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required>
                      <InputLabel>Type</InputLabel>
                      <Select {...field} label="Type">
                        <MenuItem value="viewing">Property Viewing</MenuItem>
                        <MenuItem value="meeting">Meeting</MenuItem>
                        <MenuItem value="call">Phone Call</MenuItem>
                        <MenuItem value="inspection">Inspection</MenuItem>
                        <MenuItem value="signing">Contract Signing</MenuItem>
                        <MenuItem value="consultation">Consultation</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Start Time"
                      type="datetime-local"
                      fullWidth
                      required
                      error={!!errors.startTime}
                      helperText={errors.startTime?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="End Time"
                      type="datetime-local"
                      fullWidth
                      required
                      error={!!errors.endTime}
                      helperText={errors.endTime?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              {/* Location & Meeting Details */}
              <Grid item xs={12}>
                <Divider />
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Location & Meeting Details
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Location"
                      fullWidth
                      placeholder="e.g., 123 Main St, City, State"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="meetingUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Meeting URL"
                      fullWidth
                      placeholder="https://zoom.us/j/..."
                      error={!!errors.meetingUrl}
                      helperText={errors.meetingUrl?.message}
                    />
                  )}
                />
              </Grid>

              {/* Participants */}
              <Grid item xs={12}>
                <Divider />
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Participants
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="contactId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Contact ID"
                      fullWidth
                      placeholder="Select or enter contact ID"
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="assignedToId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Assigned Agent ID"
                      fullWidth
                      required
                      placeholder="Select assigned agent"
                      error={!!errors.assignedToId}
                      helperText={errors.assignedToId?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="propertyId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Property ID"
                      fullWidth
                      placeholder="Select property (optional)"
                      InputProps={{
                        startAdornment: <PropertyIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={!isValid || isLoading}
            startIcon={<SaveIcon />}
          >
            {isLoading ? 'Saving...' : appointment ? 'Update' : 'Create'} Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Smart Schedule Dialog */}
      <Dialog open={showSmartSchedule} onClose={() => setShowSmartSchedule(false)}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <AIIcon />
            <Typography variant="h6">AI-Powered Smart Scheduling</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Let AI analyze your contact's lead score, your availability, and optimal scheduling patterns to suggest the best time for this appointment.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Smart scheduling will consider:
            <br />• Contact's lead score and priority
            <br />• Your current availability
            <br />• Optimal meeting times based on historical data
            <br />• Appointment type requirements
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSmartSchedule(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSmartSchedule}
            variant="contained"
            startIcon={<AIIcon />}
            disabled={isSmartScheduling}
          >
            {isSmartScheduling ? 'Analyzing...' : 'Generate Smart Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
