import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock, Zap, Target } from 'lucide-react';
import { RepDetail, ExerciseDiagnostics } from './exerciseStateMachines';

interface RepHistoryTableProps {
  repHistory: RepDetail[];
  diagnostics: ExerciseDiagnostics | null;
  targetReps: number;
}

export const RepHistoryTable: React.FC<RepHistoryTableProps> = ({
  repHistory,
  diagnostics,
  targetReps,
}) => {
  const { t } = useTranslation();

  if (repHistory.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
        <Target className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
        <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          {t('ai_form.no_reps_yet', 'Chưa có dữ liệu Rep')}
        </h4>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {t('ai_form.no_reps_desc', 'Bắt đầu bài tập để ghi nhận thông số chi tiết từng lần lặp')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Set Diagnostics Header Cards */}
      {diagnostics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
              {t('ai_form.clean_reps_ratio', 'Rep Chuẩn Form')}
            </span>
            <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
              {diagnostics.cleanReps} / {diagnostics.totalReps}
            </span>
            <span className="text-[10px] text-slate-400 block font-semibold">
              ({diagnostics.cleanPercentage}%)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
              {t('ai_form.avg_set_score', 'Điểm Trung Bình')}
            </span>
            <span className="text-lg font-black font-mono text-cyan-600 dark:text-cyan-400">
              {diagnostics.avgScore}%
            </span>
            <span className="text-[10px] text-slate-400 block font-semibold">
              {diagnostics.avgScore >= 90 ? 'Xuất sắc' : diagnostics.avgScore >= 78 ? 'Khá tốt' : 'Cần chú ý'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
              {t('ai_form.avg_tempo', 'Tempo Trung Bình')}
            </span>
            <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
              {diagnostics.avgDurationSec}s
            </span>
            <span className="text-[10px] text-slate-400 block font-semibold">mỗi rep</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
              {t('ai_form.target_progress', 'Tiến Độ')}
            </span>
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {diagnostics.totalReps} / {targetReps}
            </span>
            <span className="text-[10px] text-slate-400 block font-semibold">
              {Math.round((diagnostics.totalReps / targetReps) * 100)}% hoàn thành
            </span>
          </div>
        </div>
      )}

      {/* Depth & Form Trajectory Bar Chart */}
      <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('ai_form.rep_trajectory', 'Tiến Trình Điểm Form Qua Từng Rep')}</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {repHistory.length} reps logged
          </span>
        </div>

        <div className="h-14 flex items-end gap-1.5 pt-2">
          {repHistory.map((rep) => {
            const heightPercent = Math.max(15, rep.formScore);
            const barColor =
              rep.status === 'clean'
                ? 'bg-emerald-500'
                : rep.status === 'acceptable'
                ? 'bg-amber-500'
                : 'bg-rose-500';

            return (
              <div
                key={rep.repNumber}
                className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative cursor-pointer"
              >
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono py-0.5 px-1.5 rounded shadow-lg pointer-events-none z-30 whitespace-nowrap border border-slate-700">
                  Rep #{rep.repNumber}: {rep.formScore}% ({rep.minAngle}°)
                </div>

                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${barColor}`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[9px] font-mono font-bold text-slate-400 block">
                  #{rep.repNumber}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Rep Detailed List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {repHistory.slice().reverse().map((rep) => (
          <div
            key={rep.repNumber}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 shadow-xs hover:border-emerald-500/40 transition"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300">
                #{rep.repNumber}
              </span>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {rep.status === 'clean' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('ai_form.status_clean', 'Chuẩn Form')}
                      </span>
                    ) : rep.status === 'acceptable' ? (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {t('ai_form.status_acceptable', 'Tạm Ổn')}
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t('ai_form.status_warning', 'Cần Khắc Phục')}
                      </span>
                    )}
                  </span>

                  {rep.primaryFault && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium">
                      {rep.primaryFault}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 font-mono">
                  <span>Góc: <strong className="text-slate-700 dark:text-slate-300 font-bold">{rep.minAngle}°</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {rep.durationSec}s
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                {rep.formScore}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Score</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
