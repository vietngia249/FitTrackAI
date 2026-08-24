import { PrismaClient } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.js';
import {
  CreateWorkoutPlanInput,
  UpdateWorkoutPlanInput,
  StartWorkoutSessionInput,
  UpdateSessionSetInput,
  CompleteSessionInput,
} from './workouts.schemas.js';

export class WorkoutsService {
  constructor(private db: PrismaClient = prisma) {}

  // ==========================================
  // Workout Plans (Templates / Routines)
  // ==========================================

  async createPlan(userId: string, input: CreateWorkoutPlanInput) {
    return this.db.workoutPlan.create({
      data: {
        userId,
        name: input.name,
        description: input.description,
        targetMuscles: input.targetMuscles,
        exercises: {
          create: input.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            order: ex.order,
            targetSets: ex.targetSets,
            targetReps: ex.targetReps,
            restSeconds: ex.restSeconds,
            notes: ex.notes,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async listPlans(userId: string) {
    return this.db.workoutPlan.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlanById(userId: string, planId: string) {
    return this.db.workoutPlan.findFirst({
      where: { id: planId, userId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async deletePlan(userId: string, planId: string) {
    const existing = await this.db.workoutPlan.findFirst({
      where: { id: planId, userId },
    });

    if (!existing) {
      return null;
    }

    await this.db.workoutPlan.delete({
      where: { id: planId },
    });

    return true;
  }

  // ==========================================
  // Workout Sessions (Live Tracking & Logging)
  // ==========================================

  async startSession(userId: string, input: StartWorkoutSessionInput) {
    let sessionName = input.name;
    let templateExercises: Array<{
      exerciseId: string;
      order: number;
      targetSets: number;
      targetReps: number;
      notes?: string | null;
    }> = [];

    // If starting from a plan template, copy exercises
    if (input.planId) {
      const plan = await this.db.workoutPlan.findFirst({
        where: { id: input.planId, userId },
        include: { exercises: true },
      });

      if (plan) {
        if (!input.name || input.name === 'Quick Workout') {
          sessionName = plan.name;
        }
        templateExercises = plan.exercises;
      }
    }

    // Prepare exercises to seed into the session
    const exercisesToCreate =
      input.exercises && input.exercises.length > 0
        ? input.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            order: ex.order,
            notes: ex.notes,
            sets: {
              create: (ex.sets || []).map((s) => ({
                setNumber: s.setNumber,
                setType: s.setType,
                weightKg: s.weightKg,
                reps: s.reps,
                rpe: s.rpe || null,
                isCompleted: s.isCompleted,
                completedAt: s.isCompleted ? new Date() : null,
              })),
            },
          }))
        : templateExercises.map((te) => ({
            exerciseId: te.exerciseId,
            order: te.order,
            notes: te.notes || null,
            sets: {
              create: Array.from({ length: te.targetSets }).map((_, idx) => ({
                setNumber: idx + 1,
                setType: 'normal',
                weightKg: 0,
                reps: te.targetReps,
                rpe: null,
                isCompleted: false,
              })),
            },
          }));

    return this.db.workoutSession.create({
      data: {
        userId,
        planId: input.planId || null,
        name: sessionName,
        status: 'in_progress',
        notes: input.notes,
        startedAt: new Date(),
        exercises: {
          create: exercisesToCreate,
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async getSessionById(userId: string, sessionId: string) {
    return this.db.workoutSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async logSet(userId: string, sessionId: string, input: UpdateSessionSetInput) {
    // Verify session belongs to user
    const session = await this.db.workoutSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('SESSION_NOT_FOUND');
    }

    // Upsert or create set for sessionExercise
    const existingSet = await this.db.exerciseSet.findFirst({
      where: {
        sessionExerciseId: input.sessionExerciseId,
        setNumber: input.setNumber,
      },
    });

    if (existingSet) {
      return this.db.exerciseSet.update({
        where: { id: existingSet.id },
        data: {
          setType: input.setType,
          weightKg: input.weightKg,
          reps: input.reps,
          rpe: input.rpe || null,
          isCompleted: input.isCompleted,
          completedAt: input.isCompleted ? new Date() : null,
        },
      });
    }

    return this.db.exerciseSet.create({
      data: {
        sessionExerciseId: input.sessionExerciseId,
        setNumber: input.setNumber,
        setType: input.setType,
        weightKg: input.weightKg,
        reps: input.reps,
        rpe: input.rpe || null,
        isCompleted: input.isCompleted,
        completedAt: input.isCompleted ? new Date() : null,
      },
    });
  }

  async completeSession(
    userId: string,
    sessionId: string,
    input: CompleteSessionInput
  ) {
    const session = await this.db.workoutSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Metric canonical volume computation: sum(weightKg * reps)
    let calculatedVolume = 0;
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (set.isCompleted && set.weightKg > 0 && set.reps > 0) {
          calculatedVolume += set.weightKg * set.reps;
        }
      }
    }

    const now = new Date();
    const duration =
      input.durationSeconds ??
      Math.max(0, Math.floor((now.getTime() - session.startedAt.getTime()) / 1000));

    return this.db.workoutSession.update({
      where: { id: sessionId },
      data: {
        status: input.status || 'completed',
        completedAt: now,
        durationSeconds: duration,
        totalVolumeKg: calculatedVolume,
        notes: input.notes ?? session.notes,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });
  }

  async listSessions(userId: string, limit = 20, offset = 0) {
    const [sessions, total] = await Promise.all([
      this.db.workoutSession.findMany({
        where: { userId },
        include: {
          exercises: {
            include: {
              exercise: true,
              sets: true,
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { startedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.db.workoutSession.count({ where: { userId } }),
    ]);

    return {
      items: sessions,
      total,
      limit,
      offset,
      hasMore: offset + sessions.length < total,
    };
  }
}
