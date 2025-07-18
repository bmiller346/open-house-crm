import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  IconButton,
  Alert,
  Snackbar,
  TextField,
  InputAdornment
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { contactsApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import ContactFormModal from './ContactFormModal';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

const Contacts: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Function to fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contactsApi.getContacts();
      setContacts(data);
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      setError(err.response?.data?.msg || 'Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load contacts on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
    }
  }, [isAuthenticated]);

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  // Handle opening modal for adding new contact
  const handleAddContact = () => {
    setCurrentContact(null);
    setIsModalOpen(true);
  };

  // Handle opening modal for editing existing contact
  const handleEditContact = (contact: Contact) => {
    setCurrentContact(contact);
    setIsModalOpen(true);
  };

  // Handle deleting a contact
  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactsApi.deleteContact(id);
        setContacts(contacts.filter(contact => contact.id !== id));
        setSnackbar({
          open: true,
          message: 'Contact deleted successfully',
          severity: 'success'
        });
      } catch (err: any) {
        setSnackbar({
          open: true,
          message: err.response?.data?.msg || 'Failed to delete contact',
          severity: 'error'
        });
      }
    }
  };

  // Handle saving a contact (create or update)
  const handleSaveContact = async (contactData: any) => {
    try {
      if (currentContact) {
        // Update existing contact
        const updatedContact = await contactsApi.updateContact(currentContact.id, contactData);
        setContacts(contacts.map(c => c.id === currentContact.id ? updatedContact : c));
        setSnackbar({
          open: true,
          message: 'Contact updated successfully',
          severity: 'success'
        });
      } else {
        // Create new contact
        const newContact = await contactsApi.createContact(contactData);
        setContacts([...contacts, newContact]);
        setSnackbar({
          open: true,
          message: 'Contact created successfully',
          severity: 'success'
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.msg || 'Failed to save contact',
        severity: 'error'
      });
    }
  };

  // Handle closing the snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // If not authenticated or no user, show a message
  if (!isAuthenticated || !user) {
    return (
      <Paper sx={{ p: 2, m: 2 }}>
        <Typography variant="h5" gutterBottom>
          Please log in to view contacts
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Contacts
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddContact}
        >
          Add Contact
        </Button>
      </Box>
      
      <TextField
        fullWidth
        margin="normal"
        placeholder="Search contacts by name, email, or phone"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : filteredContacts.length === 0 ? (
        <Typography variant="body1" sx={{ p: 2 }}>
          No contacts found. {searchTerm ? 'Try a different search term or ' : ''}
          <Button color="primary" onClick={handleAddContact}>
            add a new contact
          </Button>
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.type}</TableCell>
                  <TableCell>{contact.status || 'Active'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditContact(contact)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteContact(contact.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Contact Form Modal */}
      <ContactFormModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContact}
        contact={currentContact}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Contacts;
