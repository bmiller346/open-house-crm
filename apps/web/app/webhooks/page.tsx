'use client';

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Settings, 
  Visibility, 
  VisibilityOff,
  ContentCopy,
  CheckCircle,
  Error,
  Warning,
  PlayArrow,
  Refresh
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '../../lib/api';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secretKey: string;
  createdAt: string;
  lastEventAt?: string;
  eventCount: number;
}

interface WebhookEvent {
  id: string;
  webhookId: string;
  eventType: string;
  payload: any;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  createdAt: string;
  deliveredAt?: string;
}

const AVAILABLE_EVENTS = [
  'contact.created',
  'contact.updated',
  'contact.deleted',
  'transaction.created',
  'transaction.updated',
  'transaction.completed',
  'property.created',
  'property.updated',
  'property.sold',
  'user.created',
  'user.updated'
];

const DEFAULT_WEBHOOK_EXAMPLES = [
  {
    name: 'Slack Notifications',
    description: 'Get real-time notifications in your Slack workspace when contacts or transactions are updated',
    url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
    events: ['contact.created', 'contact.updated', 'transaction.created', 'transaction.completed'],
    icon: '💬',
    category: 'Communication',
    setupGuide: 'https://api.slack.com/incoming-webhooks'
  },
  {
    name: 'Zapier Integration',
    description: 'Connect to thousands of apps via Zapier automation workflows',
    url: 'https://hooks.zapier.com/hooks/catch/YOUR_ZAPIER_WEBHOOK_ID',
    events: ['contact.created', 'property.created', 'transaction.created'],
    icon: '⚡',
    category: 'Automation',
    setupGuide: 'https://zapier.com/help/doc/how-get-started-webhooks-zapier'
  },
  {
    name: 'Discord Alerts',
    description: 'Receive property and transaction updates in your Discord server',
    url: 'https://discord.com/api/webhooks/YOUR_DISCORD_WEBHOOK_ID/YOUR_DISCORD_TOKEN',
    events: ['property.created', 'property.sold', 'transaction.completed'],
    icon: '🎮',
    category: 'Communication',
    setupGuide: 'https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks'
  },
  {
    name: 'Email Marketing (Mailchimp)',
    description: 'Automatically add new contacts to your email marketing campaigns',
    url: 'https://YOUR_DOMAIN.mailchimp.com/webhooks/YOUR_WEBHOOK_ID',
    events: ['contact.created', 'contact.updated'],
    icon: '📧',
    category: 'Marketing',
    setupGuide: 'https://mailchimp.com/help/about-webhooks/'
  },
  {
    name: 'CRM Integration (HubSpot)',
    description: 'Sync contacts and deals with your HubSpot CRM',
    url: 'https://api.hubapi.com/webhooks/v3/YOUR_WEBHOOK_ID',
    events: ['contact.created', 'contact.updated', 'transaction.created', 'transaction.updated'],
    icon: '🏢',
    category: 'CRM',
    setupGuide: 'https://developers.hubspot.com/docs/api/webhooks'
  },
  {
    name: 'Analytics Tracking',
    description: 'Track property views and transaction metrics in your analytics platform',
    url: 'https://YOUR_ANALYTICS_ENDPOINT.com/webhook',
    events: ['property.created', 'property.updated', 'transaction.created', 'transaction.completed'],
    icon: '📊',
    category: 'Analytics',
    setupGuide: '#'
  }
];

