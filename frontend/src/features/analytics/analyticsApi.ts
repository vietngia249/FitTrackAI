import {
  AnalyticsOverview,
  ExerciseAnalyticsResponse,
  PersonalRecordItem,
} from './analyticsTypes';
import { getLocalHistorySessions } from '../workouts/workoutApi';

const API_BASE = '/api/v1/analytics';

export async function fetchAnalyticsOverview(
  token?: string | null
): Promise<AnalyticsOverview> {
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/overview`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.ok) {
        return res.json();
      }
    } catch {
      // Fallback
    }
  }

  // Calculate from local history
  const history = getLocalHistorySessions();
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  let weeklyVol = 0;
  let monthlyVol = 0;
  const muscleMap: Record<string, number> = {};
  const workoutDates = new Set<string>();

  for (const s of history) {
    if (s.status !== 'completed') continue;
    const sTime = new Date(s.startedAt).getTime();
    if (sTime >= thirtyDaysAgo) {
      monthlyVol += s.totalVolumeKg || 0;
    }
    if (sTime >= sevenDaysAgo) {
      weeklyVol += s.totalVolumeKg || 0;
      workoutDates.add(s.startedAt.split('T')[0]);
    }

    for (const ex of s.exercises || []) {
      const m = ex.exercise?.primaryMuscles?.[0] || 'other';
      const exVol = (ex.sets || []).reduce(
        (acc, set) => (set.isCompleted ? acc + set.weightKg * set.reps : acc),
        0
      );
      if (exVol > 0) {
        muscleMap[m] = (muscleMap[m] || 0) + exVol;
      }
    }
  }

  return {
    weeklyVolumeKg: Math.round(weeklyVol),
    monthlyVolumeKg: Math.round(monthlyVol),
    totalCompletedSessions: history.filter((s) => s.status === 'completed').length,
    streakDays: workoutDates.size,
    muscleDistribution: Object.entries(muscleMap).map(([muscle, volumeKg]) => ({
      muscle,
      volumeKg: Math.round(volumeKg),
    })),
    lastUpdated: new Date().toISOString(),
  };
}

export async function fetchExerciseAnalytics(
  exerciseId: string,
  token?: string | null
): Promise<ExerciseAnalyticsResponse> {
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/exercises/${exerciseId}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.ok) {
        return res.json();
      }
    } catch {
      // Fallback
    }
  }

  // Calculate from local history
  const history = getLocalHistorySessions();
  const progression: Array<{
    date: string;
    sessionName: string;
    maxWeightKg: number;
    estimated1RM: number;
    totalVolumeKg: number;
  }> = [];

  let maxWeight = 0;
  let max1RM = 0;
  let maxSetVol = 0;
  let bestReps = 0;

  for (const s of history) {
    if (s.status !== 'completed') continue;
    const matchingEx = s.exercises?.find(
      (e) => e.exerciseId === exerciseId || e.exercise?.slug === exerciseId || e.exercise?.id === exerciseId
    );
    if (!matchingEx) continue;

    let sessionMaxWeight = 0;
    let sessionMax1RM = 0;
    let sessionVol = 0;

    for (const set of matchingEx.sets || []) {
      if (!set.isCompleted || set.weightKg <= 0 || set.reps <= 0) continue;
      const setVol = set.weightKg * set.reps;
      const epley1RM = Math.round((set.weightKg * (1 + set.reps / 30)) * 10) / 10;

      sessionVol += setVol;
      if (set.weightKg > sessionMaxWeight) {
        sessionMaxWeight = set.weightKg;
      }
      if (epley1RM > sessionMax1RM) {
        sessionMax1RM = epley1RM;
      }

      if (set.weightKg > maxWeight) {
        maxWeight = set.weightKg;
        bestReps = set.reps;
      }
      if (epley1RM > max1RM) {
        max1RM = epley1RM;
      }
      if (setVol > maxSetVol) {
        maxSetVol = setVol;
      }
    }

    if (sessionMaxWeight > 0) {
      progression.push({
        date: s.startedAt.split('T')[0],
        sessionName: s.name,
        maxWeightKg: sessionMaxWeight,
        estimated1RM: sessionMax1RM,
        totalVolumeKg: sessionVol,
      });
    }
  }

  return {
    exerciseId,
    progression,
    prs: {
      maxWeightKg: maxWeight,
      maxEstimated1RM: max1RM,
      maxSetVolumeKg: maxSetVol,
      bestRepsAtMaxWeight: bestReps,
    },
    totalSessions: progression.length,
  };
}

export async function fetchPersonalRecords(
  token?: string | null
): Promise<PersonalRecordItem[]> {
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/records`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.ok) {
        return res.json();
      }
    } catch {
      // Fallback
    }
  }

  // Calculate real PRs from local history
  const history = getLocalHistorySessions();
  const recordsMap: Record<string, PersonalRecordItem> = {};

  for (const s of history) {
    if (s.status !== 'completed') continue;
    for (const ex of s.exercises || []) {
      const exId = ex.exerciseId || ex.exercise?.id || 'unknown';
      const exName = ex.exercise?.name || 'Exercise';
      const cat = ex.exercise?.category || 'strength';
      const primaryMuscle = ex.exercise?.primaryMuscles?.[0] || 'all';

      if (!recordsMap[exId]) {
        recordsMap[exId] = {
          exerciseId: exId,
          exerciseName: exName,
          category: cat,
          primaryMuscle,
          prs: {
            maxWeightKg: 0,
            maxEstimated1RM: 0,
            maxSetVolumeKg: 0,
            bestRepsAtMaxWeight: 0,
          },
        };
      }

      for (const set of ex.sets || []) {
        if (!set.isCompleted || set.weightKg <= 0 || set.reps <= 0) continue;
        const setVol = set.weightKg * set.reps;
        const epley1RM = Math.round((set.weightKg * (1 + set.reps / 30)) * 10) / 10;
        const rec = recordsMap[exId];

        if (set.weightKg > rec.prs.maxWeightKg) {
          rec.prs.maxWeightKg = set.weightKg;
          rec.prs.bestRepsAtMaxWeight = set.reps;
        }
        if (epley1RM > rec.prs.maxEstimated1RM) {
          rec.prs.maxEstimated1RM = epley1RM;
        }
        if (setVol > rec.prs.maxSetVolumeKg) {
          rec.prs.maxSetVolumeKg = setVol;
        }
      }
    }
  }

  return Object.values(recordsMap).filter((r) => r.prs.maxWeightKg > 0);
}
