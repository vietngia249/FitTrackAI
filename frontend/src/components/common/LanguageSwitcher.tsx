import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('vi') ? 'en' : 'vi';
    i18n.changeLanguage(nextLang);
  };

  const isVi = i18n.language.startsWith('vi');

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-700/60 transition-all text-slate-200 active:scale-95"
      title="Switch Language / Chuyển đổi ngôn ngữ"
    >
      <Globe className="w-3.5 h-3.5 text-emerald-400" />
      <span>{isVi ? 'VI 🇻🇳' : 'EN 🇺🇸'}</span>
    </button>
  );
};
