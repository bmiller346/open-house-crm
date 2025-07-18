// Export all core functionality
export * from './types';
export * from './utils';

// Re-export specific types for convenience
export type {
  BaseEntity,
  Workspace,
  User,
  Contact,
  Property,
  Transaction,
  Pipeline,
  Campaign,
  Address,
  ApiResponse,
  PaginationInfo,
  SearchParams,
  ContactType,
  ContactStatus,
  PropertyType,
  PropertyStatus,
  TransactionType,
  TransactionStatus,
  CampaignType,
  CampaignStatus
} from './types';
