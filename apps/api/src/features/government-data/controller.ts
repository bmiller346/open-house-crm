import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { CommercialPropertyRecord } from '../../entities/CountyRecord';
import { Workspace } from '../../entities/Workspace';

export class GovernmentDataController {
  private countyRecordRepository: Repository<CommercialPropertyRecord>;
  private workspaceRepository: Repository<Workspace>;

  constructor() {
    this.countyRecordRepository = AppDataSource.getRepository(CommercialPropertyRecord);
    this.workspaceRepository = AppDataSource.getRepository(Workspace);
  }

  // Get all county records for a workspace
  async getCountyRecords(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const { 
        page = 1, 
        limit = 20, 
        address, 
        ownerName, 
        parcelNumber, 
        countyName, 
        state,
        assessedValueMin,
        assessedValueMax,
        marketValueMin,
        marketValueMax,
        yearBuiltMin,
        yearBuiltMax,
        propertyType,
        zoning
      } = req.query;

      const queryBuilder = this.countyRecordRepository
        .createQueryBuilder('record')
        .where('record.workspaceId = :workspaceId', { workspaceId })
        .orderBy('record.createdAt', 'DESC');

      // Apply filters
      if (address) {
        queryBuilder.andWhere('record.propertyAddress ILIKE :address', { address: `%${address}%` });
      }
      if (ownerName) {
        queryBuilder.andWhere('record.ownerName ILIKE :ownerName', { ownerName: `%${ownerName}%` });
      }
      if (parcelNumber) {
        queryBuilder.andWhere('record.propertyId ILIKE :propertyId', { propertyId: `%${parcelNumber}%` });
      }
      if (countyName) {
        queryBuilder.andWhere('record.countyName ILIKE :countyName', { countyName: `%${countyName}%` });
      }
      if (state) {
        queryBuilder.andWhere('record.state = :state', { state });
      }
      if (assessedValueMin) {
        queryBuilder.andWhere('record.assessedValue >= :assessedValueMin', { assessedValueMin });
      }
      if (assessedValueMax) {
        queryBuilder.andWhere('record.assessedValue <= :assessedValueMax', { assessedValueMax });
      }
      if (marketValueMin) {
        queryBuilder.andWhere('record.marketValue >= :marketValueMin', { marketValueMin });
      }
      if (marketValueMax) {
        queryBuilder.andWhere('record.marketValue <= :marketValueMax', { marketValueMax });
      }
      if (yearBuiltMin) {
        queryBuilder.andWhere('record.yearBuilt >= :yearBuiltMin', { yearBuiltMin });
      }
      if (yearBuiltMax) {
        queryBuilder.andWhere('record.yearBuilt <= :yearBuiltMax', { yearBuiltMax });
      }
      if (propertyType) {
        queryBuilder.andWhere('record.propertyType = :propertyType', { propertyType });
      }
      if (zoning) {
        queryBuilder.andWhere('record.zoning = :zoning', { zoning });
      }

      const total = await queryBuilder.getCount();
      const records = await queryBuilder
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .getMany();

      res.json({
        success: true,
        data: {
          records,
          total,
          page: Number(page),
          limit: Number(limit),
          hasMore: total > Number(page) * Number(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching county records:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch county records'
      });
    }
  }

  // Get a specific county record
  async getCountyRecord(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, recordId } = req.params;

      const record = await this.countyRecordRepository.findOne({
        where: { id: recordId, workspaceId }
      });

      if (!record) {
        res.status(404).json({
          success: false,
          error: 'County record not found'
        });
        return;
      }

      res.json({
        success: true,
        data: record
      });
    } catch (error) {
      console.error('Error fetching county record:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch county record'
      });
    }
  }

  // Create a new county record
  async createCountyRecord(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const recordData = req.body;

      // Verify workspace exists
      const workspace = await this.workspaceRepository.findOne({
        where: { id: workspaceId }
      });

      if (!workspace) {
        res.status(404).json({
          success: false,
          error: 'Workspace not found'
        });
        return;
      }

      const record = this.countyRecordRepository.create({
        ...recordData,
        workspaceId
      });

      const savedRecord = await this.countyRecordRepository.save(record);

      res.status(201).json({
        success: true,
        data: savedRecord
      });
    } catch (error) {
      console.error('Error creating county record:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create county record'
      });
    }
  }

  // Update a county record
  async updateCountyRecord(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, recordId } = req.params;
      const updateData = req.body;

      const record = await this.countyRecordRepository.findOne({
        where: { id: recordId, workspaceId }
      });

      if (!record) {
        res.status(404).json({
          success: false,
          error: 'County record not found'
        });
        return;
      }

      Object.assign(record, updateData);
      const updatedRecord = await this.countyRecordRepository.save(record);

      res.json({
        success: true,
        data: updatedRecord
      });
    } catch (error) {
      console.error('Error updating county record:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update county record'
      });
    }
  }

  // Delete a county record
  async deleteCountyRecord(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, recordId } = req.params;

      const record = await this.countyRecordRepository.findOne({
        where: { id: recordId, workspaceId }
      });

      if (!record) {
        res.status(404).json({
          success: false,
          error: 'County record not found'
        });
        return;
      }

      await this.countyRecordRepository.remove(record);

      res.json({
        success: true,
        message: 'County record deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting county record:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete county record'
      });
    }
  }

  // Search property records by address
  async searchPropertyByAddress(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const { address, city, state, zipCode, county } = req.body;

      if (!address || !state) {
        res.status(400).json({
          success: false,
          error: 'Address and state are required'
        });
        return;
      }

      // Search existing records first
      const queryBuilder = this.countyRecordRepository
        .createQueryBuilder('record')
        .where('record.workspaceId = :workspaceId', { workspaceId })
        .andWhere('record.propertyAddress ILIKE :address', { address: `%${address}%` });

      if (state) {
        queryBuilder.andWhere('record.state = :state', { state });
      }
      if (county) {
        queryBuilder.andWhere('record.countyName ILIKE :county', { county: `%${county}%` });
      }

      const existingRecords = await queryBuilder.getMany();

      // TODO: Implement external API searches here
      // For now, just return existing records
      res.json({
        success: true,
        data: {
          found: existingRecords.length > 0,
          records: existingRecords,
          source: 'local_database',
          searchTime: Date.now(),
          message: existingRecords.length > 0 ? 'Found existing records' : 'No records found in database'
        }
      });
    } catch (error) {
      console.error('Error searching property records:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search property records'
      });
    }
  }

  // Get analytics for government data
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;

      // Get total records
      const totalRecords = await this.countyRecordRepository.count({
        where: { workspaceId }
      });

      // Get records by county
      const recordsByCounty = await this.countyRecordRepository
        .createQueryBuilder('record')
        .select('record.countyName', 'county')
        .addSelect('COUNT(*)', 'count')
        .where('record.workspaceId = :workspaceId', { workspaceId })
        .groupBy('record.countyName')
        .getRawMany();

      // Get records by state
      const recordsByState = await this.countyRecordRepository
        .createQueryBuilder('record')
        .select('record.state', 'state')
        .addSelect('COUNT(*)', 'count')
        .where('record.workspaceId = :workspaceId', { workspaceId })
        .groupBy('record.state')
        .getRawMany();

      // Get records by property type
      const recordsByPropertyType = await this.countyRecordRepository
        .createQueryBuilder('record')
        .select('record.propertyType', 'propertyType')
        .addSelect('COUNT(*)', 'count')
        .where('record.workspaceId = :workspaceId', { workspaceId })
        .andWhere('record.propertyType IS NOT NULL')
        .groupBy('record.propertyType')
        .getRawMany();

      // Get average values
      const averageValues = await this.countyRecordRepository
        .createQueryBuilder('record')
        .select('AVG(record.assessedValue)', 'avgAssessedValue')
        .addSelect('AVG(record.marketValue)', 'avgMarketValue')
        .addSelect('AVG(record.taxAmount)', 'avgTaxAmount')
        .where('record.workspaceId = :workspaceId', { workspaceId })
        .getRawOne();

      // Get data source breakdown
      const dataSourceBreakdown = await this.countyRecordRepository
        .createQueryBuilder('record')
        .select('record.dataSource', 'dataSource')
        .addSelect('COUNT(*)', 'count')
        .where('record.workspaceId = :workspaceId', { workspaceId })
        .andWhere('record.dataSource IS NOT NULL')
        .groupBy('record.dataSource')
        .getRawMany();

      // Get recent searches (placeholder - would need search history table)
      const recentSearches: any[] = [];

      res.json({
        success: true,
        data: {
          totalRecords,
          recordsByCounty: recordsByCounty.reduce((acc, item) => {
            acc[item.county] = parseInt(item.count);
            return acc;
          }, {} as Record<string, number>),
          recordsByState: recordsByState.reduce((acc, item) => {
            acc[item.state] = parseInt(item.count);
            return acc;
          }, {} as Record<string, number>),
          recordsByPropertyType: recordsByPropertyType.reduce((acc, item) => {
            acc[item.propertyType] = parseInt(item.count);
            return acc;
          }, {} as Record<string, number>),
          averageAssessedValue: parseFloat(averageValues?.avgAssessedValue || '0'),
          averageMarketValue: parseFloat(averageValues?.avgMarketValue || '0'),
          averageTaxAmount: parseFloat(averageValues?.avgTaxAmount || '0'),
          dataSourceBreakdown: dataSourceBreakdown.reduce((acc, item) => {
            acc[item.dataSource] = parseInt(item.count);
            return acc;
          }, {} as Record<string, number>),
          recentSearches
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics'
      });
    }
  }

  // Bulk import county records
  async bulkImport(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const { records, dataSource, overwriteExisting } = req.body;

      if (!Array.isArray(records) || records.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Records array is required and must not be empty'
        });
        return;
      }

      let imported = 0;
      let updated = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const recordData of records) {
        try {
          // Check if record already exists
          let existingRecord = null;
          if (recordData.propertyId) {
            existingRecord = await this.countyRecordRepository.findOne({
              where: { 
                workspaceId, 
                propertyId: recordData.propertyId,
                county: recordData.county,
                state: recordData.state
              }
            });
          }

          if (existingRecord && overwriteExisting) {
            Object.assign(existingRecord, recordData, { 
              providerId: dataSource || existingRecord.providerId 
            });
            await this.countyRecordRepository.save(existingRecord);
            updated++;
          } else if (!existingRecord) {
            const newRecord = this.countyRecordRepository.create({
              ...recordData,
              workspaceId,
              dataSource: dataSource || recordData.dataSource
            });
            await this.countyRecordRepository.save(newRecord);
            imported++;
          } else {
            // Record exists but overwrite is false - skip
            continue;
          }
        } catch (error) {
          failed++;
          errors.push(`Failed to process record ${recordData.propertyAddress || 'unknown'}: ${error}`);
        }
      }

      res.json({
        success: true,
        data: {
          imported,
          updated,
          failed,
          errors: errors.slice(0, 10) // Limit to first 10 errors
        }
      });
    } catch (error) {
      console.error('Error bulk importing records:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to bulk import records'
      });
    }
  }
}

// Create and export controller instance
export const governmentDataController = new GovernmentDataController();