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
