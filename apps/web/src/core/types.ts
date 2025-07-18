// Core entity types for the entire application
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Workspace/Tenant types
export interface Workspace extends BaseEntity {
  name: string;
  slug: string;
  ownerId: string;
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  isActive: boolean;
  settings: WorkspaceSettings;
}

export interface WorkspaceSettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  integrations?: {
    [key: string]: any;
  };
}

// User types
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
}

// Contact types
export interface Contact extends BaseEntity {
  workspaceId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: Address;
  type: ContactType;
  status: ContactStatus;
  source: string;
  tags: string[];
  notes?: string;
  lastContactDate?: Date;
  leadScore?: number;
  customFields: Record<string, any>;
}

export type ContactType = 'lead' | 'client' | 'investor' | 'agent' | 'vendor' | 'other';
export type ContactStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiating' | 'closed' | 'lost';

// Property types
export interface Property extends BaseEntity {
  workspaceId: string;
  address: Address;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  yearBuilt?: number;
  lotSize?: number;
  listPrice?: number;
  arvValue?: number;
  repairEstimate?: number;
  status: PropertyStatus;
  images: string[];
  documents: string[];
  notes?: string;
  customFields: Record<string, any>;
}

export type PropertyType = 'single-family' | 'multi-family' | 'commercial' | 'land' | 'mobile-home' | 'other';
export type PropertyStatus = 'available' | 'under-contract' | 'sold' | 'off-market' | 'archived';

// Transaction types
export interface Transaction extends BaseEntity {
  workspaceId: string;
  propertyId: string;
  contactId: string;
  type: TransactionType;
  status: TransactionStatus;
  purchasePrice: number;
  salePrice?: number;
  repairCosts?: number;
  holdingCosts?: number;
  closingCosts?: number;
  profit?: number;
  roi?: number;
  contractDate?: Date;
  closingDate?: Date;
  documents: string[];
  notes?: string;
}

export type TransactionType = 'wholesale' | 'assignment' | 'fix-flip' | 'buy-hold' | 'land-deal';
export type TransactionStatus = 'prospecting' | 'under-contract' | 'assigned' | 'closed' | 'cancelled';

// Pipeline types
export interface Pipeline extends BaseEntity {
  workspaceId: string;
  name: string;
  description?: string;
  stages: PipelineStage[];
  isDefault: boolean;
  color?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  color?: string;
  isClosedStage: boolean;
}

// Campaign types
export interface Campaign extends BaseEntity {
  workspaceId: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetAudience: string;
  budget?: number;
  spent?: number;
  startDate: Date;
  endDate?: Date;
  metrics: CampaignMetrics;
  settings: Record<string, any>;
}

export type CampaignType = 'email' | 'sms' | 'direct-mail' | 'cold-calling' | 'social-media' | 'ppc';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  responded: number;
  unsubscribed: number;
  bounced: number;
}

// Common address type
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Webhook types
export interface WebhookEvent {
  id: string;
  type: string;
  workspaceId: string;
  data: any;
  timestamp: Date;
  source: string;
}

// File upload types
export interface FileUpload {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Notification types
export interface Notification extends BaseEntity {
  userId: string;
  workspaceId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: Date;
  data?: Record<string, any>;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'reminder';

// Export all types
export * from './types';
