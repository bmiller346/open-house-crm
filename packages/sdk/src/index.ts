// Export SDK client and types
export * from './client';

// Re-export core types for convenience
export type {
  Contact,
  Property,
  Transaction,
  Campaign,
  User,
  Workspace,
  Pipeline,
  ApiResponse,
  SearchParams,
  ContactType,
  ContactStatus,
  PropertyType,
  PropertyStatus,
  TransactionType,
  TransactionStatus,
  CampaignType,
  CampaignStatus
} from '@open-house-crm/core';

export { OpenHouseCRMClient, createOpenHouseCRMClient } from './client';
export type { OpenHouseCRMConfig } from './client';
