import { z } from 'zod';

export const ChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  text: z.string().max(2000),
});

export type ChatHistoryItem = z.infer<typeof ChatHistoryItemSchema>;

export const CopilotChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message is too long'),
  history: z.array(ChatHistoryItemSchema).optional(),
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
