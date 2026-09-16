import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Target,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Calendar,
} from 'lucide-react';
import {
  DailyNutritionResponse,
  DailyNutritionGoals,
  MealType,
} from '../features/nutrition/nutritionTypes';
import {
  getDailyNutritionApi,
  getNutritionGoalsApi,
  deleteMealItemApi,
  DEFAULT_GOALS,
} from '../features/nutrition/nutritionApi';
import { MacroCard } from '../features/nutrition/MacroCard';
import { MealSection } from '../features/nutrition/MealSection';
import { FoodSearchModal } from '../features/nutrition/FoodSearchModal';
import { NutritionGoalsModal } from '../features/nutrition/NutritionGoalsModal';

export const NutritionPage: React.FC = () => {
  const { t } = useTranslation();

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
  const WATER_KEY = (date: string) => `fittrack_water_${date}`;
  const [waterConsumedMl, setWaterConsumedMl] = useState<number>(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`fittrack_water_${today}`);
    return stored ? Number(stored) : 0;
  });
  const isFirstRender = useRef(true);

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [activeLogMealType, setActiveLogMealType] = useState<MealType>('breakfast');
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);

  const fetchNutrition = useCallback(async () => {
    const data = await getDailyNutritionApi(selectedDate);
    setNutritionData(data);
  }, [selectedDate]);

  useEffect(() => {
    fetchNutrition();
  }, [fetchNutrition]);

  // Load water from localStorage when date changes
  useEffect(() => {
    const stored = localStorage.getItem(WATER_KEY(selectedDate));
    setWaterConsumedMl(stored ? Number(stored) : 0);
  }, [selectedDate]);

  // Persist water intake on every change (skip initial mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem(WATER_KEY(selectedDate), String(waterConsumedMl));
  }, [waterConsumedMl, selectedDate]);

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

  const handleDeleteItem = async (itemId: string) => {
    await deleteMealItemApi(itemId);
    fetchNutrition();
  };

  const handleAddWater = (amount: number) => {
    setWaterConsumedMl((prev) => Math.min(prev + amount, 6000));
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
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">{t('nutrition.hydration', 'Hydration')}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {waterConsumedMl} / {goals.waterTargetMl} ml (
                {Math.round((waterConsumedMl / goals.waterTargetMl) * 100)}%)
              </span>
            </div>
            <div className="w-48 sm:w-64 bg-slate-200 dark:bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-sky-500 dark:bg-sky-400 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    Math.round((waterConsumedMl / goals.waterTargetMl) * 100),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddWater(250)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 font-semibold text-xs border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
          >
            +250 ml
          </button>
          <button
            onClick={() => handleAddWater(500)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 font-semibold text-xs border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
          >
            +500 ml
          </button>
          <button
            onClick={() => setWaterConsumedMl(0)}
            className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 text-xs transition-colors cursor-pointer"
          >
            {t('common.reset', 'Reset')}
          </button>
        </div>
      </div>

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
            onDeleteItem={handleDeleteItem}
          />
          <MealSection
            mealType="lunch"
            meals={nutritionData.mealsByType.lunch || []}
            onOpenLogModal={handleOpenLogModal}
            onDeleteItem={handleDeleteItem}
          />
          <MealSection
            mealType="dinner"
            meals={nutritionData.mealsByType.dinner || []}
            onOpenLogModal={handleOpenLogModal}
            onDeleteItem={handleDeleteItem}
          />
          <MealSection
            mealType="snack"
            meals={nutritionData.mealsByType.snack || []}
            onOpenLogModal={handleOpenLogModal}
            onDeleteItem={handleDeleteItem}
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
