const ResourceDocument = require('../models/ResourceDocument');
const UserNote = require('../models/UserNote');
const Calculator = require('../models/Calculator');
const Script = require('../models/Script');

class ResourceCenterService {
  // Resource Management
  async getResourcesByCategory(category, workspaceId, difficulty) {
    const query = {
      workspaceId,
      category,
      isPublic: true,
    };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    return ResourceDocument.find(query).sort({ views: -1, likes: -1 });
  }

  async getAllResources(workspaceId) {
    return ResourceDocument.find({ workspaceId, isPublic: true }).sort({ views: -1, likes: -1 });
  }

  async searchResources(queryString, workspaceId, filters) {
    const query = {
      workspaceId,
      isPublic: true,
      $or: [
        { title: { $regex: queryString, $options: 'i' } },
        { content: { $regex: queryString, $options: 'i' } },
        { tags: { $regex: queryString, $options: 'i' } },
      ],
    };

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.difficulty) {
      query.difficulty = filters.difficulty;
    }

    return ResourceDocument.find(query);
  }

  async incrementViews(resourceId) {
    return ResourceDocument.findByIdAndUpdate(resourceId, { $inc: { views: 1 } });
  }

  async incrementLikes(resourceId) {
    return ResourceDocument.findByIdAndUpdate(resourceId, { $inc: { likes: 1 } });
  }

  // User Notes Management
  async createUserNote(userId, workspaceId, noteData) {
    const note = new UserNote({
      ...noteData,
      user: userId,
      workspaceId,
    });

    return note.save();
  }

  async getUserNotes(userId, workspaceId, filters) {
    const query = {
      user: userId,
      workspaceId,
    };

    if (filters?.resourceId) {
      query.resourceId = filters.resourceId;
    }

    if (filters?.dealId) {
      query.dealId = filters.dealId;
    }

    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    return UserNote.find(query).sort({ updatedAt: -1 });
  }

  // Calculator Operations
  async runCalculation(calculatorId, inputs) {
    const calculator = await Calculator.findOne({
      _id: calculatorId,
      isActive: true,
    });

    if (!calculator) {
      throw new Error('Calculator not found');
    }

    return this.executeCalculation(calculator, inputs);
  }

  executeCalculation(calculator, inputs) {
    // Dynamic formula execution based on calculator type
    switch (calculator.category) {
      case 'wholesaling':
        return this.executeWholesalingCalculation(calculator.name, inputs);
      case 'investment':
        return this.executeInvestmentCalculation(calculator.name, inputs);
      default:
        return { error: 'Unknown calculation type' };
    }
  }

  executeWholesalingCalculation(calculatorName, inputs) {
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

  calculateARV(inputs) {
    const { comp1, comp2, comp3, adjustments } = inputs;
    const comps = [comp1, comp2, comp3].filter(Boolean).map(Number);
    if (comps.length === 0) {
        return { error: 'At least one comparable property value is required.' };
    }
    const avgComp = comps.reduce((sum, comp) => sum + comp, 0) / comps.length;
    const adjustmentTotal = Number(adjustments) || 0;

    return {
      averageComp: avgComp,
      adjustments: adjustmentTotal,
      arv: avgComp + adjustmentTotal,
      confidence: comps.length >= 3 ? 'High' : comps.length >= 2 ? 'Medium' : 'Low',
    };
  }

  calculateAssignmentFee(inputs) {
    const { contractPrice, assignmentPrice, marketingCosts, legalCosts } = inputs;
    const grossProfit = Number(assignmentPrice) - Number(contractPrice);
    const totalCosts = (Number(marketingCosts) || 0) + (Number(legalCosts) || 0);
    const netProfit = grossProfit - totalCosts;

    return {
      grossProfit,
      totalCosts,
      netProfit,
      roi: totalCosts > 0 ? ((netProfit / totalCosts) * 100).toFixed(2) + '%' : 'N/A',
      margin: assignmentPrice > 0 ? ((netProfit / Number(assignmentPrice)) * 100).toFixed(2) + '%' : 'N/A',
    };
  }

  calculateOfferPrice(inputs) {
    const { arv, rehabCost, desiredProfit, assignmentFee } = inputs;
    const totalDeductions = Number(rehabCost) + Number(desiredProfit) + (Number(assignmentFee) || 0);
    const maxOffer = Number(arv) - totalDeductions;

    return {
      arv: Number(arv),
      totalDeductions,
      maxOffer,
      percentOfARV: arv > 0 ? ((maxOffer / Number(arv)) * 100).toFixed(1) + '%' : 'N/A',
      recommendations: this.getOfferRecommendations(maxOffer, Number(arv)),
    };
  }

  calculateRehabCost(inputs) {
    const categories = {
      kitchen: Number(inputs.kitchen) || 0,
      bathroom: Number(inputs.bathroom) || 0,
      flooring: Number(inputs.flooring) || 0,
      paint: Number(inputs.paint) || 0,
      roof: Number(inputs.roof) || 0,
      electrical: Number(inputs.electrical) || 0,
      plumbing: Number(inputs.plumbing) || 0,
      other: Number(inputs.other) || 0,
    };

    const total = Object.values(categories).reduce((sum, cost) => sum + cost, 0);
    const contingency = total * 0.1; // 10% contingency
    const finalEstimate = total + contingency;

    return {
      breakdown: categories,
      subtotal: total,
      contingency,
      total: finalEstimate,
      perSquareFoot: inputs.squareFeet ? (finalEstimate / Number(inputs.squareFeet)).toFixed(2) : null,
    };
  }

  getOfferRecommendations(offer, arv) {
    if (arv === 0) return ['ARV must be greater than zero to provide recommendations.'];
    const percentage = (offer / arv) * 100;

    if (percentage > 75) {
      return ['Offer may be too high', 'Consider reducing desired profit', 'Verify ARV accuracy'];
    } else if (percentage > 65) {
      return ['Competitive offer range', 'Good profit margin', 'Consider market conditions'];
    } else {
      return ['Conservative offer', 'Good profit potential', 'May need to negotiate up'];
    }
  }

  executeInvestmentCalculation(calculatorName, inputs) {
    // Placeholder for investment calculations
    return { error: 'Investment calculations not yet implemented.' };
  }
}

module.exports = new ResourceCenterService();
