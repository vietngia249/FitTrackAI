import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../../../app.js';
import { BodyService } from '../body.service.js';

describe('Body Tracking API Routes & Services', () => {
  const app = buildApp();
  const service = new BodyService();

  it('GET /api/v1/body/weight rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/body/weight',
    });

    assert.equal(response.statusCode, 401);
  });

  it('POST /api/v1/body/weight rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/body/weight',
      payload: {
        weightKg: 78.5,
        loggedDate: '2026-09-15',
      },
    });

    assert.equal(response.statusCode, 401);
  });

  it('GET /api/v1/body/measurements rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/body/measurements',
    });

    assert.equal(response.statusCode, 401);
  });

  it('POST /api/v1/body/measurements rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/body/measurements',
      payload: {
        loggedDate: '2026-09-15',
        chestCm: 104,
        waistCm: 82,
      },
    });

    assert.equal(response.statusCode, 401);
  });

  it('GET /api/v1/body/photos rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/body/photos',
    });

    assert.equal(response.statusCode, 401);
  });

  it('POST /api/v1/body/photos rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/body/photos',
      payload: {
        photoType: 'front',
        loggedDate: '2026-09-15',
        storageKey: 'user-1/front-2026-09-15.webp',
      },
    });

    assert.equal(response.statusCode, 401);
  });

  it('BodyService.getWeightHistory returns smoothed 7-day average points and stats', async () => {
    const history = await service.getWeightHistory('test-user-id');
    assert.ok(history.points.length > 0);
    assert.ok(history.stats.currentWeightKg > 0);
    assert.ok(history.stats.currentSevenDayAvgKg > 0);
  });
});
