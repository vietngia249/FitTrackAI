import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

export const NutritionPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('nutrition.title')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {t('nutrition.subtitle')}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all">
          <Plus className="w-4 h-4" />
          <span>{t('nutrition.log_food')}</span>
        </button>
      </div>

      {/* Daily Macro Progress Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs font-semibold uppercase text-slate-400">Calories</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">1,850</span>
            <span className="text-xs text-slate-400">/ 2,400 kcal</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: '77%' }} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 block">550 kcal remaining</span>
        </div>

        {/* Protein */}
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs font-semibold uppercase text-slate-400">Protein</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">142</span>
            <span className="text-xs text-slate-400">/ 175 g</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: '81%' }} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 block">33 g remaining</span>
        </div>

        {/* Carbs */}
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs font-semibold uppercase text-slate-400">Carbohydrates</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">210</span>
            <span className="text-xs text-slate-400">/ 270 g</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: '78%' }} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 block">60 g remaining</span>
        </div>

        {/* Fat */}
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs font-semibold uppercase text-slate-400">Fat</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">52</span>
            <span className="text-xs text-slate-400">/ 65 g</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-rose-400 h-full rounded-full" style={{ width: '80%' }} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 block">13 g remaining</span>
        </div>
      </div>

      {/* Meals Log with Macro Snapshots */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg text-white">Today's Meals</h2>

        {/* Breakfast */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Breakfast</h3>
            <span className="text-xs text-slate-400 font-mono">620 kcal • P: 48g • C: 65g • F: 18g</span>
          </div>
          <div className="divide-y divide-slate-800/60 text-sm">
            <div className="py-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Rolled Oats with Whey & Berries</p>
                <p className="text-xs text-slate-400">1 bowl (120g) • Open Food Facts Verified</p>
              </div>
              <span className="text-xs text-slate-300 font-mono">450 kcal</span>
            </div>
            <div className="py-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Boiled Eggs</p>
                <p className="text-xs text-slate-400">2 large eggs</p>
              </div>
              <span className="text-xs text-slate-300 font-mono">170 kcal</span>
            </div>
          </div>
        </div>

        {/* Lunch */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Lunch</h3>
            <span className="text-xs text-slate-400 font-mono">750 kcal • P: 64g • C: 82g • F: 20g</span>
          </div>
          <div className="divide-y divide-slate-800/60 text-sm">
            <div className="py-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Grilled Chicken Breast & Jasmine Rice</p>
                <p className="text-xs text-slate-400">220g Chicken, 200g Rice, Steamed Broccoli</p>
              </div>
              <span className="text-xs text-slate-300 font-mono">750 kcal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
