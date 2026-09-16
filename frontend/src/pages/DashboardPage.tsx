import React, { useEffect, useState } from 'react';
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
  Clock,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAnalyticsOverview } from '../features/analytics/analyticsApi';
import { getDailyNutritionApi, getNutritionGoalsApi, DEFAULT_GOALS } from '../features/nutrition/nutritionApi';
import { fetchPlans } from '../features/workouts/workoutApi';
import { AnalyticsOverview } from '../features/analytics/analyticsTypes';
import { DailyNutritionGoals } from '../features/nutrition/nutritionTypes';
import { WorkoutPlan } from '../features/workouts/workoutTypes';
import { useAuth } from '../features/auth/AuthContext';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, accessToken } = useAuth();

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [caloriesConsumed, setCaloriesConsumed] = useState<number | null>(null);
  const [goals, setGoals] = useState<DailyNutritionGoals>(DEFAULT_GOALS);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loadingKpis, setLoadingKpis] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      fetchAnalyticsOverview(accessToken),
      getDailyNutritionApi(today),
      getNutritionGoalsApi(),
      fetchPlans(accessToken),
    ])
      .then(([ov, nutrition, g, p]) => {
        setOverview(ov);
        setCaloriesConsumed(nutrition.summary.calories);
        setGoals(g);
        setPlans(p);
      })
      .finally(() => setLoadingKpis(false));
  }, [accessToken]);

  const caloriePercent =
    caloriesConsumed !== null
      ? Math.min(Math.round((caloriesConsumed / goals.calorieTarget) * 100), 100)
      : null;

  const currentPlan = plans.length > 0 ? plans[0] : null;

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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('common.welcome_back')}, <span className="gradient-text">{user?.displayName || 'Athlete'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              {t('common.today_overview')}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/workouts"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('common.start_workout')}</span>
            </Link>
            <Link
              to="/nutrition"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-sm transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('common.log_meal')}</span>
            </Link>
            <Link
              to="/ai-form"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 font-semibold text-sm transition-all active:scale-95 cursor-pointer"
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
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {t('dashboard.weekly_volume')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {loadingKpis ? (
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
            ) : (
              <>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {overview ? overview.weeklyVolumeKg.toLocaleString() : '—'}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">kg</span>
              </>
            )}
          </div>
          {overview && (
            <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>{overview.totalCompletedSessions} {t('dashboard.sessions_logged', 'sessions logged')}</span>
            </div>
          )}
        </div>

        {/* Calories Today */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {t('dashboard.calories_today')}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {loadingKpis ? (
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
            ) : (
              <>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {caloriesConsumed !== null ? caloriesConsumed.toLocaleString() : '0'}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  / {goals.calorieTarget.toLocaleString()} kcal
                </span>
              </>
            )}
          </div>
          {caloriePercent !== null && (
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 dark:bg-amber-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Workout Streak */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {t('dashboard.streak')}
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {loadingKpis ? (
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
            ) : (
              <>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {overview?.streakDays ?? 0}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('dashboard.days')}</span>
              </>
            )}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span>{overview ? `${overview.totalCompletedSessions} ${t('dashboard.total_sessions', 'total sessions')}` : t('dashboard.start_streak', 'Start your streak!')}</span>
          </div>
        </div>

        {/* Form Score — static badge until AI form backend is built */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {t('dashboard.form_score')}
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">—</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Link to="/ai-form" className="text-teal-600 dark:text-teal-400 hover:underline">
              {t('dashboard.run_ai_form', 'Run AI Form Analysis →')}
            </Link>
          </div>
        </div>
      </div>

      {/* Split Grid: Today's Plan & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planned Routine / Next Up */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                {currentPlan ? `${t('dashboard.focus_today', "Today's Focus")}: ${currentPlan.name}` : `${t('dashboard.focus_today', "Today's Focus")}: Push Session A`}
              </h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
              {t('dashboard.planned', 'Planned')}
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
            {currentPlan && currentPlan.exercises.length > 0 ? (
              currentPlan.exercises.slice(0, 3).map((pe, idx) => (
                <div key={pe.id || idx} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{pe.exercise?.name || 'Exercise'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {pe.targetSets} sets × {pe.targetReps} reps {pe.notes ? `• ${pe.notes}` : ''}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{t('dashboard.rest', 'Rest')} {pe.restSeconds}s</span>
                </div>
              ))
            ) : (
              <>
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{t('dashboard.bench_press', 'Barbell Bench Press')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">4 sets × 6-8 reps • 85 kg target</p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{t('dashboard.rest', 'Rest')} 180s</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{t('dashboard.incline_press', 'Incline Dumbbell Press')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">3 sets × 8-10 reps • 30 kg target</p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{t('dashboard.rest', 'Rest')} 120s</span>
                </div>
              </>
            )}
          </div>

          <div className="pt-2">
            <Link
              to="/workouts"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold text-sm transition-all"
            >
              <span>{t('dashboard.launch_tracker', 'Launch Live Workout Tracker')}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* AI Insight Snapshot */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t('dashboard.ai_coaching_note', 'AI Coaching Note')}</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('dashboard.progressive_overload_trigger', 'Progressive Overload Trigger')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {overview
                ? t('dashboard.overload_note_desc', {
                    count: overview.totalCompletedSessions,
                    volume: overview.weeklyVolumeKg.toLocaleString(),
                    defaultValue: `You've logged ${overview.totalCompletedSessions} sessions totaling ${overview.weeklyVolumeKg.toLocaleString()} kg volume this week. Keep your progressive overload consistent!`,
                  })
                : t('dashboard.overload_empty_desc', 'Start logging workouts to receive personalized overload recommendations.')}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {t('dashboard.live_data', 'Live data')}
            </span>
            <Link to="/insights" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              {t('dashboard.view_all_insights', 'View all insights')}
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
