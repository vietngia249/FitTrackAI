export interface ProgressiveOverloadTip {
  exerciseId: string;
  exerciseName: string;
  currentWeightKg: number;
  recommendedWeightKg: number;
  increaseKg: number;
  reason: string;
}

export interface DeloadRecommendation {
  needed: boolean;
  reason?: string;
  recommendedVolumeReductionPercent: number;
}

export interface CopilotRecommendationsResponse {
  overloadTips: ProgressiveOverloadTip[];
  deload: DeloadRecommendation;
  recoveryScore: number;
  dailyBudgetRemaining: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  budgetRemaining?: number;
}
