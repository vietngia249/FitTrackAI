# FitTrack AI — Agent Implementation Plan

Companion to `FitTrack_AI_Specification_v2.md`. This document is written to be handed directly to a coding agent (e.g., Claude Code) as a work order. Each phase is a self-contained unit: a clear goal, concrete tasks, files/modules touched, and acceptance criteria the agent (or the user) can check before moving on. Phases match §3 of the spec — do not start a phase until the previous one's acceptance criteria pass.

**How to use this with an agent:** feed one phase at a time as a prompt, point it at the spec for domain detail, and require it to run tests and report the acceptance checklist before you approve moving to the next phase. Don't hand over the whole plan at once and expect a clean result — treat each phase as its own reviewed pull request.

---

## Phase 0 — Repository & Environment Skeleton (target: 3–4 days)

**Goal:** an empty but fully wired project — nothing works yet, but everything boots.

Tasks:
1. Initialize repo with `frontend/`, `backend/`, `worker/` (simple split per spec §22 — use this unless the agent is explicitly asked to build the monorepo variant).
2. `backend/`: Node.js + Fastify + TypeScript skeleton, `/health` endpoint, structured logger (pino or similar), Zod for input validation wired as a plugin.
3. `frontend/`: React + Vite + TypeScript, Tailwind configured, React Router with placeholder routes matching spec §24 nav (Dashboard, Workout, Nutrition, Progress, AI Form, Insights, Profile), `react-i18next` configured with `en` and `vi` locale files (even if mostly empty stubs).
4. `docker-compose.yml` bringing up Postgres, Redis (can stay unused until Phase 8), and the backend.
5. Prisma initialized against Postgres, empty schema, migration pipeline verified (`prisma migrate dev` runs cleanly).
6. GitHub Actions workflow: install → lint → typecheck → build, running on push/PR. No tests yet (none exist).
7. `.env.example` documenting every required variable; secrets never committed.
8. README stub with setup instructions that actually work from a clean clone.

**Acceptance criteria:**
- `docker compose up` brings up Postgres + backend with no errors.
- `GET /health` returns 200.
- Frontend dev server boots and renders the shell nav in both `en` and `vi` (language switch, even if untranslated placeholder text).
- CI pipeline is green on an empty PR.

---

## Phase 1 — Authentication (target: 3–4 days)

**Goal:** register, log in, and hit a protected route with a refreshable JWT.

Tasks: `users` + `refresh_tokens` Prisma models (spec §5, §14); `POST /auth/register`, `/login`, `/refresh`, `/logout`, `GET /auth/me` (spec §15); Argon2 password hashing; JWT access token (short-lived) + refresh token (longer-lived, stored hashed); Fastify auth-guard plugin applied to all subsequent protected routes; frontend auth pages + token storage (memory + httpOnly refresh cookie, not localStorage for the access token) + protected-route wrapper.

**Acceptance criteria:**
- Backend tests: register rejects duplicate email, login rejects wrong password, protected route rejects missing/expired token, refresh rotates the token correctly.
- Manual: full register → login → refresh → logout cycle works in the UI.
- Passwords are never visible in logs or API responses (grep the codebase to confirm).

---

## Phase 2 — Exercise Library (target: 3 days)

**Goal:** searchable, filterable exercise database seeded from Free Exercise DB.

Tasks: `exercises`, `exercise_muscles`, `exercise_equipment` models (spec §6, §14); import script for Free Exercise DB into Postgres (run once, not a runtime dependency — verify current license per spec §6 before committing the dataset); `GET /exercises` with muscle/equipment/difficulty/type filters, `GET /exercises/:id`, `POST/PATCH/DELETE` for custom exercises; frontend library browse + filter + detail view with `alt` text on exercise images (spec §19).

**Acceptance criteria:**
- Import script is idempotent (safe to re-run).
- Filter combinations return correct results (test at least 3 filter combos).
- Custom exercises created by a user are isolated to that user (or clearly marked shared, per your choice — document which).

---

## Phase 3 — Workout Management (target: 1.5 weeks)

**Goal:** create a plan, run a live session, log sets, see history.

