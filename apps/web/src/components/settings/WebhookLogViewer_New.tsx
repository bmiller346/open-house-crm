import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Refresh, 
  FilterList, 
  Search, 
  MoreVert, 
  CheckCircle, 
  Error, 
  Schedule, 
  Info,
  Close
} from '@mui/icons-material';

interface WebhookLog {
  id: string;
  webhookId: string;
  url: string;
  method: string;
  status: 'success' | 'failed' | 'pending';
  statusCode: number;
  timestamp: string;
  payload: any;
  response: any;
  error?: string;
  retryCount: number;
  nextRetryAt?: string;
}

interface WebhookLogViewerProps {
  webhookId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const WebhookLogViewer: React.FC<WebhookLogViewerProps> = ({ webhookId, isOpen, onClose }) => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && webhookId) {
      fetchLogs();
    }
  }, [isOpen, webhookId]);

  useEffect(() => {
    filterLogs();
  }, [logs, statusFilter, searchQuery]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockLogs: WebhookLog[] = [
        {
          id: '1',
          webhookId: webhookId || 'webhook-1',
          url: 'https://api.example.com/webhook',
          method: 'POST',
          status: 'success',
          statusCode: 200,
          timestamp: new Date().toISOString(),
          payload: { test: 'data' },
          response: { success: true },
          retryCount: 0
        },
        {
          id: '2',
          webhookId: webhookId || 'webhook-1',
          url: 'https://api.example.com/webhook',
          method: 'POST',
          status: 'failed',
          statusCode: 500,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          payload: { test: 'data' },
          response: { error: 'Server error' },
          error: 'Internal server error',
          retryCount: 2,
          nextRetryAt: new Date(Date.now() + 1800000).toISOString()
        }
      ];
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.method.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle />;
      case 'failed': return <Error />;
      case 'pending': return <Schedule />;
      default: return <Info />;
    }
  };

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  const handleViewDetails = (log: WebhookLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const handleRetryWebhook = async (log: WebhookLog) => {
    try {
      // Mock retry - replace with actual API call
      console.log('Retrying webhook:', log.id);
      await fetchLogs(); // Refresh logs
    } catch (error) {
      console.error('Error retrying webhook:', error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Webhook Logs</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                onClick={fetchLogs}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <Refresh />}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status Code</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Retries</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(log.status)}
                        label={log.status}
                        color={getStatusColor(log.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.url}</TableCell>
                    <TableCell>{log.method}</TableCell>
                    <TableCell>{log.statusCode}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.retryCount}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleViewDetails(log)}
                      >
                        View Details
                      </Button>
                      {log.status === 'failed' && (
                        <Button
                          size="small"
                          onClick={() => handleRetryWebhook(log)}
                          sx={{ ml: 1 }}
                        >
                          Retry
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
            />
          </Box>
        )}
      </DialogContent>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {selectedLog.status}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>URL:</strong> {selectedLog.url}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Method:</strong> {selectedLog.method}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status Code:</strong> {selectedLog.statusCode}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Retry Count:</strong> {selectedLog.retryCount}
              </Typography>
              
              {selectedLog.error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <strong>Error:</strong> {selectedLog.error}
                </Alert>
              )}

              <Typography variant="h6" sx={{ mt: 2 }}>Payload:</Typography>
              <Paper sx={{ p: 2, mt: 1, backgroundColor: '#f5f5f5' }}>
                <pre>{JSON.stringify(selectedLog.payload, null, 2)}</pre>
              </Paper>

              <Typography variant="h6" sx={{ mt: 2 }}>Response:</Typography>
              <Paper sx={{ p: 2, mt: 1, backgroundColor: '#f5f5f5' }}>
                <pre>{selectedLog.response ? JSON.stringify(selectedLog.response, null, 2) : 'No response'}</pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default WebhookLogViewer;
