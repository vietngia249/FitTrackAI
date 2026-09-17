import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, X, Plus } from 'lucide-react';
import { FoodItem, MealType } from './nutritionTypes.js';

interface FavoriteFoodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FoodItem[];
  onRemoveFavorite: (food: FoodItem) => void;
  onSelectFood: (mealType: MealType, food: FoodItem, servingQty: number) => void;
}

export const FavoriteFoodsModal: React.FC<FavoriteFoodsModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectFood,
}) => {
  const { t } = useTranslation();
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const mealOptions: Array<{ type: MealType; label: string }> = [
    { type: 'breakfast', label: t('nutrition.breakfast', 'Breakfast') },
    { type: 'lunch', label: t('nutrition.lunch', 'Lunch') },
    { type: 'dinner', label: t('nutrition.dinner', 'Dinner') },
    { type: 'snack', label: t('nutrition.snack', 'Snack') },
  ];

  const handleQtyChange = (foodId: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [foodId]: Math.max(0.25, val) }));
  };

  const handleAdd = (food: FoodItem) => {
    const qty = quantities[food.id] ?? 1;
    onSelectFood(selectedMealType, food, qty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('favorites.title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('favorites.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Meal Type Selector */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t('favorites.select_meal')}:
          </span>
          <div className="flex items-center gap-1.5">
            {mealOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setSelectedMealType(opt.type)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedMealType === opt.type
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('favorites.empty_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                {t('favorites.empty_desc')}
              </p>
            </div>
          ) : (
            favorites.map((food) => {
              const qty = quantities[food.id] ?? 1;
              const scaledCalories = Math.round(food.calories * qty);
              const scaledProtein = Math.round(food.protein * qty * 10) / 10;
              const scaledCarbs = Math.round(food.carbohydrates * qty * 10) / 10;
              const scaledFat = Math.round(food.fat * qty * 10) / 10;

              return (
                <div
                  key={food.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {food.name}
                      </h4>
                      {food.brand && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                          {food.brand}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {scaledCalories} kcal
                      </span>
                      <span>•</span>
                      <span>P: {scaledProtein}g</span>
                      <span>C: {scaledCarbs}g</span>
                      <span>F: {scaledFat}g</span>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                      <input
                        type="number"
                        min="0.25"
                        step="0.25"
                        value={qty}
                        onChange={(e) => handleQtyChange(food.id, parseFloat(e.target.value) || 1)}
                        className="w-12 text-center text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 pr-1">
                        {food.servingUnit}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAdd(food)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('favorites.add_to_meal')}</span>
                    </button>

                    <button
                      onClick={() => onRemoveFavorite(food)}
                      title="Remove from favorites"
                      className="p-1.5 rounded-lg text-amber-500 hover:text-slate-400 transition-colors"
                    >
                      <Star className="w-4 h-4 fill-amber-500" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
