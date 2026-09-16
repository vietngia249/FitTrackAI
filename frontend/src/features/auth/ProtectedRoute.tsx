import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext.js';
import { Lock, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { t } = useTranslation();
  const { user, isLoading, openLoginModal } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 glass-panel p-8 rounded-2xl text-center space-y-4 border border-slate-200/80 dark:border-slate-800 shadow-lg">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('common.auth_required')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('common.auth_required_desc')}
        </p>
        <button
          onClick={openLoginModal}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 keep-white"
        >
          <LogIn className="w-4 h-4" />
          <span>{t('common.sign_in')}</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
