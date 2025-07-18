import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' OpenHouse CRM'}
        </Typography>
      </Container>
    </Box>
  );
}
