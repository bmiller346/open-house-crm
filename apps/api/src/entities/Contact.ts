import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Workspace } from './Workspace';
// import { Appointment } from './Appointment'; // Temporarily disabled due to TypeORM decorator issues
// import { LeadScore } from './LeadScore'; // Temporarily disabled due to decorator issue

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

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  workspaceId!: string;

  // Basic Information
  @Column('varchar', { length: 100, nullable: true })
  firstName?: string;

  @Column('varchar', { length: 100, nullable: true })
  lastName?: string;

  @Column('varchar', { length: 255, unique: true })
  email!: string;

  @Column('varchar', { length: 50, nullable: true })
  phone?: string;

  @Column('varchar', { length: 50, nullable: true })
  secondaryPhone?: string;

  @Column('varchar', { length: 255, nullable: true })
  companyName?: string;

  @Column('varchar', { length: 100, nullable: true })
  jobTitle?: string;

  // Address Information
  @Column('varchar', { length: 255, nullable: true })
  streetAddress?: string;

  @Column('varchar', { length: 100, nullable: true })
  addressLine2?: string;

  @Column('varchar', { length: 100, nullable: true })
  city?: string;

  @Column('varchar', { length: 50, nullable: true })
  state?: string;

  @Column('varchar', { length: 20, nullable: true })
  zipCode?: string;

  @Column('varchar', { length: 100, nullable: true })
  country?: string;

  // Contact Preferences
  @Column({
    type: 'enum',
    enum: ContactType,
    default: ContactType.LEAD
  })
  type!: ContactType;

  @Column({
    type: 'enum',
    enum: ContactStatus,
    default: ContactStatus.ACTIVE
  })
  status!: ContactStatus;

  @Column({
    type: 'enum',
    enum: ContactSource,
    nullable: true
  })
  source?: ContactSource;

  @Column({
    type: 'enum',
    enum: PreferredContact,
    default: PreferredContact.EMAIL
  })
  preferredContact!: PreferredContact;

  // Marketing & Communication
  @Column('boolean', { default: true })
  emailOptIn!: boolean;

  @Column('boolean', { default: false })
  smsOptIn!: boolean;

  @Column('boolean', { default: true })
  marketingOptIn!: boolean;

  // Real Estate Specific
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  budgetMin?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  budgetMax?: number;

  @Column('jsonb', { nullable: true })
  preferredAreas?: string[];

  @Column('varchar', { length: 100, nullable: true })
  propertyType?: string;

  @Column('int', { nullable: true })
  bedroomsMin?: number;

  @Column('decimal', { precision: 3, scale: 1, nullable: true })
  bathroomsMin?: number;

  @Column('varchar', { length: 100, nullable: true })
  moveTimeline?: string;

  @Column('boolean', { default: false })
  isFirstTimeBuyer!: boolean;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  currentHomeValue?: number;

  @Column('boolean', { default: false })
  needsToSell!: boolean;

  // Notes and Tags
  @Column('text', { nullable: true })
  notes?: string;

  @Column('jsonb', { nullable: true })
  tags?: string[];

  @Column('jsonb', { nullable: true })
  customFields?: Record<string, any>;

  // Relationship tracking
  @Column('uuid', { nullable: true })
  referralSourceId?: string;

  @Column('text', { nullable: true })
  referralNotes?: string;

  @Column('varchar', { length: 200, nullable: true })
  spousePartnerName?: string;

  @Column('int', { nullable: true })
  childrenCount?: number;

  @Column('date', { nullable: true })
  anniversaryDate?: Date;

  @Column('date', { nullable: true })
  birthday?: Date;

  // Activity tracking
  @Column('timestamp', { nullable: true })
  lastContactDate?: Date;

  @Column('varchar', { length: 100, nullable: true })
  lastContactType?: string;

  @Column('timestamp', { nullable: true })
  nextFollowUp?: Date;

  @Column('int', { default: 30 })
  contactFrequencyDays!: number;

  // Lead scoring and conversion
  @Column('int', { default: 0 })
  leadScore!: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  conversionProbability?: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  lifetimeValue!: number;

  @Column('int', { default: 0 })
  totalTransactions!: number;

  // Social and digital presence
  @Column('varchar', { length: 255, nullable: true })
  linkedinUrl?: string;

  @Column('varchar', { length: 255, nullable: true })
  facebookUrl?: string;

  @Column('varchar', { length: 255, nullable: true })
  websiteUrl?: string;

  // System fields
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column('uuid', { nullable: true })
  updatedBy?: string;

  // Relationships
  @ManyToOne(() => Workspace, workspace => workspace.contacts)
  @JoinColumn({ name: 'workspaceId' })
  workspace!: Workspace;

  // @OneToMany(() => Appointment, appointment => appointment.contact) // Temporarily disabled due to TypeORM decorator issues
  // appointments!: Appointment[];

  // @OneToMany(() => LeadScore, leadScore => leadScore.contact) // Temporarily disabled due to decorator issue
  // leadScores!: LeadScore[];

  // Virtual fields for computed values
  get displayName(): string {
    const first = this.firstName || '';
    const last = this.lastName || '';
    return `${first} ${last}`.trim() || this.email || 'Unknown Contact';
  }

  get fullAddress(): string {
    const parts = [
      this.streetAddress,
      this.addressLine2,
      this.city,
      this.state,
      this.zipCode
    ].filter(Boolean);
    return parts.join(', ');
  }

  get isHighValue(): boolean {
    return this.leadScore > 80 || (this.conversionProbability ?? 0) > 0.7;
  }

  get daysSinceLastContact(): number {
    if (!this.lastContactDate) return 999;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastContactDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get needsFollowUp(): boolean {
    if (!this.nextFollowUp) return false;
    return new Date() >= this.nextFollowUp;
  }

  get budgetRange(): string | null {
    if (!this.budgetMin && !this.budgetMax) return null;
    if (this.budgetMin && this.budgetMax) {
      return `$${this.budgetMin.toLocaleString()} - $${this.budgetMax.toLocaleString()}`;
    }
    if (this.budgetMin) return `$${this.budgetMin.toLocaleString()}+`;
    if (this.budgetMax) return `Up to $${this.budgetMax.toLocaleString()}`;
    return null;
  }

  // Legacy compatibility
  get name(): string {
    return this.displayName;
  }

  set name(value: string) {
    const parts = value.split(' ');
    this.firstName = parts[0] || '';
    this.lastName = parts.slice(1).join(' ') || '';
  }
}
