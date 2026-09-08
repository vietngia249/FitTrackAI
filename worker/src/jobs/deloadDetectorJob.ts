export interface DeloadAssessment {
  userId: string;
  deloadNeeded: boolean;
  reason: string;
  consecutiveHighLoadWeeks: number;
  avgFatigueRpe: number;
}

/**
 * Checks training history to detect central nervous system & muscular fatigue.
 * Triggers deload recommendation when:
 * 1. 4 consecutive weeks of accumulating volume.
 * 2. Recent session average RPE > 9.2 (overreaching / high injury risk).
 */
export function evaluateDeloadNeed(
  userId: string,
  weeklyVolumesKg: number[], // ordered chronologically [w1, w2, w3, w4]
  recentSessionRpes: number[]
): DeloadAssessment {
  let isStrictlyIncreasing = true;
  if (weeklyVolumesKg.length >= 4) {
    for (let i = 1; i < weeklyVolumesKg.length; i++) {
      if (weeklyVolumesKg[i] <= weeklyVolumesKg[i - 1]) {
        isStrictlyIncreasing = false;
        break;
      }
    }
  } else {
    isStrictlyIncreasing = false;
  }

  const avgRpe =
    recentSessionRpes.length > 0
      ? recentSessionRpes.reduce((a, b) => a + b, 0) / recentSessionRpes.length
      : 7.0;

  if (isStrictlyIncreasing && weeklyVolumesKg.length >= 4) {
    return {
      userId,
      deloadNeeded: true,
      reason: 'Volume accumulated over 4 consecutive training weeks. Schedule a deload week (-40% volume).',
      consecutiveHighLoadWeeks: weeklyVolumesKg.length,
      avgFatigueRpe: Number(avgRpe.toFixed(1)),
    };
  }

  if (avgRpe >= 9.2) {
    return {
      userId,
      deloadNeeded: true,
      reason: `Average session RPE is critically high (${avgRpe.toFixed(1)} > 9.2). Active recovery or deload advised.`,
      consecutiveHighLoadWeeks: weeklyVolumesKg.length,
      avgFatigueRpe: Number(avgRpe.toFixed(1)),
    };
  }

  return {
    userId,
    deloadNeeded: false,
    reason: 'Fatigue accumulation is within optimal progressive adaptation threshold.',
    consecutiveHighLoadWeeks: weeklyVolumesKg.length,
    avgFatigueRpe: Number(avgRpe.toFixed(1)),
  };
}
