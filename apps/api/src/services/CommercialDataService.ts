import { Repository } from 'typeorm';
import { CommercialPropertyRecord } from '../entities/CountyRecord';
import { AppDataSource } from '../data-source';

// Local types for the service
export interface CommercialAPIConfig {
  providerId: string;
  providerName: string;
  baseUrl: string;
  apiKey: string;
  authentication: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
    currentUsage: number;
  };
  costPerQuery: number;
  supportedRegions: string[];
  coverageAreas: string[];
  supportedDataTypes: string[];
  isEnabled: boolean;
  isActive: boolean;
  priority: number;
}

export interface PropertySearchFilters {
  address?: string;
  city?: string;
  state?: string;
  county?: string;
  propertyType?: string;
  ownerName?: string;
  assessedValueMin?: number;
  assessedValueMax?: number;
  delinquentTaxes?: boolean;
  providers?: string[];
  limit?: number;
  offset?: number;
}

export interface PropertySearchResponse {
  properties: CommercialPropertyRecord[];
  total: number;
  hasMore: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  providersUsed: string[];
  searchTime: number;
  dataQuality: {
    averageScore: number;
    completeness: number;
    freshness: number;
    accuracy: number;
    providerBreakdown: Record<string, number>;
  };
}

export interface PropertyDataAnalytics {
  totalProperties: number;
  propertiesByProvider: Record<string, number>;
  propertiesByType: Record<string, number>;
  propertiesByCounty: Record<string, number>;
  averageDataQuality: number;
  dataCompleteness: {
    addressData: number;
    ownerData: number;
    propertyData: number;
    taxData: number;
  };
  providerPerformance: Record<string, any>;
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

export interface HybridDataSource {
  id: string;
  name: string;
  type: string;
  url: string;
  credentials: Record<string, string>;
  isEnabled: boolean;
  priority: number;
  lastUpdated: string;
}

export interface DataProviderStatus {
  providerId: string;
  providerName: string;
  isOnline: boolean;
  responseTime: number;
  errorRate: number;
  dailyUsage: number;
  dailyLimit: number;
  costPerQuery: number;
  priority: number;
}

export interface BulkPropertyImportRequest {
  properties: Partial<CommercialPropertyRecord>[];
  workspaceId: string;
  overwriteExisting?: boolean;
  validateData?: boolean;
  generateLeads?: boolean;
}

export interface BulkPropertyImportResponse {
  successCount: number;
  errorCount: number;
  errors: string[];
  importedProperties: CommercialPropertyRecord[];
  success: boolean;
  leadsGenerated?: number;
}

export interface DataQualityReport {
  totalRecords: number;
  qualityScore: number;
  completenessScore: number;
  accuracyScore: number;
  consistencyScore: number;
  issues: string[];
  recommendations: string[];
}

export interface CostTrackingRecord {
  date: string;
  providerId: string;
  providerName: string;
  queriesCount: number;
  totalCost: number;
  averageCostPerQuery: number;
}

export class CommercialDataService {
  private propertyRepository: Repository<CommercialPropertyRecord>;
  private providers: Map<string, any> = new Map();
  private providerConfigs: Map<string, CommercialAPIConfig> = new Map();

  constructor() {
    this.propertyRepository = AppDataSource.getRepository(CommercialPropertyRecord);
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize provider configurations
    this.providerConfigs.set('ATTOM', {
      providerId: 'attom',
      providerName: 'ATTOM',
      apiKey: process.env.ATTOM_API_KEY || '',
      baseUrl: 'https://api.attomdata.com/propertyapi/v1.0.0',
      authentication: 'header',
      isActive: true,
      isEnabled: true,
      priority: 1,
      costPerQuery: 0.05,
      supportedRegions: ['NJ', 'PA', 'NY', 'DE', 'MD'],
      coverageAreas: ['NJ', 'PA', 'NY', 'DE', 'MD'],
      supportedDataTypes: ['property', 'sales', 'tax', 'owner', 'mortgage'],
      rateLimit: {
        requestsPerMinute: 100,
        requestsPerDay: 10000,
        currentUsage: 0
      }
    });

    this.providerConfigs.set('REGRID', {
      providerId: 'regrid',
      providerName: 'Regrid',
      apiKey: process.env.REGRID_API_KEY || '',
      baseUrl: 'https://api.regrid.com/v1',
      authentication: 'header',
      isActive: true,
      isEnabled: true,
      priority: 2,
      costPerQuery: 0.00, // Free tier
      supportedRegions: ['NJ', 'PA', 'NY', 'DE', 'MD'],
      coverageAreas: ['NJ', 'PA', 'NY', 'DE', 'MD'],
      supportedDataTypes: ['property', 'parcel', 'zoning'],
      rateLimit: {
        requestsPerMinute: 30,
        requestsPerDay: 1000,
        currentUsage: 0
      }
    });

    this.providerConfigs.set('DATATREE', {
      providerId: 'datatree',
      providerName: 'DataTree',
      apiKey: process.env.DATATREE_API_KEY || '',
      baseUrl: 'https://api.datatree.com/v1',
      authentication: 'oauth',
      isActive: true,
      isEnabled: true,
      priority: 3,
      costPerQuery: 0.08,
      supportedRegions: ['NJ', 'PA'],
      coverageAreas: ['NJ', 'PA'],
      supportedDataTypes: ['property', 'documents', 'title', 'liens'],
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 5000,
        currentUsage: 0
      }
    });

