// 🤖 AI Lead Scoring service with advanced algorithms
import type { LeadScore, ScoringFactors, LeadInsights } from './types';
import { AppDataSource } from '../../data-source';
// import { LeadScore as LeadScoreEntity } from '../../entities/LeadScore'; // Temporarily disabled due to decorator issue
import { Contact } from '../../entities/Contact';
import { Transaction } from '../../entities/Transaction';

// Dummy in-memory storage for demonstration (replace with DB logic as needed)
const leadScores: LeadScore[] = [];

export async function getLeadScore(contactId: string, userId: string, workspaceId: string): Promise<LeadScore | null> {
  return leadScores.find(ls => ls.contactId === contactId) ?? null;
}

export async function listLeadScores(userId: string, workspaceId: string): Promise<LeadScore[]> {
  return leadScores;
}

export async function computeLeadScore(contactId: string, workspaceId: string): Promise<LeadScore> {
  // Get contact data
  const contactRepository = AppDataSource.getRepository(Contact);
  const contact = await contactRepository.findOne({ where: { id: contactId, workspaceId } });
  
  if (!contact) {
    throw new Error('Contact not found');
  }

  // Get transaction history
  const transactionRepository = AppDataSource.getRepository(Transaction);
  const transactions = await transactionRepository.find({ 
    where: { contactId, workspaceId } 
  });

  // Compute scoring factors
  const factors = await computeScoringFactors(contact, transactions);
  
  // Calculate overall score
  const score = calculateOverallScore(factors);
  
  // Generate insights
  const insights = generateInsights(contact, transactions, factors, score);
  
  // Determine category based on score
  const category = score >= 80 ? 'hot' : score >= 60 ? 'warm' : 'cold';
  
  // Calculate confidence based on data completeness
  const confidence = calculateConfidence(contact, transactions);

  // Save or update lead score in memory (replace with DB logic as needed)
  let leadScore = leadScores.find(ls => ls.contactId === contactId);
  if (leadScore) {
    leadScore.score = score;
    leadScore.category = category;
    leadScore.confidence = confidence;
    leadScore.factors = factors;
    leadScore.insights = insights;
  } else {
    leadScore = {
      contactId,
      score,
      category,
      confidence,
      factors,
      insights
    };
    leadScores.push(leadScore);
  }

  return leadScore;
}

async function computeScoringFactors(contact: Contact, transactions: Transaction[]): Promise<ScoringFactors> {
  return {
    demographic: computeDemographicScore(contact),
    behavioral: computeBehavioralScore(contact, transactions),
    engagement: computeEngagementScore(contact, transactions),
    financial: computeFinancialScore(transactions),
    timing: computeTimingScore(contact, transactions),
    intent: computeIntentScore(contact, transactions)
  };
}

function computeDemographicScore(contact: Contact): number {
  let score = 50; // Base score
  
  // Email domain scoring
  if (contact.email) {
    const domain = contact.email.split('@')[1];
    const businessDomains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
    
    if (!businessDomains.includes(domain)) {
      score += 15; // Business email bonus
    }
  }
  
  // Phone number provided
  if (contact.phone) {
    score += 10;
  }
  
  return Math.min(score, 100);
}

function computeBehavioralScore(contact: Contact, transactions: Transaction[]): number {
  let score = 30; // Base score
  
  // Transaction frequency
  if (transactions.length > 0) {
    score += Math.min(transactions.length * 10, 40);
  }
  
  // Recent activity
  const now = new Date();
  const recentTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.createdAt);
    const daysDiff = (now.getTime() - transactionDate.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 30;
  });
  
  if (recentTransactions.length > 0) {
    score += 20;
  }
  
  return Math.min(score, 100);
}

function computeEngagementScore(contact: Contact, transactions: Transaction[]): number {
  let score = 40; // Base score
  
  // Multiple touchpoints
  const touchpoints = [
    contact.email ? 'email' : null,
    contact.phone ? 'phone' : null,
    transactions.length > 0 ? 'transaction' : null
  ].filter(Boolean);
  
  score += touchpoints.length * 15;
  
  return Math.min(score, 100);
}

function computeFinancialScore(transactions: Transaction[]): number {
  if (transactions.length === 0) return 20;
  
  // Average transaction value
  const totalValue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const avgValue = totalValue / transactions.length;
  
  let score = 30;
  
  if (avgValue > 500000) score += 40; // High value deals
  else if (avgValue > 250000) score += 30; // Medium value deals
  else if (avgValue > 100000) score += 20; // Standard deals
  else score += 10; // Lower value deals
  
  return Math.min(score, 100);
}

function computeTimingScore(contact: Contact, transactions: Transaction[]): number {
  const now = new Date();
  const contactAge = (now.getTime() - new Date(contact.createdAt).getTime()) / (1000 * 3600 * 24);
  
  let score = 50; // Base score
  
  // Optimal contact age (7-90 days)
  if (contactAge >= 7 && contactAge <= 90) {
    score += 30;
  } else if (contactAge < 7) {
    score += 20; // Very recent
  } else if (contactAge > 90) {
    score -= 10; // Older lead
  }
  
  // Pipeline progression
  const advancedStages = transactions.filter(t => 
    ['qualified', 'proposal', 'negotiation'].includes(t.pipelineStage)
  );
  
  if (advancedStages.length > 0) {
    score += 20;
  }
  
  return Math.min(score, 100);
}

