'use client';

import { Container, Typography, Box, Grid, Card, CardContent, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import ProtectedRoute from '../../../src/components/auth/ProtectedRoute';

const marketTrends = [
  { month: 'Jan', avgPrice: 425000, inventory: 180, daysOnMarket: 25 },
  { month: 'Feb', avgPrice: 432000, inventory: 165, daysOnMarket: 22 },
  { month: 'Mar', avgPrice: 445000, inventory: 142, daysOnMarket: 18 },
  { month: 'Apr', avgPrice: 458000, inventory: 135, daysOnMarket: 16 },
  { month: 'May', avgPrice: 470000, inventory: 128, daysOnMarket: 15 },
  { month: 'Jun', avgPrice: 485000, inventory: 120, daysOnMarket: 14 }
];

const priceByPropertyType = [
  { type: 'Single Family', q1: 485000, q2: 498000, q3: 512000, q4: 525000 },
  { type: 'Condo', q1: 285000, q2: 295000, q3: 308000, q4: 318000 },
  { type: 'Townhouse', q1: 385000, q2: 395000, q3: 408000, q4: 420000 },
  { type: 'Multi-Family', q1: 685000, q2: 705000, q3: 725000, q4: 748000 }
];

const regionData = [
  { region: 'Downtown', growth: 12.5, trend: 'up' },
  { region: 'Suburbs', growth: 8.2, trend: 'up' },
  { region: 'Waterfront', growth: 15.8, trend: 'up' },
  { region: 'Historic District', growth: -2.1, trend: 'down' },
  { region: 'New Development', growth: 22.3, trend: 'up' }
];

const MarketTrendsPage = () => {
  const getTrendIcon = (trend: string, growth: number) => {
    if (trend === 'up') return <TrendingUp color="success" />;
    if (trend === 'down') return <TrendingDown color="error" />;
    return <TrendingFlat color="warning" />;
  };

  const getTrendColor = (growth: number) => {
    if (growth > 0) return 'success';
    if (growth < 0) return 'error';
    return 'warning';
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Market Trends
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Period</InputLabel>
            <Select defaultValue="6months" label="Time Period">
              <MenuItem value="3months">3 Months</MenuItem>
              <MenuItem value="6months">6 Months</MenuItem>
              <MenuItem value="1year">1 Year</MenuItem>
              <MenuItem value="2years">2 Years</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Avg. Home Price
                </Typography>
                <Typography variant="h3" color="primary">
                  $485K
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="success.main">
                    +12.5% YoY
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Inventory Level
                </Typography>
                <Typography variant="h3" color="warning.main">
                  120
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingDown color="error" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="error.main">
                    -33% YoY
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Days on Market
                </Typography>
                <Typography variant="h3" color="success.main">
                  14
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingDown color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="success.main">
                    -44% YoY
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Market Trends Chart */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Market Trends Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={marketTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="avgPrice" 
                  stroke="#2196f3" 
                  name="Average Price ($)"
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="inventory" 
                  stroke="#ff9800" 
                  name="Inventory"
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="daysOnMarket" 
                  stroke="#4caf50" 
                  name="Days on Market"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Grid container spacing={3}>
          {/* Price by Property Type */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Price Trends by Property Type
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceByPropertyType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="q1" fill="#2196f3" name="Q1" />
                    <Bar dataKey="q2" fill="#4caf50" name="Q2" />
                    <Bar dataKey="q3" fill="#ff9800" name="Q3" />
                    <Bar dataKey="q4" fill="#f44336" name="Q4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Regional Growth */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Regional Price Growth
                </Typography>
                <Box>
                  {regionData.map((region) => (
                    <Box key={region.region} display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Box display="flex" alignItems="center">
                        {getTrendIcon(region.trend, region.growth)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {region.region}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${region.growth > 0 ? '+' : ''}${region.growth}%`}
                        color={getTrendColor(region.growth) as any}
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
};

export default MarketTrendsPage;
