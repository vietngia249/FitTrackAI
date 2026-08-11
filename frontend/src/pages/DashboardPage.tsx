import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  Flame,
  Zap,
  Award,
  Play,
  PlusCircle,
  Camera,
  ArrowUpRight,
  Calendar,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <SparkleIcon className="w-3.5 h-3.5" />
              <span>FitTrack AI v1.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('common.welcome_back')}, <span className="gradient-text">Athlete</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {t('common.today_overview')}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/workouts"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('common.start_workout')}</span>
            </Link>
            <Link
              to="/nutrition"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>{t('common.log_meal')}</span>
            </Link>
            <Link
              to="/ai-form"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-semibold text-sm transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>{t('common.check_form')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Volume */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {t('dashboard.weekly_volume')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">14,250</span>
            <span className="text-xs font-medium text-slate-400">kg</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>+8.4% vs last week</span>
          </div>
        </div>

        {/* Calories Today */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {t('dashboard.calories_today')}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">1,850</span>
            <span className="text-xs font-medium text-slate-400">/ 2,400 kcal</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: '77%' }} />
          </div>
        </div>

        {/* Workout Streak */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {t('dashboard.streak')}
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">5</span>
            <span className="text-xs font-medium text-slate-400">{t('dashboard.days')}</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-400">
            <span>Best streak: 14 days</span>
          </div>
        </div>

        {/* Recent Form Score */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {t('dashboard.form_score')}
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">92</span>
            <span className="text-xs font-medium text-slate-400">/ 100</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-cyan-400 font-medium">
            <span>Barbell Squat (Depth 95%)</span>
          </div>
        </div>
      </div>

      {/* Split Grid: Today's Plan & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planned Routine / Next Up */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-lg text-white">Today's Focus: Push Session A</h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Planned
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Barbell Bench Press</p>
                <p className="text-xs text-slate-400">4 sets × 6-8 reps • 85 kg target</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Rest 180s</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Incline Dumbbell Press</p>
                <p className="text-xs text-slate-400">3 sets × 8-10 reps • 30 kg target</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Rest 120s</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Dips / Triceps Extension</p>
                <p className="text-xs text-slate-400">3 sets × 12 reps • RPE 8.5</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Rest 90s</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/workouts"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-sm transition-all"
            >
              <span>Launch Live Workout Tracker</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* AI Insight Snapshot */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Coaching Note</span>
            </div>
            <h3 className="font-bold text-white text-base">Progressive Overload Trigger</h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Your estimated 1RM on Bench Press reached 105 kg last session. You are ready to increment working weight by +2.5 kg today.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Generated 2 hrs ago
            </span>
            <Link to="/insights" className="text-emerald-400 font-medium hover:underline">
              View all insights
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}
