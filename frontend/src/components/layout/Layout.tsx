import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  TrendingUp,
  Camera,
  Sparkles,
  User,
  BookOpen,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { LanguageSwitcher } from '../common/LanguageSwitcher.js';
import { ThemeToggle } from '../common/ThemeToggle.js';
import { useAuth } from '../../features/auth/AuthContext.js';
import { AuthModal } from '../../features/auth/AuthModal.js';
import { AiCopilotDrawer } from '../../features/copilot/AiCopilotDrawer.js';

export const Layout: React.FC = () => {
  const { t } = useTranslation();
  const { user, openLoginModal, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Find active item for header breadcrumb
  const currentNav = navItems.find((item) =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  ) || navItems[0];
  const CurrentIcon = currentNav.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0a0d14] dark:text-slate-100 transition-colors duration-200 flex">
      {/* =========================================================================
          1. DESKTOP & TABLET VERTICAL SIDEBAR (Fixed Left, w-64)
          ========================================================================= */}
      <aside className="hidden md:flex flex-col fixed top-0 bottom-0 left-0 w-64 z-40 bg-white/95 dark:bg-[#0a0d14]/95 border-r border-slate-200/90 dark:border-slate-800/80 backdrop-blur-xl select-none">
        {/* Sidebar Brand Header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-white dark:bg-[#0a0d14] rounded-[10px] flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight gradient-text truncate">
                FitTrack AI
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                BETA
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate">
              {t('common.tagline')}
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={
                  `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/30">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute right-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-l-full" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer / User Profile Card */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#0e131f] border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase flex-shrink-0">
                  {user.displayName.slice(0, 2)}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {user.email || 'Athlete'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex-shrink-0"
                title={t('common.sign_out')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('common.sign_in')}</span>
            </button>
          )}
        </div>
      </aside>

      {/* =========================================================================
          2. MOBILE SLIDE-OVER DRAWER
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer Menu */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#0a0d14] h-full shadow-2xl flex flex-col z-50 p-4 border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-500" />
                <span className="font-extrabold text-base gradient-text">FitTrack AI</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Appearance & Lang</span>
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
              </div>
              {user ? (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('common.sign_out')}</span>
                </button>
              ) : (
                <button
                  onClick={() => { openLoginModal(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-white bg-emerald-500 rounded-xl shadow"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('common.sign_in')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. MAIN CONTENT AREA (Offset by Sidebar on Desktop `md:pl-64`)
          ========================================================================= */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Clean, Minimalist Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0a0d14]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Header Left: Mobile Drawer Trigger or Page Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Current View Title */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CurrentIcon className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-400 hidden sm:inline">FitTrack</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:inline" />
                <h1 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                  {currentNav.label}
                </h1>
              </div>
            </div>
          </div>

          {/* Header Right: Controls (Language, Theme, User) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <ThemeToggle />

            {/* Compact Header Auth for screens where sidebar isn't visible or quick switch */}
            <div className="md:hidden flex items-center pl-2 border-l border-slate-200 dark:border-slate-800">
              {user ? (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">
                  {user.displayName.slice(0, 2)}
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow transition-all active:scale-95"
                >
                  {t('common.sign_in')}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Global Modals & Copilot Drawer */}
      <AuthModal />
      <AiCopilotDrawer />

      {/* Mobile Bottom Navigation Bar (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0a0d14]/95 border-t border-slate-200/80 dark:border-slate-800/80 backdrop-blur-lg px-1 py-1.5 shadow-lg">
        <div className="grid grid-cols-6 gap-0.5 items-center">
          {navItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={
                  `flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-medium transition-all ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="truncate w-full text-center text-[9px]">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
