'use client';

import { Container, Typography, Box, Grid, Card, CardContent, CardActions, Button, Chip, Avatar, IconButton } from '@mui/material';
import { Edit, Delete, Email, Phone, Share, Analytics } from '@mui/icons-material';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

const campaigns = [
  {
    id: 1,
    name: 'Spring Open House Campaign',
    type: 'Email',
    status: 'Active',
    reach: 1250,
    engagement: 8.5,
    conversions: 23,
    budget: '$2,500',
    startDate: '2024-03-01',
    endDate: '2024-04-15'
  },
  {
    id: 2,
    name: 'First Time Buyer Workshop',
    type: 'Event',
    status: 'Scheduled',
    reach: 500,
    engagement: 15.2,
    conversions: 12,
    budget: '$1,200',
    startDate: '2024-03-15',
    endDate: '2024-03-15'
  },
  {
    id: 3,
    name: 'Luxury Property Showcase',
    type: 'Social Media',
    status: 'Draft',
    reach: 0,
    engagement: 0,
    conversions: 0,
    budget: '$3,000',
    startDate: '2024-04-01',
    endDate: '2024-04-30'
  },
  {
    id: 4,
    name: 'Neighborhood Market Report',
    type: 'Newsletter',
    status: 'Completed',
    reach: 2100,
    engagement: 12.8,
    conversions: 45,
    budget: '$800',
    startDate: '2024-02-01',
    endDate: '2024-02-28'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Scheduled': return 'warning';
    case 'Draft': return 'default';
    case 'Completed': return 'info';
    default: return 'default';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Email': return <Email />;
    case 'Event': return <Analytics />;
    case 'Social Media': return <Share />;
    case 'Newsletter': return <Email />;
    default: return <Email />;
  }
};

const CampaignsPage = () => {
  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Marketing Campaigns
          </Typography>
          <Button variant="contained" color="primary">
            Create Campaign
          </Button>
        </Box>
        
        {/* Campaign Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Total Campaigns
                </Typography>
                <Typography variant="h3" color="primary">
                  {campaigns.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Active Campaigns
                </Typography>
                <Typography variant="h3" color="success.main">
                  {campaigns.filter(c => c.status === 'Active').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Total Reach
                </Typography>
                <Typography variant="h3" color="info.main">
                  {campaigns.reduce((sum, c) => sum + c.reach, 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Conversions
                </Typography>
                <Typography variant="h3" color="warning.main">
                  {campaigns.reduce((sum, c) => sum + c.conversions, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Campaign List */}
        <Grid container spacing={3}>
          {campaigns.map((campaign) => (
            <Grid item xs={12} md={6} key={campaign.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {getTypeIcon(campaign.type)}
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="h6">{campaign.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {campaign.type}
                      </Typography>
                    </Box>
                    <Chip 
                      label={campaign.status} 
                      color={getStatusColor(campaign.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Reach
                      </Typography>
                      <Typography variant="h6">
                        {campaign.reach.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Engagement
                      </Typography>
                      <Typography variant="h6">
                        {campaign.engagement}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Conversions
                      </Typography>
                      <Typography variant="h6">
                        {campaign.conversions}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Budget
                      </Typography>
                      <Typography variant="h6">
                        {campaign.budget}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="body2" color="text.secondary">
                    {campaign.startDate} - {campaign.endDate}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button size="small" startIcon={<Edit />}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<Analytics />}>
                    Analytics
                  </Button>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ProtectedRoute>
  );
};

export default CampaignsPage;
