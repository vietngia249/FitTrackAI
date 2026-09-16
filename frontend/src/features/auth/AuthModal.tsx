import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext.js';
import { X, Lock, Mail, User, AlertCircle, Dumbbell, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    isAuthModalOpen,
    authModalMode,
    openLoginModal,
    openRegisterModal,
    closeAuthModal,
    login,
    register,
    loginWithGoogle,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('muscle_gain');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleGoogleSignIn = () => {
    setError(null);
    setGoogleLoading(true);

    const clientId =
      (import.meta as any).env.VITE_GOOGLE_CLIENT_ID ||
      (import.meta as any).env.GOOGLE_CLIENT_ID ||
      '';

    if (!clientId) {
      setGoogleLoading(false);
      setError('VITE_GOOGLE_CLIENT_ID is not configured in .env. Please configure it or sign in with email and password below.');
      return;
    }

    const google = (window as any).google;
    if (google?.accounts?.id) {
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential?: string }) => {
            if (response.credential) {
              try {
                await loginWithGoogle(response.credential);
              } catch (err: any) {
                setError(err.message || 'Google authentication failed');
              } finally {
                setGoogleLoading(false);
              }
            } else {
              setGoogleLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        google.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.()) {
            setGoogleLoading(false);
            setError(
              'Google Sign-In prompt could not be displayed. Configure VITE_GOOGLE_CLIENT_ID in your environment or continue with email below.'
            );
          } else if (notification?.isSkippedMoment?.() || notification?.isDismissedMoment?.()) {
            setGoogleLoading(false);
          }
        });
      } catch (err: any) {
        setGoogleLoading(false);
        setError(err.message || 'Unable to initialize Google Sign-In');
      }
    } else {
      setGoogleLoading(false);
      setError(
        'Google Identity Services is loading or unavailable. You can sign in using your email and password.'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({
          email,
          password,
          displayName,
          fitnessGoal,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-[#111622]/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {isLogin ? t('auth.sign_in_title', 'Sign In to FitTrack AI') : t('auth.create_account_title', 'Create an Athlete Account')}
            </span>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => {
              setError(null);
              openLoginModal();
            }}
            className={`flex-1 py-3 text-xs font-semibold text-center transition-all cursor-pointer ${
              isLogin
                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t('auth.tab_sign_in', 'Sign In')}
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              openRegisterModal();
            }}
            className={`flex-1 py-3 text-xs font-semibold text-center transition-all cursor-pointer ${
              !isLogin
                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t('auth.tab_register', 'Register')}
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-sm font-semibold text-slate-800 dark:text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>
              {googleLoading
                ? t('auth.connecting_google', 'Connecting to Google...')
                : isLogin
                ? t('auth.continue_google', 'Continue with Google')
                : t('auth.signup_google', 'Sign up with Google')}
            </span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-[#111622] px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider shrink-0">
              {t('auth.or_email', 'or continue with email')}
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('auth.display_name', 'Display Name')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Nguyen"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('auth.email_address', 'Email Address')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@fittrack.ai"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('auth.password', 'Password')} {isLogin ? '' : t('auth.min_chars', '(min. 8 characters)')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('profile.primary_goal', 'Primary Fitness Goal')}
                </label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="muscle_gain">{t('profile.muscle_gain', 'Muscle Gain (Hypertrophy)')}</option>
                  <option value="strength">{t('profile.strength_goal', 'Strength & Powerlifting')}</option>
                  <option value="fat_loss">{t('profile.fat_loss', 'Fat Loss & Conditioning')}</option>
                  <option value="maintenance">{t('profile.maintenance_goal', 'General Maintenance & Health')}</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white keep-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <span>
                {isSubmitting
                  ? t('auth.processing', 'Processing...')
                  : isLogin
                  ? t('auth.sign_in_btn', 'Sign In to Account')
                  : t('auth.register_btn', 'Create Athlete Account')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
