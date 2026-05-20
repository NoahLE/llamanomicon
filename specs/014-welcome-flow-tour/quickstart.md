# Quickstart: Welcome Modal & Onboarding Tour

**Branch**: `014-welcome-flow-tour`

## What's changing

- **Welcome modal** appears on first load (no localStorage session) with four paths: New File, New Seeded File, Import, or Take the Tour.
- **"New Session" button** in the nav now clears data and re-shows the welcome modal for returning users.
- **Onboarding tour** (intro.js, 8 steps) highlights each app panel in sequence with anchored outlines.
- **`?` help button** in `AppHeader` lets any user re-launch the tour at any time.
- **Dark-mode tour styling** — `.introjs-*` overrides in `theme.css`; black tooltip background in dark mode.
- **Removes** the existing auto-seed `useEffect` from `App.tsx` and `AppHeader.tsx`.

## New dependency

```bash
npm install intro.js
npm install --save-dev @types/intro.js
```

Verify bundle impact: `npm run build` and check intro.js in the Vite output. Should be ~28 KB gzipped.

## Files created

| File | Purpose |
|---|---|
| `src/components/WelcomeModal.tsx` | Blocking HeroUI Modal with 3-row layout; |
| `src/lib/onboardingTour.ts` | Plain module function wrapping intro.js (not a React hook — see research.md Decision 2) |
| `src/data/tour.ts` | 8 fixed tour step definitions |

## Files modified

| File | Change |
|---|---|
| `src/App.tsx` | `isWelcomeModalVisible` state; `handleNewSession`; render `<WelcomeModal>`; pass `startOnboardingTour` + `onNewSession` to `AppHeader`; removed auto-seed `useEffect` |
| `src/main.tsx` | Import `intro.js/introjs.css` **before** `@/main.css` so `theme.css` overrides win |
| `src/components/AppHeader.tsx` | Added `onStartTour` + `onNewSession` props; `CircleHelp` `?` button; removed auto-seed `useEffect` |
| `src/components/AppSection.tsx` | Added `data-tour-target={variant}` to `Card.Root` |
| `src/components/DataControls.tsx` | Added `onNewSession` prop; forwards to `SessionControls` |
| `src/components/SessionControls.tsx` | Added `onNewSession` prop; calls `clearData()` then `onNewSession()` in confirm handler; returns Fragment for uniform nav spacing |
| `src/style/theme.css` | Dark-mode `.introjs-*` overrides; `--introjs-*` CSS tokens for both dark (default) and light modes |
| `src/store/useAppStore.ts` | Fixed pre-existing `noUncheckedIndexedAccess` error (`sorted[0]!.id`) |
| `CLAUDE.md` | Added intro.js, WelcomeModal, and tour hook to Active Technologies and Recent Changes |

## How welcome detection works

```tsx
// In App.tsx — read synchronously before first render, no flicker
const [isWelcomeModalVisible, setIsWelcomeModalVisible] = useState(
  () => localStorage.getItem('llamanomicon-v2') === null
);
```

Once any welcome action completes, the store writes to localStorage (via `persist`), so the check returns `false` on every subsequent load.

## How tour panel anchoring works

`AppSection` emits `data-tour-target={variant}` on its root element. Tour steps reference these selectors:

```typescript
// src/data/tour.ts
{ element: '[data-tour-target="agents"]', title: 'Agent List', intro: '...' }
{ element: '[data-tour-target="skills"]', title: 'Skills',     intro: '...' }
// etc.
```

intro.js highlights the matched DOM element and positions the tooltip adjacent to it.

## Testing the welcome modal locally

```bash
# Remove session to trigger welcome modal
localStorage.removeItem('llamanomicon-v2');  # run in browser console
# Then reload the page
```

## How the "New Session" path works

Returning users click **New Session** → confirmation dialog → confirm:

1. `SessionControls.handleConfirmClear()` calls `clearData()` (Zustand store mutation)
2. Then calls `onNewSession()` (prop callback up through `DataControls → AppHeader → App`)
3. `App.handleNewSession()` calls `setIsWelcomeModalVisible(true)` only — the store mutation stays in `SessionControls` to avoid React Compiler instability from mixing Zustand mutations with React state updates in the same function

## Running tests

```bash
npm test   # all 98 tests (no feature-specific test files were added)
```
