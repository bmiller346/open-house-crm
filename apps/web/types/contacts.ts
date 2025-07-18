export interface Contact {
  id: string;
  workspaceId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  secondaryPhone?: string;
  companyName?: string;
  jobTitle?: string;
  
  // Address
  streetAddress?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // Contact preferences
  type: ContactType;
  status: ContactStatus;
  source?: ContactSource;
  preferredContact: PreferredContact;
  emailOptIn: boolean;
  smsOptIn: boolean;
  marketingOptIn: boolean;
  
  // Real estate specific
  budgetMin?: number;
  budgetMax?: number;
  preferredAreas?: string[];
  propertyType?: string;
  bedroomsMin?: number;
  bathroomsMin?: number;
  moveTimeline?: string;
  isFirstTimeBuyer: boolean;
  currentHomeValue?: number;
  needsToSell: boolean;
  
  // CRM fields
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  referralSourceId?: string;
  referralNotes?: string;
  
  // Personal details
  spousePartnerName?: string;
  childrenCount?: number;
  anniversaryDate?: string;
  birthday?: string;
  
  // Activity tracking
  lastContactDate?: string;
  lastContactType?: string;
  nextFollowUp?: string;
  contactFrequencyDays: number;
  
  // Lead scoring
  leadScore: number;
  conversionProbability?: number;
  lifetimeValue: number;
  totalTransactions: number;
  
  // Social
  linkedinUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  
  // Metadata
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  
  // Virtual properties
  displayName: string;
  fullAddress: string;
  budgetRange: string;
  isHighValue: boolean;
  needsFollowUp: boolean;
  daysSinceLastContact: number;
}

export enum ContactType {
  LEAD = 'lead',
  CLIENT = 'client',
  PROSPECT = 'prospect',
  PAST_CLIENT = 'past_client',
  VENDOR = 'vendor',
  REFERRAL_SOURCE = 'referral_source'
}

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  NURTURING = 'nurturing',
  CONVERTED = 'converted',
  LOST = 'lost',
  DO_NOT_CONTACT = 'do_not_contact'
}

export enum ContactSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social_media',
  COLD_CALL = 'cold_call',
  EMAIL_CAMPAIGN = 'email_campaign',
  OPEN_HOUSE = 'open_house',
  ADVERTISEMENT = 'advertisement',
  WALK_IN = 'walk_in',
  EXISTING_CLIENT = 'existing_client',
  OTHER = 'other'
}

export enum PreferredContact {
  EMAIL = 'email',
  PHONE = 'phone',
  TEXT = 'text',
  MAIL = 'mail',
  IN_PERSON = 'in_person'
}

export interface ContactFilters {
  search?: string;
  type?: ContactType;
  status?: ContactStatus;
  source?: ContactSource;
  tags?: string[];
  leadScoreMin?: number;
  leadScoreMax?: number;
  budgetMin?: number;
  budgetMax?: number;
  city?: string;
  state?: string;
  needsFollowUp?: boolean;
  highValue?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface ContactRecommendations {
  highPriority: Contact[];
  needsFollowUp: Contact[];
  recentlyActive: Contact[];
  coldLeads: Contact[];
}

export interface ContactAnalytics {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  averageLeadScore: number;
  highValueContacts: number;
  needingFollowUp: number;
  recentlyAdded: number;
}

export interface LeadScoringResult {
  score: number;
  factors: Array<{
    factor: string;
    weight: number;
    value: any;
    points: number;
  }>;
  recommendations: string[];
}
