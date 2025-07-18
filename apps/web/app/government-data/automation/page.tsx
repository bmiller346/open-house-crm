'use client';

import { Container, Typography, Box, Card, CardContent, Avatar } from '@mui/material';
import { AutoMode } from '@mui/icons-material';
import ProtectedRoute from '../../../src/components/auth/ProtectedRoute';

const AutomationPage = () => {
  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <AutoMode />
          </Avatar>
          <Typography variant="h4" component="h1">
            Data Automation
          </Typography>
        </Box>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Automation Features
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This page will contain automation features for government data processing.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </ProtectedRoute>
  );
};

export default AutomationPage;