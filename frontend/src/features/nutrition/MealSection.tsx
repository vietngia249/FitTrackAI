import React from 'react';
import { Coffee, Utensils, Moon, Apple, Plus, Trash2 } from 'lucide-react';
import { Meal, MealType } from './nutritionTypes';

interface MealSectionProps {
  mealType: MealType;
  meals: Meal[];
  onOpenLogModal: (type: MealType) => void;
  onDeleteItem: (itemId: string) => void;
}

const mealConfig: Record<
  MealType,
  { title: string; icon: React.ReactNode; color: string; bg: string }
> = {
  breakfast: {
    title: 'Breakfast',
    icon: <Coffee className="w-5 h-5 text-amber-400" />,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  lunch: {
    title: 'Lunch',
    icon: <Utensils className="w-5 h-5 text-emerald-400" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  dinner: {
    title: 'Dinner',
    icon: <Moon className="w-5 h-5 text-indigo-400" />,
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
  },
  snack: {
    title: 'Snacks & Supplements',
    icon: <Apple className="w-5 h-5 text-rose-400" />,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
  },
};

export const MealSection: React.FC<MealSectionProps> = ({
  mealType,
  meals,
  onOpenLogModal,
  onDeleteItem,
}) => {
  const config = mealConfig[mealType];

  // Flatten items across meals of this type
  const items = meals.flatMap((m) => m.items || []);

  const totalCalories = Math.round(items.reduce((sum, it) => sum + it.calories, 0));
  const totalProtein = Math.round(items.reduce((sum, it) => sum + it.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(items.reduce((sum, it) => sum + it.carbohydrates, 0) * 10) / 10;
  const totalFat = Math.round(items.reduce((sum, it) => sum + it.fat, 0) * 10) / 10;

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${config.bg}`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg">
              {config.title}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {totalCalories} kcal • P: {totalProtein}g • C: {totalCarbs}g • F: {totalFat}g
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenLogModal(mealType)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold border border-slate-700/50 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Food</span>
        </button>
      </div>

      {/* Food Items List */}
      {items.length === 0 ? (
        <div className="py-6 text-center rounded-xl border border-dashed border-slate-800/80">
          <p className="text-xs text-slate-500">
            No foods logged for {config.title.toLowerCase()} yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60 text-sm">
          {items.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between group hover:bg-slate-800/20 px-2 rounded-lg transition-colors"
            >
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-200">{item.name}</p>
                <p className="text-xs text-slate-400">
                  {item.servingQty} {item.servingUnit} • P: {item.protein}g • C: {item.carbohydrates}g • F: {item.fat}g
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-100 font-mono">
                  {Math.round(item.calories)} kcal
                </span>
                {item.id && (
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    title="Remove item"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
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
