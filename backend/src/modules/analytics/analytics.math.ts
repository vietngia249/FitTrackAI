/**
 * FitTrack AI - Analytics & 1RM Mathematical Engine
 * Strict canonical units: Weight is strictly in kg.
 */

export interface OneRepMaxResult {
  weightKg: number;
  reps: number;
  epley1RM: number;
  brzycki1RM: number;
  recommended1RM: number; // Rounded to 1 decimal place
}

/**
 * Calculate Epley 1RM:
 * 1RM = w * (1 + r / 30) for r > 1; 1RM = w for r = 1
 */
export function calculateEpley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  const result = weightKg * (1 + reps / 30);
  return Math.round(result * 10) / 10;
}

/**
 * Calculate Brzycki 1RM:
 * 1RM = w * 36 / (37 - r) for 1 < r < 37; 1RM = w for r = 1
 */
export function calculateBrzycki1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  if (reps >= 37) return calculateEpley1RM(weightKg, reps); // Fallback for very high reps
  const result = (weightKg * 36) / (37 - reps);
  return Math.round(result * 10) / 10;
}

/**
 * Get comprehensive 1RM analysis for a given set
 */
export function estimate1RM(weightKg: number, reps: number): OneRepMaxResult {
  const epley = calculateEpley1RM(weightKg, reps);
  const brzycki = calculateBrzycki1RM(weightKg, reps);
  // Average of both formulas for high stability
  const recommended = Math.round(((epley + brzycki) / 2) * 10) / 10;

  return {
    weightKg,
    reps,
    epley1RM: epley,
    brzycki1RM: brzycki,
    recommended1RM: recommended,
  };
}

/**
 * Calculate Set Volume (kg)
 */
export function calculateSetVolume(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  return Math.round(weightKg * reps * 10) / 10;
}

/**
 * Personal Record (PR) Evaluator
 */
export interface SetRecordCandidate {
  exerciseId: string;
  weightKg: number;
  reps: number;
  completedAt: Date | string;
}

export interface ExercisePRs {
  maxWeightKg: number;
  maxEstimated1RM: number;
  maxSetVolumeKg: number;
  bestRepsAtMaxWeight: number;
}

export function computeExercisePRs(sets: SetRecordCandidate[]): ExercisePRs {
  let maxWeightKg = 0;
  let maxEstimated1RM = 0;
  let maxSetVolumeKg = 0;
  let bestRepsAtMaxWeight = 0;

  for (const set of sets) {
    if (set.weightKg > maxWeightKg) {
      maxWeightKg = set.weightKg;
      bestRepsAtMaxWeight = set.reps;
    } else if (set.weightKg === maxWeightKg && set.reps > bestRepsAtMaxWeight) {
      bestRepsAtMaxWeight = set.reps;
    }

    const estimated1RM = calculateEpley1RM(set.weightKg, set.reps);
    if (estimated1RM > maxEstimated1RM) {
      maxEstimated1RM = estimated1RM;
    }

    const setVol = calculateSetVolume(set.weightKg, set.reps);
    if (setVol > maxSetVolumeKg) {
      maxSetVolumeKg = setVol;
    }
  }

  return {
    maxWeightKg,
    maxEstimated1RM,
    maxSetVolumeKg,
    bestRepsAtMaxWeight,
  };
}
