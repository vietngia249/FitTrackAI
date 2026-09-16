import React, { useState, useEffect } from 'react';
import { Camera, Plus, X, Lock, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProgressPhoto, PhotoType } from './bodyTypes';
import { fetchPhotosApi, logPhotoApi } from './bodyApi';

export const ProgressPhotosSection: React.FC = () => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedType, setSelectedType] = useState<PhotoType | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<ProgressPhoto | null>(null);

  // Upload modal state
  const [uploadType, setUploadType] = useState<PhotoType>('front');
  const [uploadDate, setUploadDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [uploadNotes, setUploadNotes] = useState<string>('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPhotos = () => {
    fetchPhotosApi(selectedType === 'all' ? undefined : selectedType).then(setPhotos);
  };

  useEffect(() => {
    loadPhotos();
  }, [selectedType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewDataUrl) return;

    setIsSubmitting(true);
    try {
      await logPhotoApi({
        photoType: uploadType,
        loggedDate: uploadDate,
        photoUrl: previewDataUrl,
        notes: uploadNotes.trim() || undefined,
      });
      loadPhotos();
      setIsModalOpen(false);
      setPreviewDataUrl(null);
      setUploadNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0e131f]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{t('progress.private_photos_title')}</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                <Lock className="w-2.5 h-2.5" />
                <span>{t('progress.private_encrypted', 'Private & Encrypted')}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('progress.private_photos_subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pose Filter Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            {(['all', 'front', 'side', 'back'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  selectedType === type
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t(`progress.pose_${type}`, type)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer keep-white active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('progress.add_photo')}</span>
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('progress.no_photos')}</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {t('progress.photos_hint', 'Take photos in consistent lighting and poses every 2 to 4 weeks to visually track your body recomposition.')}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            {t('progress.upload_first_photo', 'Upload First Photo')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer shadow-lg hover:border-indigo-500/50 transition-all"
            >
              <img
                src={photo.storageKey}
                alt={`${photo.photoType} progress`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white font-medium">
                <span className="capitalize px-2 py-0.5 rounded-md bg-indigo-500/80 font-bold">
                  {photo.photoType}
                </span>
                <span className="text-slate-300 font-mono text-[10px]">
                  {photo.loggedDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('progress.add_photo_title', 'Add Progress Photo')}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('progress.private_photos_subtitle', 'Photos remain strictly private')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-5 space-y-4">
              {/* Photo Pose Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('progress.pose_type', 'Pose Type')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['front', 'side', 'back'] as PhotoType[]).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setUploadType(type)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                        uploadType === type
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t(`progress.pose_${type}`, type)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('common.date', 'Date')}</label>
                <input
                  type="date"
                  required
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Photo File Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('progress.photo_image', 'Photo Image')}</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              {/* Image Preview */}
              {previewDataUrl && (
                <div className="aspect-[3/4] max-h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black flex items-center justify-center">
                  <img
                    src={previewDataUrl}
                    alt="Preview"
                    className="max-h-full object-contain"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('common.notes', 'Notes')}</label>
                <input
                  type="text"
                  placeholder="e.g. End of 8-week hypertrophy block"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !previewDataUrl}
                className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <span>{isSubmitting ? t('common.saving', 'Saving...') : t('progress.save_photo', 'Save Private Photo')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="capitalize text-sm font-bold text-white px-2.5 py-0.5 rounded-lg bg-indigo-500">
                  {activePhoto.photoType} Pose
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activePhoto.loggedDate}
                </span>
              </div>
              <button
                onClick={() => setActivePhoto(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-[3/4] bg-black flex items-center justify-center">
              <img
                src={activePhoto.storageKey}
                alt="Full progress"
                className="max-h-full object-contain"
              />
            </div>
            {activePhoto.notes && (
              <div className="p-4 bg-slate-950/60 border-t border-slate-800/80">
                <p className="text-xs text-slate-300 italic">{activePhoto.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
