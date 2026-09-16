import React, { useState } from 'react';
import { X, Dumbbell, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WorkoutPlan } from './workoutTypes';
import { createPlan } from './workoutApi';
import { useAuth } from '../auth/AuthContext';
import { CURATED_FALLBACK_EXERCISES } from '../exercises/exerciseApi';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newPlan: WorkoutPlan) => void;
}

export const CreatePlanModal: React.FC<CreatePlanModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetMuscles, setTargetMuscles] = useState('chest, triceps');
  const [selectedExercises, setSelectedExercises] = useState<
    Array<{ exerciseId: string; targetSets: number; targetReps: number; restSeconds: number }>
  >([
    { exerciseId: 'barbell-bench-press', targetSets: 4, targetReps: 8, restSeconds: 120 },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddExercise = (exerciseId: string) => {
    setSelectedExercises((prev) => [
      ...prev,
      { exerciseId, targetSets: 3, targetReps: 10, restSeconds: 90 },
    ]);
  };

  const handleRemoveExercise = (idx: number) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateSet = (idx: number, sets: number) => {
    setSelectedExercises((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, targetSets: Math.max(1, sets) } : e))
    );
  };

  const handleUpdateReps = (idx: number, reps: number) => {
    setSelectedExercises((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, targetReps: Math.max(1, reps) } : e))
    );
  };

  const handleUpdateRest = (idx: number, rest: number) => {
    setSelectedExercises((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, restSeconds: Math.max(15, rest) } : e))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const tags = targetMuscles
        .split(',')
        .map((m) => m.trim().toLowerCase())
        .filter(Boolean);

      const newPlan = await createPlan(
        {
          name: name.trim(),
          description: description.trim() || undefined,
          targetMuscles: tags,
          exercises: selectedExercises.map((e, order) => ({
            exerciseId: e.exerciseId,
            order: order,
            targetSets: e.targetSets,
            targetReps: e.targetReps,
            restSeconds: e.restSeconds,
          })),
        },
        accessToken || undefined
      );

      onCreated(newPlan);
      onClose();
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('workouts.create_routine_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('workouts.create_routine_subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Routine Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('workouts.routine_name_ph')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('workouts.routine_desc_ph')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Muscles (comma-separated)
            </label>
            <input
              type="text"
              value={targetMuscles}
              onChange={(e) => setTargetMuscles(e.target.value)}
              placeholder={t('workouts.routine_tags_ph')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Exercises & Prescription ({selectedExercises.length})
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddExercise(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 rounded-lg px-2 py-1 outline-none font-semibold cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>
                  + Add Exercise...
                </option>
                {CURATED_FALLBACK_EXERCISES.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.primaryMuscles?.[0] || 'Muscle'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {selectedExercises.map((ex, idx) => {
                const meta = CURATED_FALLBACK_EXERCISES.find((e) => e.id === ex.exerciseId);
                return (
                  <div
                    key={`${ex.exerciseId}-${idx}`}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                        {idx + 1}. {meta?.name || ex.exerciseId}
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {meta?.primaryMuscles?.[0] || 'Muscle'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 text-[10px]">Sets</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={ex.targetSets}
                          onChange={(e) => handleUpdateSet(idx, Number(e.target.value))}
                          className="w-12 px-1.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold text-slate-800 dark:text-slate-200"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 text-[10px]">Reps</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={ex.targetReps}
                          onChange={(e) => handleUpdateReps(idx, Number(e.target.value))}
                          className="w-12 px-1.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold text-slate-800 dark:text-slate-200"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 text-[10px]">Rest(s)</span>
                        <input
                          type="number"
                          min="15"
                          step="15"
                          max="600"
                          value={ex.restSeconds}
                          onChange={(e) => handleUpdateRest(idx, Number(e.target.value))}
                          className="w-14 px-1.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold text-slate-800 dark:text-slate-200"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedExercises.length === 0}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Save Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
