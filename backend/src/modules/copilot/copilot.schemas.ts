import { z } from 'zod';

export const CopilotChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message is too long'),
});

export type CopilotChatInput = z.infer<typeof CopilotChatSchema>;

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
  recoveryScore: number; // 0 - 100%
  dailyBudgetRemaining: number;
}
