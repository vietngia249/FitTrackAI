import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Clock,
  Flame,
  CheckCircle2,
  Plus,
  Trash2,
  Trophy,
  X,
  Timer,
} from 'lucide-react';
import { WorkoutSession, SessionExercise, ExerciseSet } from './workoutTypes';
import { saveLocalActiveSession, completeSessionApi } from './workoutApi';
import { RestTimer } from './RestTimer';
import { useAuth } from '../auth/AuthContext';
import { CURATED_FALLBACK_EXERCISES } from '../exercises/exerciseApi';

interface ActiveWorkoutSessionProps {
  session: WorkoutSession;
  onFinish: (completed: WorkoutSession) => void;
  onCancel: () => void;
}

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({
  session: initialSession,
  onFinish,
  onCancel,
}) => {
  const { accessToken } = useAuth();
  const [session, setSession] = useState<WorkoutSession>(initialSession);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Rest Timer states
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [currentRestSeconds, setCurrentRestSeconds] = useState(90);

  // Add exercise picker
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);

  // Completion modal
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Live stopwatch
  useEffect(() => {
    const startTime = new Date(session.startedAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - startTime) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startedAt]);

  // Persist changes to local storage
  useEffect(() => {
    saveLocalActiveSession(session);
  }, [session]);

  const formatStopwatch = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Live volume calculation
  const calculateTotalVolume = () => {
    return session.exercises.reduce((acc, ex) => {
      return (
        acc +
        ex.sets.reduce((sAcc, s) => {
          return s.isCompleted ? sAcc + s.weightKg * s.reps : sAcc;
        }, 0)
      );
    }, 0);
  };

  const totalCompletedSets = session.exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter((s) => s.isCompleted).length;
  }, 0);

  // Set updates
  const handleUpdateSet = (
    exerciseIdx: number,
    setIdx: number,
    field: keyof ExerciseSet,
    value: number | string | boolean | null
  ) => {
    setSession((prev) => {
      const updatedExercises = [...prev.exercises];
      const targetExercise = { ...updatedExercises[exerciseIdx] };
      const updatedSets = [...targetExercise.sets];

      const updatedSet = {
        ...updatedSets[setIdx],
        [field]: value,
      };

      // When marking completed, auto trigger rest timer
      if (field === 'isCompleted' && value === true) {
        updatedSet.completedAt = new Date().toISOString();
        setCurrentRestSeconds(90);
        setIsRestTimerOpen(true);
      }

      updatedSets[setIdx] = updatedSet;
      targetExercise.sets = updatedSets;
      updatedExercises[exerciseIdx] = targetExercise;

      return {
        ...prev,
        exercises: updatedExercises,
      };
    });
  };

  const handleAddSet = (exerciseIdx: number) => {
    setSession((prev) => {
      const updatedExercises = [...prev.exercises];
      const targetExercise = { ...updatedExercises[exerciseIdx] };
      const lastSet = targetExercise.sets[targetExercise.sets.length - 1];

      const newSet: ExerciseSet = {
        id: `set-${Date.now()}-${targetExercise.sets.length}`,
        sessionExerciseId: targetExercise.id,
        setNumber: targetExercise.sets.length + 1,
        setType: 'normal',
        weightKg: lastSet ? lastSet.weightKg : 50,
        reps: lastSet ? lastSet.reps : 10,
        rpe: lastSet?.rpe || 8,
        isCompleted: false,
      };

      targetExercise.sets = [...targetExercise.sets, newSet];
      updatedExercises[exerciseIdx] = targetExercise;

      return {
        ...prev,
        exercises: updatedExercises,
      };
    });
  };

  const handleRemoveSet = (exerciseIdx: number, setIdx: number) => {
    setSession((prev) => {
      const updatedExercises = [...prev.exercises];
      const targetExercise = { ...updatedExercises[exerciseIdx] };
      targetExercise.sets = targetExercise.sets
        .filter((_, idx) => idx !== setIdx)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));

      updatedExercises[exerciseIdx] = targetExercise;
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleAddExerciseToSession = (exerciseId: string) => {
    const exercise = CURATED_FALLBACK_EXERCISES.find((e) => e.id === exerciseId);
    if (!exercise) return;

    const newSessionExercise: SessionExercise = {
      id: `se-${Date.now()}`,
      sessionId: session.id,
      exerciseId: exercise.id,
      order: session.exercises.length,
      notes: null,
      exercise,
      sets: [
        {
          id: `set-new-1-${Date.now()}`,
          sessionExerciseId: `se-${Date.now()}`,
          setNumber: 1,
          setType: 'normal',
          weightKg: 50,
          reps: 10,
          rpe: 8,
          isCompleted: false,
        },
      ],
    };

    setSession((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newSessionExercise],
    }));
    setIsExercisePickerOpen(false);
  };

  const handleFinishWorkout = async () => {
    const completed = await completeSessionApi(
      session.id,
      {
        durationSeconds: elapsedSeconds,
        status: 'completed',
      },
      accessToken
    );
    onFinish(completed);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* Sticky Active Header Bar */}
      <div className="sticky top-16 z-30 bg-[#0a0d14]/90 backdrop-blur-xl border-b border-slate-800/80 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{session.name}</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE
              </span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono text-emerald-400 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {formatStopwatch(elapsedSeconds)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <strong className="text-slate-200">{calculateTotalVolume().toLocaleString()}</strong> kg
              </span>
              <span>•</span>
              <span>
                <strong className="text-slate-200">{totalCompletedSets}</strong> sets
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsRestTimerOpen(true)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Open Rest Timer"
          >
            <Timer className="w-4 h-4 text-teal-400" />
          </button>

          <button
            onClick={onCancel}
            className="px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer"
          >
            Discard
          </button>

          <button
            onClick={() => setIsSummaryOpen(true)}
            className="px-4 sm:px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            Finish Workout
          </button>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-6">
        {session.exercises.map((sessionEx, exIdx) => (
          <div
            key={sessionEx.id || exIdx}
            className="rounded-3xl bg-[#0e131f]/90 border border-slate-800/80 p-4 sm:p-6 shadow-xl space-y-4"
          >
            {/* Exercise Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {sessionEx.exercise.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="capitalize">{sessionEx.exercise.equipment || 'Body only'}</span>
                    <span>•</span>
                    <span className="capitalize">{sessionEx.exercise.primaryMuscles[0]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sets Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800/60 pb-2">
                    <th className="py-2 px-2 text-center w-12 uppercase tracking-wider font-semibold text-[11px]">
                      Set
                    </th>
                    <th className="py-2 px-2 text-center uppercase tracking-wider font-semibold text-[11px]">
                      Weight (kg)
                    </th>
                    <th className="py-2 px-2 text-center uppercase tracking-wider font-semibold text-[11px]">
                      Reps
                    </th>
                    <th className="py-2 px-2 text-center uppercase tracking-wider font-semibold text-[11px]">
                      RPE
                    </th>
                    <th className="py-2 px-2 text-center w-16 uppercase tracking-wider font-semibold text-[11px]">
                      Done
                    </th>
                    <th className="py-2 px-1 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {sessionEx.sets.map((set, setIdx) => {
                    const isDone = set.isCompleted;
                    return (
                      <tr
                        key={set.id || setIdx}
                        className={`transition-colors ${
                          isDone ? 'bg-emerald-500/5' : 'hover:bg-slate-900/50'
                        }`}
                      >
                        {/* Set Number */}
                        <td className="py-2.5 px-2 text-center font-bold text-slate-400">
                          {set.setNumber}
                        </td>

                        {/* Weight with +/- stepper */}
                        <td className="py-2.5 px-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateSet(
                                  exIdx,
                                  setIdx,
                                  'weightKg',
                                  Math.max(0, set.weightKg - 2.5)
                                )
                              }
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.5"
                              value={set.weightKg}
                              onChange={(e) =>
                                handleUpdateSet(
                                  exIdx,
                                  setIdx,
                                  'weightKg',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-16 sm:w-20 px-2 py-1 text-center font-mono font-bold text-white bg-slate-900 border border-slate-800 rounded-lg focus:border-emerald-500 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateSet(
                                  exIdx,
                                  setIdx,
                                  'weightKg',
                                  set.weightKg + 2.5
                                )
                              }
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Reps with +/- stepper */}
                        <td className="py-2.5 px-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateSet(
                                  exIdx,
                                  setIdx,
                                  'reps',
                                  Math.max(0, set.reps - 1)
                                )
                              }
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) =>
                                handleUpdateSet(
                                  exIdx,
                                  setIdx,
                                  'reps',
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              className="w-14 sm:w-16 px-2 py-1 text-center font-mono font-bold text-white bg-slate-900 border border-slate-800 rounded-lg focus:border-emerald-500 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateSet(
                                  exIdx,
                                  setIdx,
                                  'reps',
                                  set.reps + 1
                                )
                              }
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* RPE */}
                        <td className="py-2.5 px-2 text-center">
                          <select
                            value={set.rpe || 8}
                            onChange={(e) =>
                              handleUpdateSet(
                                exIdx,
                                setIdx,
                                'rpe',
                                parseFloat(e.target.value)
                              )
                            }
                            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 focus:border-emerald-500 outline-none"
                          >
                            <option value="6">6 (Light)</option>
                            <option value="7">7 (3 reps in tank)</option>
                            <option value="8">8 (2 reps left)</option>
                            <option value="8.5">8.5 (1-2 left)</option>
                            <option value="9">9 (1 rep left)</option>
                            <option value="9.5">9.5 (Maybe 1)</option>
                            <option value="10">10 (Max effort)</option>
                          </select>
                        </td>

                        {/* Done Toggle */}
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSet(
                                exIdx,
                                setIdx,
                                'isCompleted',
                                !isDone
                              )
                            }
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer mx-auto ${
                              isDone
                                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 scale-105'
                                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                isDone ? 'fill-current text-slate-950' : ''
                              }`}
                            />
                          </button>
                        </td>

                        {/* Remove */}
                        <td className="py-2.5 px-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveSet(exIdx, setIdx)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                            title="Delete set"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add Set Button */}
            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={() => handleAddSet(exIdx)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Set</span>
              </button>
            </div>
          </div>
        ))}

        {/* Add Exercise to Session Button */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExercisePickerOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#0e131f] hover:bg-slate-800/80 border border-dashed border-slate-700 hover:border-emerald-500 text-slate-300 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Exercise to Workout</span>
          </button>
        </div>
      </div>

      {/* Floating Rest Timer */}
      <RestTimer
        isOpen={isRestTimerOpen}
        initialSeconds={currentRestSeconds}
        onClose={() => setIsRestTimerOpen(false)}
      />

      {/* Exercise Picker Modal */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0e131f] border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-lg">Add Exercise</h3>
              <button
                onClick={() => setIsExercisePickerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-2 flex-1 divide-y divide-slate-800/60">
              {CURATED_FALLBACK_EXERCISES.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToSession(ex.id)}
                  className="p-3 rounded-xl hover:bg-slate-800/60 flex items-center justify-between transition cursor-pointer group"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {ex.name}
                    </h4>
                    <span className="text-xs text-slate-400 capitalize">
                      {ex.equipment || 'Body only'} • {ex.primaryMuscles[0]}
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Completion Summary Dialog */}
      {isSummaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0e131f] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto mb-4 shadow-xl shadow-emerald-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#0e131f] rounded-[22px] flex items-center justify-center">
                <Trophy className="w-8 h-8 text-emerald-400 animate-bounce" />
              </div>
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight">
              Crushed It! 🎉
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              Another stellar training session logged into FitTrack AI.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Duration</span>
                <p className="text-lg font-black text-white mt-1">
                  {Math.floor(elapsedSeconds / 60)}m
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Volume</span>
                <p className="text-lg font-black text-emerald-400 mt-1">
                  {calculateTotalVolume().toLocaleString()} kg
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Sets</span>
                <p className="text-lg font-black text-white mt-1">
                  {totalCompletedSets}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsSummaryOpen(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition cursor-pointer"
              >
                Keep Training
              </button>
              <button
                type="button"
                onClick={handleFinishWorkout}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] cursor-pointer"
              >
                Save & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
