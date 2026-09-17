import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Target,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Star,
} from 'lucide-react';
import {
  FoodItem,
  DailyNutritionResponse,
  DailyNutritionGoals,
  MealType,
  MealFoodItem,
} from '../features/nutrition/nutritionTypes.js';
import {
  getDailyNutritionApi,
  getNutritionGoalsApi,
  deleteMealItemApi,
  logMealApi,
  DEFAULT_GOALS,
} from '../features/nutrition/nutritionApi.js';
import { MacroCard } from '../features/nutrition/MacroCard.js';
import { MealSection } from '../features/nutrition/MealSection.js';
import { FoodSearchModal } from '../features/nutrition/FoodSearchModal.js';
import { NutritionGoalsModal } from '../features/nutrition/NutritionGoalsModal.js';
import { EditMealItemModal } from '../features/nutrition/EditMealItemModal.js';
import { FavoriteFoodsModal } from '../features/nutrition/FavoriteFoodsModal.js';
import { useFavoriteFoods } from '../features/nutrition/useFavoriteFoods.js';
import { WaterIntakeWidget } from '../features/nutrition/WaterIntakeWidget.js';
import { useToast } from '../context/ToastContext.js';

export const NutritionPage: React.FC = () => {
  const { t } = useTranslation();
  const { success } = useToast();
  const { favorites, isFavorite, toggleFavorite } = useFavoriteFoods();

  // Date management: default to today (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [nutritionData, setNutritionData] = useState<DailyNutritionResponse>({
    date: selectedDate,
    summary: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
    mealsByType: { breakfast: [], lunch: [], dinner: [], snack: [] },
    allMeals: [],
  });

  const [goals, setGoals] = useState<DailyNutritionGoals>(DEFAULT_GOALS);

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [activeLogMealType, setActiveLogMealType] = useState<MealType>('breakfast');
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MealFoodItem | null>(null);

  const fetchNutrition = useCallback(async () => {
    const data = await getDailyNutritionApi(selectedDate);
    setNutritionData(data);
  }, [selectedDate]);

  useEffect(() => {
    fetchNutrition();
  }, [fetchNutrition]);

  useEffect(() => {
    getNutritionGoalsApi().then(setGoals);
  }, []);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleOpenLogModal = (type: MealType = 'breakfast') => {
    setActiveLogMealType(type);
    setIsLogModalOpen(true);
  };

  const handleEditItem = (item: MealFoodItem) => {
    setEditingItem(item);
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteMealItemApi(itemId);
    success(t('toast.food_deleted', 'Food item deleted'));
    fetchNutrition();
  };

  const handleToggleMealFavorite = (item: MealFoodItem) => {
    toggleFavorite({
      id: item.foodId || item.id,
      name: item.name,
      servingSize: item.servingQty,
      servingUnit: item.servingUnit,
      calories: item.calories,
      protein: item.protein,
      carbohydrates: item.carbohydrates,
      fat: item.fat,
      isCustom: true,
    });
  };

  const handleAddFavoriteToMeal = async (
    mealType: MealType,
    food: FoodItem,
    qty: number
  ) => {
    try {
      await logMealApi({
        mealType,
        loggedDate: selectedDate,
        items: [
          {
            foodId: food.id,
            name: food.name,
            servingQty: qty,
            servingUnit: food.servingUnit,
            calories: Math.round(food.calories * qty),
            protein: Math.round(food.protein * qty * 10) / 10,
            carbohydrates: Math.round(food.carbohydrates * qty * 10) / 10,
            fat: Math.round(food.fat * qty * 10) / 10,
          },
        ],
      });
      success(t('toast.food_logged', 'Food logged successfully'));
      setIsFavoritesModalOpen(false);
      fetchNutrition();
    } catch {
      // Handled
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Date Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('nutrition.title', 'Nutrition & Food Diary')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            {t(
              'nutrition.subtitle',
              'Macro snapshotting ensures historical accuracy and reliable tracking.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsFavoritesModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold text-xs border border-amber-200/80 dark:border-amber-800/50 shadow-xs transition-all cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>
              {t('favorites.title')} {favorites.length > 0 ? `(${favorites.length})` : ''}
            </span>
          </button>

          <button
            onClick={() => setIsGoalsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700/60 shadow-sm transition-all cursor-pointer"
          >
            <Target className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{t('nutrition.set_targets', 'Set Targets')}</span>
          </button>

          <button
            onClick={() => handleOpenLogModal('breakfast')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white keep-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('nutrition.log_food', 'Log Food')}</span>
          </button>
        </div>
      </div>

      {/* Date Navigator Bar */}
      <div className="glass-panel px-4 py-3 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-800/80">
        <button
          onClick={handlePrevDay}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
            {isToday
              ? `Today, ${new Date(selectedDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}`
              : new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
          </span>
        </div>

        <button
          onClick={handleNextDay}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Daily Macro Progress Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MacroCard
          label={t('nutrition.calories', 'Calories')}
          consumed={nutritionData.summary.calories}
          target={goals.calorieTarget}
          unit="kcal"
          color="emerald"
        />
        <MacroCard
          label={t('nutrition.protein', 'Protein')}
          consumed={nutritionData.summary.protein}
          target={goals.proteinTarget}
          unit="g"
          color="cyan"
        />
        <MacroCard
          label={t('nutrition.carbs', 'Carbohydrates')}
          consumed={nutritionData.summary.carbohydrates}
          target={goals.carbsTarget}
          unit="g"
          color="amber"
        />
        <MacroCard
          label={t('nutrition.fat', 'Fat')}
          consumed={nutritionData.summary.fat}
          target={goals.fatTarget}
          unit="g"
          color="rose"
        />
      </div>

      {/* Water Intake Tracker */}
      <WaterIntakeWidget targetMl={goals.waterTargetMl} />

      {/* Meals Log with Macro Snapshots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{t('nutrition.meals_title', 'Meals & Food Items')}</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {t('common.total', 'Total')} {nutritionData.allMeals.reduce((acc, m) => acc + (m.items?.length || 0), 0)} {t('nutrition.items_logged', 'items logged')}
          </span>
        </div>

        <div className="space-y-4">
          <MealSection
            mealType="breakfast"
            meals={nutritionData.mealsByType.breakfast || []}
            onOpenLogModal={handleOpenLogModal}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onToggleFavorite={handleToggleMealFavorite}
            isFavorite={isFavorite}
          />
          <MealSection
            mealType="lunch"
            meals={nutritionData.mealsByType.lunch || []}
            onOpenLogModal={handleOpenLogModal}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onToggleFavorite={handleToggleMealFavorite}
            isFavorite={isFavorite}
          />
          <MealSection
            mealType="dinner"
            meals={nutritionData.mealsByType.dinner || []}
            onOpenLogModal={handleOpenLogModal}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onToggleFavorite={handleToggleMealFavorite}
            isFavorite={isFavorite}
          />
          <MealSection
            mealType="snack"
            meals={nutritionData.mealsByType.snack || []}
            onOpenLogModal={handleOpenLogModal}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onToggleFavorite={handleToggleMealFavorite}
            isFavorite={isFavorite}
          />
        </div>
      </div>

      {/* Food Search & Log Modal */}
      <FoodSearchModal
        isOpen={isLogModalOpen}
        initialMealType={activeLogMealType}
        selectedDate={selectedDate}
        onClose={() => setIsLogModalOpen(false)}
        onMealLogged={fetchNutrition}
      />

      {/* Edit Food Item Modal */}
      <EditMealItemModal
        isOpen={Boolean(editingItem)}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onItemUpdated={fetchNutrition}
      />

      {/* Favorite Foods Modal */}
      <FavoriteFoodsModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
        favorites={favorites}
        onRemoveFavorite={toggleFavorite}
        onSelectFood={handleAddFavoriteToMeal}
      />

      {/* Nutrition Goals Calibration Modal */}
      <NutritionGoalsModal
        isOpen={isGoalsModalOpen}
        currentGoals={goals}
        onClose={() => setIsGoalsModalOpen(false)}
        onGoalsUpdated={setGoals}
      />
    </div>
  );
};
