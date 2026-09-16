import React from 'react';
import { useTranslation } from 'react-i18next';

interface MacroCardProps {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: 'emerald' | 'cyan' | 'amber' | 'rose';
}

const colorStyles = {
  emerald: {
    bg: 'bg-emerald-500 dark:bg-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/10',
  },
  cyan: {
    bg: 'bg-cyan-500 dark:bg-cyan-400',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/30',
    glow: 'shadow-cyan-500/10',
  },
  amber: {
    bg: 'bg-amber-500 dark:bg-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/10',
  },
  rose: {
    bg: 'bg-rose-500 dark:bg-rose-400',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/10',
  },
};

export const MacroCard: React.FC<MacroCardProps> = ({
  label,
  consumed,
  target,
  unit,
  color,
}) => {
  const { t } = useTranslation();
  const percent = target > 0 ? Math.min(Math.round((consumed / target) * 100), 100) : 0;
  const remaining = Math.max(target - consumed, 0);
  const style = colorStyles[color];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className={`text-xs font-mono font-bold ${style.text}`}>
          {percent}%
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {consumed.toLocaleString()}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          / {target.toLocaleString()} {unit}
        </span>
      </div>

      <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden">
        <div
          className={`${style.bg} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>
          {remaining > 0
            ? `${Math.round(remaining)} ${unit} ${t('nutrition.remaining', 'remaining')}`
            : t('nutrition.target_reached', 'Target reached!')}
        </span>
      </div>
    </div>
  );
};
