import React from 'react';
import { X, Dumbbell, Target, Layers, Zap, Camera, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Exercise } from './exerciseTypes';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!exercise) return null;

  const handleStartAiForm = () => {
    onClose();
    navigate(`/ai-form?exercise=${encodeURIComponent(exercise.slug)}`);
  };

  const imageSrc =
    exercise.imageUrls && exercise.imageUrls.length > 0
      ? exercise.imageUrls[0]
      : 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#0d111a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Image */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-900 shrink-0">
          <img
            src={imageSrc}
            alt={exercise.name}
            className="w-full h-full object-cover object-center opacity-85"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d111a] via-[#0d111a]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title and category overlay */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 capitalize">
                {exercise.category}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 capitalize">
                {exercise.level}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {exercise.name}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-400" /> Equipment
              </span>
              <span className="font-semibold text-slate-200 text-sm mt-1 capitalize">
                {exercise.equipment || 'Body only'}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Force
              </span>
              <span className="font-semibold text-slate-200 text-sm mt-1 capitalize">
                {exercise.force || 'Neutral'}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-400" /> Mechanic
              </span>
              <span className="font-semibold text-slate-200 text-sm mt-1 capitalize">
                {exercise.mechanic || 'Compound'}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-rose-400" /> Primary Focus
              </span>
              <span className="font-semibold text-slate-200 text-sm mt-1 capitalize">
                {exercise.primaryMuscles[0] || 'Full Body'}
              </span>
            </div>
          </div>

          {/* Targeted Muscles Details */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> Targeted Muscle Groups
            </h4>
            <div className="flex flex-wrap gap-2">
              {exercise.primaryMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-300 rounded-lg border border-emerald-500/30 capitalize flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {muscle} (Primary)
                </span>
              ))}
              {exercise.secondaryMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-3 py-1 text-xs font-medium bg-slate-800/90 text-slate-300 rounded-lg border border-slate-700/60 capitalize"
                >
                  {muscle} (Secondary)
                </span>
              ))}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Execution Instructions
            </h4>
            <ol className="space-y-3">
              {exercise.instructions.map((step, idx) => (
                <li
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 flex gap-3 text-sm text-slate-300 leading-relaxed"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 sm:p-6 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleStartAiForm}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Practice with AI Form Coach</span>
          </button>
        </div>
      </div>
    </div>
  );
};