function computeIntentScore(contact: Contact, transactions: Transaction[]): number {
  let score = 40; // Base score
  
  // Pipeline stage analysis
  const stageScores: Record<string, number> = {
    'lead': 10,
    'qualified': 25,
    'proposal': 35,
    'negotiation': 45,
    'closed': 20 // Existing customer
  };
  
  const maxStageScore = Math.max(
    ...transactions.map(t => stageScores[t.pipelineStage] || 0)
  );
  
  score += maxStageScore;
  
  return Math.min(score, 100);
}

function calculateOverallScore(factors: ScoringFactors): number {
  // Weighted average of all factors
  const weights = {
    demographic: 0.15,
    behavioral: 0.20,
    engagement: 0.15,
    financial: 0.25,
    timing: 0.15,
    intent: 0.10
  };
  
  return Math.round(
    factors.demographic * weights.demographic +
    factors.behavioral * weights.behavioral +
    factors.engagement * weights.engagement +
    factors.financial * weights.financial +
    factors.timing * weights.timing +
    factors.intent * weights.intent
  );
}

function determineCategory(score: number): 'hot' | 'warm' | 'cold' | 'qualified' | 'unqualified' {
  if (score >= 80) return 'hot';
  if (score >= 60) return 'warm';
  if (score >= 40) return 'qualified';
  if (score >= 20) return 'cold';
  return 'unqualified';
}

function generateInsights(
  contact: Contact, 
  transactions: Transaction[], 
  factors: ScoringFactors, 
  score: number
): LeadInsights {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  
  // Analyze strengths
  if (factors.financial > 70) strengths.push('High transaction values');
  if (factors.engagement > 70) strengths.push('Strong engagement across channels');
  if (factors.behavioral > 70) strengths.push('Active and frequent interactions');
  if (factors.timing > 70) strengths.push('Optimal timing for conversion');
  
  // Analyze weaknesses
  if (factors.financial < 40) weaknesses.push('Low transaction history');
  if (factors.engagement < 40) weaknesses.push('Limited engagement');
  if (factors.demographic < 40) weaknesses.push('Incomplete contact information');
  
  // Generate recommendations
  if (score >= 80) {
    recommendations.push('Priority follow-up within 24 hours');
    recommendations.push('Schedule demo or property viewing');
    recommendations.push('Prepare personalized proposal');
  } else if (score >= 60) {
    recommendations.push('Nurture with targeted content');
    recommendations.push('Schedule discovery call');
    recommendations.push('Provide market insights');
  } else if (score >= 40) {
    recommendations.push('Add to email nurture sequence');
    recommendations.push('Gather more qualification data');
    recommendations.push('Provide educational resources');
  } else {
    recommendations.push('Re-engage with value proposition');
    recommendations.push('Verify contact information');
    recommendations.push('Consider lead source quality');
  }
  
  // Determine next best action
  let nextBestAction = 'Follow up via email';
  if (score >= 80) nextBestAction = 'Schedule immediate call';
  else if (score >= 60) nextBestAction = 'Send personalized proposal';
  else if (score >= 40) nextBestAction = 'Nurture with content';
  
  // Estimate close time and value
  const estimatedCloseTime = score >= 80 ? 14 : score >= 60 ? 30 : score >= 40 ? 60 : 120;
  const avgTransactionValue = transactions.length > 0 
    ? transactions.reduce((sum, t) => sum + Number(t.amount), 0) / transactions.length
    : 250000; // Default estimate
  const estimatedValue = Math.round(avgTransactionValue * (score / 100));
  
  return {
    strengths,
    weaknesses,
    recommendations,
    nextBestAction,
    estimatedCloseTime,
    estimatedValue
  };
}

function calculateConfidence(contact: Contact, transactions: Transaction[]): number {
  let confidence = 50; // Base confidence
  
  // More data points = higher confidence
  const dataPoints = getDataPointsCount(contact, transactions);
  confidence += Math.min(dataPoints * 5, 40);
  
  // Recent activity increases confidence
  if (transactions.some(t => {
    const daysDiff = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 7;
  })) {
    confidence += 10;
  }
  
  return Math.min(confidence, 100);
}

function getDataPointsCount(contact: Contact, transactions: Transaction[]): number {
  let count = 1; // Base contact
  if (contact.email) count++;
  if (contact.phone) count++;
  count += transactions.length;
  return count;
}

function getLastActivityDate(transactions: Transaction[]): Date | undefined {
  if (transactions.length === 0) return undefined;
  
  return transactions.reduce((latest, current) => {
    return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
  }).createdAt;
}

export async function refreshAllLeadScores(workspaceId: string): Promise<{ updated: number; errors: number }> {
  const contactRepository = AppDataSource.getRepository(Contact);
  const contacts = await contactRepository.find({ where: { workspaceId } });
  
  let updated = 0;
  let errors = 0;
  
  for (const contact of contacts) {
    try {
      await computeLeadScore(contact.id, workspaceId);
      updated++;
    } catch (error) {
      console.error(`Failed to compute lead score for contact ${contact.id}:`, error);
      errors++;
    }
  }
  
  return { updated, errors };
}
