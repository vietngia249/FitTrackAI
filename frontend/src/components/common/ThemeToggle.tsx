import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.js';

export const ThemeToggle: React.FC<{ showLabel?: boolean; className?: string }> = ({
  showLabel = false,
  className = '',
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
        isDark
          ? 'bg-slate-800/80 border border-slate-700/80 hover:border-amber-400/50 hover:bg-slate-700/60 text-slate-200'
          : 'bg-white/90 border border-slate-200 hover:border-amber-500/60 hover:bg-slate-50 text-slate-700 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode (Chế độ sáng)' : 'Switch to Dark Mode (Chế độ tối)'}
      aria-label="Toggle theme mode"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500 transition-transform duration-300 hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="hidden sm:inline font-medium">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
