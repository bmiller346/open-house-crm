'use client';

import { Box, Grid, Paper, Typography, Card, CardContent, LinearProgress } from '@mui/material';
import { 
  People, 
  AttachMoney, 
  Home, 
  ShowChart, 
  TrendingUp, 
  TrendingDown,
  Timeline,
  CalendarToday,
  Phone
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { contactsApi, transactionsApi, inventoryApi, getCurrentUser, isAuthenticated } from '../../lib/api';

interface DashboardStats {
  totalContacts: number;
  totalTransactions: number;
  totalProperties: number;
  totalRevenue: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'contact' | 'transaction' | 'property' | 'appointment';
  title: string;
  description: string;
  time: string;
  avatar?: string;
}

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalTransactions: 0,
    totalProperties: 0,
    totalRevenue: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load real data from APIs
        const [contactsResponse, transactionsResponse] = await Promise.allSettled([
          contactsApi.getContacts({ limit: 10 }),
          transactionsApi.getTransactions({ limit: 10 })
        ]);

        const contacts = contactsResponse.status === 'fulfilled' ? contactsResponse.value.data || [] : [];
        const transactions = transactionsResponse.status === 'fulfilled' ? transactionsResponse.value.data || [] : [];

        // Calculate total revenue
        const totalRevenue = transactions.reduce((sum: number, transaction: any) => {
          return sum + (parseFloat(transaction.amount) || 0);
        }, 0);

        // Generate recent activity
        const recentActivity: ActivityItem[] = [
          ...contacts.slice(0, 3).map((contact: any) => ({
            id: contact.id,
            type: 'contact' as const,
            title: `${contact.firstName} ${contact.lastName}`,
            description: 'New contact added',
            time: contact.createdAt ? new Date(contact.createdAt).toLocaleString() : 'Recently'
          })),
          ...transactions.slice(0, 3).map((transaction: any) => ({
            id: transaction.id,
            type: 'transaction' as const,
            title: transaction.propertyAddress || 'Property Transaction',
            description: `Transaction: $${transaction.amount || '0'}`,
            time: transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : 'Recently'
          }))
        ].slice(0, 5);

        setStats({
          totalContacts: contacts.length,
          totalTransactions: transactions.length,
          totalProperties: 0,
          totalRevenue,
          recentActivity
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Fallback to demo data
        setStats({
          totalContacts: 1234,
          totalTransactions: 56,
          totalProperties: 89,
          totalRevenue: 2450000,
          recentActivity: [
            {
              id: '1',
              type: 'contact',
              title: 'John Smith',
              description: 'New contact added',
              time: '2 hours ago'
            },
            {
              id: '2',
              type: 'transaction',
              title: '123 Oak Street',
              description: 'Deal closed: $325,000',
              time: '4 hours ago'
            },
            {
              id: '3',
              type: 'appointment',
              title: 'Property Viewing',
              description: 'Meeting with Jane Doe',
              time: '1 day ago'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards: StatCard[] = [
    {
      title: 'Total Contacts',
      value: stats.totalContacts.toLocaleString(),
      change: 12.5,
      icon: <People />,
      color: '#3B82F6'
    },
    {
      title: 'Active Deals',
      value: stats.totalTransactions.toLocaleString(),
      change: 8.2,
      icon: <AttachMoney />,
      color: '#10B981'
    },
    {
      title: 'Properties',
      value: stats.totalProperties.toLocaleString(),
      change: 5.1,
      icon: <Home />,
      color: '#F59E0B'
    },
    {
      title: 'Revenue',
      value: `$${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      change: 15.3,
      icon: <ShowChart />,
      color: '#8B5CF6'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact': return <People />;
      case 'transaction': return <AttachMoney />;
      case 'property': return <Home />;
      case 'appointment': return <CalendarToday />;
      default: return <ShowChart />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'contact': return '#3B82F6';
      case 'transaction': return '#10B981';
      case 'property': return '#F59E0B';
      case 'appointment': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Loading dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening with your business today.
        </Typography>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: stat.color + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stat.change > 0 ? (
                      <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />
                    ) : (
                      <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />
                    )}
                    <Typography 
                      variant="caption" 
                      color={stat.change > 0 ? 'success.main' : 'error.main'}
                      fontWeight={600}
                    >
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h4" component="div" fontWeight={700} gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Chart/Analytics Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Revenue Overview
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Last 12 months
                </Typography>
              </Box>
            </Box>
            <Box 
              sx={{ 
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'background.default',
                borderRadius: 1,
                border: '2px dashed',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Timeline sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Chart Coming Soon
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Revenue analytics will be displayed here
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <Box
                    key={activity.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 2,
                      borderBottom: index < stats.recentActivity.length - 1 ? 1 : 0,
                      borderColor: 'divider'
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: getActivityColor(activity.type) + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: getActivityColor(activity.type)
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {activity.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent activity
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {[
                { label: 'Add Contact', icon: <People />, path: '/contacts', color: '#3B82F6' },
                { label: 'New Deal', icon: <AttachMoney />, path: '/transactions', color: '#10B981' },
                { label: 'List Property', icon: <Home />, path: '/inventory', color: '#F59E0B' },
                { label: 'Schedule Call', icon: <Phone />, path: '/calendar', color: '#8B5CF6' }
              ].map((action, index) => (
                <Grid item xs={6} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          backgroundColor: action.color + '20',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: action.color,
                          mx: 'auto',
                          mb: 1
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {action.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Upcoming Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Upcoming Tasks
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                { task: 'Follow up with John Smith', time: 'Today, 2:00 PM', priority: 'high' },
                { task: 'Property viewing at Oak Street', time: 'Tomorrow, 10:00 AM', priority: 'medium' },
                { task: 'Review contract documents', time: 'Dec 20, 9:00 AM', priority: 'low' }
              ].map((task, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.5,
                    borderBottom: index < 2 ? 1 : 0,
                    borderColor: 'divider'
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 
                        task.priority === 'high' ? 'error.main' :
                        task.priority === 'medium' ? 'warning.main' : 'success.main'
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {task.task}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
  }, [router]);

  if (!isAuthenticated()) {
    return null;
  }

  return <DashboardContent />;
}
