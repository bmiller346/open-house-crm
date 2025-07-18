import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Workspace } from './Workspace';

@Entity('commercial_property_records')
@Index(['workspaceId', 'providerId'])
@Index(['workspaceId', 'propertyAddress'])
@Index(['workspaceId', 'ownerName'])
@Index(['dataQualityScore'])
export class CommercialPropertyRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId!: string;

  @Column({ name: 'provider_id', type: 'varchar', length: 100 })
  providerId!: string;

  @Column({ name: 'provider_name', type: 'varchar', length: 50 })
  providerName!: string;

  @Column({ name: 'property_id', type: 'varchar', length: 200 })
  propertyId!: string;

  // Standardized Address
  @Column({ name: 'property_address', type: 'text' })
  propertyAddress!: string;

  @Column({ name: 'city', type: 'varchar', length: 100 })
  city!: string;

  @Column({ name: 'state', type: 'varchar', length: 50 })
  state!: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 20 })
  zipCode!: string;

  @Column({ name: 'county', type: 'varchar', length: 100 })
  county!: string;

  @Column({ name: 'full_address', type: 'text' })
  fullAddress!: string;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude?: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude?: number;

  // Current Owner Information
  @Column({ name: 'owner_name', type: 'text' })
  ownerName!: string;

  @Column({ name: 'owner_type', type: 'varchar', length: 50 })
  ownerType!: string; // 'individual' | 'entity' | 'trust' | 'government'

  @Column({ name: 'owner_mailing_address', type: 'text', nullable: true })
  ownerMailingAddress?: string;

  @Column({ name: 'owner_acquisition_date', type: 'date', nullable: true })
  ownerAcquisitionDate?: Date;

  @Column({ name: 'owner_acquisition_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  ownerAcquisitionPrice?: number;

  // Property Details
  @Column({ name: 'property_type', type: 'varchar', length: 50 })
  propertyType!: string; // 'residential' | 'commercial' | 'industrial' | 'land' | 'multi-family'

  @Column({ name: 'year_built', type: 'int', nullable: true })
  yearBuilt?: number;

  @Column({ name: 'square_footage', type: 'int', nullable: true })
  squareFootage?: number;

  @Column({ name: 'lot_size', type: 'decimal', precision: 10, scale: 2, nullable: true })
  lotSize?: number;

  @Column({ name: 'bedrooms', type: 'int', nullable: true })
  bedrooms?: number;

  @Column({ name: 'bathrooms', type: 'decimal', precision: 3, scale: 1, nullable: true })
  bathrooms?: number;

  @Column({ name: 'stories', type: 'int', nullable: true })
  stories?: number;

  @Column({ name: 'construction', type: 'varchar', length: 200, nullable: true })
  construction?: string;

  @Column({ name: 'condition', type: 'varchar', length: 50, nullable: true })
  condition?: string; // 'excellent' | 'good' | 'fair' | 'poor' | 'distressed'

  @Column({ name: 'zoning', type: 'varchar', length: 100, nullable: true })
  zoning?: string;

  @Column({ name: 'parking_spaces', type: 'int', nullable: true })
  parkingSpaces?: number;

  // Current Tax Assessment
  @Column({ name: 'assessed_value', type: 'decimal', precision: 12, scale: 2, nullable: true })
  assessedValue?: number;

  @Column({ name: 'market_value', type: 'decimal', precision: 12, scale: 2, nullable: true })
  marketValue?: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  taxAmount?: number;

  @Column({ name: 'delinquent_taxes', type: 'boolean', default: false })
  delinquentTaxes!: boolean;

  @Column({ name: 'delinquent_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  delinquentAmount?: number;

  @Column({ name: 'current_tax_year', type: 'int', nullable: true })
  currentTaxYear?: number;

  // Last Sale Information
  @Column({ name: 'last_sale_date', type: 'date', nullable: true })
  lastSaleDate?: Date;

  @Column({ name: 'last_sale_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  lastSalePrice?: number;

  @Column({ name: 'last_seller', type: 'text', nullable: true })
  lastSeller?: string;

  @Column({ name: 'last_buyer', type: 'text', nullable: true })
  lastBuyer?: string;

  @Column({ name: 'deed_type', type: 'varchar', length: 100, nullable: true })
  deedType?: string;

  @Column({ name: 'price_per_square_foot', type: 'decimal', precision: 8, scale: 2, nullable: true })
  pricePerSquareFoot?: number;

  @Column({ name: 'cash_sale', type: 'boolean', nullable: true })
  cashSale?: boolean;

  @Column({ name: 'loan_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  loanAmount?: number;

  // Data Quality and Tracking
  @Column({ name: 'data_quality_score', type: 'decimal', precision: 4, scale: 2, default: 0 })
  dataQualityScore!: number;

  @Column({ name: 'last_updated', type: 'timestamp' })
  lastUpdated!: Date;

  @Column({ name: 'last_provider_sync', type: 'timestamp', nullable: true })
  lastProviderSync?: Date;

  @Column({ name: 'query_cost', type: 'decimal', precision: 8, scale: 4, nullable: true })
  queryCost?: number;

  // JSON fields for complex data
  @Column({ name: 'ownership_history', type: 'jsonb', nullable: true })
  ownershipHistory?: any; // Array of OwnershipRecord

  @Column({ name: 'sales_history', type: 'jsonb', nullable: true })
  salesHistory?: any; // Array of SalesRecord

  @Column({ name: 'tax_history', type: 'jsonb', nullable: true })
  taxHistory?: any; // Array of TaxRecord

  @Column({ name: 'property_amenities', type: 'jsonb', nullable: true })
  propertyAmenities?: any; // Array of amenities

  @Column({ name: 'exemptions', type: 'jsonb', nullable: true })
  exemptions?: any; // Array of tax exemptions

  @Column({ name: 'raw_provider_data', type: 'jsonb', nullable: true })
  rawProviderData?: any; // Original data from provider

  @Column({ name: 'data_quality_issues', type: 'jsonb', nullable: true })
  dataQualityIssues?: any; // Array of data quality issues

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: any; // Additional metadata

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Workspace, workspace => workspace.commercialPropertyRecords)
  @JoinColumn({ name: 'workspace_id' })
  workspace!: Workspace;

  // Virtual/computed properties
  get estimatedEquity(): number {
    if (!this.marketValue || !this.loanAmount) return 0;
    return this.marketValue - this.loanAmount;
  }

  get isPotentialLead(): boolean {
    return this.delinquentTaxes || 
           this.condition === 'distressed' || 
           this.condition === 'poor' ||
           (this.ownershipHistory && this.ownershipHistory.length > 1);
  }

  get leadScore(): number {
    let score = 0;
    
    // Delinquent taxes add significant lead potential
    if (this.delinquentTaxes) score += 40;
    
    // Property condition affects lead quality
    if (this.condition === 'distressed') score += 30;
    if (this.condition === 'poor') score += 20;
    
    // Multiple ownership changes suggest investment potential
    if (this.ownershipHistory && this.ownershipHistory.length > 1) score += 15;
    
    // High equity properties are attractive
    if (this.estimatedEquity > 50000) score += 10;
    
    // Out-of-state owners may be more motivated
    if (this.ownerMailingAddress && !this.ownerMailingAddress.includes(this.state)) score += 15;
    
    // Entity ownership suggests investment property
    if (this.ownerType === 'entity') score += 10;
    
    // Data quality affects reliability
    score *= (this.dataQualityScore / 100);
    
    return Math.min(100, Math.max(0, score));
  }
}

// Legacy alias for backward compatibility
export const CountyRecord = CommercialPropertyRecord;