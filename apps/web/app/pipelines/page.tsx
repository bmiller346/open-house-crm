'use client';

import { Container, Typography, Box, Grid, Card, CardContent, LinearProgress, Chip } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

const pipelineData = [
  { name: 'Lead', value: 45, color: '#8884d8' },
  { name: 'Qualified', value: 32, color: '#82ca9d' },
  { name: 'Proposal', value: 18, color: '#ffc658' },
  { name: 'Negotiation', value: 12, color: '#ff7300' },
  { name: 'Closed', value: 8, color: '#00ff00' },
];

const monthlyData = [
  { month: 'Jan', leads: 40, closed: 5 },
  { month: 'Feb', leads: 35, closed: 8 },
  { month: 'Mar', leads: 50, closed: 12 },
  { month: 'Apr', leads: 45, closed: 10 },
  { month: 'May', leads: 60, closed: 15 },
  { month: 'Jun', leads: 55, closed: 18 },
];

const PipelinesPage = () => {
  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sales Pipelines
        </Typography>
        
        <Grid container spacing={3}>
          {/* Pipeline Overview Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Leads
                </Typography>
                <Typography variant="h2" color="primary">
                  115
                </Typography>
                <LinearProgress variant="determinate" value={75} sx={{ mt: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  75% of monthly target
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Conversion Rate
                </Typography>
                <Typography variant="h2" color="success.main">
                  12.5%
                </Typography>
                <Chip label="+2.3%" color="success" size="small" sx={{ mt: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  vs last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Avg. Deal Value
                </Typography>
                <Typography variant="h2" color="info.main">
                  $485K
                </Typography>
                <Chip label="+15%" color="info" size="small" sx={{ mt: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  vs last quarter
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Pipeline Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pipeline Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Monthly Performance */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leads" fill="#8884d8" name="Leads" />
                    <Bar dataKey="closed" fill="#82ca9d" name="Closed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
};

export default PipelinesPage;
