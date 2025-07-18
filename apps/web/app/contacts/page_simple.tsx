'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { contactsApi, isAuthenticated } from '../../lib/api';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    // Load contacts
    const loadContacts = async () => {
      try {
        setLoading(true);
        const response = await contactsApi.getContacts();
        setContacts(response.data || []);
      } catch (error) {
        console.error('Failed to load contacts:', error);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [router]);

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await contactsApi.createContact({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      });
      
      // Add the new contact to the list
      setContacts([...contacts, response.data]);
      setShowAddForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      });
      
      alert('Contact created successfully!');
    } catch (error) {
      console.error('Failed to create contact:', error);
      alert('Failed to create contact. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactsApi.deleteContact(id);
        setContacts(contacts.filter(c => c.id !== id));
        alert('Contact deleted successfully!');
      } catch (error) {
        console.error('Failed to delete contact:', error);
        alert('Failed to delete contact. Please try again.');
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ fontSize: '1.2rem' }}>Loading contacts...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        backgroundColor: 'white',
        padding: '1rem 2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '2rem', color: '#333', margin: 0 }}>
          Contacts
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            + Add Contact
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Total Contacts</h3>
          <div style={{ fontSize: '2rem', color: '#2196f3', fontWeight: 'bold' }}>
            {contacts.length}
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Recent Contacts</h3>
          <div style={{ fontSize: '2rem', color: '#4caf50', fontWeight: 'bold' }}>
            {contacts.filter(c => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(c.createdAt) > weekAgo;
            }).length}
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #eee'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>All Contacts</h2>
        </div>
        
        {contacts.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>👥</div>
            <div>No contacts yet. Add your first contact to get started!</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Phone</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Created</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500' }}>
                      {contact.firstName} {contact.lastName}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{contact.email}</td>
                  <td style={{ padding: '1rem' }}>{contact.phone || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>Add New Contact</h2>
            
            <form onSubmit={handleSubmitContact}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: submitting ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  {submitting ? 'Creating...' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
