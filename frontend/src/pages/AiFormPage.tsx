import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  UploadCloud,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { ExerciseType, ExerciseEvaluator, FormEvaluation } from '../features/formAnalysis/exerciseStateMachines';
import { Landmark } from '../features/formAnalysis/poseGeometry';
import { PoseCanvasOverlay } from '../features/formAnalysis/PoseCanvasOverlay';
import { generateSimulatedPose } from '../features/formAnalysis/simulatedPose';
import { audioFeedback } from '../features/formAnalysis/audioFeedback';
import { getPoseLandmarker, detectPoseFromVideo } from '../features/formAnalysis/poseDetector';
import type { PoseLandmarker } from '@mediapipe/tasks-vision';

type FormSourceMode = 'camera' | 'video_upload' | 'simulated';

export const AiFormPage: React.FC = () => {
  const { t } = useTranslation();

  // Selected exercise & target
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('squat');
  const [targetReps, setTargetReps] = useState<number>(10);
  const [sourceMode, setSourceMode] = useState<FormSourceMode>('camera');

  // Control & audio state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  // AI Model state
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPersonDetected, setIsPersonDetected] = useState<boolean>(true);

  // Video Upload state
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoAnalysisComplete, setVideoAnalysisComplete] = useState<boolean>(false);
  const [collectedScores, setCollectedScores] = useState<number[]>([]);

  // Video & Stream refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);

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

  // Preload MediaPipe PoseLandmarker
  useEffect(() => {
    let isMounted = true;
    setIsModelLoading(true);

    getPoseLandmarker()
      .then((landmarker) => {
        if (isMounted && landmarker) {
          landmarkerRef.current = landmarker;
          setIsModelReady(true);
        }
      })
      .catch((err) => {
        console.error('PoseLandmarker initialization error:', err);
      })
      .finally(() => {
        if (isMounted) setIsModelLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start real webcam stream
  const startCameraStream = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      return true;
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError(t('ai_form.camera_perm_error'));
      return false;
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current && sourceMode === 'camera') {
      videoRef.current.srcObject = null;
    }
  };

  // Handle switching source mode
  const handleSwitchMode = (mode: FormSourceMode) => {
    if (mode === sourceMode) return;

    // Clean up current running state
    setIsRunning(false);
    stopCameraStream();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    setSourceMode(mode);
    setCameraError(null);
    setVideoAnalysisComplete(false);
    setLandmarks([]);
    evaluatorRef.current.reset();
    setCollectedScores([]);

    // If switching to video mode with an existing video, pause it
    if (videoRef.current && mode === 'video_upload' && uploadedVideoUrl) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsVideoPlaying(false);
    }
  };

  // Switch exercise type
  const handleSelectExercise = (type: ExerciseType) => {
    setSelectedExercise(type);
    evaluatorRef.current.setExercise(type);
    setLandmarks([]);
    setCollectedScores([]);
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

  // Reset exercise session
  const handleReset = () => {
    evaluatorRef.current.reset();
    setCollectedScores([]);
    setVideoAnalysisComplete(false);
    setEvaluation((prev) => ({
      ...prev,
      repCount: 0,
      stage: 'ready',
      feedback: 'Session reset. Begin when ready!',
    }));

    if (sourceMode === 'video_upload' && videoRef.current) {
      videoRef.current.currentTime = 0;
      setVideoCurrentTime(0);
    }
  };

  // Handle video file upload
  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file (.mp4, .webm, .mov).');
      return;
    }

    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setUploadedVideoUrl(objectUrl);
    setUploadedVideoName(file.name);
    setVideoAnalysisComplete(false);
    setCollectedScores([]);
    evaluatorRef.current.reset();

    if (videoRef.current) {
      videoRef.current.src = objectUrl;
      videoRef.current.load();
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleVideoFile(files[0]);
    }
  };

  // Main 60fps analysis render loop
  const updateLoop = useCallback(() => {
    const timeSec = performance.now() / 1000;
    let currentLandmarks: Landmark[] | null = null;

    if (sourceMode === 'simulated') {
      // Mathematical kinematic generator
      currentLandmarks = generateSimulatedPose(selectedExercise, timeSec);
      setIsPersonDetected(true);
    } else if (sourceMode === 'camera' && videoRef.current && landmarkerRef.current) {
      // Real MediaPipe detection on webcam stream
      currentLandmarks = detectPoseFromVideo(
        landmarkerRef.current,
        videoRef.current,
        performance.now()
      );
      setIsPersonDetected(Boolean(currentLandmarks));
    } else if (sourceMode === 'video_upload' && videoRef.current && landmarkerRef.current) {
      // Real MediaPipe detection on uploaded video element
      currentLandmarks = detectPoseFromVideo(
        landmarkerRef.current,
        videoRef.current,
        videoRef.current.currentTime * 1000
      );
      setIsPersonDetected(Boolean(currentLandmarks));
    }

    if (currentLandmarks && currentLandmarks.length > 0) {
      setLandmarks(currentLandmarks);
      const evalResult = evaluatorRef.current.evaluateFrame(currentLandmarks);
      setEvaluation(evalResult);

      // Track score sample for video summary
      if (sourceMode === 'video_upload' && evalResult.formScore > 0) {
        setCollectedScores((prev) => [...prev.slice(-100), evalResult.formScore]);
      }

      // Audio feedback when rep completed
      if (evalResult.isRepCompletedThisFrame && isAudioEnabled) {
        audioFeedback.playRepSuccess();
        audioFeedback.speakCue(`${evalResult.repCount} reps!`);
      }

      // Save to localStorage for dashboard widget
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
    }

    if (isRunning) {
      animFrameRef.current = requestAnimationFrame(updateLoop);
    }
  }, [isRunning, selectedExercise, sourceMode, isAudioEnabled]);

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

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (uploadedVideoUrl) {
        URL.revokeObjectURL(uploadedVideoUrl);
      }
    };
  }, [uploadedVideoUrl]);

  // Toggle running analysis
  const toggleRunning = async () => {
    if (!isRunning) {
      if (sourceMode === 'camera') {
        if (!streamRef.current) {
          const success = await startCameraStream();
          if (!success) return;
        }
      } else if (sourceMode === 'video_upload') {
        if (videoRef.current) {
          if (videoRef.current.ended) {
            videoRef.current.currentTime = 0;
            setVideoAnalysisComplete(false);
          }
          videoRef.current.play().catch(() => {});
          setIsVideoPlaying(true);
        }
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
      if (sourceMode === 'video_upload' && videoRef.current) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  // Video time updates
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    setIsRunning(false);
    setIsVideoPlaying(false);
    setVideoAnalysisComplete(true);
    if (isAudioEnabled) {
      audioFeedback.speakCue('Video analysis completed!');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setVideoCurrentTime(time);
    }
  };

  // Compute average form score for uploaded video
  const avgVideoScore =
    collectedScores.length > 0
      ? Math.round(collectedScores.reduce((a, b) => a + b, 0) / collectedScores.length)
      : evaluation.formScore;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-500/30">
              {t('ai_form.mediapipe_badge')}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>{t('ai_form.privacy_badge')}</span>
            </span>
            {isModelLoading && (
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                {t('ai_form.model_loading_badge')}
              </span>
            )}
            {isModelReady && !isModelLoading && (
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                {t('ai_form.model_ready_badge')}
              </span>
            )}
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
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 keep-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {t(ex.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Mode Segmented Control Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-800 rounded-2xl w-full sm:w-fit backdrop-blur-md">
        <button
          onClick={() => handleSwitchMode('camera')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            sourceMode === 'camera'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 keep-white'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{t('ai_form.source_mode_camera')}</span>
        </button>

        <button
          onClick={() => handleSwitchMode('video_upload')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            sourceMode === 'video_upload'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 keep-white'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-800'
          }`}
        >
          <FileVideo className="w-3.5 h-3.5" />
          <span>{t('ai_form.source_mode_video')}</span>
        </button>

        <button
          onClick={() => handleSwitchMode('simulated')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            sourceMode === 'simulated'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 keep-white'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('ai_form.source_mode_simulated')}</span>
        </button>
      </div>

      {/* Main Viewport & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pose Viewport / Video Player */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-3xl flex flex-col justify-between aspect-video relative overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between z-30">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{isRunning ? t('ai_form.live_kinematics') : t('ai_form.ready_status')}</span>
              </span>

              <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-[11px] font-semibold text-slate-300 border border-slate-700/60 backdrop-blur-md">
                {sourceMode === 'camera' && (streamRef.current ? t('ai_form.camera_on') : 'Camera: Ready')}
                {sourceMode === 'video_upload' && (uploadedVideoName ? `Video: ${uploadedVideoName}` : 'No Video')}
                {sourceMode === 'simulated' && t('ai_form.simulated_fps')}
              </span>
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
              <span className="text-xs text-slate-400 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md font-mono hidden sm:inline">
                {isModelReady ? 'MediaPipe • GPU' : 'CPU • Fallback'}
              </span>
            </div>
          </div>

          {/* Video Element: Stream for camera, or Object URL for uploaded video */}
          <video
            ref={videoRef}
            playsInline
            muted={sourceMode === 'camera'}
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedMetadata={handleVideoLoadedMetadata}
            onEnded={handleVideoEnded}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              sourceMode === 'camera'
                ? 'scale-x-[-1] opacity-100'
                : sourceMode === 'video_upload' && uploadedVideoUrl
                ? 'opacity-100'
                : 'opacity-0'
            }`}
          />

          {/* Real-Time Pose Canvas Overlay */}
          <PoseCanvasOverlay
            landmarks={landmarks}
            evaluation={evaluation}
            width={640}
            height={360}
            isMirrored={sourceMode === 'camera'}
          />

          {/* Camera Permission Error Overlay */}
          {cameraError && (
            <div className="absolute inset-0 bg-black/85 z-40 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
              <h3 className="text-white font-bold text-base mb-1">Camera Permission Required</h3>
              <p className="text-slate-300 text-xs max-w-sm mb-4 leading-relaxed">{cameraError}</p>
              <button
                onClick={startCameraStream}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition cursor-pointer keep-white"
              >
                {t('ai_form.start_camera')}
              </button>
            </div>
          )}

          {/* Upload Video Dropzone Overlay (when no video uploaded yet) */}
          {sourceMode === 'video_upload' && !uploadedVideoUrl && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`absolute inset-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center z-30 transition-all cursor-pointer ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-900/60 hover:border-emerald-500/60 hover:bg-slate-900/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/mov"
                onChange={(e) => e.target.files?.[0] && handleVideoFile(e.target.files[0])}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                <UploadCloud className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-base">{t('ai_form.upload_drop_title')}</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-xs">{t('ai_form.upload_drop_desc')}</p>
              <span className="text-[11px] text-slate-500 mt-2">{t('ai_form.upload_drop_hint')}</span>
              <button
                type="button"
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow transition keep-white"
              >
                {t('ai_form.select_video_btn')}
              </button>
            </div>
          )}

          {/* Person Detection Warning Pill */}
          {isRunning && !isPersonDetected && sourceMode !== 'simulated' && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full bg-amber-500/90 text-black font-bold text-xs backdrop-blur-md shadow-lg flex items-center gap-1.5 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{t('ai_form.no_person_detected')}</span>
            </div>
          )}

          {/* Idle Center Callout when not started */}
          {!isRunning && !videoAnalysisComplete && (sourceMode !== 'video_upload' || uploadedVideoUrl) && (
            <div className="flex flex-col items-center justify-center my-auto text-center z-30">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                {sourceMode === 'camera' ? (
                  <Camera className="w-8 h-8 text-emerald-400" />
                ) : sourceMode === 'video_upload' ? (
                  <FileVideo className="w-8 h-8 text-emerald-400" />
                ) : (
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                )}
              </div>
              <h3 className="text-white font-bold text-lg">{t('ai_form.engine_ready')}</h3>
              <p className="text-slate-400 text-xs max-w-sm mt-1">
                {sourceMode === 'camera'
                  ? 'MediaPipe Pose will detect your joints and score form in real-time.'
                  : sourceMode === 'video_upload'
                  ? 'Click start to play video and analyze kinematic posture frame-by-frame.'
                  : t('ai_form.engine_ready_desc')}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={toggleRunning}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all cursor-pointer keep-white active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t('ai_form.start_analysis')}</span>
                </button>
                {sourceMode === 'video_upload' && uploadedVideoUrl && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                  >
                    {t('ai_form.change_video_btn')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Video Controls Bar (Only when in video_upload mode with a video loaded) */}
          {sourceMode === 'video_upload' && uploadedVideoUrl && (
            <div className="z-30 bg-black/85 backdrop-blur-md p-3 rounded-2xl border border-slate-800 flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleRunning}
                  className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition cursor-pointer keep-white"
                >
                  {isVideoPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>

                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
                    }
                  }}
                  title="Rewind 5s"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <input
                  type="range"
                  min="0"
                  max={videoDuration || 100}
                  step="0.1"
                  value={videoCurrentTime}
                  onChange={handleSeek}
                  className="flex-1 accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />

                <span className="text-xs font-mono text-slate-300 min-w-[75px] text-right">
                  {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                </span>
              </div>
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

      {/* Video Analysis Complete Summary Banner */}
      {videoAnalysisComplete && sourceMode === 'video_upload' && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-slate-900/30 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {t('ai_form.video_summary_title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                {t('ai_form.video_summary_desc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="text-center">
              <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                {t('ai_form.reps_completed')}
              </span>
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {evaluation.repCount} / {targetReps}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="text-center">
              <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                {t('ai_form.avg_form_score')}
              </span>
              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {avgVideoScore}%
              </span>
            </div>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play().catch(() => {});
                  setIsRunning(true);
                  setIsVideoPlaying(true);
                  setVideoAnalysisComplete(false);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition cursor-pointer keep-white"
            >
              {t('ai_form.analyze_again')}
            </button>
          </div>
        </div>
      )}

      {/* Target Reached Trophy Toast */}
      {evaluation.repCount >= targetReps && !videoAnalysisComplete && (
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
