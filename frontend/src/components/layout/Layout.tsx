import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  TrendingUp,
  Camera,
  Sparkles,
  User,
  BookOpen
} from 'lucide-react';
import { LanguageSwitcher } from '../common/LanguageSwitcher.js';
import { useAuth } from '../../features/auth/AuthContext.js';
import { AuthModal } from '../../features/auth/AuthModal.js';
import { LogIn, LogOut } from 'lucide-react';

export const Layout: React.FC = () => {
  const { t } = useTranslation();
  const { user, openLoginModal, logout } = useAuth();

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/workouts', label: t('nav.workouts'), icon: Dumbbell },
    { to: '/exercises', label: t('nav.exercises'), icon: BookOpen },
    { to: '/nutrition', label: t('nav.nutrition'), icon: Utensils },
    { to: '/progress', label: t('nav.progress'), icon: TrendingUp },
    { to: '/ai-form', label: t('nav.ai_form'), icon: Camera, badge: 'AI' },
    { to: '/insights', label: t('nav.insights'), icon: Sparkles },
    { to: '/profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100">
      {/* Desktop & Tablet Top Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0d14] rounded-[10px] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight gradient-text">
                  FitTrack AI
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  BETA
                </span>
              </div>
              <span className="text-[10px] text-slate-400 -mt-1 hidden sm:inline">
                {t('common.tagline')}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Header Actions: Language & User */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase">
                    {user.displayName.slice(0, 2)}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 hidden lg:inline">
                    {user.displayName}
                  </span>
                  <button
                    onClick={() => logout()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs shadow transition-all active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Mobile Bottom Navigation (Visible on screens < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-800/80 px-2 py-2">
        <div className="grid grid-cols-6 gap-1 items-center">
          {navItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-medium transition-all ${
                    isActive
                      ? 'text-emerald-400 font-semibold bg-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="truncate w-full text-center">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
