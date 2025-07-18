'use client';

import { Container, Typography, Box, Grid, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Chip, Button, List, ListItem, ListItemText, Avatar } from '@mui/material';
import { Map, LocationOn, Search, Filter, Home, AttachMoney } from '@mui/icons-material';
import { useState } from 'react';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

const mapFilters = {
  propertyType: ['All', 'House', 'Condo', 'Townhouse', 'Land'],
  priceRange: ['All', 'Under $300K', '$300K - $500K', '$500K - $800K', '$800K+'],
  bedrooms: ['All', '1+', '2+', '3+', '4+'],
  bathrooms: ['All', '1+', '2+', '3+', '4+']
};

const nearbyProperties = [
  {
    id: 1,
    address: '123 Main Street',
    price: '$450,000',
    beds: 3,
    baths: 2,
    sqft: 1850,
    type: 'House',
    status: 'For Sale'
  },
  {
    id: 2,
    address: '456 Oak Avenue',
    price: '$320,000',
    beds: 2,
    baths: 1,
    sqft: 1200,
    type: 'Condo',
    status: 'Sold'
  },
  {
    id: 3,
    address: '789 Pine Street',
    price: '$680,000',
    beds: 4,
    baths: 3,
    sqft: 2400,
    type: 'Townhouse',
    status: 'For Sale'
  },
  {
    id: 4,
    address: '321 Elm Drive',
    price: '$280,000',
    beds: 2,
    baths: 2,
    sqft: 1100,
    type: 'Condo',
    status: 'Pending'
  }
];

const MapViewPage = () => {
  const [filters, setFilters] = useState({
    propertyType: 'All',
    priceRange: 'All',
    bedrooms: 'All',
    bathrooms: 'All'
  });

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'For Sale': return 'success';
      case 'Sold': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <Map />
          </Avatar>
          <Typography variant="h4" component="h1">
            Map View
          </Typography>
        </Box>
        
        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Search Filters
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(mapFilters).map(([filterType, options]) => (
                <Grid item xs={12} md={3} key={filterType}>
                  <FormControl fullWidth size="small">
                    <InputLabel>
                      {filterType.charAt(0).toUpperCase() + filterType.slice(1).replace(/([A-Z])/g, ' $1')}
                    </InputLabel>
                    <Select
                      value={filters[filterType as keyof typeof filters]}
                      onChange={(e) => handleFilterChange(filterType, e.target.value)}
                      label={filterType.charAt(0).toUpperCase() + filterType.slice(1).replace(/([A-Z])/g, ' $1')}
                    >
                      {options.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ))}
            </Grid>
            <Box mt={2}>
              <Button variant="contained" startIcon={<Search />} sx={{ mr: 2 }}>
                Search
              </Button>
              <Button variant="outlined" startIcon={<Filter />}>
                Clear Filters
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        <Grid container spacing={3}>
          {/* Map Container */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Interactive Map
                </Typography>
                
                {/* Placeholder for map */}
                <Box
                  sx={{
                    height: 500,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 1,
                    borderColor: 'grey.300',
                    borderRadius: 1
                  }}
                >
                  <Box textAlign="center">
                    <Map sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Interactive Map Integration
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Map will be integrated with Google Maps or Mapbox
                    </Typography>
                  </Box>
                </Box>
                
                {/* Map Controls */}
                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Chip label="12 Properties Found" color="primary" sx={{ mr: 1 }} />
                    <Chip label="3 New Listings" color="success" sx={{ mr: 1 }} />
                    <Chip label="2 Price Drops" color="warning" />
                  </Box>
                  <Box>
                    <Button size="small" variant="outlined">
                      Satellite
                    </Button>
                    <Button size="small" variant="outlined" sx={{ ml: 1 }}>
                      Street View
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Property List */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Nearby Properties
                </Typography>
                <List>
                  {nearbyProperties.map((property) => (
                    <ListItem key={property.id} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2">
                              {property.address}
                            </Typography>
                            <Chip 
                              label={property.status} 
                              color={getStatusColor(property.status) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="h6" color="primary">
                              {property.price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {property.beds} bed • {property.baths} bath • {property.sqft} sqft
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {property.type}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
            
            {/* Map Legend */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Legend
                </Typography>
                <List dense>
                  <ListItem>
                    <LocationOn color="success" sx={{ mr: 1 }} />
                    <ListItemText primary="For Sale" />
                  </ListItem>
                  <ListItem>
                    <LocationOn color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Sold" />
                  </ListItem>
                  <ListItem>
                    <LocationOn color="warning" sx={{ mr: 1 }} />
                    <ListItemText primary="Pending" />
                  </ListItem>
                  <ListItem>
                    <LocationOn color="info" sx={{ mr: 1 }} />
                    <ListItemText primary="Off Market" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
};

export default MapViewPage;
