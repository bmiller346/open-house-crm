// 📅 Calendar Components - Modern Material-UI calendar interface
'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Grid,
  Paper,
  Toolbar,
  ButtonGroup,
  Stack,
  Divider
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  ViewModule,
  ViewWeek,
  ViewDay,
  List as ListIcon,
  Add as AddIcon,
  SmartToy as AIIcon
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { useCalendar } from '../hooks';
import { CalendarView, Appointment } from '../types';

// Priority colors mapping
const priorityColors = {
  low: '#4caf50',
  medium: '#ff9800', 
  high: '#f44336',
  urgent: '#9c27b0'
};

// Appointment type colors
const typeColors = {
  viewing: '#2196f3',
  meeting: '#4caf50',
  call: '#ff9800',
  inspection: '#f44336',
  signing: '#9c27b0',
  consultation: '#607d8b'
};

interface CalendarComponentProps {
  userId?: string;
  onAppointmentClick?: (appointment: Appointment) => void;
  onDateClick?: (date: Date) => void;
  onCreateAppointment?: () => void;
  onSmartSchedule?: () => void;
}

export function CalendarComponent({ 
  userId, 
  onAppointmentClick, 
  onDateClick,
  onCreateAppointment,
  onSmartSchedule 
}: CalendarComponentProps) {
  const {
    appointments,
    selectedDate,
    currentView,
    setSelectedDate,
    setCurrentView,
    getAppointmentsForDate,
    isLoading
  } = useCalendar();

  const [displayDate, setDisplayDate] = useState(new Date());

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setDisplayDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setDisplayDate(today);
    setSelectedDate(today);
  };

  // Render calendar grid for month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(displayDate);
    const monthEnd = endOfMonth(displayDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <Grid container spacing={1} sx={{ mt: 2 }}>
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Grid item xs key={day}>
            <Typography variant="subtitle2" align="center" color="text.secondary">
              {day}
            </Typography>
          </Grid>
        ))}
        
        {/* Calendar days */}
        {days.map(day => {
          const dayAppointments = getAppointmentsForDate(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, displayDate);
          
          return (
            <Grid item xs key={day.toISOString()}>
              <Paper
                elevation={isSelected ? 3 : 1}
                sx={{
                  minHeight: 100,
                  p: 1,
                  cursor: 'pointer',
                  bgcolor: isSelected ? 'primary.50' : 'background.paper',
                  opacity: isCurrentMonth ? 1 : 0.5,
                  border: isSelected ? 2 : 0,
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.50'
                  }
                }}
                onClick={() => {
                  setSelectedDate(day);
                  onDateClick?.(day);
                }}
              >
                <Typography 
                  variant="body2" 
                  fontWeight={isSameDay(day, new Date()) ? 'bold' : 'normal'}
                  color={isSameDay(day, new Date()) ? 'primary.main' : 'text.primary'}
                >
                  {format(day, 'd')}
                </Typography>
                
                {/* Appointment indicators */}
                <Box sx={{ mt: 0.5 }}>
                  {dayAppointments.slice(0, 2).map(apt => (
                    <Chip
                      key={apt.id}
                      label={apt.title}
                      size="small"
                      sx={{
                        mb: 0.5,
                        fontSize: '0.65rem',
                        height: 20,
                        bgcolor: typeColors[apt.type],
                        color: 'white',
                        display: 'block',
                        '& .MuiChip-label': {
                          px: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick?.(apt);
                      }}
                    />
                  ))}
                  {dayAppointments.length > 2 && (
                    <Typography variant="caption" color="text.secondary">
                      +{dayAppointments.length - 2} more
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Render agenda view
  const renderAgendaView = () => {
    const todayAppointments = getAppointmentsForDate(selectedDate);
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </Typography>
        
        {todayAppointments.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No appointments scheduled for this day
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={onCreateAppointment}
            >
              Schedule Appointment
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {todayAppointments.map(apt => (
              <Card 
                key={apt.id} 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'grey.50' }
                }}
                onClick={() => onAppointmentClick?.(apt)}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 4,
                        height: 40,
                        bgcolor: typeColors[apt.type],
                        borderRadius: 1
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {apt.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(apt.startTime), 'h:mm a')} - {format(new Date(apt.endTime), 'h:mm a')}
                      </Typography>
                      {apt.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {apt.description}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={apt.type}
                        size="small"
                        sx={{ bgcolor: typeColors[apt.type], color: 'white' }}
                      />
                      <Chip
                        label={apt.priority}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: priorityColors[apt.priority], color: priorityColors[apt.priority] }}
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    );
  };

  return (
    <Card sx={{ width: '100%', height: '100%' }}>
      {/* Calendar Header */}
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
          <Typography variant="h5" component="h1" fontWeight="medium">
            {format(displayDate, 'MMMM yyyy')}
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <IconButton onClick={() => navigateMonth('prev')} size="small">
              <ChevronLeft />
            </IconButton>
            <IconButton onClick={() => navigateMonth('next')} size="small">
              <ChevronRight />
            </IconButton>
            <Button
              startIcon={<Today />}
              onClick={goToToday}
              size="small"
              variant="outlined"
            >
              Today
            </Button>
          </Stack>
        </Stack>

        {/* View Controls */}
        <Stack direction="row" spacing={1} alignItems="center">
          <ButtonGroup size="small" variant="outlined">
            <Button
              startIcon={<ViewModule />}
              variant={currentView === 'month' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('month')}
            >
              Month
            </Button>
            <Button
              startIcon={<ViewWeek />}
              variant={currentView === 'week' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('week')}
            >
              Week
            </Button>
            <Button
              startIcon={<ListIcon />}
              variant={currentView === 'agenda' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('agenda')}
            >
              Agenda
            </Button>
          </ButtonGroup>

          <Divider orientation="vertical" flexItem />

          <Button
            startIcon={<AIIcon />}
            variant="contained"
            color="secondary"
            onClick={onSmartSchedule}
            sx={{ ml: 2 }}
          >
            Smart Schedule
          </Button>

          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={onCreateAppointment}
          >
            New Appointment
          </Button>
        </Stack>
      </Toolbar>

      {/* Calendar Content */}
      <CardContent sx={{ p: 3, height: 'calc(100% - 64px)', overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <Typography>Loading calendar...</Typography>
          </Box>
        ) : (
          <>
            {currentView === 'month' && renderMonthView()}
            {currentView === 'agenda' && renderAgendaView()}
            {/* Week view would go here */}
          </>
        )}
      </CardContent>
    </Card>
  );
}
