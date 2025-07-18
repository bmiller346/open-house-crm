'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, CircularProgress, Box, Card, CardContent, Button } from '@mui/material';
import { Home, ArrowForward } from '@mui/icons-material';

export default function GovernmentDataRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new property data page after a short delay
    const timer = setTimeout(() => {
      router.push('/property-data');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleRedirectNow = () => {
    router.push('/property-data');
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card sx={{ textAlign: 'center', p: 4 }}>
        <CardContent>
          <Home sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom>
            Page Moved
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The Government Data page has been upgraded to our new Commercial Property Data system. 
            You'll be redirected automatically in a few seconds.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 4 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">
              Redirecting to Property Data...
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            onClick={handleRedirectNow}
            endIcon={<ArrowForward />}
            size="large"
          >
            Go to Property Data Now
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}