import { PrismaClient } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.js';
import {
  calculateEpley1RM,
  calculateSetVolume,
  computeExercisePRs,
  SetRecordCandidate,
} from './analytics.math.js';

export class AnalyticsService {
  constructor(private db: PrismaClient = prisma) {}

  /**
   * Get high-level dashboard analytics:
   * Weekly volume, active streak, volume by muscle group, recent PRs
   */
  async getOverview(userId: string) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const sessions = await this.db.workoutSession.findMany({
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
      orderBy: { startedAt: 'asc' },
    });

    let weeklyVolumeKg = 0;
    let monthlyVolumeKg = 0;
    const muscleVolumeMap: Record<string, number> = {};
    const workoutDates = new Set<string>();

    for (const session of sessions) {
      const sessionDate = session.startedAt.toISOString().split('T')[0];
      workoutDates.add(sessionDate);

      const isLast7Days = session.startedAt >= sevenDaysAgo;

      for (const se of session.exercises) {
        const muscles = se.exercise.primaryMuscles;
        for (const set of se.sets) {
          const vol = calculateSetVolume(set.weightKg, set.reps);
          monthlyVolumeKg += vol;
          if (isLast7Days) {
            weeklyVolumeKg += vol;
          }

          for (const m of muscles) {
            muscleVolumeMap[m] = (muscleVolumeMap[m] || 0) + vol;
          }
        }
      }
    }

    // Compute active streak (consecutive days or weekly sessions)
    const streakDays = workoutDates.size;

    // Convert muscle map to array for chart visualization
    const muscleDistribution = Object.entries(muscleVolumeMap).map(
      ([muscle, volumeKg]) => ({
        muscle,
        volumeKg: Math.round(volumeKg),
      })
    );

    return {
      weeklyVolumeKg: Math.round(weeklyVolumeKg),
      monthlyVolumeKg: Math.round(monthlyVolumeKg),
      totalCompletedSessions: sessions.length,
      streakDays,
      muscleDistribution,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get 1RM and volume progression history for a specific exercise
   */
  async getExerciseAnalytics(userId: string, exerciseId: string) {
    const sessions = await this.db.workoutSession.findMany({
      where: {
        userId,
        status: 'completed',
        exercises: {
          some: { exerciseId },
        },
      },
      include: {
        exercises: {
          where: { exerciseId },
          include: {
            exercise: true,
            sets: {
              where: { isCompleted: true },
            },
          },
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    const progression: Array<{
      date: string;
      sessionName: string;
      maxWeightKg: number;
      estimated1RM: number;
      totalVolumeKg: number;
    }> = [];

    const allCandidates: SetRecordCandidate[] = [];

    for (const session of sessions) {
      for (const se of session.exercises) {
        let sessionMaxWeight = 0;
        let sessionMax1RM = 0;
        let sessionVol = 0;

        for (const set of se.sets) {
          allCandidates.push({
            exerciseId,
            weightKg: set.weightKg,
            reps: set.reps,
            completedAt: session.startedAt,
          });

          if (set.weightKg > sessionMaxWeight) {
            sessionMaxWeight = set.weightKg;
          }

          const e1rm = calculateEpley1RM(set.weightKg, set.reps);
          if (e1rm > sessionMax1RM) {
            sessionMax1RM = e1rm;
          }

          sessionVol += calculateSetVolume(set.weightKg, set.reps);
        }

        if (se.sets.length > 0) {
          progression.push({
            date: session.startedAt.toISOString().split('T')[0],
            sessionName: session.name,
            maxWeightKg: sessionMaxWeight,
            estimated1RM: sessionMax1RM,
            totalVolumeKg: Math.round(sessionVol),
          });
        }
      }
    }

    const prs = computeExercisePRs(allCandidates);

    return {
      exerciseId,
      progression,
      prs,
      totalSessions: sessions.length,
    };
  }

  /**
   * List all personal records achieved across all exercises
   */
  async getPersonalRecords(userId: string) {
    const sessions = await this.db.workoutSession.findMany({
      where: {
        userId,
        status: 'completed',
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
      orderBy: { startedAt: 'asc' },
    });

    const exerciseMap: Record<string, { exercise: any; sets: SetRecordCandidate[] }> = {};

    for (const session of sessions) {
      for (const se of session.exercises) {
        if (!exerciseMap[se.exerciseId]) {
          exerciseMap[se.exerciseId] = {
            exercise: se.exercise,
            sets: [],
          };
        }

        for (const set of se.sets) {
          exerciseMap[se.exerciseId].sets.push({
            exerciseId: se.exerciseId,
            weightKg: set.weightKg,
            reps: set.reps,
            completedAt: session.startedAt,
          });
        }
      }
    }

    const records = Object.entries(exerciseMap).map(([exerciseId, data]) => {
      const prs = computeExercisePRs(data.sets);
      return {
        exerciseId,
        exerciseName: data.exercise.name,
        category: data.exercise.category,
        primaryMuscle: data.exercise.primaryMuscles[0] || 'all',
        prs,
      };
    });

    return records;
  }
}
