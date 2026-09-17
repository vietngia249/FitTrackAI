# AGENTS.md - FitTrack AI Agent Entry Point & Context Router

> **Welcome, AI Coding Agent.**
> This file is your mandatory starting point. Follow the protocol below before executing any task.

---

## 1. First Read Requirement

Before doing any work:

```text
1. Read AGENTS.md.
2. Read Docs/RULES.md.
3. Determine the task category.
4. Read the documentation required for that category.
5. Inspect the relevant source code.
```

### Core Agent Reading Flow

```text
AGENTS.md
    ↓
Docs/RULES.md (MANDATORY)
    ↓
Identify task type
    ↓
Read relevant documentation from Docs/
    ↓
Inspect relevant source code
    ↓
Plan (Implementation Plan)
    ↓
Implement (Minimal scoped changes)
    ↓
Validate (npm run typecheck && npm test)
    ↓
Update affected documentation (Docs/*)
```

---

## 2. Mandatory Rules

```text
ALWAYS READ:
- Docs/RULES.md
```

The agent MUST NOT:

- Skip `Docs/RULES.md` under any circumstance.
- Assume project rules or conventions from memory.
- Start coding before reading the required context for the task.
- Modify unrelated files outside the task scope.
- Invent undocumented or unverified behavior.
- Ignore existing architecture patterns without explicit justification.

---

## 3. Task → Context Routing Matrix

