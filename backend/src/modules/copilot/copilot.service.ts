import { prisma } from '../../infrastructure/database/prisma.js';
import { env } from '../../config/env.js';
import { logger } from '../../shared/logger/index.js';
import {
  CopilotRecommendationsResponse,
  ProgressiveOverloadTip,
  DeloadRecommendation,
} from './copilot.schemas.js';

interface DailyUsageRecord {
  date: string; // YYYY-MM-DD
  count: number;
}

/** Epley 1RM formula: weight × (1 + reps / 30) */
function epley1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export class CopilotService {
  private dailyUsage = new Map<string, DailyUsageRecord>();
  private profileCache = new Map<string, { goal: string; weight: number }>();
  private readonly DAILY_QUERY_LIMIT = env.LLM_DAILY_CALL_BUDGET;

  /**
   * Check and increment daily query limit per user.
   */
  private checkAndIncrementUsage(userId: string): { allowed: boolean; remaining: number } {
    const today = new Date().toISOString().split('T')[0];
    const record = this.dailyUsage.get(userId);

    if (!record || record.date !== today) {
      this.dailyUsage.set(userId, { date: today, count: 1 });
      return { allowed: true, remaining: this.DAILY_QUERY_LIMIT - 1 };
    }

    if (record.count >= this.DAILY_QUERY_LIMIT) {
      return { allowed: false, remaining: 0 };
    }

    record.count++;
    return { allowed: true, remaining: this.DAILY_QUERY_LIMIT - record.count };
  }

  getDailyBudgetRemaining(userId: string): number {
    const today = new Date().toISOString().split('T')[0];
    const record = this.dailyUsage.get(userId);
    if (!record || record.date !== today) {
      return this.DAILY_QUERY_LIMIT;
    }
    return Math.max(0, this.DAILY_QUERY_LIMIT - record.count);
  }

  /**
   * Generates personalized progressive overload recommendations from real session data.
   * Falls back to demo tips gracefully if user has no logged sessions yet.
   */
  async getRecommendations(userId: string): Promise<CopilotRecommendationsResponse> {
    const remaining = this.getDailyBudgetRemaining(userId);

    let overloadTips: ProgressiveOverloadTip[] = [];
    let recoveryScore = 88;

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Fetch recent completed sessions with exercise sets
      const recentSessions = await prisma.workoutSession.findMany({
        where: {
          userId,
          status: 'completed',
          startedAt: { gte: thirtyDaysAgo },
        },
        include: {
          exercises: {
            include: {
              exercise: true,
              sets: {
                where: { isCompleted: true },
              },
            },
          },
        },
        orderBy: { startedAt: 'desc' },
        take: 20,
      });

      // Group completed sets by exercise, compute best weight + estimated 1RM
      const exerciseMap = new Map<
        string,
        {
          exerciseName: string;
          bestWeightKg: number;
          bestEstimated1RM: number;
          lastSessionWeightKg: number;
          setCount: number;
          sessionCount: number;
        }
      >();

      for (const session of recentSessions) {
        for (const sessionEx of session.exercises) {
          const exId = sessionEx.exerciseId;
          const exName = sessionEx.exercise.name;

          if (!exerciseMap.has(exId)) {
            exerciseMap.set(exId, {
              exerciseName: exName,
              bestWeightKg: 0,
              bestEstimated1RM: 0,
              lastSessionWeightKg: 0,
              setCount: 0,
              sessionCount: 0,
            });
          }

          const entry = exerciseMap.get(exId)!;
          entry.sessionCount++;

          for (const set of sessionEx.sets) {
            if (set.weightKg > 0 && set.reps > 0) {
              entry.setCount++;
              const est1RM = epley1RM(set.weightKg, set.reps);

              if (est1RM > entry.bestEstimated1RM) {
                entry.bestEstimated1RM = est1RM;
                entry.bestWeightKg = set.weightKg;
              }

              // Track the most recent weight used (first session in desc order = most recent)
              if (entry.lastSessionWeightKg === 0) {
                entry.lastSessionWeightKg = set.weightKg;
              }
            }
          }
        }
      }

      // Build overload tips for top 5 most-trained exercises with enough data
      const candidates = [...exerciseMap.entries()]
        .filter(([, e]) => e.setCount >= 3) // at least 3 completed sets as evidence
        .sort(([, a], [, b]) => b.setCount - a.setCount)
        .slice(0, 5);

      for (const [exerciseId, entry] of candidates) {
        // Progressive overload: +2.5 kg for upper body (< 60 kg), +5 kg for lower body / compounds
        const isLightExercise = entry.lastSessionWeightKg < 60;
        const increaseKg = isLightExercise ? 2.5 : 5.0;
        const recommendedWeightKg = entry.lastSessionWeightKg + increaseKg;

        overloadTips.push({
          exerciseId,
          exerciseName: entry.exerciseName,
          currentWeightKg: entry.lastSessionWeightKg,
          recommendedWeightKg,
          increaseKg,
          reason: `Completed ${entry.setCount} sets across ${entry.sessionCount} sessions (est. 1RM: ${Math.round(entry.bestEstimated1RM)} kg). Ready to progress.`,
        });
      }

      // Recovery score: simple heuristic based on session frequency (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentCount = recentSessions.filter(
        (s) => new Date(s.startedAt) >= sevenDaysAgo
      ).length;

      // 0 sessions = 100% (fully rested), 7+ sessions = 65% (overreaching risk)
      recoveryScore = Math.max(65, Math.min(100, 100 - recentCount * 5));
    } catch {
      // DB not available — graceful degradation
    }

    const deload: DeloadRecommendation = {
      needed: recoveryScore < 72,
      reason:
        recoveryScore < 72
          ? `Recovery score is ${recoveryScore}%. High session frequency detected — consider a 40% volume reduction deload week.`
          : `Recovery score is ${recoveryScore}%. Current training block is at optimal fatigue accumulation.`,
      recommendedVolumeReductionPercent: recoveryScore < 72 ? 40 : 0,
    };

    return {
      overloadTips,
      deload,
      recoveryScore,
      dailyBudgetRemaining: remaining,
    };
  }

  /**
   * Grounded fitness chat answering strictly with user's verified fitness context.
   */
  async chat(
    userId: string,
    userMessage: string,
    history?: { role: 'user' | 'assistant'; text: string }[]
  ): Promise<{ reply: string; budgetRemaining: number }> {
    const { allowed, remaining } = this.checkAndIncrementUsage(userId);

    if (!allowed) {
      return {
        reply: `You have reached your daily limit of ${this.DAILY_QUERY_LIMIT} Gemini AI queries. This guardrail ensures high-quality advice and prevents information overload. Your limit resets at midnight!`,
        budgetRemaining: 0,
      };
    }

    const queryLower = userMessage.toLowerCase().trim();

    // Context retrieval: fetch user's full fitness profile and training history
    let userGoal = 'muscle_gain';
    let currentWeight = 76.0;
    let weeklyVolumeKg = 0;
    let recentSessionCount = 0;
    let profileData: any = null;
    let age: number | null = null;
    let bmiStr = 'N/A';

    try {
      const profile = await prisma.fitnessProfile.findUnique({ where: { userId } });
      if (profile) {
        profileData = profile;
        if (profile.fitnessGoal) userGoal = profile.fitnessGoal;
        if (profile.currentWeight) currentWeight = profile.currentWeight;

        if (profile.dateOfBirth) {
          const diffMs = Date.now() - new Date(profile.dateOfBirth).getTime();
          age = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
        }

        if (profile.height && profile.currentWeight) {
          const hM = profile.height / 100;
          const bmiVal = (profile.currentWeight / (hM * hM)).toFixed(1);
          bmiStr = `${bmiVal} kg/m²`;
        }
      }

      // Fetch real weekly volume
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentSessions = await prisma.workoutSession.findMany({
        where: { userId, status: 'completed', startedAt: { gte: sevenDaysAgo } },
        select: { totalVolumeKg: true },
      });
      recentSessionCount = recentSessions.length;
      weeklyVolumeKg = recentSessions.reduce((acc, s) => acc + s.totalVolumeKg, 0);
    } catch {
      // Continue with defaults if db query encounters error
    }

    // Medical / injury guardrail
    if (
      queryLower.includes('hurt') ||
      queryLower.includes('injury') ||
      queryLower.includes('pain') ||
      queryLower.includes('medical') ||
      queryLower.includes('doctor')
    ) {
      return {
        reply:
          'I cannot provide medical diagnoses or injury rehabilitation advice. If you experience sharp joint pain, swelling, or persistent discomfort, please discontinue the exercise immediately and consult a qualified healthcare provider or physical therapist.',
        budgetRemaining: remaining,
      };
    }

    // Call real Google Gemini API using env variables
    const apiKey = env.GEMINI_API_KEY || env.LLM_API_KEY;
    if (apiKey) {
      try {
        const systemPrompt = `You are FitTrack AI Coach, an elite certified strength & conditioning coach and sports nutritionist.
Current User Profile & Biometrics:
- Biological Sex: ${profileData?.biologicalSex || 'Not specified'}
- Age: ${age !== null ? `${age} years old` : 'Not specified'}
- Height: ${profileData?.height ? `${profileData.height} cm` : 'Not specified'}
- Current Weight: ${currentWeight} kg
- Target Weight: ${profileData?.targetWeight ? `${profileData.targetWeight} kg` : 'Not specified'}
- BMI: ${bmiStr}
- Activity Level: ${profileData?.activityLevel ? profileData.activityLevel.replace('_', ' ') : 'Not specified'}
- Primary Fitness Goal: ${userGoal.replace('_', ' ')}
- This Week's Training: ${weeklyVolumeKg.toLocaleString()} kg total volume across ${recentSessionCount} completed sessions.

Guidelines:
- Leverage the user's specific biometrics (age, sex, height, weight, BMI, activity level, and goal) to calculate personalized energy expenditure, macronutrient targets, and training volume/intensity recommendations.
- If the user writes in Vietnamese, answer in friendly, professional, motivating Vietnamese with clean markdown formatting.
- If the user writes in English, answer in clear, motivating English.
- Be direct, specific, and actionable. Avoid generic disclaimers unless dealing with acute injury.`;

        const candidateModels = [
          env.LLM_MODEL || 'gemini-flash-lite-latest',
          'gemini-flash-lite-latest',
          'gemini-3.5-flash-lite',
          'gemini-3.5-flash',
          'gemini-3.6-flash',
        ];
        const uniqueModels = Array.from(new Set(candidateModels));

        const historyContents = (history || [])
          .slice(-6)
          .map((item) => ({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.text }],
          }));

        const contents = [
          ...historyContents,
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ];

        for (const modelName of uniqueModels) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  system_instruction: {
                    parts: [{ text: systemPrompt }],
                  },
                  contents,
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                  },
                }),
              }
            );

            if (geminiRes.ok) {
              const geminiJson = (await geminiRes.json()) as any;
              const candidateText =
                geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText) {
                return {
                  reply: candidateText.trim(),
                  budgetRemaining: remaining,
                };
              }
            } else {
              const errText = await geminiRes.text();
              logger.warn({ model: modelName, errText }, 'Gemini API call returned non-200, attempting fallback model');
            }
          } catch (modelErr) {
            logger.warn({ model: modelName, err: modelErr }, 'Gemini model request failed');
          }
        }
      } catch (err) {
        logger.warn({ err }, 'All Gemini API models failed, falling back to local coach rules');
      }
    }

    // Grounded expert responses
    if (queryLower.includes('volume') || queryLower.includes('training')) {
      return {
        reply:
          weeklyVolumeKg > 0
            ? `Based on your recent workout logs, you lifted **${weeklyVolumeKg.toLocaleString()} kg** of total volume across **${recentSessionCount} sessions** this week. ${
                weeklyVolumeKg > 10000
                  ? 'Excellent volume — you are in the sweet spot for progressive hypertrophy (+2–5% per week).'
                  : 'Keep building consistency to accumulate more weekly volume.'
              }`
            : `You haven't logged any completed sessions this week yet. Start a workout from the Workouts tab to begin tracking your volume and progressive overload!`,
        budgetRemaining: remaining,
      };
    }

    if (
      queryLower.includes('bench') ||
      queryLower.includes('weight') ||
      queryLower.includes('overload') ||
      queryLower.includes('squat') ||
      queryLower.includes('1rm') ||
      queryLower.includes('progression')
    ) {
      const recs = await this.getRecommendations(userId);
      if (recs.overloadTips.length === 0) {
        return {
          reply: `You don't have enough completed exercise sets logged yet to calculate overload targets. Complete your workout sessions with weight and rep logs to unlock personalized progressive overload recommendations!`,
          budgetRemaining: remaining,
        };
      }

      const tipLines = recs.overloadTips
        .slice(0, 3)
        .map((t) => `• **${t.exerciseName}**: ${t.currentWeightKg} kg → **${t.recommendedWeightKg} kg** (+${t.increaseKg} kg). ${t.reason}`)
        .join('\n');

      return {
        reply: `Here are your personalized progressive overload recommendations:\n\n${tipLines}\n\nFocus on full range of motion and controlled eccentric before adding weight.`,
        budgetRemaining: remaining,
      };
    }

    if (
      queryLower.includes('protein') ||
      queryLower.includes('food') ||
      queryLower.includes('nutrition') ||
      queryLower.includes('calorie')
    ) {
      return {
        reply:
          `For your current goal (**${userGoal.replace('_', ' ')}**) at **${currentWeight} kg**, evidence recommends **1.6–2.2 g protein/kg** (~**${Math.round(currentWeight * 1.6)}–${Math.round(currentWeight * 2.2)} g daily**).\n\n` +
          `Top sources:\n1. Chicken Breast (100g = 31g protein)\n2. Whey Isolate (1 scoop = 24g)\n3. Greek Yogurt 0% (100g = 10g)\n4. Whole Eggs (2 large = 13g)\n\nSpread across 3–4 meals to maximize muscle protein synthesis.`,
        budgetRemaining: remaining,
      };
    }

    if (
      queryLower.includes('deload') ||
      queryLower.includes('recovery') ||
      queryLower.includes('tired') ||
      queryLower.includes('fatigue')
    ) {
      const recs = await this.getRecommendations(userId);
      return {
        reply: recs.deload.needed
          ? `Your recovery score is **${recs.recoveryScore}%**. A deload week is recommended — reduce volume by **${recs.deload.recommendedVolumeReductionPercent}%** for 5–7 days, maintaining intensity (weight). ${recs.deload.reason}`
          : `Your recovery score is **${recs.recoveryScore}% (Well Recovered)**. No deload needed yet. ${recs.deload.reason}`,
        budgetRemaining: remaining,
      };
    }

    if (
      queryLower.includes('hurt') ||
      queryLower.includes('injury') ||
      queryLower.includes('pain') ||
      queryLower.includes('medical') ||
      queryLower.includes('doctor')
    ) {
      return {
        reply:
          'I cannot provide medical diagnoses or injury rehabilitation advice. If you experience sharp joint pain, swelling, or persistent discomfort, please discontinue the exercise immediately and consult a qualified healthcare provider or physical therapist.',
        budgetRemaining: remaining,
      };
    }

    // Default grounded coaching response
    return {
      reply:
        `I am your FitTrack Gemini AI Coach. I analyze your logged workouts, 1RM progression curves, and nutrition macro snapshots to give grounded, evidence-based recommendations.\n\n` +
        `Try asking me:\n` +
        `• *"How is my weekly volume progressing?"*\n` +
        `• *"What weight should I use next session?"*\n` +
        `• *"Am I on track with my protein targets?"*\n` +
        `• *"Should I take a deload week?"*`,
      budgetRemaining: remaining,
    };
  }
}
