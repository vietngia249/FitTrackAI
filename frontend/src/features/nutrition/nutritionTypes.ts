export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string | null;
  barcode?: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number | null;
  isCustom: boolean;
  userId?: string | null;
}

export interface MealFoodItem {
  id: string;
  mealId?: string;
  foodId?: string | null;
  name: string;
  servingQty: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  createdAt?: string;
}

export interface Meal {
  id: string;
  userId?: string;
  mealType: MealType;
  loggedDate: string;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  items: MealFoodItem[];
}

export interface DailyNutritionGoals {
  userId?: string;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  waterTargetMl: number;
}

export interface DailyNutritionSummary {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface DailyNutritionResponse {
  date: string;
  summary: DailyNutritionSummary;
  mealsByType: Record<MealType, Meal[]>;
  allMeals: Meal[];
}

export interface CreateFoodPayload {
  name: string;
  brand?: string | null;
  barcode?: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number | null;
}

export interface LogMealPayload {
  mealType: MealType;
  loggedDate: string;
  notes?: string | null;
  items: Array<{
    foodId?: string | null;
    name: string;
    servingQty: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  }>;
}

export interface UpdateMealItemPayload {
  name?: string;
  servingQty?: number;
  servingUnit?: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
}
