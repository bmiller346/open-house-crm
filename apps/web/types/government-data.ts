// Commercial Property Data Types (Primary)
export interface CommercialPropertyRecord {
  id: string;
  workspaceId: string;
  providerId: string;
  providerName: 'ATTOM' | 'DataTree' | 'TitleFlex' | 'RentCast' | 'Regrid' | 'RealieFlex';
  propertyId: string;
  standardizedAddress: StandardizedAddress;
  ownershipHistory: OwnershipRecord[];
  salesHistory: SalesRecord[];
  taxAssessment: TaxRecord[];
  propertyCharacteristics: PropertyDetails;
  lastUpdated: Date;
  dataQualityScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface StandardizedAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  fullAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface OwnershipRecord {
  ownerName: string;
  ownerType: 'individual' | 'entity' | 'trust' | 'government';
  mailingAddress?: string;
  acquisitionDate?: string;
  acquisitionPrice?: number;
  ownershipPercentage?: number;
  isCurrentOwner: boolean;
}

export interface SalesRecord {
  saleDate: string;
  salePrice: number;
  seller: string;
  buyer: string;
  deedType: string;
  pricePerSquareFoot?: number;
  financing?: {
    cashSale: boolean;
    loanAmount?: number;
    lender?: string;
  };
}

export interface TaxRecord {
  taxYear: number;
  assessedValue: number;
  marketValue?: number;
  taxAmount: number;
  delinquent: boolean;
  delinquentAmount?: number;
  exemptions?: {
    type: string;
    amount: number;
  }[];
}

export interface PropertyDetails {
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land' | 'multi-family';
  yearBuilt?: number;
  squareFootage?: number;
  lotSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  stories?: number;
  construction?: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'distressed';
  zoning?: string;
  parkingSpaces?: number;
  amenities?: string[];
}

// Commercial Data Provider Configuration
export interface CommercialAPIConfig {
  providerId: string;
  providerName: string;
  apiKey: string;
  baseUrl: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
    currentUsage: number;
  };
  authentication: 'header' | 'oauth' | 'basic';
  isActive: boolean;
  priority: number;
  costPerQuery: number;
  coverageAreas: string[];
  supportedDataTypes: string[];
}

export interface DataProviderStatus {
  providerId: string;
  isOnline: boolean;
  lastChecked: string;
  responseTime: number;
  errorRate: number;
  dailyUsage: number;
  dailyLimit: number;
}

// Hybrid Data Source (Commercial + Government)
export interface HybridDataSource {
  id: string;
  workspaceId: string;
  name: string;
  type: 'commercial' | 'government_direct';
  priority: number;
  costPerQuery: number;
  reliabilityScore: number;
  coverageAreas: string[];
  isActive: boolean;
  lastSyncAt?: string;
  configuration: CommercialAPIConfig | GovernmentDataConfig;
  createdAt: string;
  updatedAt: string;
}

export interface GovernmentDataConfig {
  sourceType: 'county_website' | 'court_records' | 'tax_assessor' | 'public_records';
  url: string;
  county: string;
  state: string;
  selectors?: Record<string, string>;
  credentials?: Record<string, string>;
  syncFrequency: 'daily' | 'weekly' | 'monthly';
}

// Lead Generation (Updated for Commercial Data)
export interface LeadOpportunity {
  id: string;
  workspaceId: string;
  propertyRecordId: string;
  propertyAddress: string;
  ownerName: string;
  ownerContact?: {
    phone?: string;
    email?: string;
    mailingAddress?: string;
  };
  leadScore: number;
  opportunityType: 'pre_foreclosure' | 'tax_delinquent' | 'probate' | 'divorce' | 'distressed' | 'high_equity' | 'investor_owned';
  leadSources: string[]; // Which providers contributed to this lead
  estimatedValue?: number;
  estimatedEquity?: number;
  motivationLevel: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'dead';
  notes?: string;
  contactAttempts: number;
  lastContactDate?: string;
  marketingCampaigns?: string[];
  createdAt: string;
  updatedAt: string;
}

