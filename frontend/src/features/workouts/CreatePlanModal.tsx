import React, { useState } from 'react';
import { X, Dumbbell, Trash2 } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const muscles = targetMuscles.split(',').map((m) => m.trim().toLowerCase()).filter(Boolean);

    try {
      if (accessToken) {
        const created = await createPlan(
          {
            name: name.trim(),
            description: description.trim() || undefined,
            targetMuscles: muscles,
            exercises: selectedExercises.map((e, idx) => ({
              exerciseId: e.exerciseId,
              order: idx,
              targetSets: e.targetSets,
              targetReps: e.targetReps,
              restSeconds: e.restSeconds,
            })),
          },
          accessToken
        );
        onCreated(created);
      } else {
        // Local plan instance
        const newPlan: WorkoutPlan = {
          id: `local-plan-${Date.now()}`,
          userId: 'guest',
          name: name.trim(),
          description: description.trim() || null,
          targetMuscles: muscles,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          exercises: selectedExercises.map((se, idx) => ({
            id: `lpe-${idx}-${Date.now()}`,
            planId: `local-plan-${Date.now()}`,
            exerciseId: se.exerciseId,
            order: idx,
            targetSets: se.targetSets,
            targetReps: se.targetReps,
            restSeconds: se.restSeconds,
            exercise:
              CURATED_FALLBACK_EXERCISES.find((e) => e.id === se.exerciseId) ||
              CURATED_FALLBACK_EXERCISES[0],
          })),
        };
        onCreated(newPlan);
      }
      onClose();
    } catch {
      // Graceful local plan
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0e131f] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Workout Routine</h3>
              <p className="text-xs text-slate-400">Design your progressive overload plan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Routine Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Upper Body Hypertrophy"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Focus on chest stretch and shoulder volume"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Muscles (comma-separated)
            </label>
            <input
              type="text"
              value={targetMuscles}
              onChange={(e) => setTargetMuscles(e.target.value)}
              placeholder="e.g. chest, triceps, shoulders"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Planned Movements ({selectedExercises.length})
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddExercise(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-emerald-400 font-semibold outline-none"
              >
                <option value="">+ Add Exercise...</option>
                {CURATED_FALLBACK_EXERCISES.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {selectedExercises.map((se, idx) => {
                const ex = CURATED_FALLBACK_EXERCISES.find((e) => e.id === se.exerciseId);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <h5 className="font-bold text-slate-200">{ex?.name || se.exerciseId}</h5>
                      <span className="text-slate-400">
                        {se.targetSets} sets × {se.targetReps} reps • {se.restSeconds}s rest
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
