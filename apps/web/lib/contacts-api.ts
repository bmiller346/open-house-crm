import { Contact, ContactFilters, ContactRecommendations, ContactAnalytics, LeadScoringResult } from '../types/contacts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ContactsAPI {
  private getHeaders() {
    const token = localStorage.getItem('token');
    const workspaceId = localStorage.getItem('workspaceId');
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(workspaceId && { 'X-Workspace-ID': workspaceId }),
    };
  }

  // Basic CRUD operations
  async getContacts(): Promise<Contact[]> {
    const response = await fetch(`${API_BASE_URL}/api/contacts`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch contacts');
    const data = await response.json();
    return data.data || [];
  }

  async getContact(id: string): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/api/contacts/${id}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch contact');
    const data = await response.json();
    return data.data;
  }

  async createContact(contact: Partial<Contact>): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/api/contacts/advanced`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(contact),
    });
    if (!response.ok) throw new Error('Failed to create contact');
    const data = await response.json();
    return data.data;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/api/contacts/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update contact');
    const data = await response.json();
    return data.data;
  }

  async deleteContact(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/contacts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete contact');
  }

  // Enhanced features
  async searchContacts(filters: ContactFilters, page = 1, limit = 20): Promise<{
    contacts: Contact[];
    total: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/contacts/search/all?${params}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to search contacts');
    const data = await response.json();
    return data.data;
  }

  async calculateLeadScore(contactId: string): Promise<LeadScoringResult> {
    const response = await fetch(`${API_BASE_URL}/api/contacts/${contactId}/lead-score`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to calculate lead score');
    const data = await response.json();
    return data.data;
  }

  async checkDuplicates(contactData: Partial<Contact>): Promise<{
    isDuplicate: boolean;
    existingContact?: Contact;
    matchType: 'exact' | 'email' | 'phone' | 'name_address';
    confidence: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/contacts/check-duplicates`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(contactData),
    });
    if (!response.ok) throw new Error('Failed to check duplicates');
    const data = await response.json();
    return data.data;
  }

  async getRecommendations(): Promise<ContactRecommendations> {
    const response = await fetch(`${API_BASE_URL}/api/contacts/recommendations/all`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get recommendations');
    const data = await response.json();
    return data.data;
  }

  async getAnalytics(): Promise<ContactAnalytics> {
    const response = await fetch(`${API_BASE_URL}/api/contacts/analytics/dashboard`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get analytics');
    const data = await response.json();
    return data.data;
  }

  async bulkUpdate(contactIds: string[], updates: Partial<Contact>): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/contacts/bulk/update`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ contactIds, updates }),
    });
    if (!response.ok) throw new Error('Failed to bulk update contacts');
    const data = await response.json();
    return data.data;
  }
}

export const contactsAPI = new ContactsAPI();
