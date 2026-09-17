import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Utensils, X, Check, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { MealFoodItem } from './nutritionTypes';
import { updateMealItemApi } from './nutritionApi';

interface EditMealItemModalProps {
  isOpen: boolean;
  item: MealFoodItem | null;
  onClose: () => void;
  onItemUpdated: () => void;
}

export const EditMealItemModal: React.FC<EditMealItemModalProps> = ({
  isOpen,
  item,
  onClose,
  onItemUpdated,
}) => {
  const { t } = useTranslation();

  const [servingQty, setServingQty] = useState<number>(100);
  const [servingUnit, setServingUnit] = useState<string>('g');
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);

  const [isCustomMacros, setIsCustomMacros] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state when item changes
  useEffect(() => {
    if (item) {
      setServingQty(item.servingQty);
      setServingUnit(item.servingUnit || 'g');
      setCalories(item.calories);
      setProtein(item.protein);
      setCarbs(item.carbohydrates);
      setFat(item.fat);
      setIsCustomMacros(false);
      setErrorMsg(null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleQtyChange = (newQty: number) => {
    const validQty = Math.max(0.1, Math.round(newQty * 10) / 10);
    setServingQty(validQty);

    if (!isCustomMacros && item.servingQty > 0) {
      const ratio = validQty / item.servingQty;
      setCalories(Math.round(item.calories * ratio * 10) / 10);
      setProtein(Math.round(item.protein * ratio * 10) / 10);
      setCarbs(Math.round(item.carbohydrates * ratio * 10) / 10);
      setFat(Math.round(item.fat * ratio * 10) / 10);
    }
  };

  const handleResetToOriginal = () => {
    setServingQty(item.servingQty);
    setServingUnit(item.servingUnit || 'g');
    setCalories(item.calories);
    setProtein(item.protein);
    setCarbs(item.carbohydrates);
    setFat(item.fat);
    setIsCustomMacros(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (servingQty <= 0) {
      setErrorMsg(t('nutrition.invalid_qty', 'Serving quantity must be greater than 0'));
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await updateMealItemApi(item.id, {
        servingQty,
        servingUnit,
        calories,
        protein,
        carbohydrates: carbs,
        fat,
      });

      if (res) {
        onItemUpdated();
        onClose();
      } else {
        setErrorMsg(t('common.error', 'Failed to update item'));
      }
    } catch {
      setErrorMsg(t('common.error', 'An error occurred'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('nutrition.edit_item_title', 'Edit Food Item')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900">
              {errorMsg}
            </div>
          )}

          {/* Food Overview banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {item.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('nutrition.original_log', 'Logged')}: {item.servingQty} {item.servingUnit} ({Math.round(item.calories)} kcal)
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetToOriginal}
              className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              title={t('common.reset', 'Reset to original')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('common.reset', 'Reset')}</span>
            </button>
          </div>

          {/* Serving Quantity & Unit Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('nutrition.serving_qty', 'Serving Quantity & Unit')}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={servingQty}
                onChange={(e) => handleQtyChange(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                placeholder="g, ml, serving..."
                className="w-24 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick Step Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '-50', delta: -50 },
                { label: '-10', delta: -10 },
                { label: '+10', delta: 10 },
                { label: '+50', delta: 50 },
              ].map((step) => (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => handleQtyChange(servingQty + step.delta)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 transition-colors cursor-pointer"
                >
                  {step.label} {servingUnit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleQtyChange(Math.round(servingQty * 1.5 * 10) / 10)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 transition-colors cursor-pointer"
              >
                ×1.5
              </button>
              <button
                type="button"
                onClick={() => handleQtyChange(Math.round(servingQty * 2 * 10) / 10)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 transition-colors cursor-pointer"
              >
                ×2
              </button>
            </div>
          </div>

          {/* Macro Breakdown Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('nutrition.recalculated_macros', 'Recalculated Nutrients')}
              </span>
              <button
                type="button"
                onClick={() => setIsCustomMacros((prev) => !prev)}
                className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>
                  {isCustomMacros
                    ? t('nutrition.auto_scale_macros', 'Switch to auto-scale')
                    : t('nutrition.manual_override', 'Custom override')}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {t('nutrition.calories', 'Calories')}
                </span>
                {isCustomMacros ? (
                  <input
                    type="number"
                    step="any"
                    value={calories}
                    onChange={(e) => setCalories(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-2 py-1 text-base font-bold bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-lg text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {Math.round(calories)} <span className="text-xs font-normal text-slate-500">kcal</span>
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                  {t('nutrition.protein', 'Protein')}
                </span>
                {isCustomMacros ? (
                  <input
                    type="number"
                    step="any"
                    value={protein}
                    onChange={(e) => setProtein(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-2 py-1 text-base font-bold bg-white dark:bg-slate-900 border border-cyan-500/30 rounded-lg text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {Math.round(protein * 10) / 10} <span className="text-xs font-normal text-slate-500">g</span>
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  {t('nutrition.carbs', 'Carbs')}
                </span>
                {isCustomMacros ? (
                  <input
                    type="number"
                    step="any"
                    value={carbs}
                    onChange={(e) => setCarbs(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-2 py-1 text-base font-bold bg-white dark:bg-slate-900 border border-amber-500/30 rounded-lg text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {Math.round(carbs * 10) / 10} <span className="text-xs font-normal text-slate-500">g</span>
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-xs font-medium text-rose-700 dark:text-rose-300">
                  {t('nutrition.fat', 'Fat')}
                </span>
                {isCustomMacros ? (
                  <input
                    type="number"
                    step="any"
                    value={fat}
                    onChange={(e) => setFat(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-2 py-1 text-base font-bold bg-white dark:bg-slate-900 border border-rose-500/30 rounded-lg text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {Math.round(fat * 10) / 10} <span className="text-xs font-normal text-slate-500">g</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white keep-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
