# Research: Welcome Modal & Onboarding Tour

**Branch**: `014-welcome-flow-tour` | **Date**: 2026-05-05

---

## Decision 1: First-visit detection strategy

**Decision**: Check `localStorage.getItem('llamanomicon-v2') === null` once on mount (read synchronously before first render via `useState` initializer).

**Rationale**: The Zustand `persist` middleware writes the `llamanomicon-v2` key as soon as any persisted state is saved. Every welcome-modal completion path (New File, New Seeded File, Import, Tour) calls a store action that triggers a persist write, so the key will exist after any of them. Checking the raw key is simpler and more reliable than inspecting `baseline` map sizes, which could legitimately be empty after a user manually clears data through the app.

**Alternatives considered**:
- Separate `hasSeenWelcome: boolean` flag persisted in Zustand — adds state and complexity; redundant given the key-absence check does the same job.
- Check `baseline.agents.size === 0` — already used for auto-seed; ambiguous between "new user" and "user who cleared everything".

---

## Decision 2: intro.js version and integration approach

**Decision**: `intro.js` v8 as a runtime dependency; `@types/intro.js` as a dev dependency. Call intro.js imperatively from a plain module function (`src/lib/onboardingTour.ts`) rather than a React hook or a React wrapper library.

**Rationale**: The original plan used a `useOnboardingTour` React hook (`useRef` + `useEffect`). During implementation, `babel-plugin-react-compiler` (enabled in this project) inlined the hook's `useRef` into `App`'s hook sequence inconsistently between renders, producing a fatal "change in order of Hooks called" crash. Converting to a plain module function with a module-level `let tourInstance` variable eliminates the React dependency entirely and avoids the compiler conflict. The imperative intro.js API requires no React lifecycle — `.start()`, `.exit()`, and cleanup are all synchronous/promise-based calls.

**Bundle impact**: intro.js v8 ~28 KB gzipped (core + CSS). Acceptable for a one-time onboarding dependency. CSS is imported in `src/main.tsx` (before `@/main.css` to allow theme overrides — see Decision 9).

**Alternatives considered**:
- `useOnboardingTour` React hook — implemented first; abandoned due to `babel-plugin-react-compiler` hook-inlining bug.
- `introjs-react` — thin wrapper, not updated for React 19, adds extra dependency layer.
- `shepherd.js` — larger bundle (~50 KB), more configuration overhead.
- `driver.js` — similar size to intro.js but less mature TypeScript support.

---

## Decision 3: Panel element targeting for tour steps

**Decision**: Add a `data-tour-target` attribute to `AppSection`'s `Card.Root` element, keyed to the `variant` prop value (`agents`, `skills`, `snippets`, `output`). Tour steps reference elements via `document.querySelector('[data-tour-target="agents"]')`.

**Rationale**: `AppSection` already has the `variant` prop. Adding `data-tour-target={variant}` is a one-line change that makes panels queryable without introducing component refs or context. The attribute is semantically neutral and won't affect styles or behaviour.

**Alternatives considered**:
- React `ref` callbacks passed from `App.tsx` to each panel — works but requires prop drilling through `Agents`, `Skills`, `Snippets`, `OutputWindow` and then down to `AppSection`.
- CSS class selectors — fragile; Tailwind class names are utility-based and not stable identifiers.

---

## Decision 4: Welcome modal visibility state

**Decision**: Plain React `useState` in `App.tsx`, initialized lazily from the localStorage check. Not in Zustand.

**Rationale**: The welcome modal is a one-time UI gate. It has no persistence requirement and no cross-component state dependency — only `App.tsx` renders it. Putting transient UI state in Zustand would violate Simplicity & DRY. The `useState` initializer runs synchronously before first render, so there is no flicker risk.

```tsx
const [isWelcomeModalVisible, setIsWelcomeModalVisible] = useState(
  () => localStorage.getItem('llamanomicon-v2') === null
);
```

**Alternatives considered**:
- Zustand `uiState` slice — unnecessary; no other consumer of this value exists.
- `useEffect` + `useState(false)` — causes a one-frame flicker where the main app renders before the modal appears.

---

## Decision 5: Tour trigger and new-session signal sharing

**Decision**: `startOnboardingTour` (plain function import) and `onNewSession` (callback prop) are both threaded from `App.tsx` down to consumers via props. No context, no Zustand.

**Rationale**: `AppHeader` is a direct child of `App`. Both callbacks only travel two levels deep (`App → AppHeader → DataControls → SessionControls` for `onNewSession`; `App → AppHeader` for `onStartTour`). Prop threading is the simplest correct solution at this depth. The constitution's YAGNI rule rules out context — there is no unrelated subtree that needs either callback.

