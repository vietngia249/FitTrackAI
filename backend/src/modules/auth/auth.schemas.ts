import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long'),
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must not exceed 50 characters'),
  fitnessGoal: z
    .enum(['muscle_gain', 'fat_loss', 'maintenance', 'strength'])
    .optional(),
  preferredUnits: z.enum(['metric', 'imperial']).default('metric'),
  locale: z.enum(['en', 'vi']).default('en'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(50).optional(),
  dateOfBirth: z.string().nullable().optional(),
  biologicalSex: z.enum(['male', 'female', 'other']).nullable().optional(),
  height: z.number().min(50).max(300).nullable().optional(),
  currentWeight: z.number().min(20).max(500).nullable().optional(),
  targetWeight: z.number().min(20).max(500).nullable().optional(),
  activityLevel: z
    .enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
    .nullable()
    .optional(),
  fitnessGoal: z
    .enum(['muscle_gain', 'fat_loss', 'maintenance', 'strength'])
    .nullable()
    .optional(),
  preferredUnits: z.enum(['metric', 'imperial']).optional(),
  locale: z.enum(['en', 'vi']).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
