'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Contact, ContactAnalytics, ContactRecommendations } from '../../../types/contacts';
import { contactsAPI } from '../../../lib/contacts-api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

function StatCard({ title, value, icon, trend, color = 'primary' }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon 
                  sx={{ 
                    fontSize: 16, 
                    mr: 0.5, 
                    color: trend > 0 ? 'success.main' : 'error.main',
                    transform: trend < 0 ? 'rotate(180deg)' : 'none'
                  }} 
                />
                <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
                  {Math.abs(trend)}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

function ContactListItem({ contact }: { contact: Contact }) {
  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar>
          {contact.firstName?.charAt(0) || contact.email.charAt(0)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={contact.displayName}
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              {contact.email}
            </Typography>
            {contact.companyName && (
              <Typography variant="body2" color="text.secondary">
                {contact.companyName}
              </Typography>
            )}
          </Box>
        }
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
        <Chip 
          label={`Score: ${contact.leadScore}`} 
          color={getLeadScoreColor(contact.leadScore) as any}
          size="small"
        />
        <Chip 
          label={contact.type.replace('_', ' ')} 
          variant="outlined" 
          size="small"
        />
      </Box>
    </ListItem>
  );
}

export default function ContactsDashboard() {
  const [analytics, setAnalytics] = useState<ContactAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<ContactRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, recommendationsData] = await Promise.all([
        contactsAPI.getAnalytics(),
        contactsAPI.getRecommendations()
      ]);
      setAnalytics(analyticsData);
      setRecommendations(recommendationsData);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!analytics || !recommendations) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning">No data available</Alert>
      </Container>
    );
  }

  // Prepare chart data
  const typeData = Object.entries(analytics.byType).map(([key, value]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    value
  }));

  const statusData = Object.entries(analytics.byStatus).map(([key, value]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    value,
    fill: COLORS[Object.keys(analytics.byStatus).indexOf(key) % COLORS.length]
  }));

  const sourceData = Object.entries(analytics.bySource).map(([key, value]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    count: value
  }));

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Contacts Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Contacts"
            value={analytics.total}
            icon={<PeopleIcon />}
            trend={12}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="High Value Contacts"
            value={analytics.highValueContacts}
            icon={<StarIcon />}
            trend={8}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Need Follow-up"
            value={analytics.needingFollowUp}
            icon={<ScheduleIcon />}
            trend={-5}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Recently Added"
            value={analytics.recentlyAdded}
            icon={<PersonAddIcon />}
            trend={15}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Contacts by Type
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Contacts by Status
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Lead Score Distribution
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">High (80-100)</Typography>
                <Typography variant="body2">
                  {Math.round((analytics.highValueContacts / analytics.total) * 100)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(analytics.highValueContacts / analytics.total) * 100} 
                color="success"
                sx={{ mb: 2, height: 8, borderRadius: 4 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Medium (60-79)</Typography>
                <Typography variant="body2">25%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={25} 
                color="warning"
                sx={{ mb: 2, height: 8, borderRadius: 4 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Low (0-59)</Typography>
                <Typography variant="body2">
                  {100 - Math.round((analytics.highValueContacts / analytics.total) * 100) - 25}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={100 - Math.round((analytics.highValueContacts / analytics.total) * 100) - 25} 
                color="error"
                sx={{ height: 8, borderRadius: 4 }}
              />

              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="h4" color="primary">
                  {analytics.averageLeadScore.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Lead Score
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recommendations Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              High Priority Contacts
            </Typography>
            <List dense>
              {recommendations.highPriority.slice(0, 5).map((contact) => (
                <ContactListItem key={contact.id} contact={contact} />
              ))}
              {recommendations.highPriority.length === 0 && (
                <ListItem>
                  <ListItemText primary="No high priority contacts" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Needs Follow-up
            </Typography>
            <List dense>
              {recommendations.needsFollowUp.slice(0, 5).map((contact) => (
                <ContactListItem key={contact.id} contact={contact} />
              ))}
              {recommendations.needsFollowUp.length === 0 && (
                <ListItem>
                  <ListItemText primary="All contacts up to date" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recently Active
            </Typography>
            <List dense>
              {recommendations.recentlyActive.slice(0, 5).map((contact) => (
                <ContactListItem key={contact.id} contact={contact} />
              ))}
              {recommendations.recentlyActive.length === 0 && (
                <ListItem>
                  <ListItemText primary="No recent activity" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Cold Leads (90+ days)
            </Typography>
            <List dense>
              {recommendations.coldLeads.slice(0, 5).map((contact) => (
                <ContactListItem key={contact.id} contact={contact} />
              ))}
              {recommendations.coldLeads.length === 0 && (
                <ListItem>
                  <ListItemText primary="No cold leads" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
