# Tasks: Nav Skeuomorphic Design

**Input**: Design documents from `/specs/012-nav-skeuomorphic/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/AppHeader.md ✅, quickstart.md ✅

**Tests**: No test tasks generated — this is a pure visual/CSS change with no logic under test. Existing test suite must pass unchanged.

**Organization**: Tasks grouped by user story. US1 (dark mode) → US2 (light mode) → US3 (buttons). US2 depends on the token overrides introduced in Phase 2; US3 can proceed in parallel with US2 after the foundational tokens exist.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: Confirm the dev environment is healthy before making visual changes.

- [x] T001 Verify `make dev` starts without errors and the app loads at `http://localhost:5173`

---

## Phase 2: Foundational — CSS Token Definitions

**Purpose**: Add all six `--nav-*` CSS custom properties to `src/style/theme.css` under `:root` (dark mode defaults). These tokens are the single prerequisite for all three user stories.

**⚠️ CRITICAL**: No user story work can begin until T002 is complete.

- [x] T002 Add dark-mode defaults for `--nav-surface`, `--nav-highlight`, `--nav-shadow`, `--nav-title-shadow`, `--nav-btn-shadow`, and `--nav-btn-shadow-active` under `:root` in `src/style/theme.css`. Use `rgba()` values only — no hardcoded hex or named colors. Dual-shadow pattern for `--nav-shadow` (inset highlight layer + drop shadow layer in one `box-shadow` value).

**Checkpoint**: Six tokens defined in `:root`. Dev server reflects them. All user story phases can now begin.

---

## Phase 3: User Story 1 — Dark Mode Nav Has Physical Depth (Priority: P1) 🎯 MVP

**Goal**: The nav bar reads as a raised physical surface in dark mode — distinct background, drop shadow below, top-edge highlight, engraved title.

**Independent Test**: Load app in dark mode (default). Nav bar must show elevated surface with visible shadow and engraved title. No theme toggle needed.

### Implementation for User Story 1

- [x] T003 [US1] Apply `background: var(--nav-surface)` and `border-top: 1px solid var(--nav-highlight)` to the `<header>` element in `src/components/AppHeader.tsx`
- [x] T004 [US1] Apply `box-shadow: var(--nav-shadow)` and `transition: box-shadow 200ms ease, background-color 200ms ease` to the `<header>` element in `src/components/AppHeader.tsx`
- [x] T005 [US1] Apply `textShadow: 'var(--nav-title-shadow)'` (inline style) to the title `<span>` in `src/components/AppHeader.tsx`
- [x] T006 [US1] Visually verify dark mode: nav bar appears raised with engraved title per quickstart.md step 2 — adjust token values in `src/style/theme.css` until depth is convincing

**Checkpoint**: Dark mode nav reads as a physical raised surface. US1 independently complete.

---

## Phase 4: User Story 2 — Light Mode Nav Has Matching Physical Depth (Priority: P2)

**Goal**: The nav bar retains its raised appearance and engraved title in light mode, using recalibrated token values that suit the lighter palette.

**Independent Test**: Toggle to light mode. Nav bar must still appear as an elevated surface — no harsh dark shadows, no washed-out appearance.

### Implementation for User Story 2

- [x] T007 [US2] Add `[data-theme="light"]` override block to `src/style/theme.css` redefining all six `--nav-*` tokens with values recalibrated for the light palette. Lighter surface relative to light background; subtler shadows; highlight remains visible against light bg.
- [x] T008 [US2] Visually verify light mode: toggle theme, confirm nav depth is legible and shadow/highlight look intentional per quickstart.md step 3 — adjust light-mode token values until depth reads clearly

**Checkpoint**: Both dark and light mode nav bars read as elevated surfaces. US1 and US2 independently complete.

---

## Phase 5: User Story 3 — Nav Buttons Feel Tactile and Pressable (Priority: P3)

**Goal**: The ThemeButton and Data dropdown trigger visually raise at rest and depress on press in both themes.

