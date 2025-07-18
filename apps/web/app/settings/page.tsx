'use client';

import { Container, Typography, Box, Grid, Card, CardContent, Avatar, FormControlLabel, Switch, Select, MenuItem, FormControl, InputLabel, Divider, List, ListItem, ListItemText, ListItemIcon, Button, TextField, IconButton, Badge, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import { Settings, Palette, Security, Notifications, Language, Storage, Backup, AdminPanelSettings, PhotoCamera, Edit, Save, Cancel, CloudUpload, Delete, AccountCircle, PersonAdd, Lock, Webhook, Email, Google, Sync, CheckCircle, Error } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';
import { useAuth } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/contexts/ThemeContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const { mode, setMode, isDarkMode } = useTheme();
  const [settings, setSettings] = useState({
    theme: mode,
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    autoSave: true,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    darkMode: isDarkMode,
    compactView: false,
    showGrid: true,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    bio: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGmailDialog, setShowGmailDialog] = useState(false);
  const [gmailIntegration, setGmailIntegration] = useState({
    connected: false,
    email: '',
    syncEnabled: false,
    lastSync: null as string | null,
    autoSync: true,
    syncInterval: 'realtime'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme changes immediately
    if (settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [settings.darkMode]);

  const handleSettingChange = (setting: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [setting]: value };
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      return newSettings;
    });
    
    // Handle theme changes in real-time
    if (setting === 'theme') {
      setMode(value);
    }
    
    if (setting === 'darkMode') {
      const newMode = value ? 'dark' : 'light';
      setMode(newMode);
      setSettings(prev => ({ ...prev, theme: newMode }));
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Here you would typically save to your backend
      console.log('Saving profile:', profileData);
      setIsEditing(false);
      setShowSuccess(true);
      // TODO: Implement actual API call
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileData(prev => ({
          ...prev,
          avatar: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    try {
      // Here you would typically save to your backend
      console.log('Changing password...');
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowSuccess(true);
      // TODO: Implement actual API call
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Here you would typically save to your backend
      console.log('Saving settings:', settings);
      setShowSuccess(true);
      // TODO: Implement actual API call
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleGmailConnect = async () => {
    try {
      // In a real app, this would initiate OAuth flow
      console.log('Connecting to Gmail...');
      // Simulate OAuth success
      setGmailIntegration(prev => ({
        ...prev,
        connected: true,
        email: user?.email || 'user@gmail.com',
        syncEnabled: true,
        lastSync: new Date().toISOString()
      }));
      setShowGmailDialog(false);
      setShowSuccess(true);
      // TODO: Implement actual Gmail OAuth flow
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
    }
  };

  const handleGmailDisconnect = async () => {
    try {
      console.log('Disconnecting Gmail...');
      setGmailIntegration({
        connected: false,
        email: '',
        syncEnabled: false,
        lastSync: null,
        autoSync: true,
        syncInterval: 'realtime'
      });
      setShowSuccess(true);
      // TODO: Implement actual API call
    } catch (error) {
      console.error('Failed to disconnect Gmail:', error);
    }
  };

  const handleGmailSync = async () => {
    try {
      console.log('Syncing Gmail...');
      setGmailIntegration(prev => ({
        ...prev,
        lastSync: new Date().toISOString()
      }));
      setShowSuccess(true);
      // TODO: Implement actual Gmail sync
    } catch (error) {
      console.error('Failed to sync Gmail:', error);
    }
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <Settings />
          </Avatar>
          <Typography variant="h4" component="h1">
            Settings
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {/* Profile Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccountCircle sx={{ mr: 1 }} />
                  <Typography variant="h6">Profile Settings</Typography>
                  <Box flexGrow={1} />
                  <IconButton onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? <Cancel /> : <Edit />}
                  </IconButton>
                </Box>
                
                <Box display="flex" alignItems="center" mb={3}>
                  <Box position="relative">
                    <Avatar
                      sx={{ width: 80, height: 80, mr: 2 }}
                      src={profileData.avatar}
                    >
                      {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                    </Avatar>
                    {isEditing && (
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 10,
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                        size="small"
                        component="label"
                      >
                        <PhotoCamera />
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleAvatarUpload}
                        />
                      </IconButton>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="h6">
                      {profileData.firstName} {profileData.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profileData.email}
                    </Typography>
                    <Chip 
                      label={(user?.workspaces?.length || 0) > 0 ? 'Active Account' : 'Inactive'} 
                      color={(user?.workspaces?.length || 0) > 0 ? 'success' : 'error'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="First Name"
                      value={profileData.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      fullWidth
                      disabled={!isEditing}
                      type="email"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Phone"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>
                
                {isEditing && (
                  <Box mt={2} display="flex" gap={2}>
                    <Button 
                      variant="contained" 
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                    >
                      Save Profile
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<Lock />}
                      onClick={() => setShowChangePassword(true)}
                    >
                      Change Password
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Appearance Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Palette sx={{ mr: 1 }} />
                  <Typography variant="h6">Appearance</Typography>
                </Box>
                
                <List>
                  <ListItem>
                    <ListItemText primary="Theme" secondary="Choose your preferred theme" />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={settings.theme}
                        onChange={(e) => handleSettingChange('theme', e.target.value)}
                      >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="auto">Auto</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="Dark Mode" secondary="Enable dark mode interface" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.darkMode}
                          onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="Compact View" secondary="Use compact layout for more information" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.compactView}
                          onChange={(e) => handleSettingChange('compactView', e.target.checked)}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="Show Grid" secondary="Display grid lines in tables" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.showGrid}
                          onChange={(e) => handleSettingChange('showGrid', e.target.checked)}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* System Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AdminPanelSettings sx={{ mr: 1 }} />
                  <Typography variant="h6">System</Typography>
                </Box>
                
                <List>
                  <ListItem>
                    <ListItemText primary="Language" secondary="Select your preferred language" />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                        <MenuItem value="de">German</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="Currency" secondary="Default currency for transactions" />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={settings.currency}
                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                      >
                        <MenuItem value="USD">USD ($)</MenuItem>
                        <MenuItem value="EUR">EUR (€)</MenuItem>
                        <MenuItem value="GBP">GBP (£)</MenuItem>
                        <MenuItem value="CAD">CAD (C$)</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="Date Format" secondary="How dates are displayed" />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={settings.dateFormat}
                        onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                      >
                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="Time Format" secondary="12-hour or 24-hour format" />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={settings.timeFormat}
                        onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                      >
                        <MenuItem value="12">12 Hour</MenuItem>
                        <MenuItem value="24">24 Hour</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Notifications sx={{ mr: 1 }} />
                  <Typography variant="h6">Notifications</Typography>
                </Box>
                
                <List>
                  <ListItem>
                    <ListItemText primary="Email Notifications" secondary="Receive updates via email" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailNotifications}
                          onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="Push Notifications" secondary="Browser notifications" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.pushNotifications}
                          onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="Sound" secondary="Enable notification sounds" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.soundEnabled}
                          onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="Auto Save" secondary="Automatically save your work" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoSave}
                          onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Data & Storage */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Storage sx={{ mr: 1 }} />
                  <Typography variant="h6">Data & Storage</Typography>
                </Box>
                
                <List>
                  <ListItem>
                    <ListItemText primary="Auto Backup" secondary="Automatically backup your data" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoBackup}
                          onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="Backup Frequency" secondary="How often to backup data" />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={settings.backupFrequency}
                        onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                        disabled={!settings.autoBackup}
                      >
                        <MenuItem value="hourly">Hourly</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="Data Export" secondary="Export your data" />
                    <Button variant="outlined" size="small" startIcon={<CloudUpload />}>
                      Export
                    </Button>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="Cache Size" secondary="Current cache: 245 MB" />
                    <Button variant="outlined" size="small" color="warning" startIcon={<Delete />}>
                      Clear Cache
                    </Button>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Webhook Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Webhook sx={{ mr: 1 }} />
                  <Typography variant="h6">Webhook Integration</Typography>
                </Box>
                
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Webhook Status" 
                      secondary={`${user?.workspaces?.length || 0} webhooks configured`}
                    />
                    <Chip 
                      label="Active" 
                      color="success" 
                      size="small"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Manage Webhooks" 
                      secondary="Configure endpoint URLs and events"
                    />
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => window.location.href = '/webhooks'}
                    >
                      Configure
                    </Button>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          {/* Gmail Integration */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Email sx={{ mr: 1 }} />
                  <Typography variant="h6">Gmail Integration</Typography>
                </Box>
                
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Connection Status" 
                      secondary={gmailIntegration.connected ? `Connected to ${gmailIntegration.email}` : 'Not connected'}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {gmailIntegration.connected ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Error color="error" />
                      )}
                      <Chip 
                        label={gmailIntegration.connected ? "Connected" : "Disconnected"} 
                        color={gmailIntegration.connected ? "success" : "error"} 
                        size="small"
                      />
                    </Box>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Email Sync" 
                      secondary={gmailIntegration.lastSync ? `Last sync: ${new Date(gmailIntegration.lastSync).toLocaleString()}` : 'Never synced'}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {gmailIntegration.connected && (
                        <Button 
                          variant="outlined" 
                          size="small"
                          startIcon={<Sync />}
                          onClick={handleGmailSync}
                        >
                          Sync Now
                        </Button>
                      )}
                      {gmailIntegration.connected ? (
                        <Button 
                          variant="outlined" 
                          size="small"
                          color="error"
                          onClick={handleGmailDisconnect}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button 
                          variant="outlined" 
                          size="small"
                          startIcon={<Google />}
                          onClick={() => setShowGmailDialog(true)}
                        >
                          Connect
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                  
                  {gmailIntegration.connected && (
                    <>
                      <ListItem>
                        <ListItemText primary="Auto Sync" secondary="Automatically sync emails in real-time" />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={gmailIntegration.autoSync}
                              onChange={(e) => setGmailIntegration(prev => ({ ...prev, autoSync: e.target.checked }))}
                            />
                          }
                          label=""
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemText primary="Sync Interval" secondary="How often to check for new emails" />
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={gmailIntegration.syncInterval}
                            onChange={(e) => setGmailIntegration(prev => ({ ...prev, syncInterval: e.target.value }))}
                            disabled={!gmailIntegration.autoSync}
                          >
                            <MenuItem value="realtime">Real-time</MenuItem>
                            <MenuItem value="5min">Every 5 minutes</MenuItem>
                            <MenuItem value="15min">Every 15 minutes</MenuItem>
                            <MenuItem value="1hour">Every hour</MenuItem>
                          </Select>
                        </FormControl>
                      </ListItem>
                    </>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        </Grid>
        
        {/* Save Button */}
        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button variant="contained" onClick={handleSaveSettings} size="large" startIcon={<Save />}>
            Save Settings
          </Button>
        </Box>

        {/* Gmail Connection Dialog */}
        <Dialog open={showGmailDialog} onClose={() => setShowGmailDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Google color="error" />
              Connect Gmail Account
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Connect your Gmail account to enable email synchronization and automation features:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                <li>Automatically sync contact emails</li>
                <li>Track email interactions</li>
                <li>Send automated follow-up emails</li>
                <li>Import contact information from emails</li>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Privacy Note:</strong> We only access emails related to your real estate business. 
                You can revoke access at any time through your Google account settings.
              </Alert>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Google />
                <Typography variant="body2">
                  This will redirect you to Google's secure OAuth authorization page.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowGmailDialog(false)}>Cancel</Button>
            <Button onClick={handleGmailConnect} variant="contained" startIcon={<Google />}>
              Connect Gmail
            </Button>
          </DialogActions>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={showChangePassword} onClose={() => setShowChangePassword(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                fullWidth
                margin="normal"
              />
              <TextField
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                fullWidth
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowChangePassword(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} variant="contained">Change Password</Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
        >
          <Alert onClose={() => setShowSuccess(false)} severity="success">
            Settings saved successfully!
          </Alert>
        </Snackbar>
      </Container>
    </ProtectedRoute>
  );
};

export default SettingsPage;