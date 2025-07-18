// 🤖 AI Lead Scoring controller with real-time scoring
import { Request, Response } from 'express';
import * as aiService from './service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthenticatedRequest, AuthenticatedUser } from '../../types/auth';

// GET /api/ai/lead-scores - List all lead scores
export const getLeadScores = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { workspaceId } = user;
  
  const leadScores = await aiService.listLeadScores(user.id, workspaceId);
  
  res.json({
    success: true,
    data: leadScores,
    count: leadScores.length
  });
});

// GET /api/ai/lead-scores/:contactId - Get specific lead score
export const getLeadScore = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { contactId } = req.params;
  const { workspaceId } = user;
  
  const leadScore = await aiService.getLeadScore(contactId, user.id, workspaceId);
  
  if (!leadScore) {
    return res.status(404).json({
      success: false,
      message: 'Lead score not found'
    });
  }
  
  res.json({
    success: true,
    data: leadScore
  });
});

// POST /api/ai/lead-scores/:contactId/compute - Compute/refresh lead score
export const computeLeadScore = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { contactId } = req.params;
  const { workspaceId } = user;
  
  try {
    const leadScore = await aiService.computeLeadScore(contactId, workspaceId);
    
    res.json({
      success: true,
      data: leadScore,
      message: 'Lead score computed successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Contact not found') {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    throw error;
  }
});

// POST /api/ai/lead-scores/refresh-all - Refresh all lead scores in workspace
export const refreshAllLeadScores = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { workspaceId } = user;
  
  const result = await aiService.refreshAllLeadScores(workspaceId);
  
  res.json({
    success: true,
    data: result,
    message: `Refreshed ${result.updated} lead scores, ${result.errors} errors`
  });
});

// GET /api/ai/lead-scores/analytics - Lead scoring analytics
export const getLeadScoreAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { workspaceId } = user;
  
  const leadScores = await aiService.listLeadScores(user.id, workspaceId);
  
  // Calculate analytics
  const total = leadScores.length;
  const categoryBreakdown = leadScores.reduce((acc, score) => {
    acc[score.category] = (acc[score.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const averageScore = total > 0 
    ? Math.round(leadScores.reduce((sum, score) => sum + score.score, 0) / total)
    : 0;
  
  const averageConfidence = total > 0
    ? Math.round(leadScores.reduce((sum, score) => sum + score.confidence, 0) / total)
    : 0;
  
  // Top performers (score >= 80)
  const hotLeads = leadScores.filter(score => score.score >= 80);
  
  // Factor analysis
  const factorAverages = total > 0 ? {
    demographic: Math.round(leadScores.reduce((sum, score) => sum + score.factors.demographic, 0) / total),
    behavioral: Math.round(leadScores.reduce((sum, score) => sum + score.factors.behavioral, 0) / total),
    engagement: Math.round(leadScores.reduce((sum, score) => sum + score.factors.engagement, 0) / total),
    financial: Math.round(leadScores.reduce((sum, score) => sum + score.factors.financial, 0) / total),
    timing: Math.round(leadScores.reduce((sum, score) => sum + score.factors.timing, 0) / total),
    intent: Math.round(leadScores.reduce((sum, score) => sum + score.factors.intent, 0) / total)
  } : null;
  
  res.json({
    success: true,
    data: {
      summary: {
        totalLeads: total,
        averageScore,
        averageConfidence,
        hotLeads: hotLeads.length
      },
      categoryBreakdown,
      factorAverages,
      topPerformers: hotLeads.slice(0, 10).map(score => ({
        contactId: score.contactId,
        score: score.score,
        category: score.category,
        nextBestAction: score.insights.nextBestAction,
        estimatedValue: score.insights.estimatedValue
      }))
    }
  });
});

// GET /api/ai/recommendations/:contactId - Get AI recommendations for contact
export const getContactRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { contactId } = req.params;
  const { workspaceId } = user;
  
  const leadScore = await aiService.getLeadScore(contactId, user.id, workspaceId);
  
  if (!leadScore) {
    // Compute score if it doesn't exist
    const newLeadScore = await aiService.computeLeadScore(contactId, workspaceId);
    
    return res.json({
      success: true,
      data: {
        score: newLeadScore.score,
        category: newLeadScore.category,
        confidence: newLeadScore.confidence,
        insights: newLeadScore.insights,
        computed: true
      }
    });
  }
  
  res.json({
    success: true,
    data: {
      score: leadScore.score,
      category: leadScore.category,
      confidence: leadScore.confidence,
      insights: leadScore.insights,
      computed: false
    }
  });
});

// POST /api/ai/batch-score - Batch compute scores for multiple contacts
export const batchComputeScores = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { contactIds } = req.body;
  const { workspaceId } = user;
  
  if (!contactIds || !Array.isArray(contactIds)) {
    return res.status(400).json({
      success: false,
      message: 'contactIds array is required'
    });
  }
  
  const results = [];
  let successful = 0;
  let failed = 0;
  
  for (const contactId of contactIds) {
    try {
      const leadScore = await aiService.computeLeadScore(contactId, workspaceId);
      results.push({
        contactId,
        success: true,
        score: leadScore.score,
        category: leadScore.category
      });
      successful++;
    } catch (error) {
      results.push({
        contactId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failed++;
    }
  }
  
  res.json({
    success: true,
    data: {
      results,
      summary: {
        total: contactIds.length,
        successful,
        failed
      }
    }
  });
});
