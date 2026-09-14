import { WorkoutPlan, WorkoutSession, CreatePlanPayload } from './workoutTypes';
import { CURATED_FALLBACK_EXERCISES } from '../exercises/exerciseApi';

const API_BASE = '/api/v1/workouts';

export const STARTER_ROUTINES: WorkoutPlan[] = [
  {
    id: 'starter-push-a',
    userId: 'system',
    name: 'Push Hypertrophy A',
    description: 'Chest, Shoulders & Triceps foundation routine',
    targetMuscles: ['chest', 'shoulders', 'triceps'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 'spe-1',
        planId: 'starter-push-a',
        exerciseId: 'barbell-bench-press',
        order: 0,
        targetSets: 4,
        targetReps: 8,
        restSeconds: 120,
        notes: 'Pyramid up to working weight',
        exercise: CURATED_FALLBACK_EXERCISES[0],
      },
      {
        id: 'spe-2',
        planId: 'starter-push-a',
        exerciseId: 'dumbbell-shoulder-press',
        order: 1,
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
        notes: 'Full range of motion',
        exercise: CURATED_FALLBACK_EXERCISES[6],
      },
      {
        id: 'spe-3',
        planId: 'starter-push-a',
        exerciseId: 'standard-push-up',
        order: 2,
        targetSets: 3,
        targetReps: 15,
        restSeconds: 60,
        notes: 'Burnout to failure on last set',
        exercise: CURATED_FALLBACK_EXERCISES[2],
      },
    ],
  },
  {
    id: 'starter-pull-b',
    userId: 'system',
    name: 'Pull Power & Width B',
    description: 'Back, Rear Delts & Biceps mass builder',
    targetMuscles: ['lower back', 'lats', 'biceps'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 'spe-4',
        planId: 'starter-pull-b',
        exerciseId: 'barbell-deadlift',
        order: 0,
        targetSets: 4,
        targetReps: 6,
        restSeconds: 150,
        notes: 'Maintain neutral spine throughout pull',
        exercise: CURATED_FALLBACK_EXERCISES[4],
      },
      {
        id: 'spe-5',
        planId: 'starter-pull-b',
        exerciseId: 'pull-up',
        order: 1,
        targetSets: 3,
        targetReps: 8,
        restSeconds: 90,
        notes: 'Controlled eccentric descent',
        exercise: CURATED_FALLBACK_EXERCISES[5],
      },
      {
        id: 'spe-6',
        planId: 'starter-pull-b',
        exerciseId: 'dumbbell-bicep-curl',
        order: 2,
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
        notes: 'Supinate at top of contraction',
        exercise: CURATED_FALLBACK_EXERCISES[3],
      },
    ],
  },
  {
    id: 'starter-legs-c',
    userId: 'system',
    name: 'Leg Day Fundamentals C',
    description: 'Quads, Hamstrings & Glutes athletic strength',
    targetMuscles: ['quadriceps', 'glutes', 'hamstrings'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 'spe-7',
        planId: 'starter-legs-c',
        exerciseId: 'bodyweight-squat',
        order: 0,
        targetSets: 4,
        targetReps: 15,
        restSeconds: 90,
        notes: 'Hit parallel depth on every repetition',
        exercise: CURATED_FALLBACK_EXERCISES[1],
      },
      {
        id: 'spe-8',
        planId: 'starter-legs-c',
        exerciseId: 'walking-lunges',
        order: 1,
        targetSets: 3,
        targetReps: 12,
        restSeconds: 75,
        notes: 'Keep torso upright and core engaged',
        exercise: CURATED_FALLBACK_EXERCISES[7],
      },
    ],
  },
];

const LOCAL_STORAGE_ACTIVE_KEY = 'fittrack_active_workout_session';
const LOCAL_STORAGE_HISTORY_KEY = 'fittrack_workout_history';

export function getLocalActiveSession(): WorkoutSession | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACTIVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalActiveSession(session: WorkoutSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_KEY);
    } else {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, JSON.stringify(session));
    }
  } catch {
    // Ignore storage quota
  }
}

export function saveLocalCompletedSession(session: WorkoutSession): void {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    const history: WorkoutSession[] = raw ? JSON.parse(raw) : [];
    history.unshift(session);
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch {
    // Ignore storage quota
  }
}