    this.providerConfigs.set('REALIE', {
      providerId: 'realie',
      providerName: 'RealieFlex',
      apiKey: process.env.REALIE_API_KEY || '',
      baseUrl: 'https://api.realie.ai/v1',
      authentication: 'header',
      isActive: true,
      isEnabled: true,
      priority: 4,
      costPerQuery: 0.03,
      supportedRegions: ['PA'],
      coverageAreas: ['PA'],
      supportedDataTypes: ['property', 'analytics', 'foreclosure'],
      rateLimit: {
        requestsPerMinute: 50,
        requestsPerDay: 2000,
        currentUsage: 0
      }
    });
  }

  async getPropertyData(
    workspaceId: string,
    address: string,
    providers: string[] = ['ATTOM', 'REGRID']
  ): Promise<CommercialPropertyRecord | null> {
    try {
      // Check if we already have this property
      const existing = await this.propertyRepository.findOne({
        where: { workspaceId, propertyAddress: address }
      });

      if (existing && this.isDataFresh(existing.lastProviderSync)) {
        return existing;
      }

      // Try multiple providers with fallback strategy
      let bestResult: any = null;
      let bestScore = 0;

      for (const providerName of providers) {
        const config = this.providerConfigs.get(providerName);
        if (!config || !config.isActive) continue;

        try {
          const result = await this.queryProvider(config, address);
          if (result && result.dataQualityScore > bestScore) {
            bestResult = result;
            bestScore = result.dataQualityScore;
          }
        } catch (error) {
          console.error(`Provider ${providerName} failed:`, error);
          continue;
        }
      }

      if (bestResult) {
        const standardized = this.standardizePropertyData(bestResult, workspaceId);
        if (existing) {
          // Update existing record
          Object.assign(existing, standardized);
          return await this.propertyRepository.save(existing);
        } else {
          // Create new record
          const newRecord = this.propertyRepository.create(standardized);
          return await this.propertyRepository.save(newRecord);
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting property data:', error);
      throw error;
    }
  }

  async searchProperties(
    workspaceId: string,
    filters: PropertySearchFilters
  ): Promise<PropertySearchResponse> {
    try {
      const queryBuilder = this.propertyRepository
        .createQueryBuilder('property')
        .where('property.workspaceId = :workspaceId', { workspaceId });

      // Apply filters
      if (filters.address) {
        queryBuilder.andWhere('property.propertyAddress ILIKE :address', {
          address: `%${filters.address}%`
        });
      }

      if (filters.city) {
        queryBuilder.andWhere('property.city = :city', { city: filters.city });
      }

      if (filters.state) {
        queryBuilder.andWhere('property.state = :state', { state: filters.state });
      }

      if (filters.county) {
        queryBuilder.andWhere('property.county = :county', { county: filters.county });
      }

      if (filters.ownerName) {
        queryBuilder.andWhere('property.ownerName ILIKE :ownerName', {
          ownerName: `%${filters.ownerName}%`
        });
      }

      if (filters.propertyType) {
        queryBuilder.andWhere('property.propertyType = :propertyType', {
          propertyType: filters.propertyType
        });
      }

      if (filters.assessedValueMin) {
        queryBuilder.andWhere('property.assessedValue >= :minValue', {
          minValue: filters.assessedValueMin
        });
      }

      if (filters.assessedValueMax) {
        queryBuilder.andWhere('property.assessedValue <= :maxValue', {
          maxValue: filters.assessedValueMax
        });
      }

      if (filters.delinquentTaxes) {
        queryBuilder.andWhere('property.delinquentTaxes = :delinquent', {
          delinquent: filters.delinquentTaxes
        });
      }

      if (filters.providers && filters.providers.length > 0) {
        queryBuilder.andWhere('property.providerName IN (:...providers)', {
          providers: filters.providers
        });
      }

      // Pagination
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      
      queryBuilder.limit(limit).offset(offset);

      const [properties, total] = await queryBuilder.getManyAndCount();

      return {
        properties,
        total,
        hasMore: offset + limit < total,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total,
          hasMore: offset + limit < total,
        },
        providersUsed: [...new Set(properties.map(p => p.providerName))],
        searchTime: Date.now(),
        dataQuality: {
          averageScore: properties.reduce((sum, p) => sum + p.dataQualityScore, 0) / properties.length,
          completeness: this.calculateCompleteness(properties),
          freshness: 0.85, // Default value for now
          accuracy: 0.90, // Default value for now
          providerBreakdown: this.getProviderBreakdown(properties)
        }
      };
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }

  async getAnalytics(workspaceId: string): Promise<PropertyDataAnalytics> {
    try {
      const properties = await this.propertyRepository.find({
        where: { workspaceId }
      });

      const analytics: PropertyDataAnalytics = {
        totalProperties: properties.length,
        propertiesByProvider: this.groupByField(properties, 'providerName'),
        propertiesByType: this.groupByField(properties, 'propertyType'),
        propertiesByCounty: this.groupByField(properties, 'county'),
        averageDataQuality: properties.reduce((sum, p) => sum + p.dataQualityScore, 0) / properties.length,
        dataCompleteness: {
          addressData: this.calculateFieldCompleteness(properties, 'propertyAddress'),
          ownerData: this.calculateFieldCompleteness(properties, 'ownerName'),
          propertyData: this.calculateFieldCompleteness(properties, 'squareFootage'),
          taxData: this.calculateFieldCompleteness(properties, 'taxHistory')
        },
        providerPerformance: this.calculateProviderPerformance(properties),
        leadGeneration: {
          totalLeads: properties.filter(p => p.isPotentialLead).length,
          leadsByType: this.getLeadsByType(properties),
          conversionRate: 0.25, // TODO: Calculate from actual conversions
          averageLeadScore: properties.reduce((sum, p) => sum + p.leadScore, 0) / properties.length
        },
        costAnalysis: {
          totalCost: properties.reduce((sum, p) => sum + (p.queryCost || 0), 0),
          costByProvider: this.getCostByProvider(properties),
          costPerLead: this.calculateCostPerLead(properties),
          costPerProperty: this.calculateCostPerProperty(properties)
        }
      };

      return analytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  async bulkImport(
    workspaceId: string,
    request: BulkPropertyImportRequest
  ): Promise<BulkPropertyImportResponse> {
    try {
      let imported = 0;
      let updated = 0;
      let failed = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const propertyData of request.properties) {
        try {
          if (request.validateData && !this.validatePropertyData(propertyData)) {
            errors.push(`Invalid data for property: ${propertyData.propertyAddress}`);
            failed++;
            continue;
          }

          const existing = await this.propertyRepository.findOne({
            where: { 
              workspaceId, 
              propertyAddress: propertyData.propertyAddress 
            }
          });

          if (existing) {
            if (request.overwriteExisting) {
              Object.assign(existing, propertyData);
              await this.propertyRepository.save(existing);
              updated++;
            } else {
              skipped++;
            }
          } else {
            const newRecord = this.propertyRepository.create({
              ...propertyData,
              workspaceId,
              dataQualityScore: this.calculateDataQuality(propertyData),
              lastUpdated: new Date()
            });
            await this.propertyRepository.save(newRecord);
            imported++;
          }
        } catch (error) {
          errors.push(`Error processing ${propertyData.propertyAddress}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          failed++;
        }
      }

      return {
        success: failed === 0,
        successCount: imported + updated,
        errorCount: failed,
        errors,
        importedProperties: [], // Would need to track actual imported properties
        leadsGenerated: request.generateLeads ? imported + updated : undefined
      };
    } catch (error) {
      console.error('Error in bulk import:', error);
      throw error;
    }
  }

  private async queryProvider(config: CommercialAPIConfig, address: string): Promise<any> {
    // This would implement the actual API calls to each provider
    // For now, return mock data structure
    return {
      providerId: config.providerId,
      providerName: config.providerName,
      propertyAddress: address,
      dataQualityScore: 85,
      // ... other property data
    };
  }

  private standardizePropertyData(rawData: any, workspaceId: string): Partial<CommercialPropertyRecord> {
    // Standardize data from different providers into our unified format
    return {
      workspaceId,
      providerId: rawData.providerId,
      providerName: rawData.providerName,
      propertyId: rawData.propertyId || `${rawData.providerId}-${Date.now()}`,
      propertyAddress: rawData.propertyAddress,
      city: rawData.city,
      state: rawData.state,
      zipCode: rawData.zipCode,
      county: rawData.county,
      fullAddress: rawData.fullAddress,
      ownerName: rawData.ownerName,
      ownerType: rawData.ownerType || 'individual',
      propertyType: rawData.propertyType,
      assessedValue: rawData.assessedValue,
      marketValue: rawData.marketValue,
      dataQualityScore: rawData.dataQualityScore,
      lastUpdated: new Date(),
      lastProviderSync: new Date(),
      queryCost: this.providerConfigs.get(rawData.providerName)?.costPerQuery || 0
    };
  }

  private isDataFresh(lastSync?: Date): boolean {
    if (!lastSync) return false;
    const daysSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceSync < 7; // Data is fresh for 7 days
  }

  private groupByField(properties: CommercialPropertyRecord[], field: keyof CommercialPropertyRecord): Record<string, number> {
    return properties.reduce((acc, property) => {
      const value = property[field] as string;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateCompleteness(properties: CommercialPropertyRecord[]): number {
    if (properties.length === 0) return 0;
    
    const totalFields = properties.length * 10; // Assuming 10 key fields
    const completedFields = properties.reduce((sum, property) => {
      let completed = 0;
      if (property.ownerName) completed++;
      if (property.assessedValue) completed++;
      if (property.propertyType) completed++;
      if (property.yearBuilt) completed++;
      if (property.squareFootage) completed++;
      if (property.lastSaleDate) completed++;
      if (property.lastSalePrice) completed++;
      if (property.taxAmount) completed++;
      if (property.zoning) completed++;
      if (property.bedrooms) completed++;
      return sum + completed;
    }, 0);

    return (completedFields / totalFields) * 100;
  }

  private getProviderBreakdown(properties: CommercialPropertyRecord[]): Record<string, number> {
    return properties.reduce((acc, property) => {
      acc[property.providerName] = (acc[property.providerName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateFieldCompleteness(properties: CommercialPropertyRecord[], field: string): number {
    if (properties.length === 0) return 0;
    const completed = properties.filter(p => p[field as keyof CommercialPropertyRecord]).length;
    return (completed / properties.length) * 100;
  }

  private calculateProviderPerformance(properties: CommercialPropertyRecord[]): any[] {
    const providers = [...new Set(properties.map(p => p.providerName))];
    
    return providers.map(provider => {
      const providerProperties = properties.filter(p => p.providerName === provider);
      return {
        providerId: provider,
        responseTime: 250, // Mock data - would track actual response times
        errorRate: 0.05,
        costEfficiency: this.calculateCostEfficiency(providerProperties),
        dataQuality: providerProperties.reduce((sum, p) => sum + p.dataQualityScore, 0) / providerProperties.length
      };
    });
  }

  private getLeadsByType(properties: CommercialPropertyRecord[]): Record<string, number> {
    const leads = properties.filter(p => p.isPotentialLead);
    return leads.reduce((acc, property) => {
      let type = 'standard';
      if (property.delinquentTaxes) type = 'tax_delinquent';
      if (property.condition === 'distressed') type = 'distressed';
      if (property.ownerType === 'entity') type = 'investor_owned';
      
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getCostByProvider(properties: CommercialPropertyRecord[]): Record<string, number> {
    return properties.reduce((acc, property) => {
      const cost = property.queryCost || 0;
      acc[property.providerName] = (acc[property.providerName] || 0) + cost;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateCostPerLead(properties: CommercialPropertyRecord[]): number {
    const totalCost = properties.reduce((sum, p) => sum + (p.queryCost || 0), 0);
    const leadCount = properties.filter(p => p.isPotentialLead).length;
    return leadCount > 0 ? totalCost / leadCount : 0;
  }

  private calculateCostPerProperty(properties: CommercialPropertyRecord[]): number {
    const totalCost = properties.reduce((sum, p) => sum + (p.queryCost || 0), 0);
    return properties.length > 0 ? totalCost / properties.length : 0;
  }

  private calculateCostEfficiency(properties: CommercialPropertyRecord[]): number {
    const totalCost = properties.reduce((sum, p) => sum + (p.queryCost || 0), 0);
    const averageQuality = properties.reduce((sum, p) => sum + p.dataQualityScore, 0) / properties.length;
    return totalCost > 0 ? averageQuality / totalCost : 0;
  }

  private validatePropertyData(data: any): boolean {
    return !!(data.propertyAddress && data.city && data.state && data.county);
  }

  private calculateDataQuality(data: any): number {
    let score = 0;
    const weights = {
      propertyAddress: 20,
      ownerName: 15,
      assessedValue: 15,
      propertyType: 10,
      yearBuilt: 10,
      squareFootage: 10,
      lastSaleDate: 10,
      taxAmount: 10
    };

    for (const [field, weight] of Object.entries(weights)) {
      if (data[field]) score += weight;
    }

    return score;
  }
}
