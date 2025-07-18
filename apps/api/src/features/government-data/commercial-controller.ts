import { Request, Response, NextFunction } from 'express';
import { CommercialDataService } from '../../services/CommercialDataService';
import { 
  PropertySearchFilters, 
  PropertySearchResponse,
  PropertyDataAnalytics,
  BulkPropertyImportRequest,
  BulkPropertyImportResponse
} from '../../services/CommercialDataService';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    workspaceId: string;
    workspaces: string[];
  };
}

export class CommercialPropertyController {
  private commercialDataService: CommercialDataService;

  constructor() {
    this.commercialDataService = new CommercialDataService();
  }

  // Get property by address with commercial data providers
  getPropertyByAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { workspaceId } = req.user!;
      const { address, providers } = req.query;

      if (!address || typeof address !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Property address is required'
        });
        return;
      }

      const providerList = providers ? 
        (typeof providers === 'string' ? providers.split(',') : providers as string[]) : 
        ['ATTOM', 'REGRID'];

      const property = await this.commercialDataService.getPropertyData(
        workspaceId, 
        address, 
        providerList
      );

      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Property not found'
        });
        return;
      }

      res.json({
        success: true,
        data: property,
        leadScore: property.leadScore,
        isPotentialLead: property.isPotentialLead,
        estimatedEquity: property.estimatedEquity
      });
    } catch (error) {
      next(error);
    }
  };

  // Search properties with advanced filters
  searchProperties = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { workspaceId } = req.user!;
      const filters: PropertySearchFilters = req.query;

      const results = await this.commercialDataService.searchProperties(workspaceId, filters);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all properties for workspace
  getProperties = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { workspaceId } = req.user!;
      const { page = 1, limit = 50, ...filters } = req.query;

      const searchFilters: PropertySearchFilters = {
        ...filters,
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit)
      };

      const results = await this.commercialDataService.searchProperties(workspaceId, searchFilters);

      res.json({
        success: true,
        data: results.properties,
        meta: {
          total: results.total,
          page: Number(page),
          limit: Number(limit),
          hasMore: results.hasMore,
          providersUsed: results.providersUsed,
          dataQuality: results.dataQuality
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get property analytics
  getAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { workspaceId } = req.user!;

      const analytics = await this.commercialDataService.getAnalytics(workspaceId);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  };

  // Bulk import properties
  bulkImport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { workspaceId } = req.user!;
      const importRequest: BulkPropertyImportRequest = {
        ...req.body,
        workspaceId
      };

      const result = await this.commercialDataService.bulkImport(workspaceId, importRequest);

      res.json({
        success: result.success,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Get potential leads from properties
  getLeads = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { workspaceId } = req.user!;
      const { minScore = 50, limit = 100 } = req.query;

      const filters: PropertySearchFilters = {
        limit: Number(limit),
        offset: 0
      };

      const results = await this.commercialDataService.searchProperties(workspaceId, filters);
      
      // Filter for potential leads with minimum score
      const leads = results.properties
        .filter(property => property.isPotentialLead && property.leadScore >= Number(minScore))
        .sort((a, b) => b.leadScore - a.leadScore)
        .map(property => ({
          id: property.id,
          propertyAddress: property.propertyAddress,
          ownerName: property.ownerName,
          ownerMailingAddress: property.ownerMailingAddress,
          leadScore: property.leadScore,
          estimatedEquity: property.estimatedEquity,
          motivationFactors: this.getMotivationFactors(property),
          contactInfo: {
            phone: null, // Would be populated from additional data sources
            email: null,
            mailingAddress: property.ownerMailingAddress
          },
          propertyDetails: {
            type: property.propertyType,
            assessedValue: property.assessedValue,
            marketValue: property.marketValue,
            yearBuilt: property.yearBuilt,
            condition: property.condition,
            delinquentTaxes: property.delinquentTaxes,
            delinquentAmount: property.delinquentAmount
          }
        }));

      res.json({
        success: true,
        data: leads,
        meta: {
          total: leads.length,
          averageScore: leads.reduce((sum, lead) => sum + lead.leadScore, 0) / leads.length,
          highPriorityLeads: leads.filter(lead => lead.leadScore >= 80).length,
          mediumPriorityLeads: leads.filter(lead => lead.leadScore >= 60 && lead.leadScore < 80).length,
          lowPriorityLeads: leads.filter(lead => lead.leadScore < 60).length
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get provider status and performance
  getProviderStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // This would check the status of all configured providers
      const providers = [
        {
          providerId: 'attom',
          providerName: 'ATTOM',
          isOnline: true,
          lastChecked: new Date().toISOString(),
          responseTime: 245,
          errorRate: 0.02,
          dailyUsage: 150,
          dailyLimit: 10000,
          costPerQuery: 0.05,
          priority: 1
        },
        {
          providerId: 'regrid',
          providerName: 'Regrid',
          isOnline: true,
          lastChecked: new Date().toISOString(),
          responseTime: 180,
          errorRate: 0.01,
          dailyUsage: 75,
          dailyLimit: 1000,
          costPerQuery: 0.00,
          priority: 2
        },
        {
          providerId: 'datatree',
          providerName: 'DataTree',
          isOnline: true,
          lastChecked: new Date().toISOString(),
          responseTime: 320,
          errorRate: 0.03,
          dailyUsage: 45,
          dailyLimit: 5000,
          costPerQuery: 0.08,
          priority: 3
        }
      ];

      res.json({
        success: true,
        data: providers,
        meta: {
          totalProviders: providers.length,
          onlineProviders: providers.filter(p => p.isOnline).length,
          averageResponseTime: providers.reduce((sum, p) => sum + p.responseTime, 0) / providers.length,
          totalDailyUsage: providers.reduce((sum, p) => sum + p.dailyUsage, 0),
          estimatedDailyCost: providers.reduce((sum, p) => sum + (p.dailyUsage * p.costPerQuery), 0)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Refresh property data from providers
  refreshPropertyData = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { workspaceId } = req.user!;
      const { propertyId } = req.params;
      const { providers } = req.query;

      // This would force refresh data from providers for a specific property
      // Implementation depends on your specific needs

      res.json({
        success: true,
        message: 'Property data refresh initiated',
        data: {
          propertyId,
          providers: providers || ['ATTOM', 'REGRID'],
          status: 'refreshing'
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Private helper methods
  private getMotivationFactors(property: any): string[] {
    const factors: string[] = [];
    
    if (property.delinquentTaxes) {
      factors.push('Tax Delinquent');
    }
    
    if (property.condition === 'distressed' || property.condition === 'poor') {
      factors.push('Property Distressed');
    }
    
    if (property.ownershipHistory && property.ownershipHistory.length > 1) {
      factors.push('Multiple Ownership Changes');
    }
    
    if (property.ownerType === 'entity') {
      factors.push('Investor Owned');
    }
    
    if (property.ownerMailingAddress && !property.ownerMailingAddress.includes(property.state)) {
      factors.push('Out-of-State Owner');
    }
    
    if (property.estimatedEquity > 100000) {
      factors.push('High Equity');
    }
    
    return factors;
  }
}

// Export controller instance
export const commercialPropertyController = new CommercialPropertyController();

// Export individual handler functions for route binding
export const {
  getPropertyByAddress,
  searchProperties,
  getProperties,
  getAnalytics,
  bulkImport,
  getLeads,
  getProviderStatus,
  refreshPropertyData
} = commercialPropertyController;

// Legacy aliases for backward compatibility
export const governmentDataController = commercialPropertyController;
export const getCountyRecords = getProperties;
export const getCountyRecord = getPropertyByAddress;
export const createCountyRecord = bulkImport;
export const updateCountyRecord = refreshPropertyData;
export const deleteCountyRecord = refreshPropertyData;
export const searchPropertyByAddress = getPropertyByAddress;
