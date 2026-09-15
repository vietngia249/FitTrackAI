import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../../../app.js';
import { env } from '../../../config/env.js';

describe('Auth API Routes & Guardrails', () => {
  const app = buildApp();

  it('POST /api/v1/auth/register should reject invalid email format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'not-an-email',
        password: 'ValidPassword123!',
        displayName: 'Test User',
      },
    });

    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.error, 'Bad Request');
  });

  it('POST /api/v1/auth/register should reject short password (< 8 chars)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'test@fittrack.ai',
        password: 'short',
        displayName: 'Test User',
      },
    });

    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.error, 'Bad Request');
  });

  it('GET /api/v1/auth/me should reject request without token (401 Unauthorized)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
    });

    assert.equal(response.statusCode, 401);
    const body = JSON.parse(response.body);
    assert.equal(body.statusCode, 401);
    assert.equal(body.error, 'Unauthorized');
  });

  it('GET /api/v1/auth/me should reject request with forged/invalid token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: 'Bearer forged-invalid-token-string',
      },
    });

    assert.equal(response.statusCode, 401);
    const body = JSON.parse(response.body);
    assert.equal(body.statusCode, 401);
  });

  it('POST /api/v1/auth/refresh should reject missing refresh token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: {},
    });

    assert.equal(response.statusCode, 401);
  });

  it('POST /api/v1/auth/google should reject missing idToken with 400 Bad Request', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/google',
      payload: {},
    });

    assert.equal(response.statusCode, 400);
  });

  it('POST /api/v1/auth/google should reject invalid or expired idToken with 401 Unauthorized', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/google',
      payload: {
        idToken: 'invalid-fake-google-id-token',
      },
    });

    assert.equal(response.statusCode, 401);
  });
});

