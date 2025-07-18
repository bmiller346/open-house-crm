import { AppDataSource } from "../../data-source";
import { ResourceDocument } from '../../entities/ResourceDocument';
import { UserNote } from '../../entities/UserNote';
import { Calculator } from '../../entities/Calculator';
import { Script } from '../../entities/Script';

export class ResourceCenterService {
  private get resourceRepo() {
    return AppDataSource.getRepository(ResourceDocument);
  }
  private get noteRepo() {
    return AppDataSource.getRepository(UserNote);
  }
  private get calculatorRepo() {
    return AppDataSource.getRepository(Calculator);
  }
  private get scriptRepo() {
    return AppDataSource.getRepository(Script);
  }

  // Resource Management
  async getResourcesByCategory(category: string, workspaceId: string, difficulty?: string) {
    const query = this.resourceRepo
      .createQueryBuilder('resource')
      .where('resource.workspaceId = :workspaceId', { workspaceId })
      .andWhere('resource.category = :category', { category })
      .andWhere('resource.isPublic = true');

    if (difficulty) {
      query.andWhere('resource.difficulty = :difficulty', { difficulty });
    }

    return query
      .orderBy('resource.views', 'DESC')
      .addOrderBy('resource.likes', 'DESC')
      .getMany();
  }

  async getAllResources(workspaceId: string) {
    return this.resourceRepo.find({ where: { workspaceId, isPublic: true } });
  }

  async searchResources(query: string, workspaceId: string, filters?: any) {
    const searchQuery = this.resourceRepo
      .createQueryBuilder('resource')
      .where('resource.workspaceId = :workspaceId', { workspaceId })
      .andWhere('resource.isPublic = true')
      .andWhere('(resource.title ILIKE :query OR resource.content ILIKE :query OR :query = ANY(resource.tags))', 
        { query: `%${query}%` });

    if (filters?.category) {
      searchQuery.andWhere('resource.category = :category', { category: filters.category });
    }

    if (filters?.difficulty) {
      searchQuery.andWhere('resource.difficulty = :difficulty', { difficulty: filters.difficulty });
    }

    return searchQuery.getMany();
  }

  async incrementViews(resourceId: string) {
    return this.resourceRepo.increment({ id: resourceId }, 'views', 1);
  }

  async incrementLikes(resourceId: string) {
    return this.resourceRepo.increment({ id: resourceId }, 'likes', 1);
  }

  // User Notes Management
  async createUserNote(userId: string, workspaceId: string, noteData: Partial<UserNote>) {
    const note = this.noteRepo.create({
      ...noteData,
      userId,
      workspaceId,
    });

    return this.noteRepo.save(note);
  }

  async getUserNotes(userId: string, workspaceId: string, filters?: any) {
    const query = this.noteRepo
      .createQueryBuilder('note')
      .where('note.userId = :userId', { userId })
      .andWhere('note.workspaceId = :workspaceId', { workspaceId });

    if (filters?.resourceId) {
      query.andWhere('note.resourceId = :resourceId', { resourceId: filters.resourceId });
    }

    if (filters?.dealId) {
      query.andWhere('note.dealId = :dealId', { dealId: filters.dealId });
    }

    if (filters?.tags && filters.tags.length > 0) {
      query.andWhere('note.tags && ARRAY[:...tags]', { tags: filters.tags });
    }

    return query.orderBy('note.updatedAt', 'DESC').getMany();
  }

  async updateUserNote(noteId: string, userId: string, noteData: Partial<UserNote>) {
      return this.noteRepo.update({ id: noteId, userId }, noteData);
  }

  async deleteUserNote(noteId: string, userId: string) {
      return this.noteRepo.delete({ id: noteId, userId });
  }

  // Calculator Operations
  async runCalculation(calculatorId: string, inputs: Record<string, any>) {
    const calculator = await this.calculatorRepo.findOne({ 
      where: { id: calculatorId, isActive: true } 
    });

    if (!calculator) {
      throw new Error('Calculator not found');
    }

    return this.executeCalculation(calculator, inputs);
  }

  private executeCalculation(calculator: Calculator, inputs: Record<string, any>) {
    // Dynamic formula execution based on calculator type
    switch (calculator.category) {
      case 'wholesaling':
        return this.executeWholesalingCalculation(calculator.name, inputs);
      // case 'investment':
      //   return this.executeInvestmentCalculation(calculator.name, inputs);
      default:
        return { error: 'Unknown calculation type' };
    }
  }