Tasks: `workout_plans/_exercises`, `workout_sessions`, `session_exercises`, `sets` models (spec §7, §14); plan CRUD endpoints; session lifecycle endpoints (`POST /workout-sessions` to start, `PATCH` to update/finish, sets sub-resource per spec §15); live-session UI per spec §7 (current exercise, previous performance, weight/reps/RPE entry, rest timer, complete-set action) with large touch targets and minimal typing (spec §24); "copy previous set" quick action; **offline queueing for this flow specifically** (spec §18 — IndexedDB cache of active session + queued writes, sync on reconnect, visible offline indicator).

**Acceptance criteria:**
- Full journey works: create plan → start session → log several sets including a warmup (excluded from volume by default) → finish session → see it in history.
- Turning off network mid-session, logging sets, then reconnecting syncs correctly with no data loss (this is the one offline test that must pass — don't skip it).
- User isolation verified: user A cannot read/modify user B's session via direct API calls.

---

## Phase 4 — Analytics (target: 1 week)

**Goal:** volume, estimated 1RM, PR detection, and charts, all covered by tested formulas.

Tasks: implement volume (weight×reps, session sum, muscle-group aggregation), Epley 1RM estimate, PR detection across the four categories (spec §8); `GET /analytics/*` endpoints (spec §15); frontend charts (Recharts) for per-exercise and overall views; dashboard widgets consuming these endpoints (spec §11).

**Acceptance criteria:**
- Unit tests for volume, 1RM, and PR-detection formulas against hand-computed fixtures (not just "it runs").
- A new all-time-high set is correctly flagged as a PR; a lower one is not.
- Dashboard loads in under ~1s locally with a seeded dataset of a few months of sessions.

---

## Phase 5 — Nutrition (target: 1.5 weeks)

**Goal:** log food, see macros against targets, backed by Open Food Facts with local caching.

Tasks: `foods/meals/meal_items/nutrition_targets` models — **snapshot macros onto `meal_items` at write time** (spec §9, this is a correctness requirement, not optional); `GET /foods/search` implementing the local-first → Open Food Facts fallback → normalize → cache flow (spec §9); meal CRUD; nutrition dashboard with daily progress + charts (spec §9, §11); unit handling consistent with spec §5's metric-canonical rule.

**Acceptance criteria:**
- Editing a `Food` record does not change the macros shown on a previously logged meal (write a regression test for this specifically).
- Search hits Open Food Facts only on local cache miss (verify via request logging/mocking in tests).
- Daily dashboard totals match a manually computed sum for a seeded day.

---

## Phase 6 — Body Progress & Dashboard polish (target: 1 week) — **MVP checkpoint**

**Goal:** weight/measurements/photos tracking, and a cohesive dashboard tying everything together. This is the line from spec §3 where the project is a complete, shippable portfolio piece even if nothing further is built.

Tasks: `body_measurements`, `weight_logs`, `progress_photos` models; weight/measurement endpoints and trend display (7-day average as primary line per spec §10); private photo upload to R2 with signed URLs, MIME/size validation, unique object keys (spec §23); full dashboard assembly (spec §11); Sentry (or equivalent) wired on frontend and backend (spec §20); export (`GET /account/export`) and delete (`DELETE /account`) endpoints (spec §15, §23).

**Acceptance criteria — full MVP checklist (spec §27 minus AI/CV and i18n-full-coverage items):**
- End-to-end core journey works, responsive on mobile, has empty/loading/error states.
- Auth, authorization, user isolation, and validation are enforced on every endpoint (spot-check with an automated authz test suite, not just manual checks).
- Migrations + seed data run cleanly on a fresh database.
- CI is green including the full test suite; Docker build succeeds; deployment is documented and has actually been done once (not just "should work").
- README, architecture diagram, and DB diagram exist and match reality.
- **Stop and reassess against the timeline in spec §3 before continuing to Phase 7.** If behind schedule, this is an acceptable place to end the project for CV purposes.

---

## Phase 7 — AI Exercise Form Analysis (target: 2–3 weeks)

**Goal:** real-time, browser-side pose detection with rep counting and a form score for 3 exercises (Bicep Curl, Squat, Push-up — spec §12).

Tasks: MediaPipe Pose integration in the browser (spec §12, §21); landmark extraction and joint-angle geometry (3-point angle calc); per-exercise rep state machine with tunable thresholds; per-exercise form-rule set producing the 0–100 dimension scores + one feedback line; `form_analyses/_reps/_feedback` models and `POST/GET /form-analysis` endpoints (spec §14, §15); **build the validation test set described in spec §12 before claiming any accuracy number** — this is not optional polish, it's the difference between a defensible claim and a fabricated one on a CV.

**Acceptance criteria:**
- All 3 exercises run in real time in-browser without blocking the UI thread (`requestAnimationFrame`-driven, verify frame rate doesn't tank).
- Validation methodology from spec §12 actually executed: recorded true vs. predicted reps across the varied conditions listed, with precision/recall/MAE numbers written into the README's "Known Limitations" section — including the honest bad cases, not just the good ones.
- Raw webcam frames are not sent to the server in this phase (client-only).

---

## Phase 8 — Recommendation Engine, AI Copilot, Advanced Infra (target: 2–3 weeks) — optional differentiator

**Goal:** rule-based recommendations first, then the LLM copilot with grounding, plus the Redis/R2/WebSocket infra needed for async video analysis if that's included.

Tasks, in this order (don't skip ahead to the LLM before the rules layer exists):
1. Deterministic recommendation rules (spec §13 layer 1) — no LLM dependency, ship this alone first as a checkpoint.
2. Redis + BullMQ wiring, WebSocket events for job status (spec §16) — build this now if async video analysis is in scope, since the Copilot doesn't strictly need it.
3. AI Copilot: `POST /copilot/ask`, `llm_call_logs` table, and the full grounding mechanism from spec §13 — retrieval query → serialize retrieved data only → constrained prompt → per-user daily call budget → response caching → logging for later audit. **Write a test that asks a question outside the retrieved data's scope and asserts the model says it doesn't have enough data, not that it guesses.** Build the LLM call behind a provider interface (spec §13) configured via `.env` (`LLM_PROVIDER`, `LLM_MODEL`, `LLM_API_KEY`) rather than a hardcoded model string — verify the current model name/pricing for whichever provider is chosen at implementation time, since these change often (see spec §13's note on Gemini naming).
4. (Optional) video upload → R2 → job queue → worker pose processing → WebSocket-notified result, per spec §12's async path.
5. (Optional) Food Photo AI per spec §13, with clear "estimated, please confirm" UI treatment.

**Acceptance criteria:**
- Rule-based recommendations fire correctly against seeded scenarios (protein under target, new PR, etc.) — test each rule independently.
- Copilot grounding test (item 3 above) passes.
- LLM spend cap and per-user call budget are actually enforced, not just documented (write a test that exceeds the budget and confirms the request is rejected/cached instead of billed again).
- If async video analysis is included, the full job lifecycle (queued → processing → completed/failed) is observable via WebSocket in the UI.

---

## Phase 9 — Final Polish & Submission (target: 1 week)

Tasks: i18n completeness pass across all core screens in both `vi` and `en` (spec §17); accessibility checklist pass (spec §19); CI/CD hardening — confirm secrets are platform-managed, not committed (spec §23, §26); demo video/screenshots; final README pass covering setup, architecture, AI/CV explanation, known limitations, and third-party licenses (spec §27); write CV bullets **only** for phases actually completed and tested (spec §28 — do not include Redis/Copilot/etc. bullets if Phase 8 was skipped).

**Acceptance criteria:** full Definition of Done checklist from spec §27, checked item by item, with the agent (or reviewer) confirming each line against the running app rather than against intentions.

---

## Cross-phase rules for the agent

- Never mark a phase "done" without running its acceptance criteria — if a test can't be automated, state explicitly what was manually verified and how.
- Every new endpoint gets an authorization check and a corresponding negative test (wrong user, missing token, malformed input) before it's considered complete.
- Any claim in documentation or CV bullets about performance, accuracy, or "implemented" technology must correspond to something actually built and tested in that phase — this mirrors spec §12 and §28's "don't publish unmeasured numbers" rule, applied everywhere, not just to AI/CV.
- If a phase is trending significantly over its target duration, stop and re-consult spec §3's cut order before continuing to add scope.
