import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  preferences: {
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    dashboard: {
      layout: string;
      widgets: string[];
    };
  };
  workspaces: Workspace[];
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  workspaceName?: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    workspace?: Workspace;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

// API client
const apiClient = {
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },

  async get<T>(endpoint: string): Promise<T> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },
};

// Auth hook
export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get current user
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      try {
        const response = await apiClient.get<{ success: boolean; data: { user: User } }>('/auth/me');
        return response.data.user;
      } catch (error) {
        // Token might be expired, try to refresh
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await apiClient.post<AuthResponse>('/auth/refresh', {
              refreshToken,
            });
            
            if (refreshResponse.success && refreshResponse.data) {
              localStorage.setItem('accessToken', refreshResponse.data.accessToken);
              localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
              return refreshResponse.data.user;
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return null;
          }
        }
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return null;
      }
    },
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(['auth', 'user'], data.user);
      router.push('/dashboard');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (registerData: RegisterData) => {
      const response = await apiClient.post<AuthResponse>('/auth/register', registerData);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Registration failed');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(['auth', 'user'], data.user);
      router.push('/dashboard');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout', {});
    },
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
      router.push('/login');
    },
    onError: () => {
      // Still clear local data even if server request fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
      router.push('/login');
    },
  });

  // OAuth handlers
  const handleGoogleAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const handleLinkedInAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/linkedin`;
  };

  // Handle OAuth callback
  const handleAuthCallback = (token: string, refreshToken: string) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    router.push('/dashboard');
  };

  return {
    // State
    user,
    isLoading,
    isAuthenticated: !!user,
    error,

    // Actions
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    handleGoogleAuth,
    handleLinkedInAuth,
    handleAuthCallback,

    // Loading states
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,

    // Errors
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error?.message,
  };
};
