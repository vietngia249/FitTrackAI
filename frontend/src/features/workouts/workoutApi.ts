import { WorkoutPlan, WorkoutSession, CreatePlanPayload } from './workoutTypes';
import { CURATED_FALLBACK_EXERCISES } from '../exercises/exerciseApi';

const API_BASE = '/api/v1/workouts';

const LOCAL_STORAGE_ACTIVE_KEY = 'fittrack_active_workout_session';
const LOCAL_STORAGE_HISTORY_KEY = 'fittrack_workout_history';
const LOCAL_STORAGE_PLANS_KEY = 'fittrack_workout_plans';

export function getLocalPlans(): WorkoutPlan[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PLANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalPlan(plan: WorkoutPlan): void {
  try {
    const plans = getLocalPlans();
    plans.unshift(plan);
    localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(plans));
  } catch {
    // Ignore storage quota
  }
}

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
        if (Array.isArray(plans)) return plans;
      }
    } catch {
      // Fallback
    }
  }
  return getLocalPlans();
}

export async function createPlan(
  payload: CreatePlanPayload,
  token?: string | null
): Promise<WorkoutPlan> {
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to local
    }
  }

  // Graceful local creation for offline / demo mode
  const planId = `local-plan-${Date.now()}`;
  const newPlan: WorkoutPlan = {
    id: planId,
    userId: 'local-user',
    name: payload.name,
    description: payload.description,
    targetMuscles: payload.targetMuscles,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: payload.exercises.map((e, idx) => ({
      id: `lpe-${idx}-${Date.now()}`,
      planId,
      exerciseId: e.exerciseId,
      order: e.order,
      targetSets: e.targetSets,
      targetReps: e.targetReps,
      restSeconds: e.restSeconds,
      notes: e.notes,
      exercise:
        CURATED_FALLBACK_EXERCISES.find((ex) => ex.id === e.exerciseId) ||
        CURATED_FALLBACK_EXERCISES[0],
    })),
  };

  saveLocalPlan(newPlan);
  return newPlan;
}

export async function deletePlan(id: string, token: string): Promise<void> {
  await fetch(`${API_BASE}/plans/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
}

export async function fetchSessionsHistory(token?: string | null): Promise<WorkoutSession[]> {
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items)) {
          return data.items;
        }
      }
    } catch {
      // Fallback
    }
  }
  return getLocalHistorySessions();
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
  const localPlans = getLocalPlans();
  const plan = payload.planId
    ? localPlans.find((r) => r.id === payload.planId)
    : null;

  const sessionId = `local-session-${Date.now()}`;
  const exercises = (plan?.exercises || []).map((pe, exIdx) => ({
    id: `se-${exIdx}-${Date.now()}`,
    sessionId,
    exerciseId: pe.exerciseId,
    order: pe.order,
    notes: pe.notes,
    exercise: pe.exercise,
    sets: Array.from({ length: pe.targetSets || 3 }).map((_, sIdx) => ({
      id: `set-${exIdx}-${sIdx}-${Date.now()}`,
      sessionExerciseId: `se-${exIdx}-${Date.now()}`,
      setNumber: sIdx + 1,
      setType: 'normal' as const,
      weightKg: 0,
      reps: pe.targetReps || 10,
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
