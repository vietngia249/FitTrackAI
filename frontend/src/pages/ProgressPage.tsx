import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Flame,
  Calendar,
  Layers,
  Trophy,
} from 'lucide-react';
import { fetchAnalyticsOverview } from '../features/analytics/analyticsApi';
import { AnalyticsOverview } from '../features/analytics/analyticsTypes';
import { OneRepMaxProgressionChart } from '../features/analytics/OneRepMaxProgressionChart';
import { MuscleVolumePieChart } from '../features/analytics/MuscleVolumePieChart';
import { PersonalRecordsShowcase } from '../features/analytics/PersonalRecordsShowcase';
import { WeightTrendChart } from '../features/body/WeightTrendChart';
import { BodyMeasurementsSection } from '../features/body/BodyMeasurementsSection';
import { ProgressPhotosSection } from '../features/body/ProgressPhotosSection';
import { useAuth } from '../features/auth/AuthContext';

export const ProgressPage: React.FC = () => {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    fetchAnalyticsOverview(accessToken).then(setOverview);
  }, [accessToken]);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-slate-800/80 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Performance Analytics & 1RM Overload</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t('progress.title')}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t('progress.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0e131f]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">{t('progress.weekly_vol')}</span>
              <h4 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {overview.weeklyVolumeKg.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span>
              </h4>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0e131f]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">{t('progress.monthly_vol')}</span>
              <h4 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {(overview.monthlyVolumeKg / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">kg</span>
              </h4>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0e131f]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">{t('progress.completed_workouts')}</span>
              <h4 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {overview.totalCompletedSessions} <span className="text-xs font-normal text-slate-400">sessions</span>
              </h4>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0e131f]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">{t('progress.active_streak')}</span>
              <h4 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {overview.streakDays} <span className="text-xs font-normal text-slate-400">{t('dashboard.days')}</span>
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OneRepMaxProgressionChart initialExerciseId="barbell-bench-press" />
        </div>
        <div className="lg:col-span-1">
          {overview && (
            <MuscleVolumePieChart distribution={overview.muscleDistribution} />
          )}
        </div>
      </div>

      {/* Personal Records Showcase */}
      <PersonalRecordsShowcase />

      {/* Body Progress: 7-Day Moving Avg & Measurements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <WeightTrendChart />
        <BodyMeasurementsSection />
      </div>

      {/* Private Progress Photos Visual Timeline */}
      <ProgressPhotosSection />
    </div>
  );
};
