import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../../../app.js';

describe('Analytics API Routes & Auth Guardrails', () => {
  const app = buildApp();

  it('GET /api/v1/analytics/overview rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/overview',
    });

    assert.equal(response.statusCode, 401);
    const body = JSON.parse(response.body);
    assert.equal(body.error, 'Unauthorized');
  });

  it('GET /api/v1/analytics/exercises/:id rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/exercises/barbell-bench-press',
    });

    assert.equal(response.statusCode, 401);
  });

  it('GET /api/v1/analytics/records rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/records',
    });

    assert.equal(response.statusCode, 401);
  });
});
