export interface UserWeeklyStats {
  userId: string;
  totalVolumeKg: number;
  workoutsCompleted: number;
  adherenceRate: number; // 0 - 100%
  avgSessionRpe: number;
  startDate: string;
  endDate: string;
}

/**
 * Aggregates workout sessions for a given user over a 7-day window.
 */
export function calculateWeeklyDigest(
  userId: string,
  sessions: Array<{
    completed: boolean;
    totalVolumeKg: number;
    rpeAvg?: number;
    date: string;
  }>,
  targetWorkoutsPerWeek: number = 4
): UserWeeklyStats {
  const completedSessions = sessions.filter((s) => s.completed);
  const totalVolumeKg = completedSessions.reduce((acc, s) => acc + s.totalVolumeKg, 0);
  const rpeSum = completedSessions.reduce((acc, s) => acc + (s.rpeAvg || 7.0), 0);
  const avgSessionRpe = completedSessions.length > 0 ? Number((rpeSum / completedSessions.length).toFixed(1)) : 0;
  const adherenceRate = Math.min(
    100,
    Math.round((completedSessions.length / Math.max(1, targetWorkoutsPerWeek)) * 100)
  );

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    userId,
    totalVolumeKg: Number(totalVolumeKg.toFixed(1)),
    workoutsCompleted: completedSessions.length,
    adherenceRate,
    avgSessionRpe,
    startDate: weekAgo.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
  };
}
