---
document: DESIGN_SYSTEM
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

# FitTrack AI - Design System & UI Tokens

## 1. Aesthetic Philosophy & Brand Identity

FitTrack AI embodies a modern, ultra-clean aesthetic inspired by high-end biometric and athletic performance interfaces. It pairs dark-mode cybernetic contrast with an equally refined, high-contrast light mode.

### Core Principles
1. **Dynamic & Alive**: Interactive hover states, subtle micro-animations, and fluid transitions.
2. **Contrast Invariance**: Zero tolerance for unreadable low-contrast text in either theme.
3. **Information Density**: Clean data hierarchy that emphasizes progressive overload numbers, weights, and time without visual clutter.

---

## 2. Color Palette & Token System

### A. Primary Brand Accents
- **Emerald Accent**: Primary brand tint representing progression, success, and vitality.
  - Base: `#10b981` (`emerald-500`)
  - Hover: `#059669` (`emerald-600`)
  - Subtle Fill: `rgba(16, 185, 129, 0.1)` (`emerald-500/10`)
  - Border: `rgba(16, 185, 129, 0.25)` (`emerald-500/25`)
- **Teal Accent**: Secondary tint for recovery, biometrics, and analytics.
  - Base: `#14b8a6` (`teal-500`)
  - Hover: `#0d9488` (`teal-600`)
  - Subtle Fill: `rgba(20, 184, 166, 0.1)` (`teal-500/10`)

### B. Surface & Neutral Hierarchy

| Layer | Dark Mode Token | Light Mode Token | Typical Usage |
|---|---|---|---|
| **Root Background** | `#0a0d14` | `#f8fafc` (`slate-50`) | Global page canvas |
| **Card / Panel** | `#0e131f` / `slate-900/80` | `#ffffff` | Elevated component surfaces |
| **Sub-panel / Input** | `slate-900/60` | `slate-100/80` | Input fields, table rows, badges |
| **Borders** | `slate-800` | `slate-200` | Divider lines and card outlines |
| **Primary Text** | `#ffffff` / `slate-100` | `slate-900` | Headings, major metric values |
| **Secondary Text** | `slate-400` | `slate-600` | Subtitles, labels, descriptions |
| **Muted Text** | `slate-500` | `slate-400` | Timestamps, unit labels, inactive icons |

---

## 3. Contrast & Light Mode Invariants

> [!CAUTION]
> **Strict Contrast Rule**:
> 1. Buttons or badges filled with solid or gradient colors (`bg-emerald-500`, `bg-gradient-to-r`) MUST retain pure white text (`text-white !important` or `.keep-white`). Never allow light-mode global text overrides to flip button text to dark gray.
> 2. Surface panels in Light Mode must use `bg-white` with `border-slate-200` to prevent washed-out blending.
> 3. Text rendered over transparent dark modals must explicitly enforce `text-white`.

---

## 4. Typography

- **Font Family**: `Plus Jakarta Sans`, sans-serif (Google Fonts).
- **Fallback Stack**: `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`.
- **Scale**:
  - Display Title: `text-3xl sm:text-4xl font-extrabold tracking-tight`
  - Page Heading: `text-2xl font-bold tracking-tight`
  - Section Title: `text-lg font-bold`
  - Body Text: `text-sm font-normal leading-relaxed`
  - Subtext / Metadata: `text-xs font-medium`
  - Numerical Metrics: `font-mono font-bold tracking-tight`

---

## 5. UI Components & Layout Guidelines

### A. Navigation System
- **Desktop Sidebar**:
  - Collapsed Mini Rail: `w-20`, centers icons with interactive floating tooltips.
  - Expanded State: `w-64`, reveals full bilingual labels and active indicator pills.
  - Burger Toggle: Located at the top of the rail for deliberate expand/collapse toggling.
- **Mobile Bottom Navigation**:
  - Fixed dock pinned to screen bottom (`bottom-0 left-0 right-0 z-40`).
  - Provides instant thumb access to Dashboard, Workouts, Form Coach, Nutrition, and Profile.

### B. Glassmorphism & Elevation
Classes defined in `frontend/src/index.css`:
- `.glass-panel`: Translucent background blur (`backdrop-blur-md bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800`).
- Card Hover: `hover:border-emerald-500/40 hover:shadow-lg transition-all duration-200`.

### C. Icon Standards
- All icons originate strictly from `lucide-react`.
- Default sizing:
  - Inline metadata icons: `w-3.5 h-3.5` or `w-4 h-4`
  - Section headers: `w-5 h-5`
  - Empty state banners: `w-8 h-8` or `w-10 h-10`

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-09-16 | Initial baseline of design system, color tokens, and contrast rules |