**`onNewSession` flow**: `SessionControls` calls `clearData()` from the store itself, then calls `onNewSession()`. `App.handleNewSession` only sets `setIsWelcomeModalVisible(true)`. Keeping the Zustand mutation in `SessionControls` (where it already lived) and the React state setter in `App` avoids the React Compiler inlining issue described in Decision 8.

**Alternatives considered**:
- React context — justifiable only if multiple unrelated subtrees need access; not the case here.
- Zustand `startTour` action / `showWelcomeModal` action — actions should modify persisted state, not call imperative DOM APIs or toggle transient UI gates.

---

## Decision 6: Removal of duplicate auto-seed useEffects

**Decision**: Remove the `useEffect` that calls `seedData()` from both `App.tsx` and `AppHeader.tsx`. The welcome modal entirely replaces this logic.

**Rationale**: These effects were the original "no data → seed" guard. The welcome modal is the new guard — and it gives users agency over their starting state. Leaving the effects would cause auto-seeding to race with or override the welcome modal's "New File" (empty) path.

**Note**: `AppHeader.tsx` should not own any data-initialization logic. The duplication between `App.tsx` and `AppHeader.tsx` was already a code smell; this feature is the correct opportunity to remove it.

---

## Decision 8: React Compiler opt-out for WelcomeModal and App

**Decision**: Add the `"use no memo"` directive inside the function bodies of `WelcomeModal` and `App` to opt those components out of `babel-plugin-react-compiler` optimization.

**Rationale**: The React Compiler was generating conditional hook calls in `WelcomeModal` — it detected that `importError`, `isLoadingSeeded`, and `isLoadingImport` are only meaningful when the modal is open, and wrapped their `useState` calls in a condition keyed to `isOpen`. When `isOpen` transitioned (true → false or false → true), React's runtime detected a hook count mismatch and threw "Rendered fewer hooks than expected." The `"use no memo"` directive is the official React Compiler escape hatch: it tells the compiler to leave the function body untransformed, so all hooks run unconditionally on every render as React requires.

`App` received the same directive as a belt-and-suspenders measure: it renders `WelcomeModal` and owns `isWelcomeModalVisible`, so its render function is directly exposed to the same compiler optimization pass.

**Alternatives considered**:
- Global compiler disable in `vite.config.ts` — too broad; other components benefit from the optimization.
- Restructuring `WelcomeModal` to not use `useState` — unnecessary; the fix is one directive line.
- Lifting `isOpen` state out of `App` into Zustand — solves the symptom without addressing the compiler bug; adds unwarranted global state.

---

## Decision 9: CSS import order for intro.js dark-mode overrides

**Decision**: In `src/main.tsx`, import `intro.js/introjs.css` before `@/main.css`. Dark-mode overrides for all `.introjs-*` selectors are written in `src/style/theme.css`.

**Rationale**: CSS specificity between `introjs.css` and `theme.css` is equal (single-class selectors). In equal-specificity conflicts, the later rule wins. The original import order had `intro.js/introjs.css` after `@/main.css`, so intro.js's white-background rules overrode `theme.css` overrides. Reversing the order means `theme.css` (loaded via `main.css`) always wins. The dark-mode defaults use `#000000` for the tooltip background with light text; `[data-theme="light"]` restores the original intro.js defaults.

**Alternatives considered**:
- `!important` on all overrides — works but pollutes specificity and is harder to maintain.
- Separate CSS file imported after `main.css` — adds a file just to solve an import order problem; the token approach in `theme.css` is cleaner.

---

## Decision 7: Tour step count and content structure

**Decision**: 8 fixed steps: (1) welcome intro, (2) Agent List panel, (3) Skills List panel, (4) Snippets Panel, (5) Output Window, (6) AppHeader nav controls, (7) tip about the `?` button, (8) completion/call-to-action. Steps defined in `src/data/tour.ts` as a typed array of `{ element: string; intro: string; title?: string }`.

**Rationale**: 8 steps covers all major UI landmarks with one step each and stays well within the 6–12 range from FR-008. A `title` field is optional per intro.js API and improves scannability for visual learners. Defining steps as data (not JSX) keeps the hook logic free of markup.

**Alternatives considered**:
- Inline step definitions in `useOnboardingTour` — mixes data and behavior; harder to update copy without touching the hook.
- Per-panel step registration via context — over-engineered for a fixed, non-configurable tour.
