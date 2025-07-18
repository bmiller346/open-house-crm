import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  Grid,
  FormHelperText,
  Typography,
  CircularProgress
} from '@mui/material';

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

interface ContactFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (contact: any) => void;
  contact: Contact | null;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ open, onClose, onSave, contact }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'personal',
    status: 'active'
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When contact data changes, update the form
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        type: contact.type || 'personal',
        status: contact.status || 'active'
      });
    } else {
      // Reset form when adding a new contact
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: 'personal',
        status: 'active'
      });
    }
    // Reset errors
    setErrors({
      name: '',
      email: '',
      phone: ''
    });
  }, [contact, open]);

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      email: '',
      phone: ''
    };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    // Validate phone (optional validation)
    if (formData.phone && !/^[0-9+\-() ]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value
    });
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSave(formData);
        onClose();
      } catch (error) {
        console.error('Error saving contact:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {contact ? 'Edit Contact' : 'Add New Contact'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="phone"
              label="Phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleSelectChange}
                label="Type"
              >
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactFormModal;
