// 🤖 AI Lead Scoring feature types
export interface ScoringFactors {
  demographic: number;
  behavioral: number;
  engagement: number;
  financial: number;
  timing: number;
  intent: number;
}

export interface LeadInsights {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextBestAction: string;
  estimatedCloseTime: number;
  estimatedValue: number;
}

export interface LeadScore {
  contactId: string;
  score: number;
  category: string;
  confidence: number;
  factors: ScoringFactors;
  insights: LeadInsights;
}
