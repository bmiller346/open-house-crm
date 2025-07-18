import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  FormControlLabel,
  FormGroup,
  Checkbox,
  CircularProgress,
  Alert,
  AlertTitle,
  Grid,
  Tooltip,
  Snackbar
} from '@mui/material';
import { 
  Add,
  Edit,
  Delete,
  Visibility,
  Refresh,
  CheckCircle,
  Error,
  Warning,
  Bolt,
  ContentCopy,
  Settings,
  Key,
  Webhook,
  Send,
  Security
} from '@mui/icons-material';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  description: string;
  createdAt: string;
  lastTriggered: string;
  stats: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    successRate: number;
    averageResponseTime: number;
    isHealthy: boolean;
  };
}

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastUsed: string;
  expiresAt: string | null;
  description: string;
}

interface WebhookFormData {
  name: string;
  url: string;
  events: string[];
  description: string;
  isActive: boolean;
}

interface ApiKeyFormData {
  name: string;
  permissions: string[];
  description: string;
  expiresAt: string;
}

const WebhookApiManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'webhooks' | 'api-keys'>('webhooks');
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [showCreateApiKey, setShowCreateApiKey] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [webhookForm, setWebhookForm] = useState<WebhookFormData>({
    name: '',
    url: '',
    events: [],
    description: '',
    isActive: true
  });

  const [apiKeyForm, setApiKeyForm] = useState<ApiKeyFormData>({
    name: '',
    permissions: [],
    description: '',
    expiresAt: ''
  });

  const availableEvents = [
    'contact.created',
    'contact.updated',
    'contact.deleted',
    'transaction.created',
    'transaction.updated',
    'transaction.completed',
    'inventory.created',
    'inventory.updated',
    'inventory.deleted',
    'user.created',
    'user.updated'
  ];

  const availablePermissions = [
    'read:contacts',
    'write:contacts',
    'read:transactions',
    'write:transactions',
    'read:inventory',
    'write:inventory',
    'read:webhooks',
    'write:webhooks',
    'read:analytics',
    'admin:all'
  ];

  // Mock data for demonstration
  const mockWebhooks: Webhook[] = [
    {
      id: '1',
      name: 'Slack Integration',
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      events: ['contact.created', 'transaction.completed'],
      isActive: true,
      description: 'Send notifications to Slack channel',
      createdAt: '2024-01-15T10:30:00Z',
      lastTriggered: '2024-01-20T14:22:00Z',
      stats: {
        totalDeliveries: 156,
        successfulDeliveries: 150,
        failedDeliveries: 6,
        successRate: 96.2,
        averageResponseTime: 234,
        isHealthy: true
      }
    },
    {
      id: '2',
      name: 'CRM Sync',
      url: 'https://api.example-crm.com/webhooks/sync',
      events: ['contact.created', 'contact.updated', 'transaction.created'],
      isActive: true,
      description: 'Sync data with external CRM',
      createdAt: '2024-01-10T09:15:00Z',
      lastTriggered: '2024-01-20T13:45:00Z',
      stats: {
        totalDeliveries: 89,
        successfulDeliveries: 85,
        failedDeliveries: 4,
        successRate: 95.5,
        averageResponseTime: 456,
        isHealthy: true
      }
    }
  ];

  const mockApiKeys: ApiKey[] = [
    {
      id: '1',
      name: 'Production API Key',
      keyPreview: 'ohc_prod_***********************xyz',
      permissions: ['read:contacts', 'write:contacts', 'read:transactions', 'write:transactions'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastUsed: '2024-01-20T15:30:00Z',
      expiresAt: '2024-12-31T23:59:59Z',
      description: 'Main production API key for integrations'
    },
    {
      id: '2',
      name: 'Analytics Dashboard',
      keyPreview: 'ohc_analytics_*******************abc',
      permissions: ['read:analytics', 'read:contacts', 'read:transactions'],
      isActive: true,
      createdAt: '2024-01-05T12:00:00Z',
      lastUsed: '2024-01-20T12:00:00Z',
      expiresAt: null,
      description: 'Read-only access for analytics dashboard'
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setWebhooks(mockWebhooks);
        setApiKeys(mockApiKeys);
      } catch (err) {
        setError('Failed to load webhook and API key data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateWebhook = async () => {
    try {
      const newWebhook: Webhook = {
        id: Date.now().toString(),
        ...webhookForm,
        createdAt: new Date().toISOString(),
        lastTriggered: '',
        stats: {
          totalDeliveries: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          successRate: 0,
          averageResponseTime: 0,
          isHealthy: true
        }
      };

      setWebhooks([...webhooks, newWebhook]);
      setShowCreateWebhook(false);
      setWebhookForm({
        name: '',
        url: '',
        events: [],
        description: '',
        isActive: true
      });
      setSnackbarMessage('Webhook created successfully');
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to create webhook');
    }
  };

  const handleCreateApiKey = async () => {
    try {
      const newApiKey: ApiKey = {
        id: Date.now().toString(),
        ...apiKeyForm,
        keyPreview: `ohc_${Date.now().toString().slice(-6)}_*********************xyz`,
        createdAt: new Date().toISOString(),
        lastUsed: '',
        isActive: true,
        expiresAt: apiKeyForm.expiresAt || null
      };

      setApiKeys([...apiKeys, newApiKey]);
      setShowCreateApiKey(false);
      setApiKeyForm({
        name: '',
        permissions: [],
        description: '',
        expiresAt: ''
      });
      setSnackbarMessage('API key created successfully');
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to create API key');
    }
  };

  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks(webhooks.filter(w => w.id !== webhookId));
    setSnackbarMessage('Webhook deleted successfully');
    setSnackbarOpen(true);
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== keyId));
    setSnackbarMessage('API key deleted successfully');
    setSnackbarOpen(true);
  };

  const handleTestWebhook = (webhookId: string) => {
    setSnackbarMessage('Test payload sent successfully');
    setSnackbarOpen(true);
  };

  const handleRegenerateApiKey = (keyId: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === keyId 
        ? { ...key, keyPreview: `ohc_${Date.now().toString().slice(-6)}_*********************xyz` }
        : key
    ));
    setSnackbarMessage('API key regenerated successfully');
    setSnackbarOpen(true);
  };

  const getStatusColor = (isHealthy: boolean, isActive: boolean) => {
    if (!isActive) return 'default';
    return isHealthy ? 'success' : 'error';
  };

  const getStatusLabel = (isHealthy: boolean, isActive: boolean) => {
    if (!isActive) return 'Inactive';
    return isHealthy ? 'Healthy' : 'Failing';
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'webhooks' | 'api-keys') => {
    setActiveTab(newValue);
  };

  const handleWebhookEventChange = (event: string, checked: boolean) => {
    if (checked) {
      setWebhookForm({
        ...webhookForm,
        events: [...webhookForm.events, event]
      });
    } else {
      setWebhookForm({
        ...webhookForm,
        events: webhookForm.events.filter(e => e !== event)
      });
    }
  };

  const handleApiKeyPermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setApiKeyForm({
        ...apiKeyForm,
        permissions: [...apiKeyForm.permissions, permission]
      });
    } else {
      setApiKeyForm({
        ...apiKeyForm,
        permissions: apiKeyForm.permissions.filter(p => p !== permission)
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardHeader
          title="Webhook & API Management"
          subheader="Manage webhooks and API keys for integrations"
        />
        <CardContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Webhooks" value="webhooks" icon={<Webhook />} />
            <Tab label="API Keys" value="api-keys" icon={<Key />} />
          </Tabs>

          {activeTab === 'webhooks' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Webhooks ({webhooks.length})</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowCreateWebhook(true)}
                >
                  Create Webhook
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>URL</TableCell>
                      <TableCell>Events</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Success Rate</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {webhooks.map((webhook) => (
                      <TableRow key={webhook.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {webhook.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {webhook.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200, wordBreak: 'break-all' }}>
                            {webhook.url}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {webhook.events.slice(0, 2).map((event) => (
                              <Chip key={event} label={event} size="small" />
                            ))}
                            {webhook.events.length > 2 && (
                              <Chip label={`+${webhook.events.length - 2} more`} size="small" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(webhook.stats.isHealthy, webhook.isActive)}
                            color={getStatusColor(webhook.stats.isHealthy, webhook.isActive)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {webhook.stats.successRate.toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Test Webhook">
                              <IconButton
                                size="small"
                                onClick={() => handleTestWebhook(webhook.id)}
                              >
                                <Send />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => {}}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteWebhook(webhook.id)}
                                color="error"
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
            </Box>
          )}

          {activeTab === 'api-keys' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">API Keys ({apiKeys.length})</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowCreateApiKey(true)}
                >
                  Create API Key
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Key Preview</TableCell>
                      <TableCell>Permissions</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Used</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {apiKey.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {apiKey.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {apiKey.keyPreview}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {apiKey.permissions.slice(0, 2).map((permission) => (
                              <Chip key={permission} label={permission} size="small" />
                            ))}
                            {apiKey.permissions.length > 2 && (
                              <Chip label={`+${apiKey.permissions.length - 2} more`} size="small" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={apiKey.isActive ? 'Active' : 'Inactive'}
                            color={apiKey.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Regenerate Key">
                              <IconButton
                                size="small"
                                onClick={() => handleRegenerateApiKey(apiKey.id)}
                              >
                                <Refresh />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => {}}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteApiKey(apiKey.id)}
                                color="error"
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
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Webhook Dialog */}
      <Dialog open={showCreateWebhook} onClose={() => setShowCreateWebhook(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Webhook</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={webhookForm.name}
              onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="URL"
              value={webhookForm.url}
              onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={webhookForm.description}
              onChange={(e) => setWebhookForm({ ...webhookForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Events</Typography>
              <FormGroup>
                {availableEvents.map((event) => (
                  <FormControlLabel
                    key={event}
                    control={
                      <Checkbox
                        checked={webhookForm.events.includes(event)}
                        onChange={(e) => handleWebhookEventChange(event, e.target.checked)}
                      />
                    }
                    label={event}
                  />
                ))}
              </FormGroup>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={webhookForm.isActive}
                  onChange={(e) => setWebhookForm({ ...webhookForm, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateWebhook(false)}>Cancel</Button>
          <Button onClick={handleCreateWebhook} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateApiKey} onClose={() => setShowCreateApiKey(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={apiKeyForm.name}
              onChange={(e) => setApiKeyForm({ ...apiKeyForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={apiKeyForm.description}
              onChange={(e) => setApiKeyForm({ ...apiKeyForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Permissions</Typography>
              <FormGroup>
                {availablePermissions.map((permission) => (
                  <FormControlLabel
                    key={permission}
                    control={
                      <Checkbox
                        checked={apiKeyForm.permissions.includes(permission)}
                        onChange={(e) => handleApiKeyPermissionChange(permission, e.target.checked)}
                      />
                    }
                    label={permission}
                  />
                ))}
              </FormGroup>
            </Box>
            <TextField
              label="Expires At (Optional)"
              type="datetime-local"
              value={apiKeyForm.expiresAt}
              onChange={(e) => setApiKeyForm({ ...apiKeyForm, expiresAt: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateApiKey(false)}>Cancel</Button>
          <Button onClick={handleCreateApiKey} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default WebhookApiManagement;
