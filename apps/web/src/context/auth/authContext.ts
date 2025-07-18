// filepath: c:\Users\engin\Open_House_CRM\open-house-crm\apps\web\src\context\auth\authContext.ts
'use client';

import { createContext, useContext } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  workspaceId?: string;
  date?: string;
}

export interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean | null;
  loading: boolean;
  user: User | null;
  error: string | null;
  register: (formData: { name?: string; email: string; password: string }) => Promise<void>;
  login: (token: string, user: User) => void;
  logout: () => void;
  clearErrors: () => void;
  loadUser: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const authContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default authContext;