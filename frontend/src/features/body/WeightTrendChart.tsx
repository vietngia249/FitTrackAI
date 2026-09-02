import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Scale, Plus, TrendingDown } from 'lucide-react';
import { WeightHistoryResponse } from './bodyTypes';
import { fetchWeightHistoryApi } from './bodyApi';
import { LogWeightModal } from './LogWeightModal';

export const WeightTrendChart: React.FC = () => {
  const [data, setData] = useState<WeightHistoryResponse | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const loadData = () => {
    fetchWeightHistoryApi().then(setData);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!data) return null;

  // Calculate min and max for chart domain with 1kg margin
  const weights = data.points.flatMap((p) => [p.weightKg, p.movingAverageKg]);
  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);

  return (
    <div className="bg-[#0e131f]/90 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Body Weight & 7-Day Trend</h3>
            <p className="text-xs text-slate-400">
              Filtered 7-day moving average eliminates water retention noise
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-2xl font-black text-white font-mono">
                {data.stats.currentSevenDayAvgKg}
              </span>
              <span className="text-xs text-slate-400">kg 7d-avg</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-[11px] font-semibold text-emerald-400">
              <TrendingDown className="w-3 h-3" />
              <span>{data.stats.totalChangeKg} kg overall</span>
            </div>
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Weight</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data.points} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val: string) => {
                const parts = val.split('-');
                return `${parts[1]}/${parts[2]}`;
              }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[minWeight, maxWeight]}
              tickLine={false}
              unit="kg"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0]?.payload;
                return (
                  <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                    <p className="font-bold text-slate-200">{point.date}</p>
                    <p className="text-slate-400">
                      Raw Weigh-in:{' '}
                      <span className="text-white font-mono font-bold">
                        {point.weightKg} kg
                      </span>
                    </p>
                    <p className="text-emerald-400">
                      7-Day Average:{' '}
                      <span className="font-mono font-bold">
                        {point.movingAverageKg} kg
                      </span>
                    </p>
                    {point.notes && (
                      <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800">
                        {point.notes}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="weightKg"
              fill="#334155"
              radius={[4, 4, 0, 0]}
              maxBarSize={18}
              opacity={0.7}
              name="Raw Daily Weight"
            />
            <Line
              type="monotone"
              dataKey="movingAverageKg"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 3, fill: '#10b981' }}
              activeDot={{ r: 5, fill: '#34d399' }}
              name="7-Day Moving Avg"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <LogWeightModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onWeightLogged={loadData}
      />
    </div>
  );
};
