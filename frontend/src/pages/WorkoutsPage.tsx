import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Play,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Trophy,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WorkoutPlan, WorkoutSession } from '../features/workouts/workoutTypes';
import {
  fetchPlans,
  startSessionApi,
  getLocalActiveSession,
  saveLocalActiveSession,
  fetchSessionsHistory,
} from '../features/workouts/workoutApi';
import { ActiveWorkoutSession } from '../features/workouts/ActiveWorkoutSession';
import { CreatePlanModal } from '../features/workouts/CreatePlanModal';
import { useAuth } from '../features/auth/AuthContext';

export const WorkoutsPage: React.FC = () => {
  const { t } = useTranslation();
  const { accessToken } = useAuth();

  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [activeTab, setActiveTab] = useState<'routines' | 'history'>('routines');
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);

  // Restore cached active session or history
  useEffect(() => {
    const cached = getLocalActiveSession();
    if (cached && cached.status === 'in_progress') {
      setActiveSession(cached);
    }

    fetchPlans(accessToken).then(setPlans);
    fetchSessionsHistory(accessToken).then(setHistory);
  }, [accessToken]);

  const handleStartQuickWorkout = async () => {
    const newSession = await startSessionApi({ name: 'Quick Training Session' }, accessToken);
    setActiveSession(newSession);
  };

  const handleStartRoutine = async (plan: WorkoutPlan) => {
    const newSession = await startSessionApi(
      { planId: plan.id, name: plan.name },
      accessToken
    );
    setActiveSession(newSession);
  };

  const handleSessionFinished = (completed: WorkoutSession) => {
    setActiveSession(null);
    saveLocalActiveSession(null);
    setHistory((prev) => [completed, ...prev]);
    setActiveTab('history');
  };

  const handleSessionCancelled = () => {
    if (window.confirm(t('workouts.discard_confirm', 'Are you sure you want to discard this workout?'))) {
      setActiveSession(null);
      saveLocalActiveSession(null);
    }
  };

  const handlePlanCreated = (newPlan: WorkoutPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
  };

  // If a workout is currently active, render the dedicated live tracking experience
  if (activeSession) {
    return (
      <ActiveWorkoutSession
        session={activeSession}
        onFinish={handleSessionFinished}
        onCancel={handleSessionCancelled}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/10 via-slate-100 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm dark:shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 text-xs font-semibold">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Progressive Overload & Live Sets</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('workouts.title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {t('workouts.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCreatePlanOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-sm transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('workouts.new_plan')}</span>
            </button>
            <button
              onClick={handleStartQuickWorkout}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer keep-white active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('workouts.start_empty')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('routines')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'routines'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('workouts.my_routines', 'My Routines')} ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t('workouts.workout_history', 'Workout History')} ({history.length})</span>
        </button>
      </div>

      {/* Tab 1: Routines */}
      {activeTab === 'routines' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-[#0e131f]/90 hover:bg-slate-50 dark:hover:bg-[#13192a] border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    {t('workouts.template', 'Template')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {plan.exercises.length} {t('workouts.movements', 'movements')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                  {plan.description || 'Targeted hypertrophy & progressive overload routine'}
                </p>

                {/* Target Muscle Pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {plan.targetMuscles.map((muscle) => (
                    <span
                      key={muscle}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md capitalize"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>

                {/* Exercise list preview */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/60 mb-5">
                  {plan.exercises.slice(0, 3).map((pe, idx) => (
                    <div
                      key={pe.id || idx}
                      className="text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between"
                    >
                      <span className="truncate pr-2">{pe.exercise.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] shrink-0">
                        {pe.targetSets}×{pe.targetReps}
                      </span>
                    </div>
                  ))}
                  {plan.exercises.length > 3 && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                      +{plan.exercises.length - 3} {t('workouts.more_exercises', 'more exercises')}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleStartRoutine(plan)}
                className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t('workouts.start_routine')}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Workout History */}
      {activeTab === 'history' && (
        <div>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((sessionItem) => (
                <div
                  key={sessionItem.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0e131f]/90 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{sessionItem.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>{new Date(sessionItem.startedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {Math.floor(sessionItem.durationSeconds / 60)} mins
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                          <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          {sessionItem.totalVolumeKg.toLocaleString()} kg
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 capitalize">
                      {sessionItem.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0e131f] border border-slate-200/80 dark:border-slate-800/80 max-w-md mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">{t('workouts.no_completed')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
                Start an empty workout or select one of the starter routine templates to begin!
              </p>
              <button
                onClick={handleStartQuickWorkout}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition cursor-pointer keep-white active:scale-95 shadow"
              >
                {t('workouts.start_empty')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Routine Modal */}
      <CreatePlanModal
        isOpen={isCreatePlanOpen}
        onClose={() => setIsCreatePlanOpen(false)}
        onCreated={handlePlanCreated}
      />
    </div>
  );
};