**Independent Test**: Click and hold the theme toggle and the Data button in any theme — each must visually depress (inset shadow). Release restores raised state. Keyboard focus ring must be visible independently of shadow state.

### Implementation for User Story 3

- [x] T009 [P] [US3] Add shadow className to the `<Button>` in `src/components/ThemeButton.tsx`: resting state `shadow-[var(--nav-btn-shadow)]`, active state `active:shadow-[var(--nav-btn-shadow-active)]`, transition `transition-shadow duration-100`
- [x] T010 [P] [US3] Add the same shadow className treatment to the Data dropdown trigger `<Button>` (the `variant="secondary"` button) in `src/components/DataControls.tsx`
- [x] T011 [US3] Visually verify button states in both themes per quickstart.md steps 4–5: press-and-hold each button confirms inset shadow; tab-navigation confirms visible focus ring

**Checkpoint**: All three user stories complete. Full neoskeumorphic nav in both themes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final validation.

- [x] T012 [P] Update `CLAUDE.md` Recent Changes section: add entry for `012-nav-skeuomorphic` describing the six `--nav-*` tokens and which components use them
- [x] T013 [P] Update `docs/styling.md`: document the `--nav-*` token set, the dual-shadow pattern, and the `[data-theme="light"]` override convention as the established depth vocabulary for future panels
- [x] T014 Run `make lint && make build && npm test` and confirm zero new errors or failures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 (needs `:root` tokens)
- **US2 (Phase 4)**: Depends on Phase 2 (needs token names to override); can run in parallel with US3 after Phase 2
- **US3 (Phase 5)**: Depends on Phase 2 (needs `--nav-btn-shadow*` tokens); can run in parallel with US2 after Phase 2
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Unblocked after Phase 2 — no dependency on US2 or US3
- **US2 (P2)**: Unblocked after Phase 2 — no dependency on US1 (adds a new selector, doesn't change existing styles)
- **US3 (P3)**: Unblocked after Phase 2 — T009 and T010 touch different files, both parallelizable

### Within Each Story

- AppHeader changes (T003 → T004 → T005) must be sequential — same file
- Button changes (T009, T010) are parallel — different files
- Visual verification tasks (T006, T008, T011) must follow their implementation tasks

---

## Parallel Example: User Story 3

```bash
# After Phase 2 completes, launch both button tasks simultaneously:
Task T009: "Add shadow className to ThemeButton in src/components/ThemeButton.tsx"
Task T010: "Add shadow className to Data trigger in src/components/DataControls.tsx"
# T011 only after T009 and T010 are both done
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Add tokens to `src/style/theme.css`
3. Complete Phase 3: Apply tokens to `src/components/AppHeader.tsx`
4. **STOP and VALIDATE**: Dark mode nav reads as raised surface — deployable MVP
5. Continue to US2 and US3 as follow-on work

### Incremental Delivery

1. Phase 1 + 2 → tokens defined, nothing visible yet
2. Phase 3 (US1) → dark mode nav has depth ✅ demo-ready
3. Phase 4 (US2) → light mode parity ✅ both themes complete
4. Phase 5 (US3) → buttons feel tactile ✅ full feature
5. Phase 6 → docs updated, CI green ✅ merge-ready

---

## Notes

- All token values in `src/style/theme.css` MUST use `rgba()` — no hex, no named colors (FR-006)
- `text-shadow` on the title must be applied as an inline `style` prop (not a Tailwind utility) since Tailwind v4 doesn't have a `text-shadow-[var(...)]` arbitrary variant
- `active:shadow-[...]` Tailwind arbitrary variants require the brackets syntax: `active:shadow-[var(--nav-btn-shadow-active)]`
- The `[data-theme="light"]` selector in `theme.css` must match what `useTheme` sets (`root.setAttribute("data-theme", theme)`)
- Commit after each phase checkpoint — keeps diffs reviewable and lets you validate visually at each increment
