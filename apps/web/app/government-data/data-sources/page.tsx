'use client';

import { Container, Typography, Box, Card, CardContent, Avatar } from '@mui/material';
import { Storage } from '@mui/icons-material';
import ProtectedRoute from '../../../src/components/auth/ProtectedRoute';

const DataSourcesPage = () => {
  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <Storage />
          </Avatar>
          <Typography variant="h4" component="h1">
            Data Sources
          </Typography>
        </Box>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Government Data Sources
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This page will contain configuration for government data sources.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </ProtectedRoute>
  );
};

export default DataSourcesPage;
