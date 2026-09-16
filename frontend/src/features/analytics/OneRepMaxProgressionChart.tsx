import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchExerciseAnalytics } from './analyticsApi';
import { ExerciseAnalyticsResponse } from './analyticsTypes';
import { useAuth } from '../auth/AuthContext';

interface OneRepMaxProgressionChartProps {
  initialExerciseId?: string;
}

const COMMON_LIFTS = [
  { id: 'barbell-bench-press', name: 'Barbell Bench Press' },
  { id: 'barbell-back-squat', name: 'Barbell Back Squat' },
  { id: 'barbell-deadlift', name: 'Barbell Conventional Deadlift' },
  { id: 'overhead-press', name: 'Overhead Press' },
];

export const OneRepMaxProgressionChart: React.FC<OneRepMaxProgressionChartProps> = ({
  initialExerciseId = 'barbell-bench-press',
}) => {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [selectedId, setSelectedId] = useState(initialExerciseId);
  const [data, setData] = useState<ExerciseAnalyticsResponse | null>(null);

  useEffect(() => {
    fetchExerciseAnalytics(selectedId, accessToken).then(setData);
  }, [selectedId, accessToken]);

  if (!data) return null;

  return (
    <div className="bg-white dark:bg-[#0e131f]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-6">
      {/* Header & Exercise Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Progressive Overload & 1RM Trend</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Estimated 1RM Progression</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculated via validated Epley formula: w × (1 + r / 30)
          </p>
        </div>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-emerald-500 outline-none shadow-sm"
        >
          {COMMON_LIFTS.map((lift) => (
            <option key={lift.id} value={lift.id}>
              {lift.name}
            </option>
          ))}
        </select>
      </div>

      {/* PR Badges Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Peak 1RM</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {data.prs.maxEstimated1RM} kg
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">{t('analytics.heaviest_lift')}</span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {data.prs.maxWeightKg} kg
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">{t('analytics.best_set_reps')}</span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {data.prs.bestRepsAtMaxWeight} reps
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">{t('analytics.best_set_vol')}</span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {data.prs.maxSetVolumeKg} kg
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.progression} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradient1RM" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: string) => {
                const parts = val.split('-');
                return `${parts[1]}/${parts[2]}`;
              }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 5', 'dataMax + 5']}
              unit="kg"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  return (
                    <div className="p-3 bg-[#0d121f] border border-emerald-500/30 rounded-xl shadow-xl text-xs space-y-1">
                      <div className="font-bold text-white">{p.sessionName}</div>
                      <div className="text-slate-400">{label}</div>
                      <div className="text-emerald-400 font-bold">
                        Estimated 1RM: {p.estimated1RM} kg
                      </div>
                      <div className="text-slate-300">
                        Max Weight: {p.maxWeightKg} kg
                      </div>
                      <div className="text-slate-400">
                        Session Volume: {p.totalVolumeKg} kg
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="estimated1RM"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#gradient1RM)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
