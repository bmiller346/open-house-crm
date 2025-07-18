'use client';

import { Container, Typography, Box, Card, CardContent, Avatar, Button, Grid, Chip, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Person, Email, Phone, LocationOn, Business, ArrowBack } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '../../../src/components/auth/ProtectedRoute';

const ContactDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  // Mock contact data - in real app, this would come from your API
  const contact = {
    id: id,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, City, State 12345',
    company: 'ABC Company',
    status: 'Active',
    notes: 'Interested in luxury properties in downtown area.',
    lastContact: '2024-01-15',
    leadSource: 'Website',
    tags: ['High Priority', 'Luxury', 'Buyer']
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{ mr: 2 }}
          >
            Back to Contacts
          </Button>
          <Typography variant="h4" component="h1">
            Contact Details
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {contact.name}
                </Typography>
                <Chip
                  label={contact.status}
                  color={contact.status === 'Active' ? 'success' : 'default'}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Lead Source: {contact.leadSource}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Contact: {contact.lastContact}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Email /></ListItemIcon>
                    <ListItemText primary="Email" secondary={contact.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Phone /></ListItemIcon>
                    <ListItemText primary="Phone" secondary={contact.phone} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocationOn /></ListItemIcon>
                    <ListItemText primary="Address" secondary={contact.address} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Business /></ListItemIcon>
                    <ListItemText primary="Company" secondary={contact.company} />
                  </ListItem>
                </List>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Tags
                </Typography>
                <Box>
                  {contact.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Notes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {contact.notes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
};

export default ContactDetailPage;