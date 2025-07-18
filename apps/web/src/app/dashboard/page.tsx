'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // If we're not loading and not authenticated, show login prompt
  if (!isAuthenticated && !isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You need to be logged in to access your dashboard
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          href="/auth/login"
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Your Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Links
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Button variant="contained" color="primary" href="/contacts">
            Manage Contacts
          </Button>
          <Button variant="contained" color="secondary" href="/transactions">
            View Transactions
          </Button>
          <Button variant="contained" color="info" href="/inventory">
            Inventory
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Typography>
          Your recent activity will be displayed here.
        </Typography>
      </Box>
    </Box>
  );
}
