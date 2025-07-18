'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Search,
  ExpandMore,
  TrendingUp,
  Home,
  Assessment,
  FilterList,
  Refresh,
  Download,
  CloudSync,
  Warning,
  CheckCircle,
  Error,
  Info,
  LocationOn,
  Person,
  AccountBalance,
  AttachMoney,
  CalendarToday,
  Speed,
  Star,
  Visibility,
  Edit,
  Delete,
  Add
} from '@mui/icons-material';

// Updated types for commercial property data
interface CommercialPropertyRecord {
  id: string;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  ownerName: string;
  ownerType: string;
  propertyType: string;
  assessedValue?: number;
  marketValue?: number;
  yearBuilt?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  condition?: string;
  delinquentTaxes: boolean;
  delinquentAmount?: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  dataQualityScore: number;
  providerId: string;
  providerName: string;
  leadScore: number;
  isPotentialLead: boolean;
  estimatedEquity: number;
  lastUpdated: string;
}

interface PropertySearchFilters {
  address?: string;
  city?: string;
  state?: string;
  county?: string;
  propertyType?: string;
  ownerName?: string;
  assessedValueMin?: number;
  assessedValueMax?: number;
  delinquentTaxes?: boolean;
  providers?: string[];
  limit?: number;
  offset?: number;
}

interface ProviderStatus {
  providerId: string;
  providerName: string;
  isOnline: boolean;
  responseTime: number;
  errorRate: number;
  dailyUsage: number;
  dailyLimit: number;
  costPerQuery: number;
  priority: number;
}

