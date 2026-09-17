# FitTrack AI — Full-stack Fitness & AI Coaching Platform

**Document type:** Product / Technical Specification
**Version:** 2.0 (revised)
**Status:** Planning / Architecture Baseline
**Target:** Portfolio Project 3 — Full-stack Developer CV
**Primary form factor:** Responsive Web App / PWA

Changes from v1.0 are marked **[NEW]** throughout. The structure has been condensed where v1.0 repeated itself across sections, and several operational gaps have been filled in: a realistic timeline, cost/ops planning, an anti-hallucination mechanism for the AI Copilot, offline-first behavior, internationalization, accessibility, and observability.

---

## 1. Executive Summary

FitTrack AI is a personal fitness management web app combining workout logging, nutrition tracking, progress analytics, recommendations, and browser-based AI exercise-form analysis. The core loop: **Record → Analyze → Understand Progress → Receive Recommendations → Train / Eat → Record Again.**

It is the third project in a portfolio arc: File2Url (full-stack fundamentals, REST, auth, storage) → VisionRoll (client-side AI, computer vision, WebGL) → FitTrack AI (full-stack product + analytics + AI/CV + DevOps, tying the first two together into one coherent product story).

**[NEW] Reality check:** as specified, this project covers roughly the scope of a small commercial SaaS product. Built by one developer part-time, the full V1–V4 scope is realistically 4–6 months of work, not a few weeks. Section 3 below turns that into an explicit schedule so the project has a defensible "I stopped here, on purpose" line rather than an open-ended backlog.

---

## 2. Product Vision & Principles

> A full-stack personal fitness platform that combines workout tracking, nutrition management, progress analytics, and AI-powered exercise form analysis.

Primary users: individual gym users, beginner/intermediate lifters, people tracking progressive overload, people who want workout and nutrition data in one place, people who want webcam-based form feedback. First release optimizes for single-user use while keeping the schema ready for multi-user deployment (every table is already user-scoped).

Principles carried over from v1.0, still correct: data-first storage of structured workout/nutrition/body/form data; AI as an assistant whose estimates are editable, never a silent source of truth; browser-first CV processing; progressive complexity (MVP works with zero AI); mobile-first logging UX; portfolio-quality engineering (tests, docs, Docker, CI, a strong README).

---

## 3. Scope & Realistic Timeline **[NEW]**

This section is the actual answer to "what do I build, in what order, and when do I stop." Treat it as binding — if a phase is running long, cut features rather than extend indefinitely.

| Phase | Content | Target duration | Cumulative |
|---|---|---|---|
| 0 | Repo, Docker, Postgres, Fastify, React/Vite, TS, CI skeleton | 3–4 days | Week 1 |
| 1 | Auth (register/login/JWT/refresh) | 3–4 days | Week 1–2 |
| 2 | Exercise library + dataset import | 3 days | Week 2 |
| 3 | Workout plans, sessions, sets, live session UI | 1.5 weeks | Week 3–4 |
| 4 | Analytics (volume, 1RM, PRs, charts) | 1 week | Week 5 |
| 5 | Nutrition (food, meals, macro dashboard, Open Food Facts) | 1.5 weeks | Week 6–7 |
| 6 | Body progress (weight, measurements, photos) + Dashboard | 1 week | Week 8 |
| **— MVP checkpoint —** | Everything above, deployed, tested, documented | | **~8 weeks** |
| 7 | AI/CV: pose estimation, rep counting, form score (3 exercises) | 2–3 weeks | Week 9–11 |
| **— V2/V3 checkpoint —** | Recommendation engine (rules only, no LLM yet) | 3–4 days | Week 12 |
| 8 | AI Copilot (LLM + grounding), Redis/queue, video upload, R2, WebSocket | 2–3 weeks | Week 13–15 |
| **— V4 checkpoint —** | Polish, CI/CD hardening, demo video, final docs | 1 week | Week 16 |

Two explicit stop lines:

