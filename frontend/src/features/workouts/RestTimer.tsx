import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, X, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RestTimerProps {
  initialSeconds?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 90,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sync initial seconds when triggered
  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setTotalSeconds(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds, isOpen]);

  // Web Audio chime generator
  const playTimerChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      const now = ctx.currentTime;
      // High chime tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5 note

      // Envelope
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 1.2);

      // Low harmonious fifth tone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(587.33, now); // D5 note

      gain2.gain.setValueAtTime(0.2, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now);
      osc2.stop(now + 1.2);

      // Mobile vibration
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch {
      // Audio playback fails gracefully if policy blocked
    }
  };

  useEffect(() => {
    if (!isOpen || !isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          playTimerChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  const handleAdjust = (delta: number) => {
    setSecondsLeft((prev) => {
      const next = Math.max(0, prev + delta);
      if (next > totalSeconds) setTotalSeconds(next);
      return next;
    });
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-slide-up">
      <div className="relative overflow-hidden bg-white/95 dark:bg-[#0d121f]/95 border border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-emerald-950/20 dark:shadow-emerald-950/40 backdrop-blur-xl w-72 sm:w-80">
        {/* Progress bar line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Timer className="w-4 h-4 animate-spin-slow" />
            <span>{t('workouts.rest_interval')}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={playTimerChime}
              title="Test chime"
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timer numeric display */}
        <div className="text-center py-2">
          <div
            className={`font-mono text-4xl sm:text-5xl font-black tracking-tight ${
              secondsLeft === 0
                ? 'text-emerald-500 dark:text-emerald-400 animate-pulse'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatTime(secondsLeft)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {secondsLeft === 0 ? 'Rest complete! Ready for next set.' : 'Breathe & recover'}
          </span>
        </div>

        {/* Timer controls */}
        <div className="flex items-center justify-between pt-2 gap-2">
          <button
            onClick={() => handleAdjust(-15)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
            title="Subtract 15 seconds"
          >
            -15s
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition active:scale-95 keep-white"
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{t('workouts.pause')}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t('workouts.resume')}</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleAdjust(30)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
            title="Add 30 seconds"
          >
            +30s
          </button>
        </div>
      </div>
    </div>
  );
};
