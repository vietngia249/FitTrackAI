import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Flame,
  Calendar,
  Layers,
  Scale,
  Ruler,
  Plus,
  Trophy,
} from 'lucide-react';
import { fetchAnalyticsOverview } from '../features/analytics/analyticsApi';
import { AnalyticsOverview } from '../features/analytics/analyticsTypes';
import { OneRepMaxProgressionChart } from '../features/analytics/OneRepMaxProgressionChart';
import { MuscleVolumePieChart } from '../features/analytics/MuscleVolumePieChart';
import { PersonalRecordsShowcase } from '../features/analytics/PersonalRecordsShowcase';
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
          <div className="bg-[#0e131f]/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold">Weekly Volume</span>
              <h4 className="text-xl font-black text-white mt-0.5">
                {overview.weeklyVolumeKg.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span>
              </h4>
            </div>
          </div>

          <div className="bg-[#0e131f]/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold">Monthly Volume</span>
              <h4 className="text-xl font-black text-white mt-0.5">
                {(overview.monthlyVolumeKg / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">kg</span>
              </h4>
            </div>
          </div>

          <div className="bg-[#0e131f]/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold">Completed Workouts</span>
              <h4 className="text-xl font-black text-white mt-0.5">
                {overview.totalCompletedSessions} <span className="text-xs font-normal text-slate-400">sessions</span>
              </h4>
            </div>
          </div>

          <div className="bg-[#0e131f]/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold">Active Streak</span>
              <h4 className="text-xl font-black text-white mt-0.5">
                {overview.streakDays} <span className="text-xs font-normal text-slate-400">days</span>
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

      {/* Body Measurements & Weight Trend Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* 7-Day Weight Moving Average */}
        <div className="bg-[#0e131f]/90 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">7-Day Weight Moving Average</h3>
                <p className="text-xs text-slate-400">Filtered water retention fluctuation</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white font-mono">75.4</span>
              <span className="text-xs text-slate-400 ml-1">kg</span>
              <p className="text-[11px] text-emerald-400 font-semibold">-0.3 kg this week</p>
            </div>
          </div>

          <div className="h-36 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-center p-4">
            <div className="flex items-end justify-between w-full h-full gap-2 px-2">
              {[76.1, 75.8, 75.9, 75.6, 75.7, 75.5, 75.4].map((w, idx) => {
                const heightPercent = ((w - 74) / 3) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">{w}</span>
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-emerald-600 to-teal-400 opacity-80 hover:opacity-100 transition-opacity"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] text-slate-500">D{idx + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body Measurements Tape Tracker */}
        <div className="bg-[#0e131f]/90 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Ruler className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Body Tape Measurements</h3>
                <p className="text-xs text-slate-400">Canonical metric cm measurements</p>
              </div>
            </div>
            <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer">
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Update</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { label: 'Chest', value: '104.5 cm', change: '+1.5 cm' },
              { label: 'Waist', value: '81.0 cm', change: '-2.0 cm' },
              { label: 'Arms (Flexed)', value: '38.5 cm', change: '+0.8 cm' },
              { label: 'Thighs', value: '60.2 cm', change: '+1.2 cm' },
            ].map((m) => (
              <div key={m.label} className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400">{m.label}</span>
                <p className="text-base font-black text-white mt-0.5">{m.value}</p>
                <span className="text-[11px] text-emerald-400 font-semibold">{m.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
