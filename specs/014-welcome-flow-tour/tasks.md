# Tasks: Welcome Modal & Onboarding Tour

**Input**: Design documents from `/specs/014-welcome-flow-tour/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/WelcomeModal.md ✓, quickstart.md ✓

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on in-progress tasks)
- **[Story]**: User story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install the new dependency and lay down the static tour-step data before any component work begins.

- [x] T001 Install `intro.js` and `@types/intro.js` — run `npm install intro.js` and `npm install --save-dev @types/intro.js`; confirm entry appears in `package.json` and `package-lock.json`
- [x] T002 [P] Create `src/data/tour.ts` — define `TourStep` interface `{ element: string; title?: string; intro: string }` and export `const tourSteps: TourStep[]` with 8 entries: (1) welcome intro anchored to `'body'`, (2) Agent List `'[data-tour-target="agents"]'`, (3) Skills `'[data-tour-target="skills"]'`, (4) Snippets `'[data-tour-target="snippets"]'`, (5) Output `'[data-tour-target="output"]'`, (6) AppHeader `'header[role="banner"]'`, (7) Help button `'[data-tour-target="help-button"]'`, (8) completion anchored to `'body'`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: DOM attribute for tour targeting and removal of the auto-seed logic that the welcome modal will replace. ALL user story work is blocked until this phase is complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Add `data-tour-target={variant}` to `Card.Root` in `src/components/AppSection.tsx` — when `variant` prop is defined, emit the attribute on the root element so intro.js can target each panel; no prop API change needed
- [x] T004 [P] Remove the auto-seed `useEffect` (the block that checks `baseline.agents.size === 0` and calls `seedData()`) from `src/App.tsx` — the welcome modal owns this responsibility going forward
- [x] T005 [P] Remove the duplicate auto-seed `useEffect` (same `baseline.agents.size === 0` guard) from `src/components/AppHeader.tsx` — `AppHeader` must not own data-initialization logic

**Checkpoint**: Foundation ready — `AppSection` panels are tour-targetable, auto-seed side effects are gone. User story implementation can now begin.

---

## Phase 3: User Story 1 — Welcome Modal & First-Time Path Selection (Priority: P1) 🎯 MVP

**Goal**: New users land in a blocking welcome modal that lets them choose between New File, New Seeded File (file picker), Import (file picker), or taking the tour. Returning users see the main app immediately.

**Independent Test**: Clear `localStorage.removeItem('llamanomicon-v2')` in the browser console and reload — the welcome modal must appear. Select each of the four options and confirm the expected outcome (empty app / file picker / file picker / modal closes + seeds). Reload without clearing localStorage and confirm the modal does NOT appear.

### Implementation for User Story 1

- [x] T006 [US1] Create `src/components/WelcomeModal.tsx` — implement as a blocking HeroUI `Modal` (`isDismissable={false}`, `hideCloseButton={true}`); three-row layout inside: (Row 1) full-width welcome heading and description copy in `ModalHeader`; (Row 2) 3-column grid of action cards — "New File", "New Seeded File", "Import" — in `ModalBody`; (Row 3) full-width ghost/text "Not sure, let's take the tour." CTA in `ModalFooter`; inline `importError: string | null` display below the cards with `text-(--danger)` / `bg-(--danger)/10` styling; props: `isOpen: boolean`, `onNewFile: () => void`, `onNewSeededFile: () => Promise<void>`, `onImport: () => Promise<void>`, `onStartTour: () => void`; apply neoskeumorphic depth consistent with existing panel and nav tokens

- [x] T007 [US1] Wire welcome detection and modal into `src/App.tsx` — add `isWelcomeModalVisible` state initialized via `useState(() => localStorage.getItem('llamanomicon-v2') === null)`; add `welcomeImportError` state (`string | null`); implement `handleNewFile` (calls `clearData()`, sets modal closed); implement `handleNewSeededFile` (calls `importStateFromFile()` → on success calls `importState()` and closes modal; on `AbortError`/null return stays open; on other error sets `welcomeImportError` and clears after 4 000 ms); implement `handleImport` (identical mechanism to `handleNewSeededFile`); add stub `handleStartTour` (to be fully implemented in T009); render `<WelcomeModal>` with all props passed; leave `useOnboardingTour` wiring until T009

**Checkpoint**: User Story 1 is independently functional — all three file-selection paths work and the welcome modal appears only for new sessions.

---

## Phase 4: User Story 2 — Guided Tour from Welcome Modal (Priority: P2)

**Goal**: Clicking "Not sure, let's take the tour" closes the modal, seeds the workspace so all panels are populated, and launches an intro.js tour that highlights each panel with an anchored outline.

**Independent Test**: Clear localStorage and reload → modal appears → click "Not sure, let's take the tour" → modal closes, panels populate with seed data, intro.js overlay launches with step 1; advance through all 8 steps confirming each panel highlight is anchored to the correct panel element; skip/complete the tour and confirm the seeded workspace remains.

### Implementation for User Story 2

- [x] T008 [P] [US2] Create `src/hooks/useOnboardingTour.ts` — import `introJs` from `'intro.js'` and `'intro.js/introjs.css'`; hold the intro.js instance in a `useRef<ReturnType<typeof introJs> | null>`; export `function useOnboardingTour(): { startOnboardingTour: () => void }`; `startOnboardingTour` must: exit any running instance cleanly first, create a fresh instance, call `.setOptions({ steps: tourSteps, showStepNumbers: false, exitOnOverlayClick: false })`, call `.start()`, attach `.oncomplete` and `.onexit` cleanup handlers; return a cleanup function from a `useEffect` that calls `.exit(true)` on unmount

- [x] T009 [US2] Complete `handleStartTour` in `src/App.tsx` — call `useOnboardingTour()` at the top of `App` to get `startOnboardingTour`; implement `handleStartTour` as: `seedData()`, `setIsWelcomeModalVisible(false)`, `startOnboardingTour()`; pass `onStartTour={handleStartTour}` to `<WelcomeModal>` (replaces the stub from T007)

**Checkpoint**: User Stories 1 and 2 both work independently — the tour launches from the welcome modal with all panels populated and each step outline anchored to the correct panel.

---

## Phase 5: User Story 3 — Help Button for Returning Users (Priority: P3)

**Goal**: A `?` icon button in `AppHeader` lets any user re-launch the tour at any time, regardless of session state.

**Independent Test**: Load the app with an existing session (no modal) → click the `?` button in the nav → intro.js tour launches from step 1 over the live workspace; dismiss the tour and confirm no data is lost.

### Implementation for User Story 3

- [x] T010 [P] [US3] Modify `src/components/AppHeader.tsx` to accept `onStartTour: () => void` prop — import `CircleHelp` (or `HelpCircle` if unavailable) from `lucide-react`; add a `<Button>` with `aria-label="Launch onboarding tour"`, `data-tour-target="help-button"`, the icon as its child, and neoskeumorphic shadow styling matching `ThemeButton` (using `--nav-btn-shadow` / `--nav-btn-shadow-active` tokens); call `onStartTour` on click; remove the `baseline` + `seedData` imports that were only needed by the now-deleted `useEffect`

- [x] T011 [US3] Pass `startOnboardingTour` to `<AppHeader>` in `src/App.tsx` — `useOnboardingTour` is already called at the `App` level (from T009); add `onStartTour={startOnboardingTour}` to the `<AppHeader />` render call; update `AppHeader`'s TypeScript interface to include the new prop

**Checkpoint**: All three user stories are independently functional — the `?` button launches the tour from any app state.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, bundle validation, and end-to-end verification.

- [x] T012 [P] Update the `## Active Technologies` section in `CLAUDE.md` — add `- intro.js 8 — onboarding tour (014-welcome-flow-tour)` to the bullet list; confirm the intro.js entry added by the agent context script to the main `Active Technologies` line is accurate
- [x] T013 [P] Run `npm run build` and inspect the Vite output — confirm intro.js appears as a chunk and is ≤ 35 KB gzipped; if larger, investigate and document in a code comment in `useOnboardingTour.ts`
- [x] T014 End-to-end smoke test against the checklist in `specs/014-welcome-flow-tour/quickstart.md` — verify all four welcome paths, panel outline anchoring for all 8 tour steps, `?` button from main app, single-instance guard (rapid double-click), import error handling (invalid file), localStorage absence detection; run `npm run lint` and `npm test` to confirm no regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **blocks all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on Phase 2 + US1 (T007 must exist before T009 can complete the wiring)
- **US3 (Phase 5)**: Depends on Phase 2 + US2 (T009 must exist so `startOnboardingTour` is available in App.tsx)
- **Polish (Phase 6)**: Depends on all user stories complete

