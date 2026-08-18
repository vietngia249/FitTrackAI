import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  verifyPassword,
  hashToken,
  generateRandomToken,
} from '../../../shared/utils/security.js';

describe('Security Utilities', () => {
  it('should correctly hash and verify password with Argon2', async () => {
    const password = 'SuperSecretFitnessPassword123!';
    const hash = await hashPassword(password);

    assert.notEqual(hash, password);
    assert.match(hash, /^\$argon2id\$/);

    const isValid = await verifyPassword(hash, password);
    assert.equal(isValid, true);

    const isInvalid = await verifyPassword(hash, 'WrongPassword');
    assert.equal(isInvalid, false);
  });

  it('should generate random 32-byte hex tokens', () => {
    const token1 = generateRandomToken(32);
    const token2 = generateRandomToken(32);

    assert.equal(token1.length, 64);
    assert.notEqual(token1, token2);
  });

  it('should deterministically hash tokens with SHA-256', () => {
    const token = 'sample-random-token-12345';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
  });
});
