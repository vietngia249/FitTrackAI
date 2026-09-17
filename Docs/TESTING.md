---
document: TESTING
version: 1.0.0
status: active

created_at: 2026-09-16T07:18:00+07:00
updated_at: 2026-09-16T07:18:00+07:00
last_verified_at: 2026-09-16T07:18:00+07:00

source_snapshot: 2026-09-16
source_commit: d051dae
source_state: clean

verification_status: verified
---

# FitTrack AI - Testing Strategy & Verification Guide

## 1. Testing Philosophy

FitTrack AI emphasizes fast, deterministic, and isolated testing:
1. **Zero External Dependency on Unit Tests**: Unit tests must not fail due to network outages or remote third-party service downtime.
2. **Fastify In-Memory Injection**: HTTP routes are tested using `app.inject()` from `fastify`, avoiding slow TCP socket allocation.
3. **Strict Static Type Safety**: Both `backend` and `frontend` must compile with zero TypeScript errors (`tsc --noEmit`).

---

## 2. Test Execution Commands

```bash
# Run all backend tests
npm --prefix backend test

# Run a specific backend module test
npm --prefix backend run test -- src/modules/copilot/__tests__/copilot.test.ts

# Run static typechecks across the entire monorepo
npm run typecheck

# Run frontend-specific typecheck
npm --prefix frontend run typecheck

# Run backend-specific typecheck
npm --prefix backend run typecheck

# Run ESLint across monorepo
npm run lint
```

---

## 3. Backend Test Suite (`node:test`)

The backend leverages Node.js native test runner via `tsx`:
- **File Pattern**: `src/modules/**/__tests__/*.test.ts`
- **Assertion Library**: `node:assert/strict`

### Fastify Injection Pattern
```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../../../app.js';

describe('Workout Module', () => {
  const app = buildApp();

  it('GET /api/v1/workouts/plans rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/workouts/plans',
    });

    assert.equal(response.statusCode, 401);
  });
});
```

---

## 4. Frontend Testing & Kinematic Simulation

### A. Static Verification
- Run `npm --prefix frontend run typecheck` before any commit to ensure 100% type soundness across React components, hooks, and i18n locales.

### B. Computer Vision Kinematic Simulation
Located in `frontend/src/features/formAnalysis/simulatedPose.ts`:
- Generates simulated landmark streams representing valid and faulty repetitions (e.g., standard squat depth vs shallow squat).
- Enables automated verification of state machine transitions (`exerciseStateMachines.ts`) without requiring a live physical webcam.

---

## 5. Agent Verification Checklist Before Any Commit

Before committing any code change, an AI agent MUST verify:

1. [ ] `npm --prefix backend run typecheck` exits with code 0.
2. [ ] `npm --prefix frontend run typecheck` exits with code 0.
3. [ ] All modified backend unit tests pass (`npm --prefix backend test`).
4. [ ] All newly introduced i18n keys are present in both `en.json` and `vi.json`.
5. [ ] Light mode contrast standards are preserved (buttons have white text, cards have clear borders).
6. [ ] No dummy or mock data was introduced to production code paths.

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-09-16 | Initial baseline testing guide, test runner patterns, and pre-commit verification checklist |
