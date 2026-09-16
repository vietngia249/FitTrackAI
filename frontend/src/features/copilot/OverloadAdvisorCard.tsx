import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { ProgressiveOverloadTip, DeloadRecommendation } from './copilotTypes';

interface OverloadAdvisorCardProps {
  tips: ProgressiveOverloadTip[];
  deload: DeloadRecommendation;
  recoveryScore: number;
  onAskCopilot?: (initialQuery: string) => void;
}

export const OverloadAdvisorCard: React.FC<OverloadAdvisorCardProps> = ({
  tips,
  deload,
  recoveryScore,
  onAskCopilot,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Header with Recovery & Deload Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>{t('insights.overload_advisor', 'Progressive Overload Advisor')}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {t('copilot.deterministic_engine', 'Deterministic Engine')}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('copilot.heuristic_subtitle', 'Heuristic load increases based on completed sets at RPE ≤ 8')}
            </p>
          </div>
        </div>

        {/* Readiness Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">{t('copilot.recovery', 'Recovery')}:</span>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-300">{recoveryScore}%</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
              deload.needed
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {deload.needed ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>{t('copilot.deload_advised', 'Deload Advised')}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('copilot.load_phase_active', 'Load Phase Active')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Deload Alert if needed */}
      {deload.needed && (
        <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <span className="font-bold">{t('copilot.deload_week_recommended', 'Deload Week Recommended:')}</span>
            <p>{deload.reason}</p>
            <p className="text-amber-700 dark:text-amber-400">
              {t('copilot.reduce_volume_by', {
                percent: deload.recommendedVolumeReductionPercent,
                defaultValue: `Reduce working volume by ${deload.recommendedVolumeReductionPercent}% for active recovery.`,
              })}
            </p>
          </div>
        </div>
      )}

      {/* Grid of Progressive Overload Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tips.map((tip) => (
          <div
            key={tip.exerciseId}
            className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                  {tip.exerciseName}
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />+{tip.increaseKg} kg
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Current:</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {tip.currentWeightKg} kg
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">➔</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Target:</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
                  {tip.recommendedWeightKg} kg
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{tip.reason}</p>
            </div>

            {onAskCopilot && (
              <button
                onClick={() =>
                  onAskCopilot(`How should I prepare for my next ${tip.exerciseName} session?`)
                }
                className="w-full mt-2 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>{t('copilot.ask_gemini_strategy', 'Ask Gemini Strategy')}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
