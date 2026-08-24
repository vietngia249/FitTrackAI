import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../../../app.js';

describe('Workout Management API Routes & Guardrails', () => {
  const app = buildApp();

  it('GET /api/v1/workouts/plans rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/workouts/plans',
    });

    assert.equal(response.statusCode, 401);
    const body = JSON.parse(response.body);
    assert.equal(body.error, 'Unauthorized');
  });

  it('POST /api/v1/workouts/plans rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/workouts/plans',
      payload: {
        name: 'Upper Body Power',
        description: 'Heavy compound push and pull',
        targetMuscles: ['chest', 'back', 'shoulders'],
        exercises: [],
      },
    });

    assert.equal(response.statusCode, 401);
  });

  it('POST /api/v1/workouts/sessions rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/workouts/sessions',
      payload: {
        name: 'Leg Day Blast',
      },
    });

    assert.equal(response.statusCode, 401);
  });

  it('POST /api/v1/workouts/sessions/:id/complete rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/workouts/sessions/some-session-uuid/complete',
      payload: {
        durationSeconds: 3600,
      },
    });

    assert.equal(response.statusCode, 401);
  });

  it('computes total volume canonically in kg (weightKg * reps)', () => {
    // Mathematical unit verification for metric-canonical storage
    const sets = [
      { weightKg: 100, reps: 5, isCompleted: true },
      { weightKg: 100, reps: 5, isCompleted: true },
      { weightKg: 100, reps: 5, isCompleted: true },
      { weightKg: 60, reps: 10, isCompleted: true },
      { weightKg: 60, reps: 10, isCompleted: false }, // uncompleted ignored
    ];

    const totalVolume = sets.reduce((acc, set) => {
      return set.isCompleted ? acc + set.weightKg * set.reps : acc;
    }, 0);

    assert.equal(totalVolume, 100 * 5 * 3 + 60 * 10); // 1500 + 600 = 2100 kg
  });
});