### Task-Level Dependencies

| Task | Depends On |
|------|-----------|
| T001 | — |
| T002 | — (parallel with T001) |
| T003 | T001, T002 |
| T004 | T001 (parallel with T003, T005) |
| T005 | T001 (parallel with T003, T004) |
| T006 | T003, T004, T005 |
| T007 | T006 |
| T008 | T001, T002, T003 (parallel with T006) |
| T009 | T007, T008 |
| T010 | T003, T005 (parallel with T006, T008) |
| T011 | T009, T010 |
| T012 | T011 |
| T013 | T011 |
| T014 | T012, T013 |

### Parallel Opportunities

Phase 1:
- T001 and T002 can run in parallel

Phase 2:
- T003, T004, T005 can all run in parallel

Phase 3–5 (after Phase 2 complete):
- T006, T008, T010 can all run in parallel (different files, no shared dependencies)
- T007 starts after T006 completes
- T009 starts after T007 and T008 both complete
- T011 starts after T009 and T010 both complete

---

## Parallel Example: Phases 2–5 Accelerated

```
# After Phase 1 completes — launch Phase 2 all at once:
Task T003: AppSection data-tour-target attribute
Task T004: Remove auto-seed from App.tsx
Task T005: Remove auto-seed from AppHeader.tsx

# After Phase 2 completes — launch these three in parallel:
Task T006: WelcomeModal component
Task T008: useOnboardingTour hook
Task T010: AppHeader ? button

# T006 done → start:
Task T007: Wire WelcomeModal into App.tsx

# T007 + T008 done → start:
Task T009: Complete handleStartTour in App.tsx

# T009 + T010 done → start:
Task T011: Pass startOnboardingTour to AppHeader
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Install intro.js, create tour data
2. Complete Phase 2: AppSection attribute, remove auto-seed effects
3. Complete Phase 3: WelcomeModal + App.tsx wiring (T006, T007)
4. **STOP and VALIDATE**: All four welcome paths work; modal doesn't appear on return visits
5. Ship or demo — new users have a guided entry point

### Incremental Delivery

1. Phase 1 + 2 → Infrastructure ready
2. Phase 3 → Welcome modal ships (**MVP**)
3. Phase 4 → Tour from "Not sure" path ships
4. Phase 5 → `?` help button ships
5. Phase 6 → Polish + docs + bundle check

---

## Notes

- `[P]` tasks touch different files with no in-flight dependencies — safe to parallelize
- `[Story]` label maps each task to the spec.md user story for traceability
- The `useOnboardingTour` hook (T008) is independent of WelcomeModal (T006) — write them in parallel
- Do NOT call `seedData()` anywhere other than the two explicit tour/welcome paths; the old auto-seed effects are removed in Phase 2
- intro.js CSS must be imported in `useOnboardingTour.ts` (not globally) to keep the import co-located with its use
- Commit after each checkpoint to keep the branch bisectable
