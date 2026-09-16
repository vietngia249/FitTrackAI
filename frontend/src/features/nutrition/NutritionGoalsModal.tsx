import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, X, Check } from 'lucide-react';
import { DailyNutritionGoals } from './nutritionTypes';
import { updateNutritionGoalsApi } from './nutritionApi';

interface NutritionGoalsModalProps {
  isOpen: boolean;
  currentGoals: DailyNutritionGoals;
  onClose: () => void;
  onGoalsUpdated: (newGoals: DailyNutritionGoals) => void;
}

export const NutritionGoalsModal: React.FC<NutritionGoalsModalProps> = ({
  isOpen,
  currentGoals,
  onClose,
  onGoalsUpdated,
}) => {
  const { t } = useTranslation();
  const [calories, setCalories] = useState(currentGoals.calorieTarget);
  const [protein, setProtein] = useState(currentGoals.proteinTarget);
  const [carbs, setCarbs] = useState(currentGoals.carbsTarget);
  const [fat, setFat] = useState(currentGoals.fatTarget);
  const [water, setWater] = useState(currentGoals.waterTargetMl);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateNutritionGoalsApi({
        calorieTarget: calories,
        proteinTarget: protein,
        carbsTarget: carbs,
        fatTarget: fat,
        waterTargetMl: water,
      });
      onGoalsUpdated(updated);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('nutrition.daily_targets', 'Daily Nutrition Targets')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('nutrition.calibrate_split', 'Calibrate your calorie and macronutrient split')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('nutrition.calorie_target', 'Calorie Target (kcal)')}
            </label>
            <input
              type="number"
              min="500"
              max="8000"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1">
                {t('nutrition.protein_target', 'Protein (g)')}
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                {t('nutrition.carbs_target', 'Carbs (g)')}
              </label>
              <input
                type="number"
                min="10"
                max="800"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
                {t('nutrition.fat_target', 'Fat (g)')}
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sky-600 dark:text-sky-400 mb-1">
              {t('nutrition.water_target', 'Water Target (ml)')}
            </label>
            <input
              type="number"
              min="500"
              max="8000"
              step="100"
              value={water}
              onChange={(e) => setWater(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? t('common.saving', 'Saving...') : t('nutrition.save_targets', 'Save Targets')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
