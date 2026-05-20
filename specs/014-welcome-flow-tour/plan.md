# Implementation Plan: Welcome Modal & Onboarding Tour

**Branch**: `014-welcome-flow-tour` | **Date**: 2026-05-05 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/014-welcome-flow-tour/spec.md`

## Summary

Add a blocking welcome modal that appears on first load (no localStorage session) giving new users three starting paths — empty file, seeded-file picker, or JSON import — plus a "take the tour" path that auto-seeds the workspace and launches an intro.js guided tour. A `?` icon button in `AppHeader` lets returning users re-launch the tour at any time. Removes the existing auto-seed `useEffect` from both `App.tsx` and `AppHeader.tsx`, replacing that logic entirely with the welcome modal flow.

## Technical Context

**Language/Version**: TypeScript 6.0 strict, `noUncheckedIndexedAccess: true`  
**Primary Dependencies**: React 19, Vite 7, Zustand 5 + Immer 11, HeroUI v3, intro.js v8 (new), Tailwind CSS v4, lucide-react  
**Storage**: localStorage via Zustand `persist` (key: `llamanomicon-v2`) — session presence detected by `localStorage.getItem('llamanomicon-v2') === null`  
**Testing**: Vitest 4 + React Testing Library  
**Target Platform**: PWA, dark-first, offline-capable  
**Project Type**: Single-page web app  
**Performance Goals**: Welcome modal visible within 500ms of app becoming interactive; tour navigation at 60fps  
**Constraints**: Offline-capable; no server calls; bundle impact of intro.js must be audited; neoskeumorphic styling permitted  
**Scale/Scope**: Single-user local app; tour has 6–12 fixed steps

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Check | Status |
| --- | --- | --- |
| I. Code Quality | TypeScript strict throughout; no `any`; duplicate `seedData` useEffects removed in same PR; self-describing names (`welcomeModalVisible`, `startOnboardingTour`) | [x] |
| II. UX Consistency | Modal uses HeroUI `Modal`; neoskeumorphic depth applied consistently with existing nav/panel tokens; dark-first; no new motion patterns | [x] |
| III. Performance | intro.js ~30 KB gzipped audited; tree-shaking checked; tour is async-loaded only when triggered; no blocking on cold path | [x] |
| IV. Living Documentation | `CLAUDE.md` and `docs/` updated in same PR; intro.js added to Active Technologies section | [x] |
| V. Simplicity & DRY | `importStateFromFile` reused for both "New Seeded File" and "Import"; single `useOnboardingTour` hook; no extra abstraction layers; welcome-modal detection is a one-liner | [x] |
| VI. Testing Discipline | `tests/` subdirectory per source dir; AAA pattern; store actions used for state setup (not hand-constructed objects); each test isolated | [x] |
| Tech Standards | HeroUI Modal; Zustand 5 + Immer 11; localStorage persist; Vitest + RTL; `@/` alias throughout | [x] |
| V1 Scope Gate | No node graph; no GSAP; neoskeumorphic styling permitted and applied | [x] |

## Project Structure

### Documentation (this feature)

```text
specs/014-welcome-flow-tour/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── WelcomeModal.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── WelcomeModal.tsx          ← new
│   ├── AppHeader.tsx             ← modified: add ? button, remove auto-seed effect
│   ├── AppSection.tsx            ← modified: add data-tour-target attribute
│   ├── App.tsx                   ← modified: welcome modal detection, remove auto-seed effect
│   └── tests/
│       └── WelcomeModal.test.tsx ← new
├── hooks/
│   ├── useOnboardingTour.ts      ← new
│   └── tests/
│       └── useOnboardingTour.test.ts ← new
└── data/
    ├── seed.ts                   ← unchanged
    └── tour.ts                   ← new: tour step definitions
```

**Structure Decision**: Single-project layout (existing `src/` tree). No new top-level directories. Feature touches the `components/`, `hooks/`, and `data/` layers only.

## Complexity Tracking

> No constitution violations. No new abstractions beyond the rule of three. No complexity entries needed.