- **Minimum viable portfolio piece:** Phases 0–6. This alone is a complete, deployable, testable full-stack product and is enough to list on a CV even if nothing further ships.
- **Full differentiator:** Phases 0–8. This is what makes the project stand out (AI/CV + LLM copilot + background jobs), but it is optional scope — do not let it block shipping the MVP checkpoint.

If time runs short, cut in this order: Food Photo AI → AI Copilot → Video upload/Redis/WebSocket → advanced form-score sub-metrics (keep just pass/fail form warnings) → measurements/photos. Never cut: auth, user isolation, the core workout+nutrition loop, or tests for whatever ships.

---

## 4. Product Modules

```
1. Account & Profile
2. Exercise & Workout
3. Nutrition
4. Progress Analytics
5. AI Exercise Form Analysis
6. Recommendation Engine
7. AI Fitness Copilot
```
Supporting infrastructure: Authentication, Authorization, Notifications, Private media storage, Background jobs, Real-time communication, **[NEW] Observability, [NEW] Offline sync.**

---

## 5. Account & Profile

MVP auth: register, login, logout, JWT access + refresh token, password hashing (Argon2 preferred over bcrypt for new projects), protected routes. Optional: Google OAuth, email verification, password reset.

```
User
- id, email, password_hash, display_name, avatar_url, created_at, updated_at

FitnessProfile
- user_id, date_of_birth, biological_sex, height, current_weight
- activity_level, fitness_goal, target_weight
- preferred_units (metric | imperial)
- locale ("[NEW] vi | en — see §17")
- created_at, updated_at
```

Goals: Muscle Gain, Fat Loss, Maintenance, General Fitness, Strength. Avoid medical or clinical claims anywhere in copy.

**[NEW] Unit conversion:** `preferred_units` must drive display only — store weight/height/distance canonically in metric (kg, cm) and convert at the presentation layer. Converting stored values in place is a common bug source; don't do it.

---

## 6. Exercise Library

```
Exercise
- id, name, slug, category, force, mechanic, level, equipment
- primary_muscles, secondary_muscles, instructions, image_urls, is_custom
```
Filters: muscle group, equipment, difficulty, type, push/pull, compound/isolation.