function WebhookDashboard() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [examplesDialogOpen, setExamplesDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    isActive: true
  });
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    loadWebhooks();
    loadEvents();
  }, []);

  const loadWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-workspace-id': localStorage.getItem('workspaceId') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.data || []);
      } else {
        console.error('Failed to load webhooks:', response.statusText);
        setWebhooks([]);
      }
    } catch (error) {
      console.error('Failed to load webhooks:', error);
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/webhooks/logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-workspace-id': localStorage.getItem('workspaceId') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      } else {
        console.error('Failed to load webhook events:', response.statusText);
        setEvents([]);
      }
    } catch (error) {
      console.error('Failed to load webhook events:', error);
      setEvents([]);
    }
  };

  const copySecret = async (webhookId: string, secret: string) => {
    await navigator.clipboard.writeText(secret);
    setCopiedSecret(webhookId);
    setTimeout(() => setCopiedSecret(null), 2000);
  };

  const toggleSecretVisibility = (webhookId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [webhookId]: !prev[webhookId]
    }));
  };

  const handleCreateWebhook = async () => {
    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-workspace-id': localStorage.getItem('workspaceId') || '',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setCreateDialogOpen(false);
        resetForm();
        loadWebhooks();
      } else {
        console.error('Failed to create webhook');
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
    }
  };

  const handleUpdateWebhook = async () => {
    if (!selectedWebhook) return;

    try {
      const response = await fetch(`/api/webhooks/${selectedWebhook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-workspace-id': localStorage.getItem('workspaceId') || '',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditDialogOpen(false);
        setSelectedWebhook(null);
        resetForm();
        loadWebhooks();
      } else {
        console.error('Failed to update webhook');
      }
    } catch (error) {
      console.error('Error updating webhook:', error);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-workspace-id': localStorage.getItem('workspaceId') || '',
        },
      });

      if (response.ok) {
        loadWebhooks();
      } else {
        console.error('Failed to delete webhook');
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-workspace-id': localStorage.getItem('workspaceId') || '',
        },
      });

      if (response.ok) {
        alert('Test webhook sent successfully!');
        loadEvents();
      } else {
        alert('Failed to send test webhook');
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      alert('Error testing webhook');
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const openEditDialog = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      isActive: webhook.isActive,
    });
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      events: [],
      isActive: true
    });
  };

  const handleEventChange = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const stats = {
    totalWebhooks: webhooks.length,
    activeWebhooks: webhooks.filter(w => w.isActive).length,
    totalEvents: events.length,
    successRate: events.length > 0 ? (events.filter(e => e.status === 'delivered').length / events.length * 100) : 0
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          🔗 Webhook Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setExamplesDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            📚 View Examples
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openCreateDialog}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
              }
            }}
          >
            Create Webhook
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Webhooks
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalWebhooks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Webhooks
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {stats.activeWebhooks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Events
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalEvents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4" component="div" color="primary.main">
                {stats.successRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Webhooks Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configured Webhooks
          </Typography>
          {webhooks.length === 0 ? (
            <Alert severity="info">
              No webhooks configured yet. Create your first webhook to start receiving real-time notifications.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell>Events</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Secret</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>{webhook.name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {webhook.url}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {webhook.events.map((event) => (
                            <Chip key={event} label={event} size="small" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={webhook.isActive ? 'Active' : 'Inactive'}
                          color={webhook.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {showSecrets[webhook.id] 
                              ? webhook.secretKey 
                              : '••••••••••••••••'
                            }
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => toggleSecretVisibility(webhook.id)}
                          >
                            {showSecrets[webhook.id] ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                          <Tooltip title={copiedSecret === webhook.id ? 'Copied!' : 'Copy'}>
                            <IconButton 
                              size="small" 
                              onClick={() => copySecret(webhook.id, webhook.secretKey)}
                            >
                              <ContentCopy />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Test Webhook">
                            <IconButton 
                              size="small" 
                              onClick={() => handleTestWebhook(webhook.id)}
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={() => openEditDialog(webhook)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteWebhook(webhook.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Recent Events
            </Typography>
            <Button
              startIcon={<Refresh />}
              onClick={loadEvents}
              size="small"
            >
              Refresh
            </Button>
          </Box>
          {events.length === 0 ? (
            <Alert severity="info">
              No webhook events yet. Events will appear here when webhooks are triggered.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Attempts</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Delivered</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.slice(0, 10).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.eventType}</TableCell>
                      <TableCell>
                        <Chip 
                          label={event.status}
                          color={
                            event.status === 'delivered' ? 'success' :
                            event.status === 'failed' ? 'error' : 'warning'
                          }
                          size="small"
                          icon={
                            event.status === 'delivered' ? <CheckCircle /> :
                            event.status === 'failed' ? <Error /> : <Warning />
                          }
                        />
                      </TableCell>
                      <TableCell>{event.attempts}</TableCell>
                      <TableCell>
                        {new Date(event.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {event.deliveredAt ? new Date(event.deliveredAt).toLocaleString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Webhook Examples Dialog */}
      <Dialog open={examplesDialogOpen} onClose={() => setExamplesDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📚 Webhook Integration Examples
            <Chip label="Popular Integrations" color="primary" size="small" />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Get started quickly with these popular webhook integrations. Click on any example to use it as a template.
          </Typography>
          
          <Grid container spacing={3}>
            {DEFAULT_WEBHOOK_EXAMPLES.map((example, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    setFormData({
                      name: example.name,
                      url: example.url,
                      events: example.events,
                      isActive: true
                    });
                    setExamplesDialogOpen(false);
                    setCreateDialogOpen(true);
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h3" sx={{ mr: 2 }}>
                        {example.icon}
                      </Typography>
                      <Box>
                        <Typography variant="h6" component="h3">
                          {example.name}
                        </Typography>
                        <Chip 
                          label={example.category} 
                          size="small" 
                          color="secondary"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {example.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Events:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {example.events.map((event) => (
                          <Chip 
                            key={event} 
                            label={event} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(example.setupGuide, '_blank');
                        }}
                      >
                        Setup Guide
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({
                            name: example.name,
                            url: example.url,
                            events: example.events,
                            isActive: true
                          });
                          setExamplesDialogOpen(false);
                          setCreateDialogOpen(true);
                        }}
                      >
                        Use Template
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              💡 Pro Tips for Webhook Integration
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <ul>
                <li>Always test your webhook endpoints before going live</li>
                <li>Use HTTPS URLs for security</li>
                <li>Implement proper error handling and retry logic</li>
                <li>Monitor webhook delivery rates and response times</li>
                <li>Keep your webhook URLs secure and don't share them publicly</li>
              </ul>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExamplesDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Webhook</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Webhook Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Webhook URL"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              fullWidth
              placeholder="https://your-app.com/webhook"
            />
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Select Events
              </Typography>
              <FormGroup>
                {AVAILABLE_EVENTS.map((event) => (
                  <FormControlLabel
                    key={event}
                    control={
                      <Checkbox
                        checked={formData.events.includes(event)}
                        onChange={() => handleEventChange(event)}
                      />
                    }
                    label={event}
                  />
                ))}
              </FormGroup>
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateWebhook} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Webhook Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Webhook</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Webhook Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Webhook URL"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              fullWidth
            />
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Select Events
              </Typography>
              <FormGroup>
                {AVAILABLE_EVENTS.map((event) => (
                  <FormControlLabel
                    key={event}
                    control={
                      <Checkbox
                        checked={formData.events.includes(event)}
                        onChange={() => handleEventChange(event)}
                      />
                    }
                    label={event}
                  />
                ))}
              </FormGroup>
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateWebhook} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function WebhookManagement() {
  return <WebhookDashboard />;
}
