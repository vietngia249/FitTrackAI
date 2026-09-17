import { z } from 'zod';

export const SearchFoodsQuerySchema = z.object({
  q: z.string().optional(),
  barcode: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type SearchFoodsQuery = z.infer<typeof SearchFoodsQuerySchema>;

export const CreateFoodSchema = z.object({
  name: z.string().min(1, 'Food name is required'),
  brand: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  servingSize: z.number().positive().default(100),
  servingUnit: z.string().default('g'),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbohydrates: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative().optional().nullable(),
});

export type CreateFoodInput = z.infer<typeof CreateFoodSchema>;

export const MealFoodItemInputSchema = z.object({
  foodId: z.string().optional().nullable(),
  name: z.string().min(1, 'Food item name is required'),
  servingQty: z.number().positive().default(1),
  servingUnit: z.string().default('g'),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbohydrates: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});

export type MealFoodItemInput = z.infer<typeof MealFoodItemInputSchema>;

export const CreateMealSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  loggedDate: z.string().min(1, 'Logged date is required'),
  notes: z.string().optional().nullable(),
  items: z.array(MealFoodItemInputSchema).min(1, 'At least one food item must be logged'),
});

export type CreateMealInput = z.infer<typeof CreateMealSchema>;

export const GetMealsQuerySchema = z.object({
  date: z.string().optional(), // YYYY-MM-DD or ISO string
});

export type GetMealsQuery = z.infer<typeof GetMealsQuerySchema>;

export const UpdateNutritionGoalSchema = z.object({
  calorieTarget: z.number().min(500).max(10000).optional(),
  proteinTarget: z.number().min(10).max(600).optional(),
  carbsTarget: z.number().min(10).max(1200).optional(),
  fatTarget: z.number().min(5).max(400).optional(),
  waterTargetMl: z.number().min(500).max(10000).optional(),
});

export type UpdateNutritionGoalInput = z.infer<typeof UpdateNutritionGoalSchema>;

export const NutritionParamSchema = z.object({
  id: z.string().min(1),
});

export const UpdateMealFoodItemSchema = z.object({
  name: z.string().min(1).optional(),
  servingQty: z.number().positive().optional(),
  servingUnit: z.string().min(1).optional(),
  calories: z.number().nonnegative().optional(),
  protein: z.number().nonnegative().optional(),
  carbohydrates: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
});

export type UpdateMealFoodItemInput = z.infer<typeof UpdateMealFoodItemSchema>;
