import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

export function useContacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/contacts');
      setContacts(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const createContact = async (data: any) => {
    const response = await apiClient.post('/api/contacts', data);
    setContacts([...contacts, response.data]);
    return response.data;
  };

  const updateContact = async (id: string, data: any) => {
    const response = await apiClient.put(`/api/contacts/${id}`, data);
    setContacts(contacts.map(c => c.id === id ? response.data : c));
    return response.data;
  };

  const deleteContact = async (id: string) => {
    await apiClient.delete(`/api/contacts/${id}`);
    setContacts(contacts.filter(c => c.id !== id));
  };

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts,
    createContact,
    updateContact,
    deleteContact
  };
}