export function getLocalHistorySessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// API methods with graceful fallback to local data
export async function fetchPlans(token?: string | null): Promise<WorkoutPlan[]> {
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/plans`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.ok) {
        const plans = await res.json();
        if (plans.length > 0) return plans;
      }
    } catch {
      // Fallback
    }
  }
  return STARTER_ROUTINES;
}

export async function createPlan(
  payload: CreatePlanPayload,
  token: string
): Promise<WorkoutPlan> {
  const res = await fetch(`${API_BASE}/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create workout plan');
  }

  return res.json();
}

export async function deletePlan(id: string, token: string): Promise<void> {
  await fetch(`${API_BASE}/plans/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
}

export async function startSessionApi(
  payload: { planId?: string; name?: string },
  token?: string | null
): Promise<WorkoutSession> {
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return res.json();
      }
    } catch {
      // Fallback
    }
  }

  // Create local session instance if offline/unauthenticated
  const plan = payload.planId
    ? STARTER_ROUTINES.find((r) => r.id === payload.planId)
    : null;

  const sessionId = `local-session-${Date.now()}`;
  const exercises = (plan?.exercises || [
    {
      id: 'default-ex',
      planId: '',
      exerciseId: 'barbell-bench-press',
      order: 0,
      targetSets: 3,
      targetReps: 10,
      restSeconds: 90,
      exercise: CURATED_FALLBACK_EXERCISES[0],
    },
  ]).map((pe, exIdx) => ({
    id: `se-${exIdx}-${Date.now()}`,
    sessionId,
    exerciseId: pe.exerciseId,
    order: pe.order,
    notes: pe.notes,
    exercise: pe.exercise,
    sets: Array.from({ length: pe.targetSets }).map((_, sIdx) => ({
      id: `set-${exIdx}-${sIdx}-${Date.now()}`,
      sessionExerciseId: `se-${exIdx}-${Date.now()}`,
      setNumber: sIdx + 1,
      setType: 'normal' as const,
      weightKg: 60,
      reps: pe.targetReps,
      rpe: 8,
      isCompleted: false,
    })),
  }));

  const localSession: WorkoutSession = {
    id: sessionId,
    userId: 'guest',
    planId: payload.planId || null,
    name: payload.name || plan?.name || 'Quick Workout',
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    totalVolumeKg: 0,
    durationSeconds: 0,
    notes: null,
    exercises,
  };

  saveLocalActiveSession(localSession);
  return localSession;
}

export async function completeSessionApi(
  sessionId: string,
  payload: { durationSeconds: number; notes?: string; status?: 'completed' | 'cancelled' },
  token?: string | null,
  activeSession?: WorkoutSession | null
): Promise<WorkoutSession> {
  if (token) {
    try {
      // Build exercises payload from the active session's set data
      const exercisesPayload = (activeSession?.exercises ?? []).map((ex) => ({
        exerciseId: ex.exerciseId,
        order: ex.order,
        notes: ex.notes ?? undefined,
        sets: ex.sets.map((s) => ({
          setNumber: s.setNumber,
          setType: s.setType,
          weightKg: s.weightKg,
          reps: s.reps,
          rpe: s.rpe ?? undefined,
          isCompleted: s.isCompleted,
        })),
      }));

      const res = await fetch(`${API_BASE}/sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ ...payload, exercises: exercisesPayload }),
      });

      if (res.ok) {
        return res.json();
      }
    } catch {
      // Fallback to local
    }
  }

  // Complete in local storage
  const active = activeSession ?? getLocalActiveSession();
  const completed: WorkoutSession = {
    ...(active || {
      id: sessionId,
      userId: 'guest',
      name: 'Completed Workout',
      startedAt: new Date(Date.now() - payload.durationSeconds * 1000).toISOString(),
      exercises: [],
    }),
    status: payload.status || 'completed',
    completedAt: new Date().toISOString(),
    durationSeconds: payload.durationSeconds,
    totalVolumeKg:
      active?.exercises.reduce(
        (acc, ex) =>
          acc +
          ex.sets.reduce(
            (sAcc, s) => (s.isCompleted ? sAcc + s.weightKg * s.reps : sAcc),
            0
          ),
        0
      ) || 0,
  };

  saveLocalActiveSession(null);
  saveLocalCompletedSession(completed);
  return completed;
}
