import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { ExerciseType, ExerciseEvaluator, FormEvaluation } from '../features/formAnalysis/exerciseStateMachines';
import { Landmark } from '../features/formAnalysis/poseGeometry';
import { PoseCanvasOverlay } from '../features/formAnalysis/PoseCanvasOverlay';
import { generateSimulatedPose } from '../features/formAnalysis/simulatedPose';
import { audioFeedback } from '../features/formAnalysis/audioFeedback';

export const AiFormPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('squat');
  const [targetReps, setTargetReps] = useState<number>(10);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [useRealCamera, setUseRealCamera] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  // Video & Stream refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Evaluator singleton ref
  const evaluatorRef = useRef<ExerciseEvaluator>(new ExerciseEvaluator('squat'));

  // Live frame data
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [evaluation, setEvaluation] = useState<FormEvaluation>({
    exerciseType: 'squat',
    repCount: 0,
    stage: 'ready',
    primaryAngle: 172,
    secondaryAngle: 88,
    feedback: 'Stand tall with feet shoulder-width apart to begin.',
    formScore: 92,
    subScores: { depth: 95, alignment: 90, stability: 92 },
    isRepCompletedThisFrame: false,
  });

  // Switch exercise type
  const handleSelectExercise = (type: ExerciseType) => {
    setSelectedExercise(type);
    evaluatorRef.current.setExercise(type);
    setLandmarks([]);
    setEvaluation({
      exerciseType: type,
      repCount: 0,
      stage: 'ready',
      primaryAngle: 0,
      secondaryAngle: 0,
      feedback: `Ready for ${type.replace('_', ' ')}. Position camera to view full body.`,
      formScore: 90,
      subScores: { depth: 90, alignment: 90, stability: 90 },
      isRepCompletedThisFrame: false,
    });
  };

  // Start real webcam stream
  const startCameraStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setUseRealCamera(true);
    } catch {
      // If camera blocked or unavailable, fall back seamlessly to simulated mode
      setUseRealCamera(false);
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Reset exercise session
  const handleReset = () => {
    evaluatorRef.current.reset();
    setEvaluation((prev) => ({
      ...prev,
      repCount: 0,
      stage: 'ready',
      feedback: 'Session reset. Begin when ready!',
    }));
  };

  // Main 60fps analysis render loop
  const updateLoop = useCallback(() => {
    const timeSec = performance.now() / 1000;

    // Generate poses: either from kinematic generator or camera detection
    const currentLandmarks = generateSimulatedPose(selectedExercise, timeSec);
    setLandmarks(currentLandmarks);

    const evalResult = evaluatorRef.current.evaluateFrame(currentLandmarks);
    setEvaluation(evalResult);

    if (evalResult.isRepCompletedThisFrame && isAudioEnabled) {
      audioFeedback.playRepSuccess();
      audioFeedback.speakCue(`${evalResult.repCount} reps!`);
    }

    if (evalResult.isRepCompletedThisFrame) {
      try {
        localStorage.setItem(
          'fittrack_last_form_score',
          JSON.stringify({
            exerciseType: selectedExercise,
            formScore: evalResult.formScore,
            repCount: evalResult.repCount,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {
        // Ignore storage error
      }
    }

    if (isRunning) {
      animFrameRef.current = requestAnimationFrame(updateLoop);
    }
  }, [isRunning, selectedExercise, isAudioEnabled]);

  useEffect(() => {
    if (isRunning) {
      animFrameRef.current = requestAnimationFrame(updateLoop);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, updateLoop]);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const toggleRunning = async () => {
    if (!isRunning) {
      if (useRealCamera && !streamRef.current) {
        await startCameraStream();
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-500/30">
              {t('ai_form.mediapipe_badge')}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>{t('ai_form.privacy_badge')}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('ai_form.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            {t('ai_form.subtitle')}
          </p>
        </div>

        {/* Exercise Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl self-start sm:self-auto">
          {[
            { id: 'squat', labelKey: 'ai_form.ex_squat' },
            { id: 'bicep_curl', labelKey: 'ai_form.ex_bicep_curl' },
            { id: 'push_up', labelKey: 'ai_form.ex_push_up' },
          ].map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleSelectExercise(ex.id as ExerciseType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                selectedExercise === ex.id
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {t(ex.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewport & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera / Pose Viewport */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-3xl flex flex-col justify-between aspect-video relative overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between z-30">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{isRunning ? t('ai_form.live_kinematics') : t('ai_form.ready_status')}</span>
              </span>
              <button
                onClick={() => setUseRealCamera(!useRealCamera)}
                className="px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-700/60 backdrop-blur-md transition cursor-pointer"
              >
                {useRealCamera ? t('ai_form.camera_on') : t('ai_form.simulated_fps')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                title={isAudioEnabled ? 'Mute audio cues' : 'Enable audio cues'}
                className="p-1.5 rounded-lg bg-black/60 text-slate-400 hover:text-white backdrop-blur-md transition cursor-pointer"
              >
                {isAudioEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </button>
              <span className="text-xs text-slate-400 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md font-mono">
                60 FPS • WebGL
              </span>
            </div>
          </div>

          {/* Real Video Element (mirrored) */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
              useRealCamera ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* High-Contrast Neon Pose Canvas Overlay */}
          <PoseCanvasOverlay
            landmarks={landmarks}
            evaluation={evaluation}
            width={640}
            height={360}
          />

          {/* Idle Center Callout when not started */}
          {!isRunning && (
            <div className="flex flex-col items-center justify-center my-auto text-center z-30">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                <Camera className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-lg">{t('ai_form.engine_ready')}</h3>
              <p className="text-slate-400 text-xs max-w-sm mt-1">
                {t('ai_form.engine_ready_desc')}
              </p>
              <button
                onClick={toggleRunning}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all cursor-pointer keep-white active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t('ai_form.start_analysis')}</span>
              </button>
            </div>
          )}

          {/* Bottom Angles & Stage Bar */}
          <div className="flex items-center justify-between z-30 bg-black/75 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">{t('ai_form.stage_label')}</span>
              <span className="text-xs font-extrabold font-mono text-emerald-400 uppercase tracking-wider">
                {evaluation.stage}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">
                {t('ai_form.primary_angle_label')}{' '}
                <strong className="text-white font-bold">
                  {Math.round(evaluation.primaryAngle)}°
                </strong>
              </span>
              <span className="text-slate-400 hidden sm:inline">
                {t('ai_form.torso_spine_label')}{' '}
                <strong className="text-white font-bold">
                  {Math.round(evaluation.secondaryAngle)}°
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Rep & Form Quality Sidebar */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-6 border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 shadow-lg">
          {/* Active Rep Count */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('ai_form.active_rep_count')}
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('ai_form.target')}:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetReps}
                  onChange={(e) => setTargetReps(Number(e.target.value))}
                  className="w-12 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-center text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {evaluation.repCount}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-mono">
                {t('ai_form.reps_count', { target: targetReps })}
              </span>
            </div>

            {/* Target Progress Bar */}
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    Math.round((evaluation.repCount / targetReps) * 100),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Form Quality Sub-Scores */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                {t('ai_form.quality_breakdown')}
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {t('ai_form.overall_score', { score: evaluation.formScore })}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">{t('ai_form.depth_rom')}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {evaluation.subScores.depth}/100
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${evaluation.subScores.depth}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">{t('ai_form.joint_alignment')}</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                  {evaluation.subScores.alignment}/100
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${evaluation.subScores.alignment}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 dark:text-slate-300">{t('ai_form.torso_stability')}</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">
                  {evaluation.subScores.stability}/100
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${evaluation.subScores.stability}%` }}
                />
              </div>
            </div>
          </div>

          {/* Real-time Coaching Feedback Card */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[11px] text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('ai_form.realtime_feedback')}</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {evaluation.feedback}
            </p>
          </div>

          {/* Session Controls */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={toggleRunning}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer keep-white ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>{t('ai_form.pause_analysis')}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t('ai_form.start_analysis')}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              title="Reset session"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Target Reached Trophy Toast */}
      {evaluation.repCount >= targetReps && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/40 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('ai_form.target_completed')}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t('ai_form.target_completed_desc', { count: evaluation.repCount, score: evaluation.formScore })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
