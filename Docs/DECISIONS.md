---
document: DECISIONS
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

# FitTrack AI - Architectural Decision Records (ADRs)

## ADR 001: Adoption of Fastify 5 over Express for Backend API

- **Status**: Accepted
- **Context**: An enterprise fitness application requires low latency, schema-driven input validation, and high concurrent throughput for set logging and telemetry.
- **Decision**: Adopt Fastify 5 rather than legacy Express. Fastify provides built-in schema serialization, native TypeScript integration, fast routing, and an ecosystem of well-maintained security plugins (`@fastify/jwt`, `@fastify/helmet`, `@fastify/rate-limit`).
- **Consequences**: Fastify route handlers require `FastifyRequest` / `FastifyReply` paradigms. Tests use `app.inject()` rather than `supertest`.

---

## ADR 002: Client-Side Edge MediaPipe Pose over Cloud Video Streaming

- **Status**: Accepted
- **Context**: Real-time exercise form coaching requires instantaneous visual and auditory feedback (e.g., cueing a lifter before they complete an unsafe rep). Streaming raw video frames to cloud GPU servers introduces network latency (100–300ms), massive operational bandwidth costs, and privacy concerns regarding user webcam footage.
- **Decision**: Execute MediaPipe Pose entirely in the user's browser using WebAssembly / WebGL.
- **Consequences**:
  - Zero server GPU infrastructure cost.
  - Complete user privacy (raw video never leaves the client device).
  - Instantaneous feedback loop (< 30ms latency).
  - Dependent on client device processing capabilities; requires simulated landmark harness for automated test execution.

---

## ADR 003: Metric Canonical Storage (cm / kg) with Display-Level Imperial Conversions

- **Status**: Accepted
- **Context**: Resistance training algorithms, 1RM formulas, and BMI calculations require consistent arithmetic. Storing mixed units (lbs in some rows, kg in others) leads to compounding rounding errors and data corruption.
- **Decision**: All database columns for length/circumference store values strictly in **centimeters (cm)**, and all load/weight columns strictly in **kilograms (kg)**. Conversions to Imperial (`lbs`, `inches`) occur exclusively at the presentation layer.
- **Consequences**: Simplifies backend mathematical logic. UI components must wrap display metrics in unit conversion utilities.

---

## ADR 004: Dual-Locale English and Vietnamese with Strict 100% Key Parity

- **Status**: Accepted
- **Context**: FitTrack AI serves both global and Vietnamese fitness communities. Incomplete translations create poor user impressions and degraded usability.
- **Decision**: Maintain dual-language support (`en` and `vi`) using `react-i18next` with a zero-tolerance policy for missing keys: any key in `en.json` must exist in `vi.json`.
- **Consequences**: PRs and commits touching UI strings must update both locale dictionaries simultaneously.

---

## ADR 005: Hybrid Progressive Overload Architecture (Deterministic Heuristics + Gemini LLM)

- **Status**: Accepted
- **Context**: Pure LLM generation can hallucinate unsafe load progressions (e.g., suggesting a lifter jump from 80kg to 120kg). Conversely, purely static algorithms cannot answer qualitative questions regarding fatigue or recovery.
- **Decision**: Separate quantitative load progression from qualitative coaching:
  - **Deterministic Engine**: Calculates target weights strictly using verified set history and progressive increments (`+2.5 kg` / `+5.0 kg`).
  - **Gemini Copilot**: Provides grounded qualitative answers, nutritional strategies, and exercise tips based on the user's verified metrics.
- **Consequences**: High athletic safety and reliability while retaining AI conversational benefits.

---

## ADR 006: Elimination of Dummy / Mock Data in Favor of Clean Empty States

- **Status**: Accepted
- **Context**: Hardcoded starter routines, fake 4200kg weekly volume numbers, and fake 85kg Bench Press records misled new users into believing they had active history and masked data synchronization bugs.
- **Decision**: Purge all mock/dummy data across backend controllers and frontend state. When a user has no logged workouts, analytics, or weigh-ins, the UI renders clean empty states with educational guidance prompting them to start their first workout.
- **Consequences**: Clear, trustworthy user experience and authentic analytics.

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-09-16 | Initial formalization of core architectural decision records (ADRs 001-006) |