**Dataset:** [Free Exercise DB](https://github.com/makeneto/free-exercise-db) — 800+ structured exercises (muscles, equipment, difficulty, instructions, images), public-domain/open-use per its description. Import into Postgres, normalize fields, assign internal IDs, support custom exercises, and do not make GitHub a runtime dependency. **Re-check the current LICENSE before public redistribution — do this before, not after, deploying.**

---

## 7. Workout Management

Plan types: Push/Pull/Legs, Upper/Lower, Full Body, Custom. Planned-exercise fields: `target_sets, target_reps, target_weight, target_rpe, rest_seconds, order, notes`. Schedule support: day of week, planned workout, start time, reminder, completion status.

The live workout screen shows current exercise, previous performance for that exercise, current set, weight, reps, RPE, rest timer, and a complete-set action. Set fields: `weight, reps, rpe, rest_duration, set_type, notes`. Set types: Warmup, Working, Drop Set, Failure — warm-up sets are excluded from working volume unless explicitly configured otherwise.

**Data model:**
```
WorkoutPlan → WorkoutPlanExercise → Exercise
WorkoutSession → SessionExercise → Exercise, Set
```
Tables: `workout_plans, workout_plan_exercises, workout_sessions, session_exercises, sets, exercises, personal_records`.

Reference (concepts, not code to copy wholesale): [reannu123/workout-tracker](https://github.com/reannu123/workout-tracker) — React/Express/Prisma/Postgres/Docker implementation of sessions, sets, RPE, warmups, volume, estimated 1RM, PR charts, streaks, analytics API.

---

## 8. Workout Analytics

- **Volume:** `weight × reps`; session volume is the sum across sets; muscle-group volume aggregates from exercise→muscle mapping. This is a simplified training-load proxy, not a universal effectiveness measure.
- **Estimated 1RM (Epley):** `weight × (1 + reps / 30)`. Always label it "estimated."
- **PRs:** heaviest weight, best estimated 1RM, highest set volume, highest session volume.
- **Charts:** per-exercise weight/reps/1RM/volume over time, best set, sessions; overall workout count, streak, average session duration, weekly/monthly volume.

---

## 9. Nutrition

```
Food:      id, name, brand, barcode, serving_size, serving_unit,
           calories, protein, carbohydrates, fat, fiber, source
Meal:      id, user_id, meal_type, eaten_at, notes
MealItem:  id, meal_id, food_id, quantity, serving_size,
           calories, protein, carbohydrates, fat
```
Meal types: Breakfast, Lunch, Dinner, Snack, Other. **Snapshot macro values onto `MealItem` at log time** so historical logs don't silently change when a `Food` record is later edited — this was correct in v1.0 and is worth keeping as a hard rule.

Dashboard shows daily calories/protein/carbs/fat vs. targets, plus charts for calories/protein by day, macro distribution, goal adherence, weekly averages, meal distribution.

**Food data flow:** Search → local Postgres → miss → [Open Food Facts](https://world.openfoodfacts.org/) → normalize → cache → user confirms → save. Keep external calls behind the backend and cache aggressively; Open Food Facts is a community database with uneven data quality, so surfacing "source: user-verified vs. external" in the UI is worth the small extra column.

References: [dmaring/macrometric](https://github.com/dmaring/macrometric) (food diary, macro goals, JWT, spec-driven testing), [Abdulla1x/Macros-Calculator](https://github.com/Abdulla1x/Macros-Calculator) (React+TS, FastAPI, PWA, AI macro estimates with editable/uncertain output — good reference for the "AI estimates must be reviewable before saving" principle).

---

## 10. Body Progress

Weight: `date, weight, notes`, with daily value, weekly average, trend, and change from baseline/previous period — avoid overinterpreting daily noise (show the 7-day average as the primary line, raw points as secondary). Measurements: chest, waist, hips, upper arm, thigh, shoulders, calf. Progress photos: front/side/back, stored privately (Cloudflare R2 + signed URLs), never public.

---

## 11. Dashboard

Widgets: today's workout, calorie/protein progress, workout streak, weekly training volume, weight trend, recent PR, recent AI form score, one recommendation, quick actions. Keep it to one screenful on mobile — this is a summary view, not a report.

---

## 12. AI Exercise Form Analysis

**Flow:** select exercise → camera/upload → pose detection → landmark extraction → exercise recognition → rep counting → joint-angle analysis → form rules → form score → feedback.

**Exercise rollout order** (unchanged from v1.0, still the right call): Bicep Curl → Squat → Push-up → Lunge → Shoulder Press. Bicep curl first because elbow-angle tracking is the simplest single-plane movement; squat is more visually impressive but needs depth, knee alignment, torso angle, and camera-position handling all at once — don't start there.

Track shoulder/elbow/wrist/hip/knee/ankle landmarks; compute joint angles via 3-point geometry. Rep state machine: `STANDING → DESCENDING → BOTTOM → ASCENDING → STANDING → REP COMPLETE`, with exercise-specific angle thresholds tuned and tested across camera positions and body proportions — this tuning step is usually underestimated; budget real time for it, not just implementation time.

Form score reports per-dimension values (e.g., Depth, Knee Alignment, Torso Stability, Range of Motion, Tempo — each 0–100) plus one plain-language feedback line, never a bare correct/incorrect. State clearly in the UI that this is a computer-vision heuristic, not medical or professional coaching advice.

References: [yakupzengin/fitness-trainer-pose-estimation](https://github.com/yakupzengin/fitness-trainer-pose-estimation) (MediaPipe, rep counting, form score, multiple exercises), [khiem-nguyen-ict/ai-fit-global](https://github.com/khiem-nguyen-ict/ai-fit-global) (33-landmark MediaPipe Pose, UP/DOWN state machine, voice feedback), [tangalice/AlignAI](https://github.com/tangalice/AlignAI) (React + MediaPipe + WASM, browser-side — closest match to the client-side/privacy philosophy carried over from VisionRoll).

**Client-side pipeline:** Camera → MediaDevices → Pose Model → Landmarks → Exercise Engine → Rep Counter → Form Analyzer → Canvas/UI, driven by `requestAnimationFrame`. Don't send raw webcam streams to the server unless the (optional, V4) async video-analysis path is explicitly used.

**Async video path (V4, optional):** upload → validate → private R2 storage → create analysis job → Redis queue → worker → pose/video processing → rep + form result → save → WebSocket notification → report. Build this only after the real-time browser prototype works — it's strictly harder and shouldn't gate the MVP AI story.

**Validation methodology:** build a small controlled test set per exercise (correct reps, incorrect reps, varied camera distance/lighting/position/clothing); record true vs. predicted reps, false positives/negatives, and form-warning correctness. Report rep-counting accuracy, precision, recall, and MAE for rep count. **Do not publish an accuracy number that wasn't actually measured this way.**

---

## 13. Recommendation Engine & AI Fitness Copilot

**Layer 1 — deterministic rules** (cheap, reliable, ship first): protein adherence below target → nutrition insight; new PR → PR notification; workout frequency below plan → consistency insight; significant volume change → trend note; declining recent performance → performance trend. These require no LLM and should exist before any AI copy is written.

**Layer 2 — LLM explanation, with grounding [NEW — this is the part v1.0 under-specified].** The stated principle ("the LLM should not invent missing data") needs an actual mechanism, not just an instruction in a system prompt:

1. Retrieve only the structured data relevant to the question (recent sessions, weekly volume, nutrition history, weight trend, form scores) via normal SQL queries — this is retrieval, not vector search; the data is already structured.
2. Serialize exactly that retrieved data into the prompt as the only source of facts, and instruct the model to answer using only what's provided, saying "I don't have enough data for that" when a query falls outside the retrieved set.
3. Never let the model write to the database, modify goals, or edit logged data directly — its output is display-only text.
4. Set a small, fixed per-user daily call budget and cache repeated questions, since LLM API calls cost real money and this is the one part of the stack with no free tier once volume grows.
5. Log every prompt/response pair (without exposing this to the user) so form-check accuracy and hallucination rate can actually be audited later, rather than asserted.

**[NEW] LLM provider — configurable, not hardcoded.** Put the copilot behind a small provider interface (`generateCompletion(prompt, opts)`) with the concrete implementation selected via `.env` (`LLM_PROVIDER=gemini|anthropic|openai`, `LLM_MODEL=...`, `LLM_API_KEY=...`). This keeps the grounding logic in §13 independent of any one vendor and lets the model be swapped without touching business logic — useful both for cost tuning and because provider model names change often (see note below).

Note on "Gemini 2.1": as of this writing there is no Gemini 2.1 model in Google's lineup — the current generation is Gemini 3.x (e.g. `gemini-3.5-flash` or `gemini-3.6-flash` for a cost-effective default, `gemini-3.5-flash-lite` for the cheapest high-volume tier, `gemini-3.1-pro`/`gemini-3-pro` for higher-quality reasoning), with Gemini 2.0 and 2.5 already being deprecated/shut down on Google's own schedule. Because these names and shutdown dates change frequently, **do not hardcode a specific model string in code or in this doc** — read it from `LLM_MODEL` in `.env`, and check Google's current model list at implementation time rather than trusting this note.

Example query: *"Why did my bench press performance drop this week?"* → retrieve recent bench sessions, weekly volume, completed sets, recent nutrition, weight trend, form scores → grounded explanation using only that data.

**Food Photo AI (optional, V4):** photo → vision model → detected foods → estimated portions → estimated nutrition → **user review/edit** → confirm → save. Never present photo-derived calories as an exact measurement; the UI should visually distinguish estimated from confirmed values.

---

## 14. Database Schema

Core: `users, fitness_profiles, exercises, exercise_muscles, exercise_equipment, workout_plans, workout_plan_exercises, workout_sessions, session_exercises, sets, personal_records, foods, meals, meal_items, nutrition_targets, body_measurements, weight_logs, progress_photos, form_analyses, form_analysis_reps, form_analysis_feedback, recommendations, notifications, refresh_tokens`.

Later (V4): `video_assets, analysis_jobs, audit_logs, activity_logs`. **[NEW]** add `llm_call_logs` (prompt hash, retrieved-data hash, response, cost, timestamp) if the AI Copilot ships — needed for the auditing described in §13.

---

## 15. API Design

Base path `/api/v1`. Endpoint groups (unchanged from v1.0, this part was already solid):

```
Auth:      POST /auth/register, /auth/login, /auth/refresh, /auth/logout   GET /auth/me
Profile:   GET/PATCH /profile
Exercises: GET /exercises, /exercises/:id   POST/PATCH/DELETE /exercises/:id
Plans:     GET/POST /workout-plans   GET/PATCH/DELETE /workout-plans/:id
Sessions:  GET/POST /workout-sessions   GET/PATCH/DELETE /workout-sessions/:id
Sets:      POST /workout-sessions/:id/sets   PATCH/DELETE /sets/:id
Analytics: GET /analytics/dashboard, /workout-volume, /exercises/:id, /muscles, /prs, /nutrition, /weight
Nutrition: GET /foods/search   POST /foods   CRUD /meals
Body:      GET/POST /weight   GET/POST /measurements
AI form:   POST/GET /form-analysis   GET /form-analysis/:id
           (later) POST /form-analysis/jobs   GET /form-analysis/jobs/:id
Copilot:   [NEW] POST /copilot/ask   GET /copilot/history
Data:      [NEW] GET /account/export   DELETE /account
```

**[NEW] Account export/delete** matter once the app stores real personal data (weight, photos, camera-derived form data) — even for a single-user portfolio project, implementing "export my data" / "delete my account" is a good, cheap signal of taking privacy seriously, and it's a natural CV talking point.

---

## 16. Real-time & Background Jobs

WebSocket is optional and should only exist to serve a real need: video-analysis progress, AI processing status, notifications, live dashboard updates. Events: `analysis.started/progress/completed/failed`. Don't add it purely for the résumé keyword.

Redis/BullMQ, when introduced (V4), handles: job queue, video analysis, AI processing, notifications, optional caching. Flow: upload video → create job → Redis → worker → process → Postgres → WebSocket update.

---

## 17. Internationalization (vi / en) **[NEW]**

Given the target audience spans Vietnamese and international employers, shipping the UI in both Vietnamese and English is a reasonable differentiator and not much extra work if planned from the start:

- Use a standard i18n library (e.g., `react-i18next`) with locale keys from day one, even before a second language is actually translated — retrofitting i18n into hardcoded strings later is much more expensive than starting with it.
- Store `locale` on `FitnessProfile` (see §5); default to browser locale on first visit.
- Number/date/unit formatting (kg vs lb, cm vs ft/in, date order) should follow locale, independent of the language string translations.
- The AI Copilot's grounding prompt (§13) should include the user's locale so responses come back in the right language — this is a good test of whether the grounding mechanism actually constrains output correctly.

---

## 18. Offline-first behavior **[NEW]**

Gyms frequently have poor connectivity, and this app is explicitly a PWA — offline support is a real feature, not just a checkbox:

- Cache the exercise library and the active workout session locally (IndexedDB) so a session in progress can be logged with no network.
- Queue writes (new sets, completed session) locally and sync when connectivity returns; use a simple last-write-wins or timestamp-based merge, since a single-user workout log rarely has real conflicts.
- Show a visible "offline — will sync" indicator rather than silently failing requests.
- Keep this scoped to the workout-logging flow only for V1 of offline support; nutrition/AI features can require connectivity.

---

## 19. Accessibility **[NEW]**

Minimum bar worth actually implementing (and worth a line in the README, since it's frequently skipped and reviewers notice): sufficient color contrast on charts and status colors (not color-alone encoding for warnings), keyboard navigation for all form inputs including the live-workout quick-entry controls, visible focus states, and `alt` text on exercise images pulled from the dataset.

---

## 20. Observability & Error Monitoring **[NEW]**

Not in v1.0 at all, but needed for any deployed app with real users (even one user): structured backend logging, a hosted error tracker (e.g., Sentry free tier) wired into both frontend and backend, and a `/health` endpoint checked by the deploy pipeline before traffic is routed. This is cheap to add in Phase 0 and expensive to retrofit.

---

## 21. Recommended Technology Stack

| Layer | Choice |
|---|---|
| Frontend | React, Vite, TypeScript, React Router, Tailwind CSS, Recharts; optionally TanStack Query, Zustand, React Hook Form, Zod |
| Backend | Node.js, Fastify, TypeScript, REST |
| Database | PostgreSQL + Prisma (pick one ORM — don't mix Prisma and Drizzle) |
| Auth | JWT + refresh token, Argon2 or bcrypt, optional Google OAuth |
| AI/CV | MediaPipe Pose, TensorFlow.js, WebGL, Canvas, MediaDevices API, `requestAnimationFrame` — finalize the exact model/runtime only after browser performance testing |
| Storage | Cloudflare R2 |
| Cache/Jobs | Redis, BullMQ |
| DevOps | Docker, Docker Compose, GitHub Actions, Nginx |
| Testing | Vitest, React Testing Library, Playwright, Fastify API tests, a Prisma test database |
| i18n | react-i18next **[NEW]** |
| Observability | Sentry (or equivalent) **[NEW]** |

**[NEW] Cost notes:** Postgres/Redis/R2 all have free or near-free tiers at portfolio scale (a few GB, single-digit users). The one line item that isn't naturally free is the LLM API behind the Copilot — set a hard monthly spend cap on the provider account and the per-user daily call budget from §13 before this ships, not after. Keep the provider/model itself behind `.env` (see §13) so a cheaper tier can be swapped in without a code change if costs run high.

---

## 22. Frontend & Backend Architecture

```
frontend/src/
  app/  components/  features/{auth,dashboard,workouts,nutrition,progress,
  form-analysis,copilot}/  hooks/  lib/  services/  types/  pages/  i18n/  [NEW]

backend/src/
  modules/{auth,users,exercises,workouts,nutrition,progress,analytics,
  form-analysis,recommendations,notifications,copilot}/  [NEW: copilot]
  plugins/  infrastructure/{database,redis,storage}/  shared/  app.ts
```
Feature-oriented structure on both sides; each backend module follows route/controller → service → repository → schema → types, without over-engineering a single-developer project.

Monorepo (`apps/{web,api,worker}`, `packages/{shared-types,validation,config}`) or a simpler `frontend/ backend/ worker/` split — pick the simpler split unless the monorepo tooling itself is something you want to demonstrate.

---

## 23. Security & Privacy

**Auth:** never store plaintext passwords, use a strong hash, expire access tokens, protect refresh tokens, protect all private routes. **Authorization:** every user-owned resource is scoped to the authenticated user at the query level — never rely on frontend filtering. **Files:** private by default, validate MIME type and size, generate unique object keys, never trust the original filename, use signed URLs.

**[NEW] API hardening:** rate-limit auth endpoints and the Copilot endpoint specifically (the latter for cost control, not just abuse); validate all input with a schema library (Zod) at the boundary, not just in the frontend form; keep secrets in environment variables injected by the CI/CD platform, never committed, and rotate the JWT signing secret independently from other credentials.

**Privacy:** keep live camera processing local where possible; don't upload camera streams unnecessarily; explain what's stored, in plain language, in-app; let users delete their data (§15 export/delete endpoints); keep progress photos private; never claim medical or HIPAA compliance; AI form analysis is fitness assistance, not medical diagnosis — say so in the UI, not just in this doc.

---

## 24. UX

Navigation: Dashboard, Workout, Nutrition, Progress, AI Form, Insights, Profile. Mobile bottom nav: Home, Workout, Nutrition, Progress, More. Workout UX prioritizes large touch targets, quick set entry, "copy previous set," +/- controls, a rest timer, minimal typing. Nutrition UX: search, recent foods, favorites, quick add, "copy yesterday," custom meal, barcode, photo estimate.

---

## 25. Testing

Backend: auth, authorization/user-isolation, workout creation, set validation, analytics formulas, PR detection, nutrition totals. Frontend: login, workout flow, meal logging, dashboard, form-analysis UI. E2E critical journeys: register → create plan → start workout → log sets → finish → view analytics; add food → create meal → check macros; open camera → select exercise → detect pose → count reps → view feedback.

---

## 26. CI/CD

`Push/PR → Install → Lint → Type check → Unit tests → Build → Integration/E2E → Docker build → Deploy`, with secrets injected from the platform's encrypted store (§23), not the repo.

---

## 27. Definition of Done

**Product:** end-to-end core journey works; responsive mobile UI; empty/loading/error states. **Backend:** validation, auth, authorization, user isolation, error handling, API docs. **Database:** core schema, foreign keys, indexes, migrations, seed data. **AI/CV:** ≥3 exercises, rep counting tested against §12's methodology, form rules documented, performance measured, limitations documented. **DevOps:** Docker, CI, env config, build succeeds, deployment documented. **Docs:** README, architecture diagram, DB diagram, API docs, AI/CV explanation, setup guide, third-party licenses, known limitations, screenshots/demo video. **[NEW]** i18n coverage for both locales on core screens; accessibility checklist from §19; observability wired per §20.

---

## 28. Portfolio Positioning

Title: *"Development of a Full-stack Fitness Tracking & AI Coaching Platform."* Role: Solo Developer. **Only list technologies actually implemented** — this matters more than it sounds; an interviewer who asks about Redis and gets a vague answer does more damage than not mentioning Redis at all.

Sample CV bullets (write these only after the corresponding phase is actually done and tested):
- Built a full-stack fitness platform for workout logging, nutrition tracking, progress analytics, and personalized insights using React, Node.js, Fastify, and PostgreSQL.
- Designed workout and nutrition analytics covering training volume, estimated 1RM, personal records, and macro/calorie tracking.
- Implemented browser-based exercise form analysis using pose estimation, joint-angle geometry, and state-machine rep counting with real-time visual feedback.
- **[NEW, only if shipped]** Added an LLM-backed fitness copilot grounded in the user's own logged data, with a fixed per-user call budget for cost control.

Interview talking points carried over from v1.0 remain accurate: database design/isolation, why Fastify, analytics formulas, CV pipeline internals (landmarks, angles, thresholds, false positive/negative causes), performance (`requestAnimationFrame`, avoiding UI blocking, WebGL/WASM), architecture (when Redis/background jobs/WebSocket/object storage actually earn their place), and security (JWT handling, private photo protection, upload validation, ownership enforcement). **[NEW]** add: how the Copilot's grounding mechanism prevents hallucination, and what the offline-sync conflict strategy is.

---

## 29. Final Architecture

```
                         React Web/PWA
                              │
                       REST / WebSocket
                              │
                         Fastify API
                              │
       ┌──────────────────────┼──────────────────────┐
       ↓                      ↓                      ↓
  PostgreSQL                Redis               Cloudflare R2
       │                      │                      │
       │                 Background Jobs         Private media
       │                      │
       │                    Worker
       │                      │
       └─────────────── Analytics / AI ──────────────┘

Browser AI:  Camera → MediaDevices → Pose Model → Landmarks →
             Exercise Engine → Rep + Form Analysis → Canvas/UI
```

---

## 30. Research References

- https://github.com/reannu123/workout-tracker
- https://github.com/makeneto/free-exercise-db
- https://github.com/dmaring/macrometric
- https://github.com/Abdulla1x/Macros-Calculator
- https://github.com/yakupzengin/fitness-trainer-pose-estimation
- https://github.com/khiem-nguyen-ict/ai-fit-global
- https://github.com/tangalice/AlignAI
- https://github.com/kipphard/fitness-tracker
- https://world.openfoodfacts.org/

**Research note:** repository features, licenses, APIs, and implementation details change over time. Re-check the current README, LICENSE, API docs, and repo activity before adopting code or data — do this at the start of the phase that needs it, not once at the beginning of the project.
