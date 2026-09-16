import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Download,
  Trash2,
  Shield,
  LogIn,
  User as UserIcon,
  Activity,
  Sparkles,
  Check,
  AlertCircle,
  Calendar,
  Scale,
  Flame,
  Save,
  Loader2,
  HeartPulse,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, openLoginModal, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  // Preferences
  const [preferredUnits, setPreferredUnits] = useState<'metric' | 'imperial'>(
    user?.profile?.preferredUnits ?? 'metric'
  );

  // Form state
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState<string>(
    user?.profile?.dateOfBirth ? user.profile.dateOfBirth.split('T')[0] : ''
  );
  const [biologicalSex, setBiologicalSex] = useState<'male' | 'female' | 'other'>(
    (user?.profile?.biologicalSex as any) ?? 'male'
  );
  const [height, setHeight] = useState<string>(
    user?.profile?.height ? String(user.profile.height) : ''
  );
  const [currentWeight, setCurrentWeight] = useState<string>(
    user?.profile?.currentWeight ? String(user.profile.currentWeight) : ''
  );
  const [targetWeight, setTargetWeight] = useState<string>(
    user?.profile?.targetWeight ? String(user.profile.targetWeight) : ''
  );
  const [activityLevel, setActivityLevel] = useState<
    'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  >((user?.profile?.activityLevel as any) ?? 'moderate');
  const [fitnessGoal, setFitnessGoal] = useState<
    'muscle_gain' | 'fat_loss' | 'maintenance' | 'strength'
  >((user?.profile?.fitnessGoal as any) ?? 'muscle_gain');

  // Submit states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync state if user loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '');
      if (user.profile) {
        if (user.profile.dateOfBirth) {
          setDateOfBirth(user.profile.dateOfBirth.split('T')[0]);
        }
        if (user.profile.biologicalSex) {
          setBiologicalSex(user.profile.biologicalSex as any);
        }
        if (user.profile.height) setHeight(String(user.profile.height));
        if (user.profile.currentWeight) setCurrentWeight(String(user.profile.currentWeight));
        if (user.profile.targetWeight) setTargetWeight(String(user.profile.targetWeight));
        if (user.profile.activityLevel) setActivityLevel(user.profile.activityLevel as any);
        if (user.profile.fitnessGoal) setFitnessGoal(user.profile.fitnessGoal as any);
        if (user.profile.preferredUnits) setPreferredUnits(user.profile.preferredUnits);
      }
    }
  }, [user]);

  // Derive initials for avatar
  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  // Derived metrics
  const age = useMemo(() => {
    if (!dateOfBirth) return null;
    const diffMs = Date.now() - new Date(dateOfBirth).getTime();
    if (isNaN(diffMs) || diffMs < 0) return null;
    return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
  }, [dateOfBirth]);

  const bmiData = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(currentWeight);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const hM = h / 100;
    const bmi = +(w / (hM * hM)).toFixed(1);
    let category = 'Normal weight';
    let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

    if (bmi < 18.5) {
      category = 'Underweight';
      colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    } else if (bmi >= 30) {
      category = 'Obese';
      colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
    return { bmi, category, colorClass };
  }, [height, currentWeight]);

  // Estimated TDEE
  const tdeeEstimate = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(currentWeight);
    if (!h || !w || !age || age <= 0) return null;

    // Mifflin-St Jeor
    let bmr = 10 * w + 6.25 * h - 5 * age;
    if (biologicalSex === 'female') {
      bmr -= 161;
    } else {
      bmr += 5;
    }

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const mult = activityMultipliers[activityLevel] || 1.55;
    return Math.round(bmr * mult);
  }, [height, currentWeight, age, biologicalSex, activityLevel]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        dateOfBirth: dateOfBirth ? dateOfBirth : null,
        biologicalSex,
        height: height ? parseFloat(height) : null,
        currentWeight: currentWeight ? parseFloat(currentWeight) : null,
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
        activityLevel,
        fitnessGoal,
        preferredUnits,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
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
      alert('Account deletion request submitted.');
    }
  };

  // Not logged in — prompt to sign in
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
          <LogIn className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {t('profile.sign_in_prompt', 'Sign in to view your profile')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('common.auth_required_desc', 'Create an account to save your workouts and preferences.')}
          </p>
        </div>
        <button
          onClick={openLoginModal}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          {t('common.sign_in', 'Sign In')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('profile.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {t('profile.subtitle')}
        </p>
      </div>

      {/* User Info Overview Card */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-full h-full rounded-[14px] object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {initials}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {user.displayName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 text-[11px] rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-semibold capitalize">
                {t(`profile.${fitnessGoal}`, fitnessGoal.replace('_', ' '))}
              </span>
              {currentWeight && (
                <span className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {currentWeight} kg
                </span>
              )}
              {height && (
                <span className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {height} cm
                </span>
              )}
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                {t('profile.member_since', 'Member since')} {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time calculated widgets */}
        <div className="flex items-center gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
          {bmiData && (
            <div className="flex-1 sm:flex-initial bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-center min-w-[95px]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">BMI</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{bmiData.bmi}</div>
              <div className={`text-[10px] font-semibold px-1.5 py-0.2 rounded mt-0.5 border inline-block ${bmiData.colorClass}`}>
                {bmiData.category}
              </div>
            </div>
          )}

          {tdeeEstimate && (
            <div className="flex-1 sm:flex-initial bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-center min-w-[95px]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-orange-500 dark:text-orange-400" /> TDEE
              </div>
              <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">{tdeeEstimate}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">kcal/day</div>
            </div>
          )}
        </div>
      </div>

      {/* Personal Biometrics & Fitness Attributes Form */}
      <form onSubmit={handleSaveProfile} className="glass-panel p-6 rounded-2xl space-y-6 border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3>{t('profile.biometrics_title', 'Personal Biometrics & AI Coach Parameters')}</h3>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            {t('profile.syncs_gemini', 'Syncs with Gemini Coach & Progressive Overload')}
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 text-sm animate-fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{t('profile.save_success', 'Profile and biometrics saved successfully! Gemini AI Coach will now adapt to your updated metrics.')}</span>
          </div>
        )}

        {saveError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-600 dark:text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" /> {t('profile.full_name', 'Full Name / Display Name')}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('profile.name_ph', 'e.g. Alex Johnson')}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {t('profile.dob', 'Date of Birth')}
              </span>
              {age !== null && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  {age} {t('profile.years_old', 'years old')}
                </span>
              )}
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
            />
          </div>

          {/* Biological Sex */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-slate-400" /> {t('profile.biological_sex', 'Biological Sex')}
            </label>
            <select
              value={biologicalSex}
              onChange={(e) => setBiologicalSex(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
            >
              <option value="male">{t('profile.male', 'Male')}</option>
              <option value="female">{t('profile.female', 'Female')}</option>
              <option value="other">{t('profile.other_gender', 'Other / Prefer not to say')}</option>
            </select>
          </div>

          {/* Fitness Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" /> {t('profile.primary_goal', 'Primary Fitness Goal')}
            </label>
            <select
              value={fitnessGoal}
              onChange={(e) => setFitnessGoal(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
            >
              <option value="muscle_gain">{t('profile.muscle_gain', 'Muscle Gain (Hypertrophy)')}</option>
              <option value="fat_loss">{t('profile.fat_loss', 'Fat Loss (Cutting)')}</option>
              <option value="strength">{t('profile.strength_goal', 'Strength (Powerlifting)')}</option>
              <option value="maintenance">{t('profile.maintenance_goal', 'Maintenance (General Health)')}</option>
            </select>
          </div>

          {/* Height */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>{t('profile.height', 'Height')}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">cm</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="50"
                max="260"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={t('profile.height_ph', 'e.g. 175')}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">cm</span>
            </div>
          </div>

          {/* Current Weight */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400" /> {t('profile.current_weight', 'Current Weight')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">kg</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="25"
                max="300"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder={t('profile.weight_ph', 'e.g. 72.5')}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">kg</span>
            </div>
          </div>

          {/* Target Weight */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>{t('profile.target_weight', 'Target Weight')}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">kg</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="25"
                max="300"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder={t('profile.target_weight_ph', 'e.g. 78.0')}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">kg</span>
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-slate-400" /> {t('profile.activity_level', 'Daily Activity Level')}
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
            >
              <option value="sedentary">{t('profile.sedentary', 'Sedentary (Desk job, minimal activity)')}</option>
              <option value="light">{t('profile.light_act', 'Light Activity (1–3 workout days/week)')}</option>
              <option value="moderate">{t('profile.moderate_act', 'Moderate (3–5 workout days/week)')}</option>
              <option value="active">{t('profile.active_act', 'Active (6–7 workout days/week)')}</option>
              <option value="very_active">{t('profile.very_active_act', 'Very Active (Athlete / Physical labor)')}</option>
            </select>
          </div>
        </div>

        {/* Submit action */}
        <div className="pt-3 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('common.saving', 'Saving...')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t('profile.save_profile', 'Save Profile Changes')}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preferences Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-5 border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
          <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3>{t('profile.app_preferences', 'Application Preferences')}</h3>
        </div>

        {/* Units setting */}
        <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t('profile.units')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Canonical database storage remains strictly metric (kg/cm)
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setPreferredUnits('metric')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                preferredUnits === 'metric'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Metric (kg, cm)
            </button>
            <button
              onClick={() => setPreferredUnits('imperial')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                preferredUnits === 'imperial'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Imperial (lb, in)
            </button>
          </div>
        </div>

        {/* Language setting */}
        <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t('common.language')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Switch UI and Gemini AI response language
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                i18n.language.startsWith('en')
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              English 🇺🇸
            </button>
            <button
              onClick={() => i18n.changeLanguage('vi')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                i18n.language.startsWith('vi')
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tiếng Việt 🇻🇳
            </button>
          </div>
        </div>

        {/* Theme setting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t('profile.theme_title', 'Appearance & Theme')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('profile.theme_desc', 'Switch between dark, light, or follow system theme')}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{t('profile.theme_dark', 'Dark')}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{t('profile.theme_light', 'Light')}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                theme === 'system'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{t('profile.theme_system', 'System')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data & Privacy Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3>{t('profile.privacy_control', 'Privacy & Data Control')}</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('profile.privacy_desc', 'You have full ownership of your fitness logs, biometric data, and form analysis records.')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('profile.export_data')} (JSON)</span>
          </button>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('profile.delete_account')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
