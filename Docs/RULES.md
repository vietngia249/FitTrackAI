---
document: RULES
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

# FitTrack AI - Engineering & Agent Rules

> [!IMPORTANT]
> **MANDATORY FILE**: Every AI agent working on FitTrack AI MUST read this file in full before writing, modifying, or executing any code or tests. No task is exempt.

---

## 1. Coding & Language Standards

### A. TypeScript Standards
- **[Explicit Rule] Strict Mode**: TypeScript strict mode is enabled across both `backend` and `frontend`. Never use `any` unless wrapping untyped external libraries or catching unknown errors (`catch (err: unknown)`).
- **[Explicit Rule] ES Modules**: The repository strictly uses Node.js ES Modules (`"type": "module"`). In the backend, all relative imports within TypeScript files must specify `.js` extension (e.g., `import { app } from './app.js';`).
- **[Observed Convention] Interfaces vs Types**: Use `interface` for object shapes, entities, and component props; use `type` for unions, primitives, and mapped types.

### B. React & Frontend Conventions
- **[Explicit Rule] Functional Components**: All React components must be functional components typed with `React.FC<Props>` or directly typed parameters. Class components are strictly forbidden.
- **[Explicit Rule] State Management**: Keep state local (`useState`, `useReducer`) or scoped via React Context (`ThemeContext`, `AuthContext`). Avoid introducing external state libraries (Redux, Zustand) without architectural approval.
- **[Explicit Rule] Icon Library**: Exclusively use `lucide-react`. Never install or mix other icon libraries (FontAwesome, Heroicons, etc.).

---

## 2. Naming Conventions

- **[Observed Convention] Files & Directories**:
  - React Components: PascalCase (e.g., `ExerciseDetailModal.tsx`, `OverloadAdvisorCard.tsx`).
  - Hooks: camelCase starting with `use` (e.g., `useTheme.ts`).
  - Utilities, APIs, and Services: camelCase (e.g., `copilotApi.ts`, `poseGeometry.ts`, `exercise.service.ts`).
  - Backend Controllers & Schemas: kebab-case with descriptive suffix (e.g., `copilot.controller.ts`, `copilot.schemas.ts`).
  - Documentation: UPPER_SNAKE_CASE in `Docs/` (e.g., `PROJECT_CONTEXT.md`, `RULES.md`).
- **[Observed Convention] Database Columns**: Snake case (e.g., `user_id`, `created_at`, `total_volume_kg`).
- **[Observed Convention] API Routes**: Lowercase kebab-case, plural nouns (e.g., `/api/v1/workout-plans`, `/api/v1/exercises`).

---

## 3. Architecture Constraints

- **[Explicit Rule] Backend Framework**: The backend is built strictly on **Fastify 5**, NOT Express. All route handlers must use `FastifyRequest` and `FastifyReply`.
- **[Explicit Rule] User Tenancy Isolation**: All database operations touching user data (workouts, meals, weight logs, measurements, fitness profile) MUST filter by `userId` derived from the authenticated token (`request.user.id`). Cross-tenant leakage is a critical severity failure.
- **[Explicit Rule] Canonical Measurement Metrics**:
  - Distance, height, and circumferences MUST be stored strictly in **centimeters (cm)**.
  - Weight, loads, and volume MUST be stored strictly in **kilograms (kg)**.
  - Conversions to Imperial (`lbs`, `inches`) are strictly display-layer operations.
- **[Explicit Rule] Immutable Food Snapshots**: Food entries logged in meals snapshot their macros at log time to prevent retroactive changes if food definitions are updated.

---

## 4. Design System & UI Contrast Rules

- **[Explicit Rule] Dual Theme Support**: The application must support dark mode (`dark` class on `html`) by default, with seamless, high-contrast light mode (`light`).
- **[Explicit Rule] Contrast Invariance**:
  - In Light Mode, never render dark text on dark surfaces or light text on light surfaces.
  - Buttons with gradient or solid accent fills (`bg-emerald-500`, `bg-teal-500`) must retain high-contrast white text (use `.keep-white` or `text-white font-bold`).
- **[Observed Convention] Color Palette**:
  - Primary Accent: Emerald (`#10b981`, `emerald-500`)
  - Secondary Accent: Teal (`#14b8a6`, `teal-500`)
  - Dark Surfaces: `#0a0d14` (root background), `#0e131f` (cards/panels), Slate 800/900
  - Light Surfaces: `#f8fafc` (root background), `#ffffff` (cards/panels), Slate 100/200

---

## 5. Internationalization (i18n) Rules

- **[Explicit Rule] 100% Key Parity**: Any translation key introduced to `frontend/src/i18n/locales/en.json` MUST be mirrored with accurate Vietnamese in `frontend/src/i18n/locales/vi.json`.
- **[Explicit Rule] No Hardcoded UI Text**: All user-facing labels, buttons, dialog titles, notifications, and tooltips must use `t('key.path', 'Default fallback')`.

---

## 6. AI & Safety Guardrails

- **[Explicit Rule] Medical Disclaimer Guardrail**: If an AI query relates to acute pain, injury diagnosis, or medical symptoms, the AI must refuse diagnosis and redirect to a licensed medical professional.
- **[Explicit Rule] Anti-Hallucination Grounding**: The AI Copilot prompt must be grounded in verified user biometrics (height, weight, age, sex, recent session volume, 1RM trajectory).
- **[Explicit Rule] Rate Limiting**: The Gemini Copilot enforces a hard daily limit of 15 queries per user to prevent API quota exhaustion.

---

## 7. Git & Development Rules

- **[Explicit Rule] Conventional Commits**: All commit messages must strictly adhere to Conventional Commits:
  - `feat(<scope>): <description>`
  - `fix(<scope>): <description>`
  - `docs(<scope>): <description>`
  - `style(<scope>): <description>`
  - `refactor(<scope>): <description>`
  - `test(<scope>): <description>`
- **[Explicit Rule] Atomic Scopes**: Keep commits atomic and isolated per feature or domain.
- **[Explicit Rule] No Broken Commits**: Before committing, verify `npm --prefix backend run typecheck` and `npm --prefix frontend run typecheck` exit with code 0.

---

## 8. File Modification & Preservation Rules

- **[Explicit Rule] Preserve Existing Comments**: Do NOT delete existing JSDoc comments, explanatory comments, or domain invariant notes unrelated to your task.
- **[Explicit Rule] Minimal Scoped Edits**: Only modify files directly relevant to the current task. Do not reformat untouched files or adjust line endings repository-wide.

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-09-16 | Initial formalization of mandatory engineering rules, conventions, and constraints |
