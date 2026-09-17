import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MacroRingsDashboardProps {
  calories: number;
  calorieTarget: number;
  protein: number;
  proteinTarget: number;
  carbs: number;
  carbsTarget: number;
  fat: number;
  fatTarget: number;
  className?: string;
}

interface MiniRingProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  gradientId: string;
  fromColor: string;
  toColor: string;
}

const MiniRing: React.FC<MiniRingProps> = ({
  label,
  value,
  target,
  unit,
  gradientId,
  fromColor,
  toColor,
}) => {
  const percentage = target > 0 ? Math.min(Math.round((value / target) * 100), 100) : 0;
  const radius = 32;
  const stroke = 5.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-slate-100 dark:text-slate-800"
          />
          <circle
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fromColor} />
              <stop offset="100%" stopColor={toColor} />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute text-[11px] font-extrabold text-slate-900 dark:text-white">
          {percentage}%
        </span>
      </div>

      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5">{label}</span>
      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
        {Math.round(value)}/{target}{unit}
      </span>
    </div>
  );
};

export const MacroRingsDashboard: React.FC<MacroRingsDashboardProps> = ({
  calories,
  calorieTarget,
  protein,
  proteinTarget,
  carbs,
  carbsTarget,
  fat,
  fatTarget,
  className = '',
}) => {
  const { t } = useTranslation();

  const caloriePercent = calorieTarget > 0 ? Math.min(Math.round((calories / calorieTarget) * 100), 100) : 0;

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {t('macro_rings.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('macro_rings.subtitle')}
              </p>
            </div>
          </div>

          <Link
            to="/nutrition"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t('common.details')} →
          </Link>
        </div>

        {/* 3 Donut Rings (Protein, Carbs, Fat) */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <MiniRing
            label={t('macro_rings.protein')}
            value={protein}
            target={proteinTarget}
            unit="g"
            color="emerald"
            gradientId="protein-grad"
            fromColor="#10b981"
            toColor="#14b8a6"
          />
          <MiniRing
            label={t('macro_rings.carbs')}
            value={carbs}
            target={carbsTarget}
            unit="g"
            color="amber"
            gradientId="carbs-grad"
            fromColor="#f59e0b"
            toColor="#f97316"
          />
          <MiniRing
            label={t('macro_rings.fat')}
            value={fat}
            target={fatTarget}
            unit="g"
            color="rose"
            gradientId="fat-grad"
            fromColor="#f43f5e"
            toColor="#ec4899"
          />
        </div>
      </div>

      {/* Calorie Bar at Bottom */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-medium mb-1.5">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{t('macro_rings.calories')}:</span>
            <strong className="text-slate-900 dark:text-white font-bold">
              {calories.toLocaleString()}
            </strong>
            <span>/ {calorieTarget.toLocaleString()} kcal</span>
          </span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
            {caloriePercent}%
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${caloriePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
