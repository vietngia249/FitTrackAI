import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../../../app.js';

describe('Exercise Library API Routes', () => {
  const app = buildApp();

  it('GET /api/v1/exercises returns 200 and schema compliant structure', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/exercises?limit=10&offset=0',
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.ok(Array.isArray(body.items));
    assert.equal(typeof body.total, 'number');
    assert.equal(body.limit, 10);
    assert.equal(body.offset, 0);
    assert.equal(typeof body.hasMore, 'boolean');
  });

  it('GET /api/v1/exercises rejects invalid limit parameter', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/exercises?limit=99999',
    });

    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.error, 'Bad Request');
  });

  it('GET /api/v1/exercises/:id returns 404 for nonexistent exercise', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/exercises/non-existent-exercise-slug-12345',
    });

    assert.equal(response.statusCode, 404);
    const body = JSON.parse(response.body);
    assert.equal(body.error, 'Not Found');
  });

  it('POST /api/v1/exercises rejects unauthenticated user with 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/exercises',
      payload: {
        name: 'Custom Pushup',
        category: 'strength',
        level: 'beginner',
        primaryMuscles: ['chest'],
        instructions: ['Start in plank position', 'Lower body', 'Push back up'],
      },
    });

    assert.equal(response.statusCode, 401);
    const body = JSON.parse(response.body);
    assert.equal(body.error, 'Unauthorized');
  });

  it('DELETE /api/v1/exercises/:id rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/exercises/custom-exercise-id',
    });

    assert.equal(response.statusCode, 401);
  });
});
