# Data Model: Welcome Modal & Onboarding Tour

**Branch**: `014-welcome-flow-tour` | **Date**: 2026-05-05

This feature introduces no new persisted entities. All new state is transient UI state confined to a single session.

---

## UI State: WelcomeModal

**Location**: `isWelcomeModalVisible` — `useState` in `src/App.tsx`; `importError`, `isLoadingSeeded`, `isLoadingImport` — `useState` internal to `src/components/WelcomeModal.tsx`  
**Persistence**: None — `isWelcomeModalVisible` derived at mount from `localStorage.getItem('llamanomicon-v2') === null`

| Field | Type | Owner | Description |
|---|---|---|---|
| `isWelcomeModalVisible` | `boolean` | `App.tsx` | True when the key is absent from localStorage or after "New Session". Set to `false` by any welcome action. |
| `importError` | `string \| null` | `WelcomeModal.tsx` | Error message if file import fails. Auto-clears after 4 000 ms. |
| `isLoadingSeeded` | `boolean` | `WelcomeModal.tsx` | True while "New Seeded File" file picker is in-flight. |
| `isLoadingImport` | `boolean` | `WelcomeModal.tsx` | True while "Import" file picker is in-flight. |

**Note**: `WelcomeModal` and `App` both carry `"use no memo"` directive to opt out of `babel-plugin-react-compiler` optimization. The compiler was generating conditional `useState` calls in `WelcomeModal` based on `isOpen`, causing hook count mismatches on `isOpen` transitions. See research.md Decision 8.

**State transitions**:

```
[App mounts, no localStorage key]
  → isWelcomeModalVisible = true

[User selects "New File"]
  → clearData() called → persist writes key
  → isWelcomeModalVisible = false

[User selects "New Seeded File" or "Import", file pick succeeds]
  → importStateFromFile() → importState(appState) called → persist writes key
  → isWelcomeModalVisible = false

[User selects "New Seeded File" or "Import", file pick cancelled/fails]
  → importError set in WelcomeModal (cleared after 4s or next attempt)
  → isWelcomeModalVisible remains true

[User selects "Not sure, let's take the tour"]
  → seedData() called → persist writes key
  → isWelcomeModalVisible = false
  → tour starts

[Returning user clicks "New Session" in AppHeader]
  → clearData() called in SessionControls → persist updates key
  → isWelcomeModalVisible = true (set via onNewSession callback in App)
```

---

## UI State: OnboardingTour

**Location**: `src/lib/onboardingTour.ts` — plain module function (not a React hook)  
**Persistence**: None — always restarts from step 1

| Field | Type | Description |
|---|---|---|
| `tourInstance` | `ReturnType<typeof introJs> \| null` | Module-level variable holding the live intro.js instance. Not React state — no re-render on change. |

**Note**: Originally designed as a `useOnboardingTour` React hook (`useRef` + `useEffect`). Converted to a plain module function to avoid a `babel-plugin-react-compiler` hook-inlining crash. See research.md Decision 2 and Decision 8.

**Public API**:

```typescript
// src/lib/onboardingTour.ts
export function startOnboardingTour(): void
```

`startOnboardingTour()`:
1. If an instance is already active, calls `.exit(true)` to clean it up first.
2. Creates a fresh `introJs()` instance, calls `.setOptions({ steps, ... }).start()`.
3. Attaches `.onComplete` and `.onExit` handlers that null out `tourInstance`.

---

## Tour Step Definitions

**Location**: `src/data/tour.ts`  
**Type**:

```typescript
interface TourStep {
  element: string;   // CSS selector, e.g. '[data-tour-target="agents"]'
  title?: string;
  intro: string;
}
```

**Steps** (8 total):

| # | Element | Purpose |
|---|---|---|
| 1 | `'body'` (no anchor) | Welcome — overview of what Llamanomicon does |
| 2 | `'[data-tour-target="agents"]'` | Agent List — what agents are and how to create one |
| 3 | `'[data-tour-target="skills"]'` | Skills List — skill tags and filtering |
| 4 | `'[data-tour-target="snippets"]'` | Snippets Panel — creating/toggling snippets |
| 5 | `'[data-tour-target="output"]'` | Output Window — compiled output and copy-to-clipboard |
| 6 | `'header[role="banner"]'` | AppHeader — save/discard session controls, import/export |
| 7 | `'[data-tour-target="help-button"]'` | ? button — how to re-launch the tour any time |
| 8 | `'body'` (no anchor) | Completion — call to action to start building |

---

## AppSection Attribute Extension

**Location**: `src/components/AppSection.tsx`  
**Change**: `Card.Root` receives `data-tour-target={variant}` when a `variant` prop is present.

No new fields on `AppSectionProps` — the existing `variant` prop drives the attribute value automatically.

---

## Unchanged Persisted Entities

The following entities are untouched by this feature:

- `Snippet` — no changes
- `Skill` — no changes  
- `Agent` — no changes
- `DataState` / `StoreState` — no new persisted fields
- localStorage key `llamanomicon-v2` — structure unchanged; this feature only reads its presence/absence
