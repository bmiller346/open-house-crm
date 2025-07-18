// 📊 Calendar Analytics Dashboard - Performance insights and metrics
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Stack,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Button
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Schedule,
  CheckCircle,
  Cancel,
  PersonOff,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { useCalendarAnalytics } from '../hooks';

// Metric card component
interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  format?: 'number' | 'percentage' | 'currency';
}

function MetricCard({ title, value, trend, trendValue, icon, color = 'primary', format = 'number' }: MetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {formatValue(value)}
            </Typography>
            {trend && trendValue && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                {trend === 'up' ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : trend === 'down' ? (
                  <TrendingDown color="error" fontSize="small" />
                ) : null}
                <Typography variant="body2" color={trend === 'up' ? 'success.main' : 'error.main'}>
                  {trend === 'up' ? '+' : ''}{trendValue.toFixed(1)}%
                </Typography>
              </Stack>
            )}
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// Time period selector
type TimePeriod = '7d' | '30d' | '90d' | '12m';

interface CalendarAnalyticsDashboardProps {
  userId?: string;
}

export function CalendarAnalyticsDashboard({ userId }: CalendarAnalyticsDashboardProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');

  // Calculate date range based on selected period
  const getDateRange = (period: TimePeriod) => {
    const endDate = new Date().toISOString();
    let startDate: string;

    switch (period) {
      case '7d':
        startDate = subDays(new Date(), 7).toISOString();
        break;
      case '30d':
        startDate = subDays(new Date(), 30).toISOString();
        break;
      case '90d':
        startDate = subDays(new Date(), 90).toISOString();
        break;
      case '12m':
        startDate = subMonths(new Date(), 12).toISOString();
        break;
      default:
        startDate = subDays(new Date(), 30).toISOString();
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange(timePeriod);
  const { data: analytics, isLoading, error } = useCalendarAnalytics(startDate, endDate);

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading analytics...</Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">Failed to load analytics</Typography>
        </CardContent>
      </Card>
    );
  }

  const analyticsData = analytics?.data;
  if (!analyticsData) return null;

  // Calculate conversion rate
  const conversionRate = analyticsData.summary.totalAppointments > 0 
    ? (analyticsData.summary.completedAppointments / analyticsData.summary.totalAppointments) * 100 
    : 0;

  // Calculate no-show rate
  const noShowRate = analyticsData.summary.totalAppointments > 0 
    ? (analyticsData.summary.noShowAppointments / analyticsData.summary.totalAppointments) * 100 
    : 0;

  // Calculate cancellation rate
  const cancellationRate = analyticsData.summary.totalAppointments > 0 
    ? (analyticsData.summary.cancelledAppointments / analyticsData.summary.totalAppointments) * 100 
    : 0;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <AnalyticsIcon color="primary" />
          <Typography variant="h5">Calendar Analytics</Typography>
        </Stack>

        {/* Time Period Selector */}
        <ButtonGroup variant="outlined" size="small">
          <Button
            variant={timePeriod === '7d' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={timePeriod === '30d' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={timePeriod === '90d' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('90d')}
          >
            90 Days
          </Button>
          <Button
            variant={timePeriod === '12m' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('12m')}
          >
            12 Months
          </Button>
        </ButtonGroup>
      </Stack>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Appointments"
            value={analyticsData.summary.totalAppointments}
            icon={<Schedule fontSize="large" />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Completed"
            value={analyticsData.summary.completedAppointments}
            icon={<CheckCircle fontSize="large" />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conversion Rate"
            value={conversionRate}
            icon={<TrendingUp fontSize="large" />}
            color="secondary"
            format="percentage"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="No Shows"
            value={analyticsData.summary.noShowAppointments}
            icon={<PersonOff fontSize="large" />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Detailed Analytics */}
      <Grid container spacing={3}>
        {/* Performance Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Overview
              </Typography>
              
              <Stack spacing={3}>
                {/* Completion Rate */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Completion Rate</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {conversionRate.toFixed(1)}%
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={conversionRate} 
                    color="success"
                    sx={{ mt: 1 }}
                  />
                </Box>

                {/* Cancellation Rate */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Cancellation Rate</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {cancellationRate.toFixed(1)}%
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={cancellationRate} 
                    color="warning"
                    sx={{ mt: 1 }}
                  />
                </Box>

                {/* No-Show Rate */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">No-Show Rate</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {noShowRate.toFixed(1)}%
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={noShowRate} 
                    color="error"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Trends & Insights */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trends & Insights
              </Typography>
              
              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                  <Typography variant="body2" color="primary.main" fontWeight="medium">
                    Daily Average
                  </Typography>
                  <Typography variant="h6">
                    {analyticsData.trends.dailyAverage.toFixed(1)} appointments
                  </Typography>
                </Paper>

                {analyticsData.trends.peakDays.length > 0 && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Peak Days
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {analyticsData.trends.peakDays.map((day, index) => (
                        <Chip 
                          key={index} 
                          label={day} 
                          size="small" 
                          color="secondary" 
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {analyticsData.trends.peakHours.length > 0 && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Peak Hours
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {analyticsData.trends.peakHours.map((hour, index) => (
                        <Chip 
                          key={index} 
                          label={`${hour}:00`} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Statistics
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary.main">
                      {analyticsData.summary.totalAppointments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {analyticsData.summary.completedAppointments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {analyticsData.summary.cancelledAppointments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cancelled
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error.main">
                      {analyticsData.summary.noShowAppointments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No Shows
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
