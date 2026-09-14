import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../../../app.js';
import { CopilotService } from '../copilot.service.js';

describe('AI Copilot & Recommendation Engine Module', () => {
  const app = buildApp();
  const service = new CopilotService();

  it('GET /api/v1/copilot/recommendations rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/copilot/recommendations',
    });

    assert.equal(response.statusCode, 401);
  });

  it('GET /api/v1/gemini/recommendations rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/gemini/recommendations',
    });

    assert.equal(response.statusCode, 401);
  });

  it('POST /api/v1/gemini/chat rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/gemini/chat',
      payload: {
        message: 'How is my volume progressing?',
      },
    });

    assert.equal(response.statusCode, 401);
  });

  it('POST /api/v1/copilot/chat rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/copilot/chat',
      payload: {
        message: 'How is my volume progressing?',
      },
    });

    assert.equal(response.statusCode, 401);
  });

  it('getRecommendations returns progressive overload tips and recovery score', async () => {
    const recs = await service.getRecommendations('test-user-id');

    assert.ok(recs.overloadTips.length > 0);
    assert.ok(recs.recoveryScore >= 0 && recs.recoveryScore <= 100);
    assert.equal(typeof recs.deload.needed, 'boolean');

    const benchTip = recs.overloadTips.find((t) => t.exerciseId === 'barbell-bench-press');
    assert.ok(benchTip);
    assert.equal(benchTip?.increaseKg, 2.5);
  });

  it('chat returns grounded progressive overload advice when queried', async () => {
    const res = await service.chat('user-test-chat-1', 'What weight should I bench press next?');

    assert.ok(res.reply.includes('Bench Press'));
    assert.ok(res.reply.includes('+2.5 kg'));
    assert.ok(res.budgetRemaining >= 0);
  });

  it('chat provides safety disclaimer when medical/injury questions are asked', async () => {
    const res = await service.chat('user-test-chat-2', 'My shoulder has sharp pain, what injury is this?');

    assert.ok(
      res.reply.toLowerCase().includes('medical') ||
      res.reply.toLowerCase().includes('physician') ||
      res.reply.toLowerCase().includes('therapist')
    );
  });

  it('enforces daily rate limit of 15 queries per user', async () => {
    const userId = 'rate-limit-test-user';
    // Consume 15 queries
    for (let i = 0; i < 15; i++) {
      const res = await service.chat(userId, `Query number ${i + 1}`);
      assert.ok(res.budgetRemaining >= 0);
    }

    // 16th query must be rejected
    const blockedRes = await service.chat(userId, 'Query number 16 should be blocked');
    assert.equal(blockedRes.budgetRemaining, 0);
    assert.ok(blockedRes.reply.includes('reached your daily limit'));
  });
});
