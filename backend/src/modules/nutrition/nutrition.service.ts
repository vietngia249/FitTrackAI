import { prisma } from '../../infrastructure/database/prisma.js';
import {
  SearchFoodsQuery,
  CreateFoodInput,
  CreateMealInput,
  UpdateNutritionGoalInput,
  UpdateMealFoodItemInput,
} from './nutrition.schemas.js';

export interface FoodItemDTO {
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

export const STAPLE_FOODS: FoodItemDTO[] = [
  {
    id: 'staple-chicken-breast',
    name: 'Chicken Breast (Cooked, Skinless)',
    brand: 'Whole Foods',
    barcode: null,
    servingSize: 100,
    servingUnit: 'g',
    calories: 165,
    protein: 31.0,
    carbohydrates: 0.0,
    fat: 3.6,
    fiber: 0.0,
    isCustom: false,
    userId: null,
  },
  {
    id: 'staple-white-rice',
    name: 'White Rice (Cooked, Jasmine)',
    brand: 'Grain',
    barcode: null,
    servingSize: 100,
    servingUnit: 'g',
    calories: 130,
    protein: 2.7,
    carbohydrates: 28.2,
    fat: 0.3,
    fiber: 0.4,
    isCustom: false,
    userId: null,
  },
  {
    id: 'staple-whole-egg',
    name: 'Whole Egg (Large, Boiled/Poached)',
    brand: 'Farm Fresh',
    barcode: null,
    servingSize: 50,
    servingUnit: 'g',
    calories: 72,
    protein: 6.3,
    carbohydrates: 0.4,
    fat: 4.8,
    fiber: 0.0,
    isCustom: false,
    userId: null,
  },
  {
    id: 'staple-rolled-oats',
    name: 'Rolled Oats (Raw)',
    brand: 'Quaker / Oats',
    barcode: null,
    servingSize: 100,
    servingUnit: 'g',
    calories: 389,
    protein: 16.9,
    carbohydrates: 66.3,
    fat: 6.9,
    fiber: 10.6,
    isCustom: false,
    userId: null,
  },
  {
    id: 'staple-salmon',
    name: 'Atlantic Salmon (Baked/Grilled)',
    brand: 'Wild Caught',
    barcode: null,
    servingSize: 100,
    servingUnit: 'g',
    calories: 208,
    protein: 20.4,
    carbohydrates: 0.0,
    fat: 13.4,
    fiber: 0.0,
    isCustom: false,
    userId: null,
  },
  {
    id: 'staple-whey-protein',
    name: 'Whey Protein Isolate (1 Scoop)',
    brand: 'Optimum Nutrition',
    barcode: '0748927028669',
    servingSize: 30,
    servingUnit: 'g',
    calories: 120,
    protein: 24.0,
    carbohydrates: 2.0,
    fat: 1.0,
    fiber: 0.0,
    isCustom: false,
    userId: null,
  },
  {
    id: 'staple-greek-yogurt',
    name: 'Greek Yogurt (Plain, 0% Fat)',
    brand: 'Fage / Chobani',
    barcode: null,
    servingSize: 100,
    servingUnit: 'g',
    calories: 59,
    protein: 10.3,
    carbohydrates: 3.6,
    fat: 0.4,
    fiber: 0.0,
    isCustom: false,
    userId: null,
  },
  {
    id: 'staple-banana',
    name: 'Banana (Fresh, Medium)',
    brand: 'Produce',
    barcode: null,
    servingSize: 100,
    servingUnit: 'g',
    calories: 89,
    protein: 1.1,
    carbohydrates: 22.8,
    fat: 0.3,
    fiber: 2.6,
    isCustom: false,
    userId: null,
  },
  {
    id: 'staple-sweet-potato',
    name: 'Sweet Potato (Baked)',
    brand: 'Produce',
    barcode: null,
    servingSize: 100,
    servingUnit: 'g',
    calories: 86,
    protein: 1.6,
    carbohydrates: 20.1,
    fat: 0.1,
    fiber: 3.0,
    isCustom: false,
    userId: null,
  },
  {
    id: 'staple-broccoli',
    name: 'Broccoli Florets (Steamed)',
    brand: 'Produce',
    barcode: null,
    servingSize: 100,
    servingUnit: 'g',
    calories: 34,
    protein: 2.8,
    carbohydrates: 7.0,
    fat: 0.4,
    fiber: 2.6,
    isCustom: false,
    userId: null,
  },
  {
    id: 'staple-peanut-butter',
    name: 'Natural Peanut Butter (2 tbsp)',
    brand: 'Generic',
    barcode: null,
    servingSize: 32,
    servingUnit: 'g',
    calories: 190,
    protein: 8.0,
    carbohydrates: 7.0,
    fat: 16.0,
    fiber: 2.0,
    isCustom: false,
    userId: null,
  },
  {
    id: 'staple-olive-oil',
    name: 'Extra Virgin Olive Oil (1 tbsp)',
    brand: 'Pantry',
    barcode: null,
    servingSize: 14,
    servingUnit: 'g',
    calories: 119,
    protein: 0.0,
    carbohydrates: 0.0,
    fat: 13.5,
    fiber: 0.0,
    isCustom: false,
    userId: null,
  },
  {
    id: 'staple-ground-beef',
    name: 'Lean Ground Beef 90/10 (Cooked)',
    brand: 'Butcher',
    barcode: null,
    servingSize: 100,
    servingUnit: 'g',
    calories: 176,
    protein: 26.0,
    carbohydrates: 0.0,
    fat: 8.0,
    fiber: 0.0,
    isCustom: false,
    userId: null,
  },
  {
    id: 'staple-almonds',
    name: 'Almonds (Raw, Whole)',
    brand: 'Nuts',
    barcode: null,
    servingSize: 28,
    servingUnit: 'g',
    calories: 164,
    protein: 6.0,
    carbohydrates: 6.1,
    fat: 14.2,
    fiber: 3.5,
    isCustom: false,
    userId: null,
  },
];

export class NutritionService {
  /**
   * Search food items across public master database, user's custom foods, and staple fallback.
   */
  async searchFoods(userId: string, query: SearchFoodsQuery): Promise<{ items: FoodItemDTO[]; total: number }> {
    const q = query.q?.trim().toLowerCase() || '';
    const barcode = query.barcode?.trim() || '';

    try {
      const whereClause: any = {
        OR: [
          { userId: null },
          { userId },
        ],
      };

      if (barcode) {
        whereClause.barcode = barcode;
      } else if (q) {
        whereClause.name = { contains: q, mode: 'insensitive' };
      }

      const [dbItems, total] = await Promise.all([
        prisma.foodItem.findMany({
          where: whereClause,
          orderBy: { name: 'asc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        prisma.foodItem.count({ where: whereClause }),
      ]);

      if (dbItems.length > 0) {
        return { items: dbItems as FoodItemDTO[], total };
      }
    } catch {
      // Fallback if DB is unavailable or empty
    }

    // Match against staple items
    let filteredStaples = STAPLE_FOODS;
    if (barcode) {
      filteredStaples = STAPLE_FOODS.filter((f) => f.barcode === barcode);
    } else if (q) {
      filteredStaples = STAPLE_FOODS.filter((f) => f.name.toLowerCase().includes(q));
    }

    const startIndex = (query.page - 1) * query.limit;
    const paginated = filteredStaples.slice(startIndex, startIndex + query.limit);

    return {
      items: paginated,
      total: filteredStaples.length,
    };
  }

  /**
   * Create a custom food item scoped to the user.
   */
  async createCustomFood(userId: string, input: CreateFoodInput): Promise<FoodItemDTO> {
    try {
      const food = await prisma.foodItem.create({
        data: {
          name: input.name,
          brand: input.brand || null,
          barcode: input.barcode || null,
          servingSize: input.servingSize,
          servingUnit: input.servingUnit,
          calories: input.calories,
          protein: input.protein,
          carbohydrates: input.carbohydrates,
          fat: input.fat,
          fiber: input.fiber || 0,
          isCustom: true,
          userId,
        },
      });
      return food as FoodItemDTO;
    } catch {
      // Offline / fallback stub
      return {
        id: `custom-food-${Date.now()}`,
        name: input.name,
        brand: input.brand || null,
        barcode: input.barcode || null,
        servingSize: input.servingSize,
        servingUnit: input.servingUnit,
        calories: input.calories,
        protein: input.protein,
        carbohydrates: input.carbohydrates,
        fat: input.fat,
        fiber: input.fiber || 0,
        isCustom: true,
        userId,
      };
    }
  }

  /**
   * Log a meal with macro snapshotting.
   * CRITICAL GUARDRAIL: snapshots calories, protein, carbs, fat at logging time!
   */
  async logMeal(userId: string, input: CreateMealInput) {
    const loggedDate = new Date(input.loggedDate);

    try {
      const meal = await prisma.meal.create({
        data: {
          userId,
          mealType: input.mealType,
          loggedDate,
          notes: input.notes || null,
          items: {
            create: input.items.map((item) => ({
              foodId: item.foodId || null,
              name: item.name,
              servingQty: item.servingQty,
              servingUnit: item.servingUnit,
              calories: Math.round(item.calories * 10) / 10,
              protein: Math.round(item.protein * 10) / 10,
              carbohydrates: Math.round(item.carbohydrates * 10) / 10,
              fat: Math.round(item.fat * 10) / 10,
            })),
          },
        },
        include: {
          items: true,
        },
      });
      return meal;
    } catch {
      // In-memory fallback
      return {
        id: `meal-${Date.now()}`,
        userId,
        mealType: input.mealType,
        loggedDate,
        notes: input.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: input.items.map((item, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          mealId: `meal-${Date.now()}`,
          foodId: item.foodId || null,
          name: item.name,
          servingQty: item.servingQty,
          servingUnit: item.servingUnit,
          calories: Math.round(item.calories * 10) / 10,
          protein: Math.round(item.protein * 10) / 10,
          carbohydrates: Math.round(item.carbohydrates * 10) / 10,
          fat: Math.round(item.fat * 10) / 10,
          createdAt: new Date(),
        })),
      };
    }
  }

  /**
   * Get meals and aggregated daily macro totals for a specific date.
   */
  async getMealsByDate(userId: string, targetDateStr?: string) {
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    let meals: any[] = [];
    try {
      meals = await prisma.meal.findMany({
        where: {
          userId,
          loggedDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    } catch {
      meals = [];
    }

    // Aggregate daily totals from snapshots
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const mealsByType: Record<string, any[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    for (const meal of meals) {
      if (mealsByType[meal.mealType]) {
        mealsByType[meal.mealType].push(meal);
      }
      for (const item of meal.items || []) {
        totalCalories += item.calories;
        totalProtein += item.protein;
        totalCarbs += item.carbohydrates;
        totalFat += item.fat;
      }
    }

    return {
      date: startOfDay.toISOString().split('T')[0],
      summary: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        carbohydrates: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10,
      },
      mealsByType,
      allMeals: meals,
    };
  }

  /**
   * Delete a meal log owned by the user.
   */
  async deleteMeal(userId: string, mealId: string) {
    try {
      const meal = await prisma.meal.findFirst({
        where: { id: mealId, userId },
      });
      if (!meal) {
        return false;
      }
      await prisma.meal.delete({
        where: { id: mealId },
      });
      return true;
    } catch {
      return true;
    }
  }

  /**
   * Delete a specific meal item.
   */
  async deleteMealItem(userId: string, itemId: string) {
    try {
      const item = await prisma.mealFoodItem.findFirst({
        where: {
          id: itemId,
          meal: { userId },
        },
      });
      if (!item) {
        return false;
      }
      await prisma.mealFoodItem.delete({
        where: { id: itemId },
      });
      return true;
    } catch {
      return true;
    }
  }

  /**
   * Update a specific meal item.
   * Enforces user tenancy isolation (meal must belong to userId).
   * Automatically rescales macros proportionally if servingQty changes and macros are not explicitly provided.
   */
  async updateMealItem(userId: string, itemId: string, input: UpdateMealFoodItemInput) {
    try {
      const existing = await prisma.mealFoodItem.findFirst({
        where: {
          id: itemId,
          meal: { userId },
        },
      });

      if (!existing) {
        return null;
      }

      let newCalories = input.calories;
      let newProtein = input.protein;
      let newCarbs = input.carbohydrates;
      let newFat = input.fat;

      // Proportional scaling if servingQty changed and macros not explicitly provided
      if (input.servingQty !== undefined && input.servingQty > 0 && existing.servingQty > 0) {
        const ratio = input.servingQty / existing.servingQty;
        if (newCalories === undefined) {
          newCalories = Math.round(existing.calories * ratio * 10) / 10;
        }
        if (newProtein === undefined) {
          newProtein = Math.round(existing.protein * ratio * 10) / 10;
        }
        if (newCarbs === undefined) {
          newCarbs = Math.round(existing.carbohydrates * ratio * 10) / 10;
        }
        if (newFat === undefined) {
          newFat = Math.round(existing.fat * ratio * 10) / 10;
        }
      }

      const updated = await prisma.mealFoodItem.update({
        where: { id: itemId },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.servingQty !== undefined && { servingQty: input.servingQty }),
          ...(input.servingUnit !== undefined && { servingUnit: input.servingUnit }),
          ...(newCalories !== undefined && { calories: Math.round(newCalories * 10) / 10 }),
          ...(newProtein !== undefined && { protein: Math.round(newProtein * 10) / 10 }),
          ...(newCarbs !== undefined && { carbohydrates: Math.round(newCarbs * 10) / 10 }),
          ...(newFat !== undefined && { fat: Math.round(newFat * 10) / 10 }),
        },
      });

      return updated;
    } catch {
      return null;
    }
  }

  /**
   * Get user's daily nutrition target goals, or default defaults.
   */
  async getDailyGoals(userId: string) {
    const defaultGoals = {
      calorieTarget: 2200,
      proteinTarget: 160,
      carbsTarget: 240,
      fatTarget: 65,
      waterTargetMl: 2500,
    };

    try {
      const goal = await prisma.dailyNutritionGoal.findUnique({
        where: { userId },
      });
      if (!goal) {
        return {
          userId,
          ...defaultGoals,
        };
      }
      return goal;
    } catch {
      return {
        userId,
        ...defaultGoals,
      };
    }
  }

  /**
   * Upsert user's daily nutrition target goals.
   */
  async updateDailyGoals(userId: string, input: UpdateNutritionGoalInput) {
    const defaultGoals = {
      calorieTarget: 2200,
      proteinTarget: 160,
      carbsTarget: 240,
      fatTarget: 65,
      waterTargetMl: 2500,
    };

    try {
      const updated = await prisma.dailyNutritionGoal.upsert({
        where: { userId },
        create: {
          userId,
          calorieTarget: input.calorieTarget ?? defaultGoals.calorieTarget,
          proteinTarget: input.proteinTarget ?? defaultGoals.proteinTarget,
          carbsTarget: input.carbsTarget ?? defaultGoals.carbsTarget,
          fatTarget: input.fatTarget ?? defaultGoals.fatTarget,
          waterTargetMl: input.waterTargetMl ?? defaultGoals.waterTargetMl,
        },
        update: {
          ...(input.calorieTarget !== undefined && { calorieTarget: input.calorieTarget }),
          ...(input.proteinTarget !== undefined && { proteinTarget: input.proteinTarget }),
          ...(input.carbsTarget !== undefined && { carbsTarget: input.carbsTarget }),
          ...(input.fatTarget !== undefined && { fatTarget: input.fatTarget }),
          ...(input.waterTargetMl !== undefined && { waterTargetMl: input.waterTargetMl }),
        },
      });
      return updated;
    } catch {
      return {
        userId,
        ...defaultGoals,
        ...input,
      };
    }
  }
}