// Search and Filtering
export interface PropertySearchFilters {
  address?: string;
  city?: string;
  state?: string;
  county?: string;
  zipCode?: string;
  propertyType?: string;
  ownerName?: string;
  assessedValueMin?: number;
  assessedValueMax?: number;
  yearBuiltMin?: number;
  yearBuiltMax?: number;
  lastSaleMin?: string;
  lastSaleMax?: string;
  delinquentTaxes?: boolean;
  distressedProperty?: boolean;
  providers?: string[];
  limit?: number;
  offset?: number;
}

export interface PropertySearchResponse {
  properties: CommercialPropertyRecord[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  providersUsed: string[];
  searchTime: number;
  dataQuality: {
    averageScore: number;
    completeness: number;
    providerBreakdown: Record<string, number>;
  };
}

// Analytics (Updated for Commercial Focus)
export interface PropertyDataAnalytics {
  totalProperties: number;
  propertiesByProvider: Record<string, number>;
  propertiesByType: Record<string, number>;
  propertiesByCounty: Record<string, number>;
  averageDataQuality: number;
  dataCompleteness: {
    ownershipData: number;
    salesHistory: number;
    taxRecords: number;
    propertyDetails: number;
  };
  providerPerformance: {
    providerId: string;
    responseTime: number;
    errorRate: number;
    costEfficiency: number;
    dataQuality: number;
  }[];
  leadGeneration: {
    totalLeads: number;
    leadsByType: Record<string, number>;
    conversionRate: number;
    averageLeadScore: number;
  };
  costAnalysis: {
    totalCost: number;
    costByProvider: Record<string, number>;
    costPerLead: number;
    costPerProperty: number;
  };
}

// Automation Rules (Updated)
export interface PropertyAutomationRule {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  isActive: boolean;
  triggerType: 'new_property' | 'property_update' | 'scheduled' | 'manual';
  conditions: {
    propertyType?: string[];
    county?: string[];
    assessedValue?: { min?: number; max?: number };
    delinquentTaxes?: boolean;
    ownershipType?: string[];
    lastSaleDate?: { from?: string; to?: string };
    dataQuality?: { min?: number };
    providers?: string[];
  };
  actions: {
    type: 'create_lead' | 'send_notification' | 'add_to_campaign' | 'create_task' | 'webhook' | 'export_data';
    config: Record<string, any>;
  }[];
  priority: number;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Bulk Operations
export interface BulkPropertyImportRequest {
  properties: Partial<CommercialPropertyRecord>[];
  provider: string;
  overwriteExisting: boolean;
  validateData: boolean;
  generateLeads: boolean;
}

export interface BulkPropertyImportResponse {
  success: boolean;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
  leadsGenerated?: number;
  costIncurred?: number;
}

// Export Types
export interface PropertyExportRequest {
  filters: PropertySearchFilters;
  format: 'csv' | 'xlsx' | 'json';
  includeFields: string[];
  includeLeadData: boolean;
  includeProviderData: boolean;
}

export interface PropertyExportResponse {
  success: boolean;
  downloadUrl?: string;
  recordCount?: number;
  fileSize?: number;
  message?: string;
}

// Data Quality and Validation
export interface DataQualityReport {
  propertyId: string;
  overallScore: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  issues: {
    type: 'missing_data' | 'inconsistent_data' | 'outdated_data' | 'invalid_format';
    field: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  recommendations: string[];
}

// Cost Management
export interface CostTrackingRecord {
  id: string;
  workspaceId: string;
  providerId: string;
  operationType: 'property_search' | 'bulk_import' | 'lead_generation' | 'data_refresh';
  recordsProcessed: number;
  costPerRecord: number;
  totalCost: number;
  timestamp: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface CostAnalysis {
  totalSpent: number;
  spentByProvider: Record<string, number>;
  spentByOperation: Record<string, number>;
  avgCostPerProperty: number;
  avgCostPerLead: number;
  monthlyTrend: {
    month: string;
    spent: number;
    recordsProcessed: number;
  }[];
  recommendations: {
    type: 'switch_provider' | 'optimize_usage' | 'bulk_operation' | 'cache_data';
    description: string;
    potentialSavings: number;
  }[];
}