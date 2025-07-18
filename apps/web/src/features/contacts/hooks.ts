import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// API client placeholder - will use @openhouse/sdk later
const api = {
  getContacts: async () => {
    const response = await fetch('/api/contacts');
    return response.json();
  },
  createContact: async (contact: any) => {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    return response.json();
  },
};

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: api.getContacts,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
