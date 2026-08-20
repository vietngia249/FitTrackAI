import { z } from 'zod';

export const ExerciseQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'expert']).optional(),
  equipment: z.string().optional(),
  muscle: z.string().optional(),
  isCustom: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ExerciseQueryInput = z.infer<typeof ExerciseQuerySchema>;

export const CreateExerciseSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(50),
  force: z.enum(['push', 'pull', 'static']).nullable().optional(),
  level: z.enum(['beginner', 'intermediate', 'expert']).default('beginner'),
  mechanic: z.enum(['compound', 'isolation']).nullable().optional(),
  equipment: z.string().trim().max(50).nullable().optional(),
  primaryMuscles: z.array(z.string().trim()).min(1),
  secondaryMuscles: z.array(z.string().trim()).default([]),
  instructions: z.array(z.string().trim()).min(1),
  imageUrls: z.array(z.string().url()).default([]),
});

export type CreateExerciseInput = z.infer<typeof CreateExerciseSchema>;

export const UpdateExerciseSchema = CreateExerciseSchema.partial();
export type UpdateExerciseInput = z.infer<typeof UpdateExerciseSchema>;

export const ExerciseParamsSchema = z.object({
  id: z.string().min(1),
});
export type ExerciseParamsInput = z.infer<typeof ExerciseParamsSchema>;
