import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Download, Trash2, Shield, LogIn } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, openLoginModal } = useAuth();

  const [preferredUnits, setPreferredUnits] = useState<'metric' | 'imperial'>(
    user?.profile?.preferredUnits ?? 'metric'
  );

  // Derive initials for avatar
  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const fitnessGoalLabel: Record<string, string> = {
    muscle_gain: 'Muscle Gain',
    fat_loss: 'Fat Loss',
    maintenance: 'Maintenance',
    strength: 'Strength',
  };

  const handleExportData = () => {
    if (!user) return;
    const dataStr = JSON.stringify({ user }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fittrack-export-${user.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account and all associated data? This action cannot be undone.'
    );
    if (confirmed) {
      // TODO: Call DELETE /api/v1/auth/account endpoint
      alert('Account deletion request submitted. You will receive a confirmation email.');
    }
  };

  // Not logged in — prompt to sign in
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
          <LogIn className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-1">Sign in to view your profile</h2>
          <p className="text-sm text-slate-400">Create an account to save your workouts and preferences.</p>
        </div>
        <button
          onClick={openLoginModal}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm transition-all"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-full h-full rounded-[14px] object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl font-bold text-emerald-400">
              {initials}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{user.displayName}</h2>
          <p className="text-xs text-slate-400">{user.email}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {user.profile?.fitnessGoal && (
              <span className="px-2 py-0.5 text-[11px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                {fitnessGoalLabel[user.profile.fitnessGoal] ?? user.profile.fitnessGoal}
              </span>
            )}
            {user.profile?.height && user.profile?.currentWeight && (
              <span className="text-xs text-slate-400 font-mono">
                {user.profile.height} cm • {user.profile.currentWeight} kg
              </span>
            )}
            <span className="text-xs text-slate-500 font-mono">
              Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
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
          <button
            onClick={handleExportData}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('profile.export_data')} (JSON)</span>
          </button>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('profile.delete_account')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
