import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Play, Shield } from 'lucide-react';

export const AiFormPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedExercise, setSelectedExercise] = useState('squat');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              MediaPipe Pose 33-Keypoints
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              100% Client-Side / Private
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('ai_form.title')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {t('ai_form.subtitle')}
          </p>
        </div>

        {/* Exercise Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {[
            { id: 'bicep_curl', label: 'Bicep Curl' },
            { id: 'squat', label: 'Squat' },
            { id: 'push_up', label: 'Push-up' },
          ].map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelectedExercise(ex.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedExercise === ex.id
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Analyzer Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera / Pose Canvas Box */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between aspect-video relative overflow-hidden bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
              LIVE POSE TRACKING
            </span>
            <span className="text-xs text-slate-400 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-md font-mono">
              60 FPS • WebGL
            </span>
          </div>

          {/* Center Simulated Pose Visualization */}
          <div className="flex flex-col items-center justify-center my-auto text-center z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
              <Camera className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-white font-bold text-lg">Webcam Ready</h3>
            <p className="text-slate-400 text-xs max-w-sm mt-1">
              Position yourself 2–3 meters away so your full body is visible in the frame.
            </p>
            <button className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all">
              <Play className="w-4 h-4 fill-current" />
              <span>Start Real-time Analysis</span>
            </button>
          </div>

          {/* Bottom Overlay Status */}
          <div className="flex items-center justify-between z-10 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">State:</span>
              <span className="text-xs font-bold font-mono text-emerald-400 uppercase">
                STANDING / READY
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Knee Angle: <strong className="text-white">172°</strong></span>
              <span className="text-slate-400">Torso: <strong className="text-white">88°</strong></span>
            </div>
          </div>
        </div>

        {/* Rep & Form Score Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Active Rep Count</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-black text-white font-mono">0</span>
              <span className="text-sm font-semibold text-slate-400">/ 10 target</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Form Quality Sub-Scores
            </h4>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Squat Depth</span>
                <span className="text-emerald-400 font-mono font-bold">95/100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: '95%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Knee Alignment</span>
                <span className="text-cyan-400 font-mono font-bold">88/100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Torso Stability</span>
                <span className="text-amber-400 font-mono font-bold">82/100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            <strong>Coaching Feedback:</strong> Great hip hinge. Ensure your knees track outwards over your toes at the bottom position.
          </div>
        </div>
      </div>
    </div>
  );
};
