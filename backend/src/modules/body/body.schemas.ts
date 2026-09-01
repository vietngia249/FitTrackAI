import { z } from 'zod';

export const LogWeightSchema = z.object({
  weightKg: z.number().positive('Weight must be greater than 0').max(500, 'Weight exceeds plausible limit'),
  loggedDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional().nullable(),
});

export type LogWeightInput = z.infer<typeof LogWeightSchema>;

export const LogMeasurementSchema = z.object({
  loggedDate: z.string().min(1, 'Date is required'),
  neckCm: z.number().positive().max(150).optional().nullable(),
  chestCm: z.number().positive().max(250).optional().nullable(),
  waistCm: z.number().positive().max(250).optional().nullable(),
  hipsCm: z.number().positive().max(250).optional().nullable(),
  bicepsLeftCm: z.number().positive().max(100).optional().nullable(),
  bicepsRightCm: z.number().positive().max(100).optional().nullable(),
  thighLeftCm: z.number().positive().max(150).optional().nullable(),
  thighRightCm: z.number().positive().max(150).optional().nullable(),
  calvesCm: z.number().positive().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type LogMeasurementInput = z.infer<typeof LogMeasurementSchema>;

export const LogPhotoSchema = z.object({
  photoType: z.enum(['front', 'side', 'back']),
  loggedDate: z.string().min(1, 'Date is required'),
  storageKey: z.string().min(1, 'Storage key or file path is required'),
  notes: z.string().optional().nullable(),
});

export type LogPhotoInput = z.infer<typeof LogPhotoSchema>;

export const BodyParamSchema = z.object({
  id: z.string().min(1),
});