  private executeWholesalingCalculation(calculatorName: string, inputs: any) {
    switch (calculatorName) {
      case 'ARV Calculator':
        return this.calculateARV(inputs);
      case 'Assignment Fee Calculator':
        return this.calculateAssignmentFee(inputs);
      case 'Offer Price Calculator':
        return this.calculateOfferPrice(inputs);
      case 'Rehab Estimator':
        return this.calculateRehabCost(inputs);
      default:
        return { error: 'Unknown calculator' };
    }
  }

  private calculateARV(inputs: any) {
    const { comp1, comp2, comp3, adjustments } = inputs;
    const comps = [comp1, comp2, comp3].filter(Boolean).map(Number);
    if (comps.some(isNaN)) return { error: "Invalid comparable values" };
    const avgComp = comps.reduce((sum, comp) => sum + comp, 0) / (comps.length || 1);
    const adjustmentTotal = Number(adjustments) || 0;
    if(isNaN(adjustmentTotal)) return { error: "Invalid adjustment value" };
    
    return {
      averageComp: avgComp,
      adjustments: adjustmentTotal,
      arv: avgComp + adjustmentTotal,
      confidence: comps.length >= 3 ? 'High' : comps.length >= 2 ? 'Medium' : 'Low'
    };
  }

  private calculateAssignmentFee(inputs: any) {
    const { contractPrice, assignmentPrice, marketingCosts, legalCosts } = inputs;
    const grossProfit = Number(assignmentPrice) - Number(contractPrice);
    const totalCosts = (Number(marketingCosts) || 0) + (Number(legalCosts) || 0);
    const netProfit = grossProfit - totalCosts;

    if (isNaN(grossProfit) || isNaN(totalCosts) || isNaN(netProfit)) return { error: "Invalid input values" };
    
    return {
      grossProfit,
      totalCosts,
      netProfit,
      roi: totalCosts > 0 ? ((netProfit / totalCosts) * 100).toFixed(2) + '%' : 'N/A',
      margin: assignmentPrice > 0 ? ((netProfit / Number(assignmentPrice)) * 100).toFixed(2) + '%' : 'N/A'
    };
  }

  private calculateOfferPrice(inputs: any) {
    const { arv, rehabCost, desiredProfit, assignmentFee } = inputs;
    const totalDeductions = Number(rehabCost) + Number(desiredProfit) + (Number(assignmentFee) || 0);
    const maxOffer = Number(arv) - totalDeductions;

    if (isNaN(totalDeductions) || isNaN(maxOffer)) return { error: "Invalid input values" };
    
    return {
      arv: Number(arv),
      totalDeductions,
      maxOffer,
      percentOfARV: arv > 0 ? ((maxOffer / Number(arv)) * 100).toFixed(1) + '%' : 'N/A',
      recommendations: this.getOfferRecommendations(maxOffer, Number(arv))
    };
  }

  private calculateRehabCost(inputs: any) {
    const categories: { [key: string]: number } = {
      kitchen: Number(inputs.kitchen) || 0,
      bathroom: Number(inputs.bathroom) || 0,
      flooring: Number(inputs.flooring) || 0,
      paint: Number(inputs.paint) || 0,
      roof: Number(inputs.roof) || 0,
      electrical: Number(inputs.electrical) || 0,
      plumbing: Number(inputs.plumbing) || 0,
      other: Number(inputs.other) || 0
    };

    const total = Object.values(categories).reduce((sum, cost) => sum + cost, 0);
    const contingency = total * 0.1; // 10% contingency
    const finalEstimate = total + contingency;

    return {
      breakdown: categories,
      subtotal: total,
      contingency,
      total: finalEstimate,
      perSquareFoot: inputs.squareFeet > 0 ? (finalEstimate / Number(inputs.squareFeet)).toFixed(2) : null
    };
  }

  private getOfferRecommendations(offer: number, arv: number) {
    if (arv <= 0) return [];
    const percentage = (offer / arv) * 100;
    
    if (percentage > 75) {
      return [
        'Offer may be too high',
        'Consider reducing desired profit',
        'Verify ARV accuracy',
        'Check for additional repair costs',
        'Consult with a real estate expert'
      ];
    } else if (percentage > 65) {
      return [
        'Competitive offer range',
        'Good profit margin',
        'Consider market conditions',
        'Evaluate property condition',
        'Review comparable sales'
      ];
    } else {
      return [
        'Conservative offer',
        'Good profit potential',
        'May need to negotiate up',
        'Consider increasing your offer',
        'Highlight your buyer’s ability to close quickly'
      ];
    }
  }
}

export const resourceCenterService = new ResourceCenterService();
