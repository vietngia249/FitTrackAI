import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSevenDayMovingAverage } from '../body.math.js';

describe('Body Weight 7-Day Moving Average Math Engine', () => {
  it('returns empty array when given empty inputs', () => {
    assert.deepEqual(calculateSevenDayMovingAverage([]), []);
  });

  it('calculates single entry moving average equal to itself', () => {
    const result = calculateSevenDayMovingAverage([
      { loggedDate: '2026-09-01', weightKg: 80.0 },
    ]);

    assert.equal(result.length, 1);
    assert.equal(result[0].weightKg, 80.0);
    assert.equal(result[0].movingAverageKg, 80.0);
  });

  it('calculates 7-day simple moving average (SMA-7) correctly across 7 consecutive days', () => {
    // 7 days of weights: 80, 81, 79, 82, 80, 78, 80
    // Sum = 560, Mean = 80.00
    const logs = [
      { loggedDate: '2026-09-01', weightKg: 80.0 },
      { loggedDate: '2026-09-02', weightKg: 81.0 },
      { loggedDate: '2026-09-03', weightKg: 79.0 },
      { loggedDate: '2026-09-04', weightKg: 82.0 },
      { loggedDate: '2026-09-05', weightKg: 80.0 },
      { loggedDate: '2026-09-06', weightKg: 78.0 },
      { loggedDate: '2026-09-07', weightKg: 80.0 },
    ];

    const result = calculateSevenDayMovingAverage(logs);

    assert.equal(result.length, 7);
    const day7 = result[6];
    assert.equal(day7.date, '2026-09-07');
    assert.equal(day7.weightKg, 80.0);
    assert.equal(day7.movingAverageKg, 80.0);
  });

  it('sorts unordered logs chronologically before calculating window', () => {
    const unordered = [
      { loggedDate: '2026-09-03', weightKg: 79.0 },
      { loggedDate: '2026-09-01', weightKg: 80.0 },
      { loggedDate: '2026-09-02', weightKg: 81.0 },
    ];

    const result = calculateSevenDayMovingAverage(unordered);

    assert.equal(result[0].date, '2026-09-01');
    assert.equal(result[1].date, '2026-09-02');
    assert.equal(result[2].date, '2026-09-03');
    // Day 3: (80 + 81 + 79) / 3 = 80.0
    assert.equal(result[2].movingAverageKg, 80.0);
  });
});
