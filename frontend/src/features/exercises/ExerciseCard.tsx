import React from 'react';
import { Dumbbell, Eye } from 'lucide-react';
import { Exercise } from './exerciseTypes';

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onSelect }) => {
  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'intermediate':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'expert':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const imageSrc =
    exercise.imageUrls && exercise.imageUrls.length > 0
      ? exercise.imageUrls[0]
      : 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80';

  return (
    <div
      onClick={() => onSelect(exercise)}
      className="group relative bg-[#0e131f]/80 hover:bg-[#131929] border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-emerald-500/10 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
    >
      {/* Thumbnail with overlay gradient */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={imageSrc}
          alt={exercise.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
          loading="lazy"
          onError={(e) => {
            // Fallback gracefully on broken remote image
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e131f] via-transparent to-transparent opacity-90" />

        {/* Level badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize backdrop-blur-md ${getLevelColor(
              exercise.level
            )}`}
          >
            {exercise.level}
          </span>
        </div>

        {/* Custom badge */}
        {exercise.isCustom && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
              Custom
            </span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5 uppercase font-semibold tracking-wider">
            <span>{exercise.category}</span>
            {exercise.force && (
              <>
                <span>•</span>
                <span className="capitalize">{exercise.force}</span>
              </>
            )}
          </div>

          <h3 className="font-bold text-base text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1 mb-2">
            {exercise.name}
          </h3>

          {/* Targeted Muscles Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {exercise.primaryMuscles.map((muscle) => (
              <span
                key={muscle}
                className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-300 rounded-md border border-emerald-500/20 capitalize"
              >
                {muscle}
              </span>
            ))}
            {exercise.secondaryMuscles.slice(0, 2).map((muscle) => (
              <span
                key={muscle}
                className="px-2 py-0.5 text-[11px] font-medium bg-slate-800/80 text-slate-400 rounded-md border border-slate-700/50 capitalize"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>

        {/* Footer info: Equipment & Quick View */}
        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-slate-500" />
            <span className="capitalize">{exercise.equipment || 'Body only'}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 group-hover:translate-x-0.5 transition-transform font-medium">
            <span>Details</span>
            <Eye className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
