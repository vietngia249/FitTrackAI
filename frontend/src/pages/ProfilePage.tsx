import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Download, Trash2, Shield } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [preferredUnits, setPreferredUnits] = useState<'metric' | 'imperial'>('metric');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('profile.title')}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {t('profile.subtitle')}
        </p>
      </div>

      {/* User Info Card */}
      <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl font-bold text-emerald-400">
            JD
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">John Doe</h2>
          <p className="text-xs text-slate-400">athlete@fittrack.ai</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Hypertrophy Focus
            </span>
            <span className="text-xs text-slate-400 font-mono">178 cm • 75.4 kg</span>
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Settings className="w-4 h-4 text-emerald-400" />
          <h3>Application Preferences</h3>
        </div>

        {/* Units setting */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-200">{t('profile.units')}</p>
            <p className="text-xs text-slate-400">
              Canonical database storage remains strictly metric (kg/cm)
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setPreferredUnits('metric')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                preferredUnits === 'metric'
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Metric (kg, cm)
            </button>
            <button
              onClick={() => setPreferredUnits('imperial')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                preferredUnits === 'imperial'
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Imperial (lb, in)
            </button>
          </div>
        </div>

        {/* Language setting */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-200">{t('common.language')}</p>
            <p className="text-xs text-slate-400">
              Switch UI and AI Copilot response language
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                i18n.language.startsWith('en')
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English 🇺🇸
            </button>
            <button
              onClick={() => i18n.changeLanguage('vi')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                i18n.language.startsWith('vi')
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tiếng Việt 🇻🇳
            </button>
          </div>
        </div>
      </div>

      {/* Data & Privacy Card (Export / Delete account per Spec §15 & §23) */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3>Privacy & Data Control (Spec §15 / §23)</h3>
        </div>
        <p className="text-xs text-slate-400">
          You have full ownership of your fitness logs, biometric data, and form analysis records.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all">
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('profile.export_data')} (JSON)</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all">
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('profile.delete_account')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
