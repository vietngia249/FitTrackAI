import {
  FoodItem,
  Meal,
  MealFoodItem,
  DailyNutritionGoals,
  DailyNutritionResponse,
  CreateFoodPayload,
  LogMealPayload,
  UpdateMealItemPayload,
} from './nutritionTypes';

const API_BASE = '/api/v1/nutrition';
const NUTRITION_CACHE_KEY = 'fittrack_nutrition_meals';
const GOALS_CACHE_KEY = 'fittrack_nutrition_goals';

export const STAPLE_FOODS: FoodItem[] = [
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
];

export const DEFAULT_GOALS: DailyNutritionGoals = {
  calorieTarget: 2200,
  proteinTarget: 160,
  carbsTarget: 240,
  fatTarget: 65,
  waterTargetMl: 2500,
};

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('fittrack_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getLocalMeals(): Meal[] {
  try {
    const raw = localStorage.getItem(NUTRITION_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMeals(meals: Meal[]) {
  try {
    localStorage.setItem(NUTRITION_CACHE_KEY, JSON.stringify(meals));
  } catch {
    // Ignore quota issues
  }
}

export async function searchFoodsApi(
  q?: string,
  barcode?: string,
  page = 1,
  limit = 20
): Promise<{ items: FoodItem[]; total: number }> {
  try {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (barcode) params.set('barcode', barcode);
    params.set('page', String(page));
    params.set('limit', String(limit));

    const res = await fetch(`${API_BASE}/foods?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to offline staple filter
  }

  const query = q?.toLowerCase().trim() || '';
  let filtered = STAPLE_FOODS;
  if (barcode) {
    filtered = STAPLE_FOODS.filter((f) => f.barcode === barcode);
  } else if (query) {
    filtered = STAPLE_FOODS.filter((f) => f.name.toLowerCase().includes(query));
  }

  const start = (page - 1) * limit;
  return {
    items: filtered.slice(start, start + limit),
    total: filtered.length,
  };
}

export async function createCustomFoodApi(payload: CreateFoodPayload): Promise<FoodItem> {
  try {
    const res = await fetch(`${API_BASE}/foods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  return {
    id: `custom-${Date.now()}`,
    ...payload,
    isCustom: true,
  };
}

export async function getDailyNutritionApi(dateStr: string): Promise<DailyNutritionResponse> {
  try {
    const res = await fetch(`${API_BASE}/meals?date=${dateStr}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Offline calculation
  }

  const localMeals = getLocalMeals().filter((m) => m.loggedDate.startsWith(dateStr));
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  const mealsByType: Record<string, Meal[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  for (const meal of localMeals) {
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
    date: dateStr,
    summary: {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbohydrates: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
    },
    mealsByType: mealsByType as any,
    allMeals: localMeals,
  };
}

export async function logMealApi(payload: LogMealPayload): Promise<Meal> {
  try {
    const res = await fetch(`${API_BASE}/meals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const savedMeal = await res.json();
      // sync to local
      const local = getLocalMeals();
      local.push(savedMeal);
      saveLocalMeals(local);
      return savedMeal;
    }
  } catch {
    // Save locally
  }

  const newMeal: Meal = {
    id: `local-meal-${Date.now()}`,
    mealType: payload.mealType,
    loggedDate: payload.loggedDate,
    notes: payload.notes || null,
    items: payload.items.map((it, idx) => ({
      id: `local-item-${Date.now()}-${idx}`,
      ...it,
    })),
  };

  const local = getLocalMeals();
  local.push(newMeal);
  saveLocalMeals(local);
  return newMeal;
}

export async function deleteMealApi(mealId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/meals/${mealId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });
    if (res.ok) {
      const local = getLocalMeals().filter((m) => m.id !== mealId);
      saveLocalMeals(local);
      return true;
    }
  } catch {
    // Offline
  }

  const local = getLocalMeals().filter((m) => m.id !== mealId);
  saveLocalMeals(local);
  return true;
}

export async function deleteMealItemApi(itemId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/meals/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });
    if (res.ok) {
      return true;
    }
  } catch {
    // Offline
  }

  const local = getLocalMeals();
  for (const meal of local) {
    meal.items = meal.items.filter((it) => it.id !== itemId);
  }
  saveLocalMeals(local);
  return true;
}

export async function updateMealItemApi(
  itemId: string,
  payload: UpdateMealItemPayload
): Promise<MealFoodItem | null> {
  try {
    const res = await fetch(`${API_BASE}/meals/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const updatedItem: MealFoodItem = await res.json();
      const local = getLocalMeals();
      for (const meal of local) {
        const idx = meal.items.findIndex((it) => it.id === itemId);
        if (idx !== -1) {
          meal.items[idx] = { ...meal.items[idx], ...updatedItem };
        }
      }
      saveLocalMeals(local);
      return updatedItem;
    }
  } catch {
    // Offline fallback
  }

  const local = getLocalMeals();
  let updatedFallback: MealFoodItem | null = null;
  for (const meal of local) {
    const idx = meal.items.findIndex((it) => it.id === itemId);
    if (idx !== -1) {
      meal.items[idx] = { ...meal.items[idx], ...payload };
      updatedFallback = meal.items[idx];
    }
  }
  saveLocalMeals(local);
  return updatedFallback;
}

export async function getNutritionGoalsApi(): Promise<DailyNutritionGoals> {
  try {
    const res = await fetch(`${API_BASE}/goals`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  try {
    const saved = localStorage.getItem(GOALS_CACHE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Ignore
  }

  return DEFAULT_GOALS;
}

export async function updateNutritionGoalsApi(
  goals: Partial<DailyNutritionGoals>
): Promise<DailyNutritionGoals> {
  try {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(goals),
    });
    if (res.ok) {
      const updated = await res.json();
      localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(updated));
      return updated;
    }
  } catch {
    // Offline fallback
  }

  const current = await getNutritionGoalsApi();
  const merged = { ...current, ...goals };
  localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(merged));
  return merged;
}
