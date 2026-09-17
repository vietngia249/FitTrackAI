import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, Focus } from 'lucide-react';

interface PositioningGuideProps {
  isPersonDetected: boolean;
  isRunning: boolean;
}

export const PositioningGuide: React.FC<PositioningGuideProps> = ({
  isPersonDetected,
  isRunning,
}) => {
  const { t } = useTranslation();

  if (!isRunning) return null;

  if (isPersonDetected) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-opacity duration-300">
        <div className="px-3 py-1 rounded-full bg-emerald-500/80 text-white font-bold text-xs backdrop-blur-md shadow-lg flex items-center gap-1.5 keep-white border border-emerald-400/40">
          <UserCheck className="w-3.5 h-3.5" />
          <span>{t('ai_form.body_locked', 'Đã Khóa Mục Tiêu Cơ Thể')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-25 pointer-events-none flex flex-col items-center justify-center p-4">
      {/* Target Framing Silhouette Box */}
      <div className="w-48 sm:w-56 h-72 sm:h-80 border-2 border-dashed border-cyan-400/70 rounded-3xl relative flex flex-col items-center justify-between p-3 animate-pulse shadow-lg shadow-cyan-500/10">
        {/* Top Head Target */}
        <div className="w-14 h-14 rounded-full border border-cyan-400/60 bg-cyan-500/10 flex items-center justify-center">
          <Focus className="w-6 h-6 text-cyan-300" />
        </div>

        {/* Torso area hint */}
        <div className="text-center px-2 py-1 bg-black/60 rounded-xl backdrop-blur-md border border-cyan-500/30">
          <p className="text-[11px] font-bold text-cyan-300">
            {t('ai_form.position_guide_prompt', 'Đứng vào trong khung')}
          </p>
        </div>

        {/* Feet level marker */}
        <div className="w-24 h-1.5 rounded-full bg-cyan-400/40" />
      </div>

      <div className="mt-3 px-3 py-1 rounded-full bg-black/75 text-amber-300 border border-amber-500/40 text-xs font-semibold backdrop-blur-md">
        {t('ai_form.step_back_prompt', 'Lùi lại để camera nhìn rõ từ đầu tới chân')}
      </div>
    </div>
  );
};
