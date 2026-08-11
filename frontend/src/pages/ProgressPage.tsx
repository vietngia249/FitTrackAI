import React from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Ruler, Image, ShieldCheck, Plus } from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('progress.title')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {t('progress.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Log Measurement</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all">
            <Scale className="w-4 h-4" />
            <span>Log Weight</span>
          </button>
        </div>
      </div>

      {/* 7-Day Weight Moving Average Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">7-Day Moving Weight Average</h2>
              <p className="text-xs text-slate-400">Filtering daily water fluctuations with canonical metric storage</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-white font-mono">75.4</span>
            <span className="text-xs text-slate-400 ml-1">kg</span>
            <p className="text-[11px] text-emerald-400">-0.3 kg this week</p>
          </div>
        </div>

        {/* Minimal chart mock */}
        <div className="h-44 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 text-xs">
          Interactive Recharts 7-Day Trend Chart (Wired in Phase 4 & 6)
        </div>
      </div>

      {/* Body Measurements & Photos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Body Measurements */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Ruler className="w-4 h-4 text-emerald-400" />
            <h3>Circumference Tracking</h3>
          </div>
          <div className="divide-y divide-slate-800 text-sm">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-300">Chest</span>
              <span className="font-mono font-semibold text-white">102.5 cm</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-300">Waist</span>
              <span className="font-mono font-semibold text-white">78.0 cm</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-300">Arms (Flexed)</span>
              <span className="font-mono font-semibold text-white">38.2 cm</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-300">Thighs</span>
              <span className="font-mono font-semibold text-white">59.5 cm</span>
            </div>
          </div>
        </div>

        {/* Private Progress Photo Vault */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Image className="w-4 h-4 text-emerald-400" />
              <h3>Private Photo Vault</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              R2 Encrypted
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Compare front, side, and back progression privately with Cloudflare R2 signed URLs.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="aspect-[3/4] bg-slate-800/80 rounded-xl border border-slate-700/80 flex flex-col items-center justify-center text-slate-500 text-xs">
              <span>Front</span>
            </div>
            <div className="aspect-[3/4] bg-slate-800/80 rounded-xl border border-slate-700/80 flex flex-col items-center justify-center text-slate-500 text-xs">
              <span>Side</span>
            </div>
            <div className="aspect-[3/4] bg-slate-800/80 rounded-xl border border-slate-700/80 flex flex-col items-center justify-center text-slate-500 text-xs">
              <span>Back</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
