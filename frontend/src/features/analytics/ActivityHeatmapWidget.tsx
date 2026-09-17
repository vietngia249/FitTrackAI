import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, Flame } from 'lucide-react';
import { WorkoutSession } from '../workouts/workoutTypes.js';

interface ActivityHeatmapWidgetProps {
  sessions?: WorkoutSession[];
  streakDays?: number;
  className?: string;
}

interface DayData {
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Sun, 1 = Mon ...
  volumeKg: number;
  sessionCount: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

export const ActivityHeatmapWidget: React.FC<ActivityHeatmapWidgetProps> = ({
  sessions = [],
  streakDays = 0,
  className = '',
}) => {
  const { t } = useTranslation();
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Generate 12 weeks (84 days) grid ending today
  const { weeks, totalActiveDays, totalVolume } = useMemo(() => {
    // Map existing sessions by YYYY-MM-DD
    const volumeByDate = new Map<string, { volume: number; count: number }>();
    let allVol = 0;

    for (const s of sessions) {
      if (s.status !== 'completed') continue;
      const dStr = (s.startedAt || '').split('T')[0];
      if (!dStr) continue;
      const curr = volumeByDate.get(dStr) || { volume: 0, count: 0 };
      const vol = s.totalVolumeKg || 0;
      curr.volume += vol;
      curr.count += 1;
      allVol += vol;
      volumeByDate.set(dStr, curr);
    }

    const today = new Date();
    // Align grid so last column ends on Saturday or today
    const totalDays = 12 * 7; // 84 days
    const days: DayData[] = [];
    let activeDaysCount = 0;

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = volumeByDate.get(dateStr);
      const vol = match ? Math.round(match.volume) : 0;
      const count = match ? match.count : 0;

      if (vol > 0 || count > 0) {
        activeDaysCount++;
      }

      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (vol > 10000) intensity = 4;
      else if (vol > 5000) intensity = 3;
      else if (vol > 2000) intensity = 2;
      else if (vol > 0 || count > 0) intensity = 1;

      days.push({
        dateStr,
        dayOfWeek: d.getDay(),
        volumeKg: vol,
        sessionCount: count,
        intensity,
      });
    }

    // Chunk into 12 weeks of 7 days
    const weekChunks: DayData[][] = [];
    for (let w = 0; w < 12; w++) {
      weekChunks.push(days.slice(w * 7, (w + 1) * 7));
    }

    return {
      weeks: weekChunks,
      totalActiveDays: activeDaysCount,
      totalVolume: Math.round(allVol),
    };
  }, [sessions]);

  const getIntensityClass = (level: 0 | 1 | 2 | 3 | 4) => {
    switch (level) {
      case 1:
        return 'bg-emerald-500/30 border-emerald-500/40 hover:ring-2 hover:ring-emerald-400';
      case 2:
        return 'bg-emerald-500/60 border-emerald-500/70 hover:ring-2 hover:ring-emerald-400';
      case 3:
        return 'bg-emerald-500 border-emerald-400 hover:ring-2 hover:ring-emerald-300';
      case 4:
        return 'bg-emerald-400 border-emerald-300 shadow-xs shadow-emerald-500/50 hover:ring-2 hover:ring-white';
      case 0:
      default:
        return 'bg-slate-100 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500';
    }
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-sm relative overflow-hidden ${className}`}
    >
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {t('heatmap.title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('heatmap.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span className="text-slate-400">{t('heatmap.active_days')}:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{totalActiveDays}</span>
          </div>

          {streakDays > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-rose-500/20" />
              <span>{streakDays} {t('dashboard.days')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="min-w-[480px]">
          {/* Day rows grid */}
          <div className="flex gap-2">
            {/* Day of week labels */}
            <div className="flex flex-col justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500 pr-1 py-0.5 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>

            {/* Weeks columns */}
            <div className="flex-1 flex gap-1.5 justify-between">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm border transition-all cursor-pointer ${getIntensityClass(
                        day.intensity
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Tooltip & Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            {/* Tooltip text */}
            <div className="min-h-[20px] font-medium">
              {hoveredDay ? (
                hoveredDay.volumeKg > 0 ? (
                  <span className="text-slate-800 dark:text-slate-200">
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {hoveredDay.volumeKg.toLocaleString()} kg
                    </strong>{' '}
                    ({hoveredDay.sessionCount} workout{hoveredDay.sessionCount > 1 ? 's' : ''}) on{' '}
                    <span className="font-semibold">{hoveredDay.dateStr}</span>
                  </span>
                ) : (
                  <span>
                    {t('heatmap.no_activity')} on {hoveredDay.dateStr}
                  </span>
                )
              ) : (
                <span>
                  {totalVolume > 0
                    ? `${totalVolume.toLocaleString()} kg volume recorded in this period`
                    : t('dashboard.start_streak')}
                </span>
              )}
            </div>

            {/* Intensity scale legend */}
            <div className="flex items-center gap-1.5 select-none text-[11px]">
              <span>{t('heatmap.less')}</span>
              <span className="w-3 h-3 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              <span className="w-3 h-3 rounded-xs bg-emerald-500/30 border border-emerald-500/40" />
              <span className="w-3 h-3 rounded-xs bg-emerald-500/60 border border-emerald-500/70" />
              <span className="w-3 h-3 rounded-xs bg-emerald-500 border border-emerald-400" />
              <span className="w-3 h-3 rounded-xs bg-emerald-400 border border-emerald-300 shadow-2xs" />
              <span>{t('heatmap.more')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
