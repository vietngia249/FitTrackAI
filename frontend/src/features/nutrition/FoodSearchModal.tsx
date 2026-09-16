import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Check, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FoodItem, MealType } from './nutritionTypes';
import { searchFoodsApi, createCustomFoodApi, logMealApi } from './nutritionApi';

interface FoodSearchModalProps {
  isOpen: boolean;
  initialMealType: MealType;
  selectedDate: string;
  onClose: () => void;
  onMealLogged: () => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  initialMealType,
  selectedDate,
  onClose,
  onMealLogged,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingQty, setServingQty] = useState<number>(100);

  // Custom food form state
  const [customName, setCustomName] = useState('');
  const [customServingSize, setCustomServingSize] = useState(100);
  const [customServingUnit, setCustomServingUnit] = useState('g');
  const [customCalories, setCustomCalories] = useState(150);
  const [customProtein, setCustomProtein] = useState(20);
  const [customCarbs, setCustomCarbs] = useState(10);
  const [customFat, setCustomFat] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMealType(initialMealType);
  }, [initialMealType]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await searchFoodsApi(searchQuery);
        if (isMounted) {
          setSearchResults(res.items);
          if (!selectedFood && res.items.length > 0) {
            setSelectedFood(res.items[0]);
            setServingQty(res.items[0].servingSize || 100);
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setServingQty(food.servingSize || 100);
  };

  // Macro calculation multiplier
  const baseServing = selectedFood?.servingSize || 100;
  const ratio = servingQty > 0 ? servingQty / baseServing : 1;

  const calcCalories = selectedFood ? Math.round(selectedFood.calories * ratio) : 0;
  const calcProtein = selectedFood ? Math.round(selectedFood.protein * ratio * 10) / 10 : 0;
  const calcCarbs = selectedFood ? Math.round(selectedFood.carbohydrates * ratio * 10) / 10 : 0;
  const calcFat = selectedFood ? Math.round(selectedFood.fat * ratio * 10) / 10 : 0;

  const handleLogFood = async () => {
    if (!selectedFood) return;
    setIsSubmitting(true);
    try {
      await logMealApi({
        mealType,
        loggedDate: selectedDate,
        items: [
          {
            foodId: selectedFood.id,
            name: selectedFood.name,
            servingQty,
            servingUnit: selectedFood.servingUnit || 'g',
            calories: calcCalories,
            protein: calcProtein,
            carbohydrates: calcCarbs,
            fat: calcFat,
          },
        ],
      });
      onMealLogged();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAndLogCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await createCustomFoodApi({
        name: customName.trim(),
        servingSize: customServingSize,
        servingUnit: customServingUnit,
        calories: customCalories,
        protein: customProtein,
        carbohydrates: customCarbs,
        fat: customFat,
      });

      await logMealApi({
        mealType,
        loggedDate: selectedDate,
        items: [
          {
            foodId: created.id,
            name: created.name,
            servingQty: customServingSize,
            servingUnit: customServingUnit,
            calories: customCalories,
            protein: customProtein,
            carbohydrates: customCarbs,
            fat: customFat,
          },
        ],
      });

      onMealLogged();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('nutrition.log_food_title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('nutrition.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Type Selector & Tabs */}
        <div className="p-5 pb-3 border-b border-slate-200 dark:border-slate-800/80 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">Meal:</span>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  mealType === type
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                activeTab === 'search'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('common.search')}
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                activeTab === 'custom'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('exercises.create_title', { defaultValue: 'Custom Food' })}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'search' ? (
            <>
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nutrition.search_food_ph')}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Food Items List */}
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    {t('common.loading')}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    {t('exercises.no_exercises', { defaultValue: 'No matching foods found.' })}
                  </div>
                ) : (
                  searchResults.map((food) => {
                    const isSelected = selectedFood?.id === food.id;
                    return (
                      <button
                        key={food.id}
                        onClick={() => handleSelectFood(food)}
                        className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-900 dark:text-white'
                            : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold">{food.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {food.brand ? `${food.brand} • ` : ''}
                            {food.calories} kcal per {food.servingSize}{food.servingUnit}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                            P: {food.protein}g
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            C: {food.carbohydrates}g • F: {food.fat}g
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Serving Size & Live Macro Calculator */}
              {selectedFood && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {t('nutrition.selected_food')}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedFood.name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Serving:</span>
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        value={servingQty}
                        onChange={(e) => setServingQty(Math.max(1, Number(e.target.value)))}
                        className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">{selectedFood.servingUnit || 'g'}</span>
                    </div>
                  </div>

                  {/* Calculated Macro Snapshot Pills */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                        {t('nutrition.calories')}
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{calcCalories}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">kcal</span>
                    </div>
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 block">
                        {t('nutrition.protein')}
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{calcProtein}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">g</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">
                        {t('nutrition.carbs')}
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{calcCarbs}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">g</span>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">
                        {t('nutrition.fat')}
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{calcFat}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">g</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogFood}
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSubmitting ? t('common.loading') : `Log to ${mealType.toUpperCase()}`}</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Custom Food Creation Form */
            <form onSubmit={handleCreateAndLogCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('nutrition.food_name')}
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Homemade Protein Pancake"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Serving Size</label>
                  <input
                    type="number"
                    min="1"
                    value={customServingSize}
                    onChange={(e) => setCustomServingSize(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={customServingUnit}
                    onChange={(e) => setCustomServingUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {t('nutrition.calories')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 mb-1">
                    {t('nutrition.protein')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-1">
                    {t('nutrition.carbs')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400 mb-1">
                    {t('nutrition.fat')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={customFat}
                    onChange={(e) => setCustomFat(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Save & Log to {mealType.toUpperCase()}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
