'use client';

import { Container, Typography, Box, Grid, Card, CardContent, CardActions, Button, Chip, Avatar, List, ListItem, ListItemText, ListItemAvatar, IconButton, Tabs, Tab, Paper } from '@mui/material';
import { LibraryBooks, VideoLibrary, School, Article, Download, Star, Launch, Calculate, Build } from '@mui/icons-material';
import { useState } from 'react';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';
import { InteractiveCalculators } from '../../src/features/resources/components/InteractiveCalculators';
import { PersonalNotes } from '../../src/features/resources/components/PersonalNotes';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const resourceCategories = [
  { name: 'Training Videos', count: 45, icon: <VideoLibrary />, color: 'primary' },
  { name: 'Legal Documents', count: 28, icon: <Article />, color: 'success' },
  { name: 'Market Reports', count: 12, icon: <LibraryBooks />, color: 'warning' },
  { name: 'Educational Courses', count: 8, icon: <School />, color: 'info' }
];

const featuredResources = [
  {
    id: 1,
    title: 'Complete Guide to Real Estate Photography',
    type: 'Video Course',
    duration: '2h 30m',
    rating: 4.8,
    category: 'Training Videos',
    description: 'Learn professional photography techniques to showcase properties effectively.'
  },
  {
    id: 2,
    title: 'Q1 2024 Market Analysis Report',
    type: 'PDF Report',
    pages: 24,
    rating: 4.9,
    category: 'Market Reports',
    description: 'Comprehensive analysis of market trends and predictions for the current quarter.'
  },
  {
    id: 3,
    title: 'Property Purchase Agreement Template',
    type: 'Legal Document',
    pages: 8,
    rating: 4.7,
    category: 'Legal Documents',
    description: 'Standardized purchase agreement template with state-specific clauses.'
  },
  {
    id: 4,
    title: 'Digital Marketing for Real Estate Agents',
    type: 'Online Course',
    duration: '4h 15m',
    rating: 4.6,
    category: 'Educational Courses',
    description: 'Master social media marketing and lead generation strategies.'
  }
];

const quickLinks = [
  { name: 'MLS Access', url: '#', icon: <Launch /> },
  { name: 'Forms Library', url: '#', icon: <Article /> },
  { name: 'Continuing Education', url: '#', icon: <School /> },
  { name: 'Industry News', url: '#', icon: <LibraryBooks /> },
  { name: 'Calculators & Tools', url: '#', icon: <Star /> }
];

const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video Course': return <VideoLibrary />;
      case 'PDF Report': return <Article />;
      case 'Legal Document': return <LibraryBooks />;
      case 'Online Course': return <School />;
      default: return <LibraryBooks />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        sx={{ 
          color: i < Math.floor(rating) ? 'warning.main' : 'grey.300',
          fontSize: 16
        }} 
      />
    ));
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <LibraryBooks />
          </Avatar>
          <Typography variant="h4" component="h1">
            Resources
          </Typography>
        </Box>
        
        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="resources tabs">
            <Tab label="Overview" {...a11yProps(0)} />
            <Tab label="Calculators" icon={<Calculate />} {...a11yProps(1)} />
            <Tab label="Notes" icon={<Build />} {...a11yProps(2)} />
            <Tab label="Library" icon={<LibraryBooks />} {...a11yProps(3)} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <CustomTabPanel value={activeTab} index={0}>
          {/* Resource Categories */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {resourceCategories.map((category) => (
              <Grid item xs={12} md={3} key={category.name}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: `${category.color}.main` }}>
                      {category.icon}
                    </Avatar>
                    <Typography variant="h6">{category.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.count} resources
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Grid container spacing={3}>
            {/* Featured Resources */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Featured Resources
                  </Typography>
                  <Grid container spacing={3}>
                    {featuredResources.map((resource) => (
                      <Grid item xs={12} md={6} key={resource.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                              <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                                {getTypeIcon(resource.type)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" component="h3">
                                  {resource.title}
                                </Typography>
                                <Chip label={resource.category} size="small" color="primary" />
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {resource.description}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                              <Box display="flex" alignItems="center">
                                {renderStars(resource.rating)}
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                  {resource.rating}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {resource.duration || `${resource.pages} pages`}
                              </Typography>
                            </Box>
                            
                            <Chip label={resource.type} size="small" variant="outlined" />
                          </CardContent>
                          
                          <CardActions>
                            <Button size="small" startIcon={<Download />}>
                              Download
                            </Button>
                            <Button size="small" startIcon={<Launch />}>
                              View
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Quick Links */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Links
                  </Typography>
                  <List>
                    {quickLinks.map((link) => (
                      <ListItem 
                        key={link.name} 
                        button 
                        onClick={() => {
                          if (link.name === 'Calculators & Tools') {
                            setActiveTab(1);
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'grey.100' }}>
                            {link.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={link.name} />
                        <IconButton size="small">
                          <Launch />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
              
              {/* Recent Updates */}
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Updates
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="New MLS Integration Guide"
                        secondary="Added today"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Updated Legal Forms"
                        secondary="2 days ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Market Trends Webinar"
                        secondary="1 week ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="New Training Videos"
                        secondary="2 weeks ago"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              
              {/* Popular Downloads */}
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Popular Downloads
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Buyer Consultation Checklist"
                        secondary="Downloaded 234 times"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Property Marketing Template"
                        secondary="Downloaded 187 times"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Commission Calculator"
                        secondary="Downloaded 156 times"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CustomTabPanel>

        <CustomTabPanel value={activeTab} index={1}>
          <InteractiveCalculators searchTerm="" selectedCategory="" />
        </CustomTabPanel>

        <CustomTabPanel value={activeTab} index={2}>
          <PersonalNotes searchTerm="" selectedCategory="" />
        </CustomTabPanel>

        <CustomTabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Resource Library
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Document library and training materials will be available here.
          </Typography>
        </CustomTabPanel>
      </Container>
    </ProtectedRoute>
  );
};

export default ResourcesPage;
