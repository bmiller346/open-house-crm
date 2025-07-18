'use client';

import axios from 'axios';

// Create a base axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
      
      // Extract workspace ID from token if available
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        if (tokenData.workspaceId) {
          config.headers['x-workspace-id'] = tokenData.workspaceId;
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Contact related API calls
export const contactsApi = {
  getContacts: async () => {
    try {
      const response = await api.get('/api/contacts');
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },
  
  getContact: async (id: string) => {
    try {
      const response = await api.get(`/api/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contact with id ${id}:`, error);
      throw error;
    }
  },
  
  createContact: async (contactData: any) => {
    try {
      const response = await api.post('/api/contacts', contactData);
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },
  
  updateContact: async (id: string, contactData: any) => {
    try {
      const response = await api.put(`/api/contacts/${id}`, contactData);
      return response.data;
    } catch (error) {
      console.error(`Error updating contact with id ${id}:`, error);
      throw error;
    }
  },
  
  deleteContact: async (id: string) => {
    try {
      const response = await api.delete(`/api/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting contact with id ${id}:`, error);
      throw error;
    }
  }
};

export default api;
