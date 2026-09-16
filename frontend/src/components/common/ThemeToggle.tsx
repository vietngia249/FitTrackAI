import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext.js';

export const ThemeToggle: React.FC<{ showLabel?: boolean; className?: string }> = ({
  showLabel = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
        isDark
          ? 'bg-slate-800/80 border border-slate-700/80 hover:border-amber-400/50 hover:bg-slate-700/60 text-slate-200'
          : 'bg-white border border-slate-200 hover:border-amber-500/60 hover:bg-slate-50 text-slate-700 shadow-sm'
      } ${className}`}
      title={isDark ? t('common.switch_theme_light') : t('common.switch_theme_dark')}
      aria-label="Toggle theme mode"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500 transition-transform duration-300 hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="hidden sm:inline font-medium">
          {isDark ? t('profile.theme_light') : t('profile.theme_dark')}
        </span>
      )}
    </button>
  );
};
