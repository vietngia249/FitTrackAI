import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Columns2, Calendar } from 'lucide-react';
import { ProgressPhoto } from './bodyTypes.js';

interface PhotoCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: ProgressPhoto[];
}

export const PhotoCompareModal: React.FC<PhotoCompareModalProps> = ({
  isOpen,
  onClose,
  photos,
}) => {
  const { t } = useTranslation();

  // Sort photos chronologically (oldest first)
  const sortedPhotos = useMemo(() => {
    return [...photos].sort(
      (a, b) => new Date(a.loggedDate).getTime() - new Date(b.loggedDate).getTime()
    );
  }, [photos]);

  const [firstPhotoId, setFirstPhotoId] = useState<string>(() => {
    return sortedPhotos[0]?.id || '';
  });

  const [secondPhotoId, setSecondPhotoId] = useState<string>(() => {
    return sortedPhotos[sortedPhotos.length - 1]?.id || '';
  });

  if (!isOpen) return null;

  const firstPhoto = sortedPhotos.find((p) => p.id === firstPhotoId) || sortedPhotos[0];
  const secondPhoto =
    sortedPhotos.find((p) => p.id === secondPhotoId) ||
    sortedPhotos[sortedPhotos.length - 1];

  const daysBetween =
    firstPhoto && secondPhoto
      ? Math.abs(
          Math.round(
            (new Date(secondPhoto.loggedDate).getTime() -
              new Date(firstPhoto.loggedDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Columns2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {t('compare.title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('compare.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {firstPhoto && secondPhoto && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800/60">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('compare.days_between', { days: daysBetween })}</span>
              </span>
            )}

            <button
              onClick={onClose}
              aria-label={t('common.close')}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {sortedPhotos.length < 2 ? (
          <div className="p-12 text-center my-auto">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Columns2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('compare.no_photos_to_compare')}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Selector Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                  {t('compare.before')}:
                </span>
                <select
                  value={firstPhoto?.id}
                  onChange={(e) => setFirstPhotoId(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {sortedPhotos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.loggedDate} — {p.photoType.toUpperCase()} {p.notes ? `(${p.notes})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Right Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 shrink-0">
                  {t('compare.after')}:
                </span>
                <select
                  value={secondPhoto?.id}
                  onChange={(e) => setSecondPhotoId(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {sortedPhotos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.loggedDate} — {p.photoType.toUpperCase()} {p.notes ? `(${p.notes})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Side-by-Side Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Photo 1 Container */}
              <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 relative group">
                <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-white text-xs font-bold flex items-center gap-1.5">
                  <span>{t('compare.before')}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 font-mono">{firstPhoto?.loggedDate}</span>
                </div>

                <div className="aspect-[3/4] w-full flex items-center justify-center overflow-hidden bg-slate-950">
                  {firstPhoto ? (
                    <img
                      src={firstPhoto.storageKey || (firstPhoto as any).photoUrl}
                      alt="Before"
                      className="w-full h-full object-contain"
                    />
                  ) : null}
                </div>

                {firstPhoto?.notes && (
                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 italic">
                    "{firstPhoto.notes}"
                  </div>
                )}
              </div>

              {/* Photo 2 Container */}
              <div className="flex flex-col rounded-2xl overflow-hidden border border-indigo-500/40 dark:border-indigo-500/40 bg-slate-950 relative group">
                <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-indigo-950/90 backdrop-blur-md border border-indigo-500/50 text-indigo-200 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <span>{t('compare.after')}</span>
                  <span className="text-indigo-400">•</span>
                  <span className="text-white font-mono">{secondPhoto?.loggedDate}</span>
                </div>

                <div className="aspect-[3/4] w-full flex items-center justify-center overflow-hidden bg-slate-950">
                  {secondPhoto ? (
                    <img
                      src={secondPhoto.storageKey || (secondPhoto as any).photoUrl}
                      alt="After"
                      className="w-full h-full object-contain"
                    />
                  ) : null}
                </div>

                {secondPhoto?.notes && (
                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 italic">
                    "{secondPhoto.notes}"
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
