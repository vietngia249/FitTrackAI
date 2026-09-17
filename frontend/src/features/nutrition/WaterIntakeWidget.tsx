import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplet, RotateCcw, Plus, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.js';

interface WaterIntakeWidgetProps {
  targetMl?: number;
  className?: string;
  compact?: boolean;
}

export const WaterIntakeWidget: React.FC<WaterIntakeWidgetProps> = ({
  targetMl = 2500,
  className = '',
  compact = false,
}) => {
  const { t } = useTranslation();
  const { success, info } = useToast();

  const getTodayDateString = () => new Date().toISOString().slice(0, 10);

  const [intake, setIntake] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`fittrack_water_${getTodayDateString()}`);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const saveIntake = (amount: number) => {
    setIntake(amount);
    try {
      localStorage.setItem(`fittrack_water_${getTodayDateString()}`, amount.toString());
    } catch {
      // Ignore
    }
  };

  const handleAddWater = (amount: number) => {
    const updated = intake + amount;
    saveIntake(updated);
    success(t('toast.water_logged', { amount }));
  };

  const handleReset = () => {
    saveIntake(0);
    info(t('toast.water_reset'));
  };

  const percentage = Math.min(Math.round((intake / targetMl) * 100), 100);
  const isGoalReached = intake >= targetMl;

  // SVG Circular progress math
  const radius = compact ? 36 : 46;
  const stroke = compact ? 6 : 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${className}`}
    >
      {/* Background subtle glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Droplet className="w-5 h-5 fill-cyan-500/20" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {t('water.title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('water.daily_goal')}: <span className="font-semibold text-slate-700 dark:text-slate-300">{targetMl} ml</span>
            </p>
          </div>
        </div>

        {intake > 0 && (
          <button
            onClick={handleReset}
            title={t('water.reset')}
            aria-label={t('water.reset')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-5 my-2">
        {/* Circular Progress Ring */}
        <div className="relative shrink-0 flex items-center justify-center">
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
              stroke="url(#water-gradient)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-500 ease-out"
            />
            <defs>
              <linearGradient id="water-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Stats details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {intake}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              / {targetMl} ml
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isGoalReached ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('water.goal_achieved')}
              </span>
            ) : (
              <span>
                {t('water.remaining')}: <strong className="text-slate-700 dark:text-slate-300">{Math.max(0, targetMl - intake)} ml</strong>
              </span>
            )}
          </p>

          {/* Quick Add Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {[200, 350, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => handleAddWater(amt)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition-colors flex items-center gap-1 shadow-2xs active:scale-95"
              >
                <Plus className="w-3 h-3" />
                {amt} ml
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