interface PropertyAnalytics {
  totalProperties: number;
  propertiesByProvider: Record<string, number>;
  propertiesByType: Record<string, number>;
  propertiesByCounty: Record<string, number>;
  averageDataQuality: number;
  leadGeneration: {
    totalLeads: number;
    leadsByType: Record<string, number>;
    conversionRate: number;
    averageLeadScore: number;
  };
  costAnalysis: {
    totalCost: number;
    costByProvider: Record<string, number>;
    costPerLead: number;
    costPerProperty: number;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-data-tabpanel-${index}`}
      aria-labelledby={`property-data-tab-${index}`}
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

export default function PropertyDataPage() {
  const [properties, setProperties] = useState<CommercialPropertyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [analytics, setAnalytics] = useState<PropertyAnalytics | null>(null);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Search and filter states
  const [searchFilters, setSearchFilters] = useState<PropertySearchFilters>({
    limit: 50,
    offset: 0
  });
  const [quickSearchAddress, setQuickSearchAddress] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['ATTOM', 'REGRID']);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Load initial data
  useEffect(() => {
    loadProperties();
    loadAnalytics();
    loadProviderStatus();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...Object.fromEntries(
          Object.entries(searchFilters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      const response = await fetch(`/api/property-data/properties?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-jwt-token-12345'}`
        }
      });

      if (!response.ok) {
        const error: Error = new (globalThis.Error)('Failed to load properties');
        throw error;
      }

      const data = await response.json();
      setProperties(data.data);
      setTotalProperties(data.meta.total);
      setHasMore(data.meta.hasMore);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load properties';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/property-data/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-jwt-token-12345'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const loadProviderStatus = async () => {
    try {
      const response = await fetch('/api/property-data/providers/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-jwt-token-12345'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProviders(data.data);
      }
    } catch (err) {
      console.error('Failed to load provider status:', err);
    }
  };

  const handleQuickSearch = async () => {
    if (!quickSearchAddress.trim()) return;

    setSearchLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        address: quickSearchAddress,
        providers: selectedProviders.join(',')
      });

      const response = await fetch(`/api/property-data/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-jwt-token-12345'}`
        }
      });

      if (!response.ok) {
        const error: Error = new (globalThis.Error)('Property search failed');
        throw error;
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setProperties([data.data]);
        setSuccess(`Found property: ${data.data.propertyAddress} (Lead Score: ${data.data.leadScore})`);
      } else {
        setError('Property not found');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Search failed';
      setError(errorMessage);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAdvancedSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/property-data/advanced-search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-jwt-token-12345'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...searchFilters,
          providers: selectedProviders
        })
      });

      if (!response.ok) {
        const error: Error = new (globalThis.Error)('Advanced search failed');
        throw error;
      }

      const data = await response.json();
      setProperties(data.data.properties);
      setTotalProperties(data.data.total);
      setHasMore(data.data.hasMore);
      setSuccess(`Found ${data.data.properties.length} properties`);
    } catch (err: any) {
      const errorMessage = err?.message || 'Advanced search failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getLeadPotentialColor = (score: number) => {
    if (score >= 80) return 'error';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'info';
    return 'default';
  };

  const getLeadPotentialText = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    if (score >= 40) return 'Low';
    return 'None';
  };

  const getDataQualityColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'info';
    if (score >= 50) return 'warning';
    return 'error';
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Home color="primary" />
        Commercial Property Data
        <Chip 
          label="Powered by Commercial APIs" 
          color="primary" 
          variant="outlined" 
          size="small"
          sx={{ ml: 2 }}
        />
      </Typography>

      {/* Alert Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Quick Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Search />
          Quick Property Search
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Property Address"
            value={quickSearchAddress}
            onChange={(e) => setQuickSearchAddress(e.target.value)}
            placeholder="123 Main St, Camden, NJ"
            sx={{ minWidth: 300 }}
            onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
          />
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Data Providers</InputLabel>
            <Select
              multiple
              value={selectedProviders}
              onChange={(e) => setSelectedProviders(e.target.value as string[])}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="ATTOM">ATTOM Data</MenuItem>
              <MenuItem value="REGRID">Regrid</MenuItem>
              <MenuItem value="DATATREE">DataTree</MenuItem>
              <MenuItem value="REALIE">Realie.ai</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleQuickSearch}
            disabled={searchLoading || !quickSearchAddress.trim()}
            startIcon={searchLoading ? <CircularProgress size={20} /> : <Search />}
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </Button>
        </Box>
      </Paper>

      {/* Main Content Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Properties" icon={<Home />} />
          <Tab label="Analytics" icon={<Assessment />} />
          <Tab label="Providers" icon={<CloudSync />} />
          <Tab label="Lead Management" icon={<TrendingUp />} />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          {/* Properties Tab */}
          <Box sx={{ mb: 3 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterList />
                  Advanced Search Filters
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="City"
                      value={searchFilters.city || ''}
                      onChange={(e) => setSearchFilters({...searchFilters, city: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="State"
                      value={searchFilters.state || ''}
                      onChange={(e) => setSearchFilters({...searchFilters, state: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="County"
                      value={searchFilters.county || ''}
                      onChange={(e) => setSearchFilters({...searchFilters, county: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Owner Name"
                      value={searchFilters.ownerName || ''}
                      onChange={(e) => setSearchFilters({...searchFilters, ownerName: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Property Type</InputLabel>
                      <Select
                        value={searchFilters.propertyType || ''}
                        onChange={(e) => setSearchFilters({...searchFilters, propertyType: e.target.value})}
                      >
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value="residential">Residential</MenuItem>
                        <MenuItem value="commercial">Commercial</MenuItem>
                        <MenuItem value="industrial">Industrial</MenuItem>
                        <MenuItem value="land">Land</MenuItem>
                        <MenuItem value="multi-family">Multi-Family</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={searchFilters.delinquentTaxes || false}
                          onChange={(e) => setSearchFilters({...searchFilters, delinquentTaxes: e.target.checked})}
                        />
                      }
                      label="Delinquent Taxes Only"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handleAdvancedSearch}
                      disabled={loading}
                      startIcon={<Search />}
                    >
                      Apply Filters
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setSearchFilters({ limit: 50, offset: 0 })}
                      sx={{ ml: 2 }}
                    >
                      Clear Filters
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Properties Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Property Address</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Assessed Value</TableCell>
                  <TableCell>Lead Score</TableCell>
                  <TableCell>Data Quality</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : properties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" color="text.secondary">
                        No properties found. Try adjusting your search criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {property.propertyAddress}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {property.city}, {property.state} {property.zipCode}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {property.ownerName}
                          </Typography>
                          <Chip
                            label={property.ownerType}
                            size="small"
                            color={property.ownerType === 'entity' ? 'primary' : 'default'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={property.propertyType}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatCurrency(property.assessedValue)}
                        </Typography>
                        {property.delinquentTaxes && (
                          <Chip
                            label="Tax Delinquent"
                            size="small"
                            color="error"
                            icon={<Warning />}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`${property.leadScore}%`}
                            color={getLeadPotentialColor(property.leadScore)}
                            size="small"
                          />
                          <Typography variant="caption">
                            {getLeadPotentialText(property.leadScore)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={property.dataQualityScore}
                            color={getDataQualityColor(property.dataQualityScore)}
                            sx={{ width: 60, height: 6 }}
                          />
                          <Typography variant="caption">
                            {property.dataQualityScore}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={property.providerName}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Refresh Data">
                            <IconButton size="small" color="secondary">
                              <Refresh />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              sx={{ mr: 1 }}
            >
              Previous
            </Button>
            <Typography sx={{ mx: 2, display: 'flex', alignItems: 'center' }}>
              Page {currentPage} of {Math.ceil(totalProperties / 50)}
            </Typography>
            <Button
              disabled={!hasMore}
              onClick={() => setCurrentPage(p => p + 1)}
              sx={{ ml: 1 }}
            >
              Next
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Analytics Tab */}
          {analytics && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {analytics.totalProperties.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Properties
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary">
                      {analytics.leadGeneration.totalLeads.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Potential Leads
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {analytics.averageDataQuality.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Data Quality
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {formatCurrency(analytics.costAnalysis.totalCost)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Cost
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Providers Tab */}
          <Grid container spacing={3}>
            {providers.map((provider) => (
              <Grid item xs={12} md={6} key={provider.providerId}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {provider.providerName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={provider.isOnline ? 'Online' : 'Offline'}
                          color={provider.isOnline ? 'success' : 'error'}
                          icon={provider.isOnline ? <CheckCircle /> : <Error />}
                          size="small"
                        />
                        <Chip
                          label={`Priority ${provider.priority}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Response Time
                        </Typography>
                        <Typography variant="h6">
                          {provider.responseTime}ms
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Error Rate
                        </Typography>
                        <Typography variant="h6">
                          {(provider.errorRate * 100).toFixed(1)}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Daily Usage
                        </Typography>
                        <Typography variant="h6">
                          {provider.dailyUsage}/{provider.dailyLimit}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Cost per Query
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(provider.costPerQuery)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* Lead Management Tab */}
          <Typography variant="h6" gutterBottom>
            Lead Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Advanced lead generation and management features coming soon...
          </Typography>
        </TabPanel>
      </Paper>
    </Container>
  );
}
