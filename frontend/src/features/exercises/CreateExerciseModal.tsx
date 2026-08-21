import React, { useState } from 'react';
import { X, Plus, AlertCircle, Dumbbell } from 'lucide-react';
import { Exercise } from './exerciseTypes';
import { createCustomExercise } from './exerciseApi';
import { useAuth } from '../auth/AuthContext';

interface CreateExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (exercise: Exercise) => void;
}

export const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { accessToken } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('strength');
  const [level, setLevel] = useState('beginner');
  const [equipment, setEquipment] = useState('body only');
  const [primaryMuscles, setPrimaryMuscles] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setError('Please sign in to create custom exercises.');
      return;
    }

    const musclesArr = primaryMuscles
      .split(',')
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);

    const stepsArr = instructions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (musclesArr.length === 0) {
      setError('Please specify at least one targeted primary muscle.');
      return;
    }

    if (stepsArr.length === 0) {
      setError('Please provide at least one execution instruction step.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await createCustomExercise(
        {
          name: name.trim(),
          category,
          level,
          equipment,
          primaryMuscles: musclesArr,
          secondaryMuscles: [],
          instructions: stepsArr,
          imageUrls: [],
        },
        accessToken
      );
      onCreated(created);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create exercise';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0e131f] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Custom Exercise</h3>
              <p className="text-xs text-slate-400">Add your personalized movement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Exercise Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bulgarian Split Squat with Pulse"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:border-emerald-500 outline-none"
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="stretching">Stretching</option>
                <option value="plyometrics">Plyometrics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Difficulty Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:border-emerald-500 outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Equipment
            </label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:border-emerald-500 outline-none"
            >
              <option value="body only">Body Only</option>
              <option value="dumbbell">Dumbbell</option>
              <option value="barbell">Barbell</option>
              <option value="cable">Cable</option>
              <option value="machine">Machine</option>
              <option value="bands">Resistance Bands</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Primary Muscles * (comma-separated)
            </label>
            <input
              type="text"
              required
              value={primaryMuscles}
              onChange={(e) => setPrimaryMuscles(e.target.value)}
              placeholder="e.g. quadriceps, glutes"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Instructions * (one step per line)
            </label>
            <textarea
              rows={3}
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Step 1: Set up bench&#10;Step 2: Lower hips with control&#10;Step 3: Drive up through front heel"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-emerald-500 outline-none resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Exercise'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
