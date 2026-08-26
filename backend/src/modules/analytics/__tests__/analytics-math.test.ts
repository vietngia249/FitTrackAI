import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEpley1RM,
  calculateBrzycki1RM,
  estimate1RM,
  calculateSetVolume,
  computeExercisePRs,
} from '../analytics.math.js';

describe('Analytics Mathematical Calculations & 1RM Engine', () => {
  it('calculates Epley 1RM accurately for valid reps', () => {
    // 100 kg for 1 rep = exactly 100 kg
    assert.equal(calculateEpley1RM(100, 1), 100);

    // 100 kg for 10 reps = 100 * (1 + 10/30) = 133.3 kg
    assert.equal(calculateEpley1RM(100, 10), 133.3);

    // 80 kg for 5 reps = 80 * (1 + 5/30) = 93.3 kg
    assert.equal(calculateEpley1RM(80, 5), 93.3);
  });

  it('calculates Brzycki 1RM accurately for valid reps', () => {
    // 100 kg for 1 rep = exactly 100 kg
    assert.equal(calculateBrzycki1RM(100, 1), 100);

    // 100 kg for 10 reps = 100 * 36 / (37 - 10) = 3600 / 27 = 133.3 kg
    assert.equal(calculateBrzycki1RM(100, 10), 133.3);
  });

  it('handles edge cases (zero or negative weight/reps) safely', () => {
    assert.equal(calculateEpley1RM(0, 10), 0);
    assert.equal(calculateEpley1RM(-50, 5), 0);
    assert.equal(calculateEpley1RM(100, 0), 0);
    assert.equal(calculateEpley1RM(100, -2), 0);

    assert.equal(calculateBrzycki1RM(0, 10), 0);
    assert.equal(calculateBrzycki1RM(100, 0), 0);
  });

  it('computes set volume (weightKg * reps)', () => {
    assert.equal(calculateSetVolume(82.5, 8), 660);
    assert.equal(calculateSetVolume(0, 10), 0);
  });

  it('computes comprehensive 1RM recommendation with formula average', () => {
    const analysis = estimate1RM(100, 5);
    assert.equal(analysis.weightKg, 100);
    assert.equal(analysis.reps, 5);
    assert.ok(analysis.epley1RM > 100);
    assert.ok(analysis.brzycki1RM > 100);
    assert.equal(typeof analysis.recommended1RM, 'number');
  });

  it('detects exercise personal records (PRs) accurately', () => {
    const candidateSets = [
      { exerciseId: 'bench', weightKg: 80, reps: 10, completedAt: '2026-09-01' },
      { exerciseId: 'bench', weightKg: 90, reps: 5, completedAt: '2026-09-05' },
      { exerciseId: 'bench', weightKg: 100, reps: 3, completedAt: '2026-09-08' },
    ];

    const prs = computeExercisePRs(candidateSets);
    assert.equal(prs.maxWeightKg, 100);
    assert.equal(prs.bestRepsAtMaxWeight, 3);
    // 80 * 10 = 800 set volume vs 90 * 5 = 450 vs 100 * 3 = 300
    assert.equal(prs.maxSetVolumeKg, 800);
    // 100kg x 3 Epley: 100 * (1 + 3/30) = 110 kg
    assert.equal(prs.maxEstimated1RM, 110);
  });
});
