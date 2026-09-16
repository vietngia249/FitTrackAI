import React from 'react';
import { Dumbbell, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Exercise } from './exerciseTypes';

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onSelect }) => {
  const { t } = useTranslation();

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'intermediate':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'expert':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/30';
    }
  };

  const imageSrc =
    exercise.imageUrls && exercise.imageUrls.length > 0
      ? exercise.imageUrls[0]
      : 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80';

  return (
    <div
      onClick={() => onSelect(exercise)}
      className="group relative bg-white dark:bg-[#0e131f]/80 hover:bg-slate-50 dark:hover:bg-[#131929] border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg transition-all duration-300 hover:shadow-emerald-500/10 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
    >
      {/* Thumbnail with overlay gradient */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img
          src={imageSrc}
          alt={exercise.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90" />

        {/* Level badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border backdrop-blur-md uppercase tracking-wider ${getLevelColor(
              exercise.level
            )}`}
          >
            {exercise.level || 'All Levels'}
          </span>
        </div>

        {/* Category tag */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-black/60 text-slate-200 backdrop-blur-md capitalize">
            {exercise.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {exercise.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
            {t('common.target', 'Target')}: <strong className="text-slate-700 dark:text-slate-300">{exercise.primaryMuscles?.[0] || 'Full Body'}</strong>
          </p>

          {/* Secondary Muscle tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {exercise.secondaryMuscles?.slice(0, 3).map((muscle) => (
              <span
                key={muscle}
                className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700/50 capitalize"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>

        {/* Footer info: Equipment & Quick View */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="capitalize">{exercise.equipment || 'Body only'}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform font-medium">
            <span>{t('common.details')}</span>
            <Eye className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
