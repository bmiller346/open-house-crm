import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const ContactFilter: React.FC = () => {
  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Contact Filter
      </Typography>
      <Box>
        <Typography>Contact filtering component will be implemented here.</Typography>
      </Box>
    </Paper>
  );
};

export default ContactFilter;
