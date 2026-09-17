import React from 'react';
import { X, Dumbbell, Target, Layers, Zap, Camera, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Exercise } from './exerciseTypes';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
}) => {
  const { t } = useTranslation();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#0d111a] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Image */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-100 dark:bg-slate-900 shrink-0">
          <img
            src={imageSrc}
            alt={exercise.name}
            className="w-full h-full object-cover object-center opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-slate-200 hover:text-white hover:bg-black/80 backdrop-blur-md transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title and category overlay */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md capitalize">
                {exercise.category}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 capitalize">
                {exercise.level}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 drop-shadow-md">
              {exercise.name}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-700 dark:text-slate-300">
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> {t('exercises.specs_equipment', 'Equipment')}
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 capitalize">
                {exercise.equipment || 'Body only'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> {t('exercises.specs_force', 'Force')}
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 capitalize">
                {exercise.force || 'Neutral'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> {t('exercises.specs_mechanic', 'Mechanic')}
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 capitalize">
                {exercise.mechanic || 'Compound'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" /> {t('exercises.specs_primary_focus', 'Primary Focus')}
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 capitalize">
                {exercise.primaryMuscles[0] || 'Full Body'}
              </span>
            </div>
          </div>

          {/* Targeted Muscles Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> {t('exercises.targeted_muscles', 'Targeted Muscle Groups')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {exercise.primaryMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-500/30 capitalize flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  {muscle} ({t('exercises.primary_tag', 'Primary')})
                </span>
              ))}
              {exercise.secondaryMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700/60 capitalize"
                >
                  {muscle} ({t('exercises.secondary_tag', 'Secondary')})
                </span>
              ))}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500 dark:text-teal-400" /> {t('exercises.execution_instructions', 'Execution Instructions')}
            </h4>
            <ol className="space-y-3">
              {exercise.instructions.map((step, idx) => (
                <li
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/70 flex gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {t('common.close')}
          </button>
          <button
            type="button"
            onClick={handleStartAiForm}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer keep-white active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>{t('exercises.practice_ai')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
