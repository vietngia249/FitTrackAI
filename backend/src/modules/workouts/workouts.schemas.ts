import { z } from 'zod';

export const PlanExerciseInputSchema = z.object({
  exerciseId: z.string().min(1),
  order: z.number().int().min(0).default(0),
  targetSets: z.number().int().min(1).max(20).default(3),
  targetReps: z.number().int().min(1).max(100).default(10),
  restSeconds: z.number().int().min(0).max(600).default(90),
  notes: z.string().optional(),
});

export const CreateWorkoutPlanSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  targetMuscles: z.array(z.string().trim()).default([]),
  exercises: z.array(PlanExerciseInputSchema).default([]),
});

export type CreateWorkoutPlanInput = z.infer<typeof CreateWorkoutPlanSchema>;

export const UpdateWorkoutPlanSchema = CreateWorkoutPlanSchema.partial();
export type UpdateWorkoutPlanInput = z.infer<typeof UpdateWorkoutPlanSchema>;

export const SetInputSchema = z.object({
  id: z.string().optional(),
  setNumber: z.number().int().min(1),
  setType: z.enum(['warmup', 'normal', 'drop', 'failure']).default('normal'),
  weightKg: z.number().min(0).max(1000), // strictly stored canonically in kg
  reps: z.number().int().min(0).max(200),
  rpe: z.number().min(1).max(10).nullable().optional(),
  isCompleted: z.boolean().default(false),
  completedAt: z.string().datetime().nullable().optional(),
});

export type SetInput = z.infer<typeof SetInputSchema>;

export const StartWorkoutSessionSchema = z.object({
  planId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(100).default('Quick Workout'),
  notes: z.string().optional(),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string().min(1),
        order: z.number().int().min(0).default(0),
        notes: z.string().optional(),
        sets: z.array(SetInputSchema).default([]),
      })
    )
    .optional(),
});

export type StartWorkoutSessionInput = z.infer<typeof StartWorkoutSessionSchema>;

export const UpdateSessionSetSchema = z.object({
  sessionExerciseId: z.string().min(1),
  setNumber: z.number().int().min(1),
  setType: z.enum(['warmup', 'normal', 'drop', 'failure']).default('normal'),
  weightKg: z.number().min(0).max(1000),
  reps: z.number().int().min(0).max(200),
  rpe: z.number().min(1).max(10).nullable().optional(),
  isCompleted: z.boolean().default(true),
});

export type UpdateSessionSetInput = z.infer<typeof UpdateSessionSetSchema>;

export const CompleteExerciseSetSchema = z.object({
  exerciseId: z.string().min(1),
  order: z.number().int().min(0).default(0),
  notes: z.string().optional(),
  sets: z.array(
    z.object({
      setNumber: z.number().int().min(1),
      setType: z.enum(['warmup', 'normal', 'drop', 'failure']).default('normal'),
      weightKg: z.number().min(0).max(1000),
      reps: z.number().int().min(0).max(200),
      rpe: z.number().min(1).max(10).nullable().optional(),
      isCompleted: z.boolean().default(false),
    })
  ).default([]),
});

export const CompleteSessionSchema = z.object({
  durationSeconds: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  status: z.enum(['completed', 'cancelled']).default('completed'),
  // Optional: full exercise+set data for sessions tracked locally
  exercises: z.array(CompleteExerciseSetSchema).optional(),
});

export type CompleteSessionInput = z.infer<typeof CompleteSessionSchema>;
export type CompleteExerciseSetInput = z.infer<typeof CompleteExerciseSetSchema>;

export const WorkoutParamSchema = z.object({
  id: z.string().min(1),
});
export type WorkoutParamInput = z.infer<typeof WorkoutParamSchema>;
