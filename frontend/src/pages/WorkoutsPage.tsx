import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dumbbell, Plus, Play, Clock, CheckCircle2 } from 'lucide-react';

export const WorkoutsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('workouts.title')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {t('workouts.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{t('workouts.new_plan')}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all">
            <Play className="w-4 h-4 fill-current" />
            <span>Start Empty Workout</span>
          </button>
        </div>
      </div>

      {/* Routine Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold uppercase text-emerald-400">Push Day</span>
          <h3 className="font-bold text-lg text-white mt-1">Chest, Shoulders & Triceps</h3>
          <p className="text-xs text-slate-400 mt-1">5 exercises • 18 total working sets</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Last: 3 days ago</span>
            <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
              Start Session
            </button>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-teal-500">
          <span className="text-xs font-bold uppercase text-teal-400">Pull Day</span>
          <h3 className="font-bold text-lg text-white mt-1">Back, Rear Delts & Biceps</h3>
          <p className="text-xs text-slate-400 mt-1">6 exercises • 20 total working sets</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Last: 2 days ago</span>
            <button className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-semibold">
              Start Session
            </button>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-indigo-500">
          <span className="text-xs font-bold uppercase text-indigo-400">Leg Day</span>
          <h3 className="font-bold text-lg text-white mt-1">Quads, Hamstrings & Calves</h3>
          <p className="text-xs text-slate-400 mt-1">5 exercises • 16 total working sets</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Last: 5 days ago</span>
            <button className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold">
              Start Session
            </button>
          </div>
        </div>
      </div>

      {/* Live Session Simulation Preview */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Live Workout Experience Preview</h2>
              <p className="text-xs text-slate-400">Touch-optimized live set logging with rest timer and RPE tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-mono text-emerald-400 border border-slate-700">
            <Clock className="w-3.5 h-3.5" />
            <span>00:42:15</span>
          </div>
        </div>

        {/* Set Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase border-b border-slate-800">
                <th className="pb-3 font-semibold">Set</th>
                <th className="pb-3 font-semibold">Previous</th>
                <th className="pb-3 font-semibold">kg</th>
                <th className="pb-3 font-semibold">Reps</th>
                <th className="pb-3 font-semibold">RPE</th>
                <th className="pb-3 text-right font-semibold">Done</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-3 font-mono font-bold text-slate-300">1 (Warmup)</td>
                <td className="py-3 text-slate-400 text-xs font-mono">50 kg × 12</td>
                <td className="py-3"><span className="px-2 py-1 bg-slate-800 rounded font-mono">50</span></td>
                <td className="py-3"><span className="px-2 py-1 bg-slate-800 rounded font-mono">12</span></td>
                <td className="py-3 text-slate-400 text-xs font-mono">6.0</td>
                <td className="py-3 text-right">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 inline" />
                </td>
              </tr>
              <tr>
                <td className="py-3 font-mono font-bold text-slate-300">2 (Work)</td>
                <td className="py-3 text-slate-400 text-xs font-mono">82.5 kg × 8</td>
                <td className="py-3"><span className="px-2 py-1 bg-slate-800 rounded font-mono">85</span></td>
                <td className="py-3"><span className="px-2 py-1 bg-slate-800 rounded font-mono">8</span></td>
                <td className="py-3 text-slate-400 text-xs font-mono">8.5</td>
                <td className="py-3 text-right">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 inline" />
                </td>
              </tr>
              <tr className="bg-emerald-500/5">
                <td className="py-3 font-mono font-bold text-emerald-400">3 (Current)</td>
                <td className="py-3 text-slate-400 text-xs font-mono">82.5 kg × 7</td>
                <td className="py-3"><input defaultValue="85" className="w-16 px-2 py-1 bg-slate-800 border border-emerald-500/50 rounded font-mono text-white text-center" /></td>
                <td className="py-3"><input defaultValue="8" className="w-16 px-2 py-1 bg-slate-800 border border-emerald-500/50 rounded font-mono text-white text-center" /></td>
                <td className="py-3"><input defaultValue="9" className="w-16 px-2 py-1 bg-slate-800 border border-emerald-500/50 rounded font-mono text-white text-center" /></td>
                <td className="py-3 text-right">
                  <button className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded transition-all">
                    Complete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
