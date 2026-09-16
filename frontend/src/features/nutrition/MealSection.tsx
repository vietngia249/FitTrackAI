import React from 'react';
import { Coffee, Utensils, Moon, Apple, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Meal, MealType } from './nutritionTypes';

interface MealSectionProps {
  mealType: MealType;
  meals: Meal[];
  onOpenLogModal: (type: MealType) => void;
  onDeleteItem: (itemId: string) => void;
}

export const MealSection: React.FC<MealSectionProps> = ({
  mealType,
  meals,
  onOpenLogModal,
  onDeleteItem,
}) => {
  const { t } = useTranslation();

  const mealConfig: Record<
    MealType,
    { title: string; icon: React.ReactNode; color: string; bg: string }
  > = {
    breakfast: {
      title: t('nutrition.breakfast', 'Breakfast'),
      icon: <Coffee className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-500/10',
    },
    lunch: {
      title: t('nutrition.lunch', 'Lunch'),
      icon: <Utensils className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    dinner: {
      title: t('nutrition.dinner', 'Dinner'),
      icon: <Moon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
      color: 'text-indigo-500 dark:text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    snack: {
      title: t('nutrition.snack', 'Snacks & Supplements'),
      icon: <Apple className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
      color: 'text-rose-500 dark:text-rose-400',
      bg: 'bg-rose-500/10',
    },
  };

  const config = mealConfig[mealType];

  // Flatten items across meals of this type
  const items = meals.flatMap((m) => m.items || []);

  const totalCalories = Math.round(items.reduce((sum, it) => sum + it.calories, 0));
  const totalProtein = Math.round(items.reduce((sum, it) => sum + it.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(items.reduce((sum, it) => sum + it.carbohydrates, 0) * 10) / 10;
  const totalFat = Math.round(items.reduce((sum, it) => sum + it.fat, 0) * 10) / 10;

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${config.bg}`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base sm:text-lg">
              {config.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {totalCalories} kcal • P: {totalProtein}g • C: {totalCarbs}g • F: {totalFat}g
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenLogModal(mealType)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700/50 transition-all self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t('nutrition.add_food')}</span>
        </button>
      </div>

      {/* Food Items List */}
      {items.length === 0 ? (
        <div className="py-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t('nutrition.no_foods_logged', { defaultValue: `No foods logged for ${config.title.toLowerCase()} yet.` })}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
          {items.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/20 px-2 rounded-lg transition-colors"
            >
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.servingQty} {item.servingUnit} • P: {item.protein}g • C: {item.carbohydrates}g • F: {item.fat}g
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-100 font-mono">
                  {Math.round(item.calories)} kcal
                </span>
                {item.id && (
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    title={t('nutrition.remove_item')}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
