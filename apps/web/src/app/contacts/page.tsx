'use client';

import React, { useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import Contacts from '../../components/contacts/Contacts';

export default function ContactsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // The useAuth hook already handles loading the user
  }, []);

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
          You need to be logged in to access your contacts
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
    <Box>
      <Contacts />
    </Box>
  );
}
