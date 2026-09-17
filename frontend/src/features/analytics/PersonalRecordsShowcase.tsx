import React, { useState, useEffect } from 'react';
import { Trophy, Dumbbell, Zap, Flame, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PersonalRecordItem } from './analyticsTypes';
import { fetchPersonalRecords } from './analyticsApi';
import { useAuth } from '../auth/AuthContext';

export const PersonalRecordsShowcase: React.FC = () => {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [records, setRecords] = useState<PersonalRecordItem[]>([]);

  useEffect(() => {
    fetchPersonalRecords(accessToken).then(setRecords);
  }, [accessToken]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 mb-1">
            <Trophy className="w-4 h-4" />
            <span>{t('analytics.hall_of_fame')}</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('analytics.all_time_pr', 'All-Time Personal Records')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('analytics.peak_strength')}</p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#0e131f]/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
            {t('analytics.no_prs_title', 'No Personal Records Yet')}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            {t('analytics.no_prs_desc', 'Log and complete your workout sets with weight and reps to establish all-time personal records across exercises.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((rec) => (
            <div
              key={rec.exerciseId}
              className="group relative bg-white dark:bg-[#0e131f]/90 hover:bg-slate-50 dark:hover:bg-[#13192a] border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 rounded-3xl p-5 shadow-sm dark:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                    {t('analytics.pr_record', 'PR Record')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {rec.primaryMuscle}
                  </span>
                </div>

                <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 mb-3">
                  {rec.exerciseName}
                </h4>

                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 mb-2">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Dumbbell className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> {t('analytics.max_lift', 'Max Lift')}
                    </span>
                    <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {rec.prs.maxWeightKg} kg
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {t('analytics.for_reps', { count: rec.prs.bestRepsAtMaxWeight, defaultValue: `for ${rec.prs.bestRepsAtMaxWeight} reps` })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" /> {t('analytics.est_1rm', 'Est. 1RM')}
                    </span>
                    <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      {rec.prs.maxEstimated1RM} kg
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Epley model
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                  Best Set Vol: <strong className="text-slate-800 dark:text-slate-200">{rec.prs.maxSetVolumeKg} kg</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
