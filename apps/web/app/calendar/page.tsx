'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

// Calendar utilities
const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

// Sample appointment data (would come from API)
const sampleAppointments = [
  {
    id: 1,
    title: 'Property Viewing - 123 Main St',
    type: 'viewing',
    priority: 'high',
    startTime: new Date(currentYear, currentMonth, 15, 10, 0),
    endTime: new Date(currentYear, currentMonth, 15, 11, 0),
    location: '123 Main St, City, State',
    contactName: 'John Doe'
  },
  {
    id: 2,
    title: 'Client Consultation',
    type: 'consultation',
    priority: 'medium',
    startTime: new Date(currentYear, currentMonth, 18, 14, 0),
    endTime: new Date(currentYear, currentMonth, 18, 15, 30),
    location: 'Office',
    contactName: 'Jane Smith'
  },
  {
    id: 3,
    title: 'Contract Signing',
    type: 'signing',
    priority: 'urgent',
    startTime: new Date(currentYear, currentMonth, 20, 9, 0),
    endTime: new Date(currentYear, currentMonth, 20, 10, 0),
    location: 'Law Office',
    contactName: 'Bob Johnson'
  }
];

// Type mapping for colors
const typeColors = {
  viewing: '#2196f3',
  meeting: '#4caf50',
  call: '#ff9800',
  inspection: '#f44336',
  signing: '#9c27b0',
  consultation: '#607d8b'
};

const priorityColors = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
  urgent: '#9c27b0'
};

// Calendar utilities
const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (month: number, year: number) => {
  return new Date(year, month, 1).getDay();
};

