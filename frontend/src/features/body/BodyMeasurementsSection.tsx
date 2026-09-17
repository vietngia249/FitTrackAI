import React, { useState, useEffect } from 'react';
import { Ruler, Plus, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BodyMeasurement } from './bodyTypes';
import { fetchMeasurementsApi, logMeasurementApi } from './bodyApi';

export const BodyMeasurementsSection: React.FC = () => {
  const { t } = useTranslation();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [chestCm, setChestCm] = useState<number | ''>('');
  const [waistCm, setWaistCm] = useState<number | ''>('');
  const [bicepsRightCm, setBicepsRightCm] = useState<number | ''>('');
  const [thighRightCm, setThighRightCm] = useState<number | ''>('');
  const [hipsCm, setHipsCm] = useState<number | ''>('');
  const [calvesCm, setCalvesCm] = useState<number | ''>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMeasurements = () => {
    fetchMeasurementsApi().then(setMeasurements);
  };

  useEffect(() => {
    loadMeasurements();
  }, []);

  const latest = measurements[0] || null;
  const previous = measurements[1] || null;

  const handleOpenModal = () => {
    if (latest) {
      setChestCm(latest.chestCm ?? '');
      setWaistCm(latest.waistCm ?? '');
      setBicepsRightCm(latest.bicepsRightCm ?? '');
      setThighRightCm(latest.thighRightCm ?? '');
      setHipsCm(latest.hipsCm ?? '');
      setCalvesCm(latest.calvesCm ?? '');
      setNotes(latest.notes ?? '');
    } else {
      setChestCm('');
      setWaistCm('');
      setBicepsRightCm('');
      setThighRightCm('');
      setHipsCm('');
      setCalvesCm('');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const getDiff = (currentVal?: number | null, prevVal?: number | null) => {
    if (!currentVal || !prevVal) return null;
    const diff = Math.round((currentVal - prevVal) * 10) / 10;
    if (diff === 0) return '0.0 cm';
    return diff > 0 ? `+${diff} cm` : `${diff} cm`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await logMeasurementApi({
        loggedDate: new Date().toISOString().split('T')[0],
        chestCm: chestCm !== '' ? Number(chestCm) : undefined,
        waistCm: waistCm !== '' ? Number(waistCm) : undefined,
        bicepsRightCm: bicepsRightCm !== '' ? Number(bicepsRightCm) : undefined,
        thighRightCm: thighRightCm !== '' ? Number(thighRightCm) : undefined,
        hipsCm: hipsCm !== '' ? Number(hipsCm) : undefined,
        calvesCm: calvesCm !== '' ? Number(calvesCm) : undefined,
        notes: notes.trim() || undefined,
      });
      loadMeasurements();
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cards = [
    {
      label: t('progress.chest', 'Chest'),
      value: latest?.chestCm ? `${latest.chestCm} cm` : '--',
      diff: getDiff(latest?.chestCm, previous?.chestCm),
    },
    {
      label: t('progress.waist', 'Waist'),
      value: latest?.waistCm ? `${latest.waistCm} cm` : '--',
      diff: getDiff(latest?.waistCm, previous?.waistCm),
    },
    {
      label: t('progress.biceps', 'Arms / Biceps'),
      value: latest?.bicepsRightCm ? `${latest.bicepsRightCm} cm` : '--',
      diff: getDiff(latest?.bicepsRightCm, previous?.bicepsRightCm),
    },
    {
      label: t('progress.hips', 'Hips'),
      value: latest?.hipsCm ? `${latest.hipsCm} cm` : '--',
      diff: getDiff(latest?.hipsCm, previous?.hipsCm),
    },
    {
      label: t('progress.thighs', 'Thighs'),
      value: latest?.thighRightCm ? `${latest.thighRightCm} cm` : '--',
      diff: getDiff(latest?.thighRightCm, previous?.thighRightCm),
    },
    {
      label: t('progress.calves', 'Calves'),
      value: latest?.calvesCm ? `${latest.calvesCm} cm` : '--',
      diff: getDiff(latest?.calvesCm, previous?.calvesCm),
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0e131f]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">{t('progress.circumference_title')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('progress.circumference_subtitle')}</p>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>{t('common.update')}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
        {cards.map((c) => (
          <div
            key={c.label}
            className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              {c.label}
            </span>
            <p className="text-base font-black text-slate-900 dark:text-white mt-1 font-mono">{c.value}</p>
            {c.diff && (
              <span
                className={`text-[11px] font-semibold block mt-0.5 ${
                  c.diff.startsWith('+')
                    ? 'text-teal-600 dark:text-teal-400'
                    : c.diff.startsWith('-')
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400'
                }`}
              >
                {c.diff}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Update Measurements Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('progress.circumference_title')}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('progress.circumference_subtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('progress.chest', 'Chest')} (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="—"
                    value={chestCm}
                    onChange={(e) => setChestCm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('progress.waist', 'Waist')} (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="—"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('progress.biceps', 'Arms / Biceps')} (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="—"
                    value={bicepsRightCm}
                    onChange={(e) => setBicepsRightCm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('progress.thighs', 'Thighs')} (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="—"
                    value={thighRightCm}
                    onChange={(e) => setThighRightCm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('progress.hips', 'Hips')} (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="—"
                    value={hipsCm}
                    onChange={(e) => setHipsCm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('progress.calves', 'Calves')} (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="—"
                    value={calvesCm}
                    onChange={(e) => setCalvesCm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('common.notes', 'Notes')}</label>
                <input
                  type="text"
                  placeholder={t('progress.notes_ph', 'e.g. Measured unflexed after workout')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white keep-white font-bold text-sm shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? t('common.saving', 'Saving...') : t('progress.update_measurements', 'Save Measurements')}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
