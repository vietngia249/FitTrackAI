import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Send, ShieldCheck, Zap, Info } from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('insights.title')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {t('insights.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span>AI Budget Today:</span>
          <strong className="text-emerald-400 font-mono">18 / 20 calls left</strong>
        </div>
      </div>

      {/* Deterministic Rule Engine Insights (Layer 1) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase text-slate-400 tracking-wider">
          Automated Training & Nutrition Rules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>Progressive Overload Verified</span>
            </div>
            <h3 className="font-bold text-white text-base mt-1">Ready for Bench Press Increment</h3>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              You completed all planned sets at target RPE ≤ 8. Recommend increasing load to 87.5 kg next workout.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
              <Info className="w-3.5 h-3.5" />
              <span>Nutrition Adherence</span>
            </div>
            <h3 className="font-bold text-white text-base mt-1">Protein Intake Below Target</h3>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Your average daily protein over the last 3 days was 142g (target: 175g). Consider adding an extra shake or high-protein snack.
            </p>
          </div>
        </div>
      </div>

      {/* Grounded AI Copilot Chat Interface (Layer 2) */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">FitTrack AI Grounded Copilot</h3>
              <p className="text-xs text-slate-400">Answers queries strictly using your verified workout & nutrition data</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Anti-Hallucination Grounded
          </span>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            'Why did my bench press stall this week?',
            'Am I hitting enough volume for chest hypertrophy?',
            'What was my highest estimated 1RM this month?',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(prompt)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all text-left"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Prompt Input Box */}
        <div className="relative pt-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your coach anything about your training, recovery, or diet..."
            className="w-full pl-4 pr-12 py-3.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
          <button className="absolute right-2 top-4 p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
