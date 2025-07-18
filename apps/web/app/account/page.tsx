'use client';

import { Container, Typography, Box, Grid, Card, CardContent, Avatar, Button, TextField, Divider, List, ListItem, ListItemText, ListItemIcon, Switch, FormControlLabel } from '@mui/material';
import { AccountCircle, Edit, Security, Notifications, Email, Phone, LocationOn, Business } from '@mui/icons-material';
import { useState } from 'react';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';
import { useAuth } from '../../src/hooks/useAuth';

const AccountPage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone || '(555) 123-4567',
    address: '123 Main Street, City, State 12345',
    company: 'Real Estate Pro',
    licenseNumber: 'RE123456789',
    bio: 'Experienced real estate agent with 10+ years in the industry.'
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: string, checked: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log('Saving profile data:', formData);
    setIsEditing(false);
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <AccountCircle />
          </Avatar>
          <Typography variant="h4" component="h1">
            My Account
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">Profile Information</Typography>
                  <Button
                    variant={isEditing ? "contained" : "outlined"}
                    startIcon={<Edit />}
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  >
                    {isEditing ? 'Save' : 'Edit'}
                  </Button>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="License Number"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Notification Preferences */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Email /></ListItemIcon>
                    <ListItemText primary="Email Notifications" secondary="Receive important updates via email" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.emailNotifications}
                          onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Notifications /></ListItemIcon>
                    <ListItemText primary="Push Notifications" secondary="Get real-time notifications in your browser" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.pushNotifications}
                          onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Phone /></ListItemIcon>
                    <ListItemText primary="SMS Notifications" secondary="Receive text messages for urgent matters" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.smsNotifications}
                          onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Business /></ListItemIcon>
                    <ListItemText primary="Marketing Emails" secondary="Receive promotional content and updates" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.marketingEmails}
                          onChange={(e) => handleNotificationChange('marketingEmails', e.target.checked)}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Profile Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                </Avatar>
                <Typography variant="h6">
                  {formData.firstName} {formData.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formData.company}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  License: {formData.licenseNumber}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box textAlign="left">
                  <Box display="flex" alignItems="center" mb={1}>
                    <Email sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">{formData.email}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Phone sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">{formData.phone}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">{formData.address}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            
            {/* Account Actions */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Actions
                </Typography>
                <Button fullWidth variant="outlined" startIcon={<Security />} sx={{ mb: 2 }}>
                  Change Password
                </Button>
                <Button fullWidth variant="outlined" color="error">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
};

export default AccountPage;
