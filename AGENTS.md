# FitTrack AI - Agents & Engineering Guide

## 1. Project Overview & Architecture
FitTrack AI is a full-stack, enterprise-grade progressive overload and intelligent fitness coaching platform.
- **Frontend**: React 18, Vite, TypeScript, TailwindCSS + custom tokens in `index.css`, Lucide React icons, `react-i18next`.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Google Gemini AI API via official `@google/genai` SDK.
- **Computer Vision**: Client-side MediaPipe Pose landmark estimation for real-time exercise form feedback and kinematic analysis.

---

## 2. Core Engineering Standards

### A. Design System & Aesthetics
- **Theme**: Dark mode by default (`dark`) with seamless, high-contrast Light Mode support (`light`).
- **Color Palette**: Emerald (`#10b981`), Teal (`#14b8a6`), Slate dark surfaces (`#0a0d14`, `#0e131f`), Slate light surfaces (`#f8fafc`, `#ffffff`).
- **Contrast Rule**: In Light Mode, never render dark text on dark backgrounds or white text on white backgrounds. Buttons with solid/gradient colored fills must retain white text (using `.keep-white` or `text-white !important`).
- **Typography**: `Plus Jakarta Sans`, font weights 400 to 800.

### B. Internationalization (i18n)
- Supported languages: **English (`en`)** and **Tiếng Việt (`vi`)**.
- **100% Key Parity Rule**: Any key added to `frontend/src/i18n/locales/en.json` MUST be mirrored in `frontend/src/i18n/locales/vi.json`.
- All user-facing labels, buttons, placeholders, dialogs, and statuses must use `useTranslation()` / `t(...)`.

### C. Domain & Business Logic Invariants
- **Canonical Metrics**: All height/circumference metrics are stored strictly in **cm**, and all weight/load metrics strictly in **kg**. Conversions to Imperial (lb/in) are purely display-level.
- **User Isolation**: All database queries and operations require authenticated user tenancy.
- **Immutable Nutrition Snapshots**: Food entries in meals snapshot their macros at log time to prevent retrospective changes if food definitions change.

---

## 3. Git Commit Conventions
Follow Conventional Commits:
- `feat(<scope>): <short description>`
- `fix(<scope>): <short description>`
- `style(<scope>): <short description>`
- `refactor(<scope>): <short description>`
- `docs(<scope>): <short description>`

**Rule**: Keep commits atomic and focused per feature/domain for easy rollbacks and clear history.

---

## 4. Work Log & Task Tracker

| Task / Domain | Status | Commit Hash | Summary |
|---|---|---|---|
| Backend Auth & Google GIS API | Completed | `45b4a11` | Provision Google GIS verification, token refresh, and Auth routes |
| Backend Gemini Copilot Service | Completed | `45b4a11` | Contextual fitness & nutrition prompt engineering with real metrics |
| Vertical Navigation Layout | Completed | `cbcb61a` | Fixed desktop/tablet sidebar (`md:w-64`), dynamic breadcrumbs, clean header |
| Theme & Light Mode Overhaul | Completed | `932a068` | Escaped Tailwind opacity overrides in `index.css`, ThemeToggle, button contrast |
| Core i18n Expansion (EN/VI) | Completed | `132c171` | 100% parity across `en.json` and `vi.json` with 100+ keys |
| Feature Workouts i18n & Light Mode | Completed | `ab54b4a` | ActiveSession, CreatePlan, RestTimer, WorkoutsPage |
| Feature Exercises i18n & Light Mode | Completed | `5153058` | ExerciseCard, ExerciseDetailModal, CreateExerciseModal, ExercisesPage |
| Feature Progress & Body Metrics | Completed | `cb516f0` | WeightTrend, BodyMeasurements, ProgressPhotos, LogWeightModal |
| Feature Analytics & AI Form | Completed | `8716cb5` | MuscleVolume, 1RM Progression, PersonalRecords, AiFormPage |
| Feature Auth UI & Protected Route | Completed | `2fa3570` | Google sign-in state handling, protected route i18n, light glass styles |
| Feature Nutrition i18n & Light Mode | Completed | `610b5ed` | MealSection, FoodSearchModal, NutritionGoalsModal, MacroCard |
| Feature Copilot Drawer & Advisor Card | Completed | `c8a18fb` | OverloadAdvisorCard, AiCopilotDrawer responsive light/dark & i18n |
| Feature Pages: Dashboard & Profile | Completed | `ec56913` | Full light mode styling, bilingual translations, metric forms |
| Agents Guide & Documentation | Completed | `725a492` | Create and maintain AGENTS.md standards and log |
| Sidebar Collapse i18n Keys | Completed | `987010a` | Add sidebar collapse and expand translation keys |
| Collapsible Burger Sidebar | Completed | `6f3b962` | Implement burger toggle, mini rail (w-20), hover overlay expand (w-64) and tooltips |
| Dashboard Exercise Translations | Completed | `23b18fd` | Refine light mode contrast and translate default exercise items |
| Feature Workouts Refinements | Completed | `773e02d` | Refine light mode styling and table header translations in active session and workouts page |
| Feature Copilot Localization | Completed | `a8bfbbf` | Bind localized initial message and quick prompts in AI copilot drawer |

