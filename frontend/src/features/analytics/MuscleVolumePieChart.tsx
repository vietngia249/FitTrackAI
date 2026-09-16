import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MuscleVolumeItem } from './analyticsTypes';

interface MuscleVolumePieChartProps {
  distribution: MuscleVolumeItem[];
}

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export const MuscleVolumePieChart: React.FC<MuscleVolumePieChartProps> = ({
  distribution,
}) => {
  const { t } = useTranslation();
  const totalVolume = distribution.reduce((acc, item) => acc + item.volumeKg, 0);

  const formattedData = distribution.map((item) => ({
    name: item.muscle.charAt(0).toUpperCase() + item.muscle.slice(1),
    value: item.volumeKg,
    percentage: totalVolume > 0 ? Math.round((item.volumeKg / totalVolume) * 100) : 0,
  }));

  return (
    <div className="bg-white dark:bg-[#0e131f]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
          <Layers className="w-4 h-4" />
          <span>{t('analytics.volume_distribution')}</span>
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('analytics.targeted_muscle_load')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('analytics.workload_balance')}</p>
      </div>

      {/* Donut Chart Canvas */}
      <div className="h-56 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {formattedData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-2.5 bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-1 shadow-lg">
                      <div className="font-bold text-slate-900 dark:text-white">{data.name}</div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {data.value.toLocaleString()} kg ({data.percentage}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Volume */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-bold text-slate-400">{t('common.total')}</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">
            {(totalVolume / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] text-slate-400">kg</span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
        {formattedData.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
            <span className="text-slate-500 font-mono text-[11px] ml-auto">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