const getMonthName = (month: number) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Enhanced Calendar Page
function CalendarPageContent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState('calendar');
  const [showModal, setShowModal] = useState(false);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [viewYear, setViewYear] = useState(currentYear);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'agenda'>('month');
  const [appointments, setAppointments] = useState(sampleAppointments);

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getFullYear() === date.getFullYear();
    });
  };

  // Get upcoming appointments
  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => apt.startTime >= now)
                     .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                     .slice(0, 5);
  };

  // Calculate stats
  const todayAppointments = getAppointmentsForDate(today);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const thisWeekAppointments = appointments.filter(apt => 
    apt.startTime >= weekStart && apt.startTime <= weekEnd
  );

  const pendingAppointments = appointments.filter(apt => apt.startTime > today);
  const completedThisMonth = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return aptDate.getMonth() === today.getMonth() && 
           aptDate.getFullYear() === today.getFullYear() &&
           apt.startTime < today;
  });

  const handleNewAppointment = (date?: Date) => {
    if (!isAuthenticated) {
      alert('Please log in to create appointments');
      return;
    }
    setSelectedDate(date || today);
    setShowModal(true);
  };

  const handleDemoLogin = () => {
    // Demo user data
    const demoUser = {
      id: 'demo-user-id',
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@example.com',
      role: 'admin',
      tenantId: 'demo-workspace-id'
    };
    const demoToken = 'demo-token-123';
    login(demoToken, demoUser);
  };

  const handleTabChange = (tab: string) => {
    setCalendarView('month'); // Reset to month view when switching tabs
    setCurrentTab(tab);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    } else {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    }
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
    const days: React.ReactElement[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewYear, viewMonth, day);
      const dayAppointments = getAppointmentsForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleNewAppointment(date)}
          style={{
            border: '1px solid #e0e0e0',
            padding: '8px',
            minHeight: '80px',
            cursor: 'pointer',
            backgroundColor: isToday ? '#e3f2fd' : isSelected ? '#f3e5f5' : 'white',
            position: 'relative'
          }}
        >
          <div style={{ fontWeight: isToday ? 'bold' : 'normal', marginBottom: '4px' }}>
            {day}
          </div>
          {dayAppointments.map((apt, index) => (
            <div
              key={apt.id}
              style={{
                fontSize: '10px',
                padding: '2px 4px',
                borderRadius: '3px',
                backgroundColor: typeColors[apt.type as keyof typeof typeColors],
                color: 'white',
                marginBottom: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={`${apt.title} - ${formatTime(apt.startTime)}`}
            >
              {formatTime(apt.startTime)} {apt.title.substring(0, 15)}...
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
            📅 Calendar & Scheduling
            {isAuthenticated && (
              <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666', marginLeft: '16px' }}>
                Welcome, {user?.firstName} {user?.lastName}!
              </span>
            )}
          </h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            {!isAuthenticated ? (
              <button
                onClick={handleDemoLogin}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                🔐 Demo Login
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNewAppointment()}
                  style={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  + New Appointment
                </button>
                <button
                  onClick={logout}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Manage appointments with AI-powered scheduling and real-time calendar views
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { title: 'Today', count: `${todayAppointments.length} appointments`, color: '#1976d2' },
          { title: 'This Week', count: `${thisWeekAppointments.length} appointments`, color: '#4caf50' },
          { title: 'Pending', count: `${pendingAppointments.length} appointments`, color: '#ff9800' },
          { title: 'Completed', count: `${completedThisMonth.length} this month`, color: '#f44336' }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '6px',
                  backgroundColor: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px'
                }}
              >
                📅
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{stat.title}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{stat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        backgroundColor: 'white',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '2px solid #e0e0e0',
          marginBottom: '30px'
        }}>
          {[
            { id: 'calendar', label: '📅 Calendar View', description: 'Month and day views' },
            { id: 'appointments', label: '📋 Appointments', description: 'List and manage' },
            { id: 'analytics', label: '📊 Analytics', description: 'Performance insights' },
            { id: 'availability', label: '⏰ Availability', description: 'Set your schedule' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                padding: '16px 24px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: currentTab === tab.id ? '3px solid #1976d2' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: currentTab === tab.id ? '#1976d2' : '#666',
                fontWeight: currentTab === tab.id ? 600 : 400
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '16px' }}>{tab.label}</div>
                <div style={{ fontSize: '12px', marginTop: '2px' }}>{tab.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '600px' }}>
          {currentTab === 'calendar' && (
            <div>
              {/* Calendar Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px',
                padding: '0 10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
                    {getMonthName(viewMonth)} {viewYear}
                  </h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => navigateMonth('prev')}
                      style={{
                        border: '1px solid #ddd',
                        backgroundColor: 'white',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      style={{
                        border: '1px solid #ddd',
                        backgroundColor: 'white',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setCalendarView('month')}
                    style={{
                      border: '1px solid #ddd',
                      backgroundColor: calendarView === 'month' ? '#1976d2' : 'white',
                      color: calendarView === 'month' ? 'white' : 'black',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setCalendarView('agenda')}
                    style={{
                      border: '1px solid #ddd',
                      backgroundColor: calendarView === 'agenda' ? '#1976d2' : 'white',
                      color: calendarView === 'agenda' ? 'white' : 'black',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Agenda
                  </button>
                </div>
              </div>

              {calendarView === 'month' ? (
                <>
                  {/* Calendar Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '1px',
                    backgroundColor: '#e0e0e0',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div
                        key={day}
                        style={{
                          backgroundColor: '#f5f5f5',
                          padding: '12px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}
                      >
                        {day}
                      </div>
                    ))}
                    {/* Calendar days */}
                    {renderCalendarGrid()}
                  </div>
                </>
              ) : (
                /* Agenda View */
                <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
                    <h3 style={{ margin: 0, marginBottom: '16px' }}>Upcoming Appointments</h3>
                    {getUpcomingAppointments().length === 0 ? (
                      <p style={{ color: '#666', margin: 0 }}>No upcoming appointments</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {getUpcomingAppointments().map((apt) => (
                          <div
                            key={apt.id}
                            style={{
                              border: '1px solid #e0e0e0',
                              borderRadius: '6px',
                              padding: '16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '4px',
                                  height: '40px',
                                  backgroundColor: typeColors[apt.type as keyof typeof typeColors],
                                  borderRadius: '2px'
                                }}
                              />
                              <div>
                                <h4 style={{ margin: 0, marginBottom: '4px' }}>{apt.title}</h4>
                                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                                  {apt.startTime.toLocaleDateString()} at {formatTime(apt.startTime)}
                                </p>
                                <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                                  📍 {apt.location} • 👤 {apt.contactName}
                                </p>
                              </div>
                            </div>
                            <div
                              style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 500,
                                backgroundColor: priorityColors[apt.priority as keyof typeof priorityColors],
                                color: 'white'
                              }}
                            >
                              {apt.priority}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentTab === 'appointments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>All Appointments</h2>
                <button
                  onClick={() => handleNewAppointment()}
                  style={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  + Add Appointment
                </button>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gap: '16px'
              }}>
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '18px' }}>{apt.title}</h3>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor: priorityColors[apt.priority as keyof typeof priorityColors],
                              color: 'white'
                            }}
                          >
                            {apt.priority}
                          </span>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor: typeColors[apt.type as keyof typeof typeColors],
                              color: 'white'
                            }}
                          >
                            {apt.type}
                          </span>
                        </div>
                        <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                          <p style={{ margin: '4px 0' }}>
                            📅 {apt.startTime.toLocaleDateString()} at {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                          </p>
                          <p style={{ margin: '4px 0' }}>📍 {apt.location}</p>
                          <p style={{ margin: '4px 0' }}>👤 {apt.contactName}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          style={{
                            border: '1px solid #ddd',
                            backgroundColor: 'white',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            border: '1px solid #f44336',
                            backgroundColor: 'white',
                            color: '#f44336',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'analytics' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>Calendar Analytics</h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '20px'
              }}>
                {/* Appointment Types Chart */}
                <div style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'white'
                }}>
                  <h3 style={{ marginBottom: '16px' }}>Appointment Types</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(typeColors).map(([type, color]) => {
                      const count = appointments.filter(apt => apt.type === type).length;
                      return (
                        <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              backgroundColor: color,
                              borderRadius: '3px'
                            }}
                          />
                          <span style={{ textTransform: 'capitalize', flex: 1 }}>{type}</span>
                          <span style={{ fontWeight: 'bold' }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Monthly Summary */}
                <div style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'white'
                }}>
                  <h3 style={{ marginBottom: '16px' }}>This Month Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Appointments:</span>
                      <span style={{ fontWeight: 'bold' }}>{appointments.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Completed:</span>
                      <span style={{ fontWeight: 'bold', color: '#4caf50' }}>{completedThisMonth.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Upcoming:</span>
                      <span style={{ fontWeight: 'bold', color: '#ff9800' }}>{pendingAppointments.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Success Rate:</span>
                      <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
                        {appointments.length > 0 ? Math.round((completedThisMonth.length / appointments.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Time Distribution */}
                <div style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'white'
                }}>
                  <h3 style={{ marginBottom: '16px' }}>Busiest Days</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                      const dayAppointments = appointments.filter(apt => apt.startTime.getDay() === index);
                      return (
                        <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ minWidth: '80px' }}>{day}</span>
                          <div style={{ 
                            flex: 1, 
                            height: '8px', 
                            backgroundColor: '#f0f0f0', 
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${appointments.length > 0 ? (dayAppointments.length / Math.max(...[0, 1, 2, 3, 4, 5, 6].map(d => appointments.filter(apt => apt.startTime.getDay() === d).length))) * 100 : 0}%`,
                                backgroundColor: '#1976d2',
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                          <span style={{ minWidth: '20px', textAlign: 'right' }}>{dayAppointments.length}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'availability' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>Availability Settings</h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                gap: '20px'
              }}>
                {/* Working Hours */}
                <div style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'white'
                }}>
                  <h3 style={{ marginBottom: '16px' }}>Working Hours</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input type="checkbox" defaultChecked={day !== 'Saturday' && day !== 'Sunday'} />
                        <span style={{ minWidth: '100px' }}>{day}</span>
                        <input 
                          type="time" 
                          defaultValue="09:00"
                          style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        <span>to</span>
                        <input 
                          type="time" 
                          defaultValue="17:00"
                          style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    style={{
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginTop: '16px'
                    }}
                  >
                    Save Working Hours
                  </button>
                </div>

                {/* Buffer Settings */}
                <div style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'white'
                }}>
                  <h3 style={{ marginBottom: '16px' }}>Scheduling Preferences</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                        Buffer Time Between Appointments
                      </label>
                      <select 
                        defaultValue="15"
                        style={{ 
                          width: '100%', 
                          padding: '8px', 
                          border: '1px solid #ddd', 
                          borderRadius: '4px' 
                        }}
                      >
                        <option value="0">No buffer</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                        Default Appointment Duration
                      </label>
                      <select 
                        defaultValue="60"
                        style={{ 
                          width: '100%', 
                          padding: '8px', 
                          border: '1px solid #ddd', 
                          borderRadius: '4px' 
                        }}
                      >
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                        Auto-confirm appointments
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" defaultChecked />
                        <span>Automatically confirm new appointments</span>
                      </div>
                    </div>
                  </div>
                  <button
                    style={{
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginTop: '16px'
                    }}
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Create New Appointment</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0'
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Handle form submission
                setShowModal(false);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                  Appointment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Property viewing, client meeting, etc."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    Type *
                  </label>
                  <select
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select type</option>
                    <option value="viewing">Property Viewing</option>
                    <option value="meeting">Client Meeting</option>
                    <option value="call">Phone Call</option>
                    <option value="inspection">Inspection</option>
                    <option value="signing">Contract Signing</option>
                    <option value="consultation">Consultation</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    Priority
                  </label>
                  <select
                    defaultValue="medium"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    defaultValue={selectedDate ? selectedDate.toISOString().split('T')[0] : today.toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    defaultValue="10:00"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                  Duration (minutes)
                </label>
                <select
                  defaultValue="60"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Property address, office, online, etc."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                  Contact/Client
                </label>
                <input
                  type="text"
                  placeholder="Contact name or client"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Additional notes or details..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Create Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <CalendarPageContent />
    </ProtectedRoute>
  );
}