| Task Category                                             | Required Documentation Context                                                                                                                   |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Any task (Mandatory baseline)**                   | [`Docs/RULES.md`](file:///d:/MyProject/FitTrackAI/Docs/RULES.md)                                                                                |
| **General understanding & domain logic**            | [`Docs/PROJECT_CONTEXT.md`](file:///d:/MyProject/FitTrackAI/Docs/PROJECT_CONTEXT.md)                                                            |
| **System architecture & module layout**             | [`Docs/ARCHITECTURE.md`](file:///d:/MyProject/FitTrackAI/Docs/ARCHITECTURE.md)                                                                  |
| **Feature development or modification**             | [`Docs/FEATURES.md`](file:///d:/MyProject/FitTrackAI/Docs/FEATURES.md)                                                                          |
| **Frontend, UI styling, and Themes**                | [`Docs/DESIGN_SYSTEM.md`](file:///d:/MyProject/FitTrackAI/Docs/DESIGN_SYSTEM.md)                                                                |
| **Backend REST APIs and controllers**               | [`Docs/API_SPEC.md`](file:///d:/MyProject/FitTrackAI/Docs/API_SPEC.md), [`Docs/DATABASE.md`](file:///d:/MyProject/FitTrackAI/Docs/DATABASE.md) |
| **Database modeling, Prisma, migrations**           | [`Docs/DATABASE.md`](file:///d:/MyProject/FitTrackAI/Docs/DATABASE.md)                                                                          |
| **Authentication, JWT, Google GIS, security**       | [`Docs/SECURITY.md`](file:///d:/MyProject/FitTrackAI/Docs/SECURITY.md)                                                                          |
| **AI Copilot (Gemini) & CV Form Coach (MediaPipe)** | [`Docs/AI.md`](file:///d:/MyProject/FitTrackAI/Docs/AI.md)                                                                                      |
| **Testing, verification, test runners**             | [`Docs/TESTING.md`](file:///d:/MyProject/FitTrackAI/Docs/TESTING.md)                                                                            |
| **Docker, deployment, environment variables**       | [`Docs/DEPLOYMENT.md`](file:///d:/MyProject/FitTrackAI/Docs/DEPLOYMENT.md)                                                                      |
| **Local workflow, scripts, and commit format**      | [`Docs/DEVELOPMENT_WORKFLOW.md`](file:///d:/MyProject/FitTrackAI/Docs/DEVELOPMENT_WORKFLOW.md)                                                  |
| **Architectural decisions & rationale**             | [`Docs/DECISIONS.md`](file:///d:/MyProject/FitTrackAI/Docs/DECISIONS.md)                                                                        |
| **Bugs, runtime quirks, offline limitations**       | [`Docs/KNOWN_ISSUES.md`](file:///d:/MyProject/FitTrackAI/Docs/KNOWN_ISSUES.md)                                                                  |
| **Detailed context index & dependency map**         | [`Docs/AGENT_CONTEXT_INDEX.md`](file:///d:/MyProject/FitTrackAI/Docs/AGENT_CONTEXT_INDEX.md)                                                    |

---

## 4. Progressive Context Loading Rules

Do NOT load every file in `Docs/` simultaneously. Load progressively:

- **Level 1 — Mandatory**: Always read `AGENTS.md` and [`Docs/RULES.md`](file:///d:/MyProject/FitTrackAI/Docs/RULES.md).
- **Level 2 — Project Context**: Read [`Docs/PROJECT_CONTEXT.md`](file:///d:/MyProject/FitTrackAI/Docs/PROJECT_CONTEXT.md) when broader domain understanding is required.
- **Level 3 — Task Context**: Read ONLY the documentation relevant to the identified task category (see matrix above).
- **Level 4 — Source Code Inspection**: Inspect the actual source files. Documentation never replaces inspecting live code.

---

## 5. Source of Truth Hierarchy

When resolving ambiguities or conflicts, apply this strict hierarchy:

```text
1. Current source code (Active implementation)
2. Configuration files (package.json, tsconfig.json, .env.example)
3. Database schema / migrations (schema.prisma, migrations/)
4. Tests (*.test.ts)
5. API implementation (*.routes.ts, *.controller.ts)
6. Documentation (Docs/*)
7. Inference / Assumption
```

> [!NOTE]
> If documentation conflicts with the current implementation:
>
> 1. Inspect the source implementation.
> 2. Treat the source implementation as the current reality.
> 3. Update the affected documentation.
> 4. Do NOT blindly follow stale documentation.

---

## 6. Documentation Freshness & Update Protocol

Every file under `Docs/` features YAML frontmatter with `version`, `updated_at`, `source_snapshot`, and a `Changelog`.

### Versioning Rules (SemVer)

- **PATCH** (`x.x.+1`): Typo, wording, file link correction, minor clarification.
- **MINOR** (`x.+1.0`): New feature spec, new API route, new architectural section.
- **MAJOR** (`+1.0.0`): Fundamental architecture change, breaking API rewrite, major schema overhaul.

### Required Documentation Updates on Code Changes

- **UI Changes**: Update `Docs/DESIGN_SYSTEM.md` and `Docs/FEATURES.md`.
- **API Changes**: Update `Docs/API_SPEC.md` and `Docs/FEATURES.md`.
- **Database Changes**: Update `Docs/DATABASE.md` and `Docs/API_SPEC.md`.
- **Auth Changes**: Update `Docs/SECURITY.md` and `Docs/API_SPEC.md`.
- **AI / CV Changes**: Update `Docs/AI.md` and `Docs/FEATURES.md`.

---

## 7. Standard Coding Workflow

```text
1. Read AGENTS.md
2. Read Docs/RULES.md
3. Classify task into category
4. Read required Docs/ files
5. Inspect relevant source code files
6. Identify existing patterns and conventions
7. Create implementation plan
8. Implement minimal scoped changes
9. Run validation (npm run typecheck && npm test)
10. Review diff for contrast and i18n parity
11. Update affected documentation in Docs/
12. Report changes and verification results
```

---

## 8. Historical Work Log & Feature Tracker

| Task / Domain                         | Status    | Commit Hash | Summary                                                                          |
| ------------------------------------- | --------- | ----------- | -------------------------------------------------------------------------------- |
| Backend Auth & Google GIS API         | Completed | `45b4a11` | Provision Google GIS verification, token refresh, and Auth routes                |
| Backend Gemini Copilot Service        | Completed | `45b4a11` | Contextual fitness & nutrition prompt engineering with real metrics              |
| Vertical Navigation Layout            | Completed | `cbcb61a` | Fixed desktop/tablet sidebar (`md:w-64`), dynamic breadcrumbs, clean header    |
| Theme & Light Mode Overhaul           | Completed | `932a068` | Escaped Tailwind opacity overrides in`index.css`, ThemeToggle, button contrast |
| Core i18n Expansion (EN/VI)           | Completed | `132c171` | 100% parity across`en.json` and `vi.json` with 100+ keys                     |
| Feature Workouts i18n & Light Mode    | Completed | `ab54b4a` | ActiveSession, CreatePlan, RestTimer, WorkoutsPage                               |
| Feature Exercises i18n & Light Mode   | Completed | `5153058` | ExerciseCard, ExerciseDetailModal, CreateExerciseModal, ExercisesPage            |
| Feature Progress & Body Metrics       | Completed | `cb516f0` | WeightTrend, BodyMeasurements, ProgressPhotos, LogWeightModal                    |
| Feature Analytics & AI Form           | Completed | `8716cb5` | MuscleVolume, 1RM Progression, PersonalRecords, AiFormPage                       |
| Feature Auth UI & Protected Route     | Completed | `2fa3570` | Google sign-in state handling, protected route i18n, light glass styles          |
| Feature Nutrition i18n & Light Mode   | Completed | `610b5ed` | MealSection, FoodSearchModal, NutritionGoalsModal, MacroCard                     |
| Feature Copilot Drawer & Advisor Card | Completed | `c8a18fb` | OverloadAdvisorCard, AiCopilotDrawer responsive light/dark & i18n                |
| Feature Pages: Dashboard & Profile    | Completed | `ec56913` | Full light mode styling, bilingual translations, metric forms                    |
| Agents Guide & Documentation          | Completed | `725a492` | Create and maintain AGENTS.md standards and log                                  |
| Sidebar Collapse i18n Keys            | Completed | `987010a` | Add sidebar collapse and expand translation keys                                 |
| Collapsible Burger Sidebar            | Completed | `6f3b962` | Implement burger toggle, mini rail (w-20), hover overlay expand (w-64)           |
| Canonical Agents Documentation        | Completed | `6777eb4` | Merge agent.md and AGENTS.md into single canonical file                          |
| Backend Mock Data Removal             | Completed | `7adbf4a` | Remove hardcoded mock analytics and workout volume data                          |
| Feature Body Metrics Mock Removal     | Completed | `caed360` | Remove mockup weight and body measurements with empty states                     |
| Feature Analytics Mock Removal        | Completed | `c6f7c4b` | Remove mockup analytics data and add empty state handling                        |
| Feature Workouts Mock Removal         | Completed | `6399c4a` | Remove starter routine mock fallback and add empty states                        |
| Feature Copilot Mock Removal          | Completed | `d051dae` | Remove fake overload recommendations and handle empty advisor state              |
| Agent Context Documentation System    | Completed | `d051dae` | Build standardized Docs/ context system with AGENTS.md routing                   |
| Vertical Navbar Burger Toggle & Hover | Completed | `e37d105` | Refine vertical navbar with burger button toggle and hover overlay               |
| Auth Token Refresh & Profile Fallback | Completed | `ece46c1` | Auto-refresh token on 401 and preserve local profile on expired session          |
| Neon Adapter & Auth Login 500 Fix     | Completed | `b3f7ca3` | Integrate @prisma/adapter-neon over WebSocket (port 443), fix login 500 error    |
| Exercises Pagination & Gemini AI Chat | Completed | `1692583` | Add exercises load more (873 items) and Gemini multi-thread chat history         |
| Meal Item Edit & Delete Actions       | Completed | `37f16bd` | Add edit food modal with macro scaling and accessible delete confirmation        |
| Copilot FAB & Gemini Chat History     | Completed | `c554d05` | Circular FAB launcher, Gemini-style persistent history threads, navbar layout    |

