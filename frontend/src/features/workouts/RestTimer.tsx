import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, X, Volume2 } from 'lucide-react';

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
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.3); // A6 note
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Mobile vibration
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isOpen && isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            playTimerChime();
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isRunning, secondsLeft]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent =
    totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  const handleAdjust = (delta: number) => {
    setSecondsLeft((prev) => {
      const next = Math.max(0, prev + delta);
      if (next > totalSeconds) setTotalSeconds(next);
      return next;
    });
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-slide-up">
      <div className="relative overflow-hidden bg-[#0d121f]/95 border border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl w-72 sm:w-80">
        {/* Progress bar line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Timer className="w-4 h-4 animate-spin-slow" />
            <span>Rest Interval</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={playTimerChime}
              title="Test chime"
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/80 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition"
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
                ? 'text-emerald-400 animate-pulse'
                : 'text-white'
            }`}
          >
            {formatTime(secondsLeft)}
          </div>
          <span className="text-[11px] text-slate-400">
            {secondsLeft === 0 ? 'Rest complete! Ready for next set.' : 'Breathe & recover'}
          </span>
        </div>

        {/* Timer controls */}
        <div className="flex items-center justify-between pt-2 gap-2">
          <button
            onClick={() => handleAdjust(-15)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            title="Subtract 15 seconds"
          >
            -15s
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition"
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleAdjust(30)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            title="Add 30 seconds"
          >
            +30s
          </button>
        </div>
      </div>
    </div>
  );
};
