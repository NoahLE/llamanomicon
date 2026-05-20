# Tasks: In-App Documentation Modal

**Input**: Design documents from `specs/016-in-app-docs/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

**Purpose**: No new dependencies or config needed. Verify existing structure is ready.

- [x] T001 Confirm `src/components/tests/` directory exists and ResizeObserver mock is available

---

## Phase 2: User Story 1 — Open the Documentation Modal (Priority: P1) 🎯 MVP

**Goal**: A book icon in the header opens a HeroUI modal with placeholder content. Prompt Engineering tab shown by default. Modal closes via button and Escape.

**Independent Test**: Click book icon → modal opens → Prompt Engineering content visible → close works.

### Tests for User Story 1

- [x] T002 [US1] Create `src/components/tests/DocsModal.test.tsx`: test that trigger button renders, clicking it opens modal with Prompt Engineering tab active, close button dismisses modal

### Implementation for User Story 1

- [x] T003 [US1] Create `src/components/DocsModal.tsx`: `<Modal>` wrapper with `BookOpen` trigger button (variant="tertiary", nav shadow tokens), `useState` for isOpen, `Modal.Backdrop` → `Modal.Container` → `Modal.Dialog`, `Modal.CloseTrigger`, `Modal.Header` with "Documentation" heading, `Modal.Body` containing `Tabs` — three tabs with lorem ipsum placeholder content, default tab "prompt-engineering"

---

## Phase 3: User Story 2 — Switch Between Documentation Tabs (Priority: P2)

**Goal**: Clicking each of the three tabs replaces the content area with that tab's content.

**Independent Test**: Click each tab in sequence, verify content area updates.

### Tests for User Story 2

- [x] T004 [US2] Add tab-switching tests to `src/components/tests/DocsModal.test.tsx`: clicking Prompting Tips shows its content, clicking Sources shows its content, clicking active tab again has no visible change

### Implementation for User Story 2

- [x] T005 [US2] Verify `Tabs` in DocsModal uses `Tabs.Panel` per tab with distinct placeholder content (each panel's lorem ipsum text is different enough to distinguish in tests)

---

## Phase 4: User Story 3 — Book Icon in Header (Priority: P3)

**Goal**: `DocsModal` is rendered in `AppHeader` immediately left of `ThemeButton`, visible at all times.

**Independent Test**: Verify book icon is present in header, positioned before the theme toggle.

### Tests for User Story 3

- [x] T006 [P] [US3] Add `AppHeader` rendering test to `src/components/tests/AppHeader.test.tsx` (create if it doesn't exist): verify book icon button renders in the header

### Implementation for User Story 3

- [x] T007 [US3] Modify `src/components/AppHeader.tsx`: import `DocsModal`, insert `<DocsModal />` between the `CircleHelp` tour button and `<ThemeButton />`

---

## Phase 5: Polish & Validation

- [x] T008 [P] Update `CLAUDE.md` Recent Changes entry for 016-in-app-docs with accurate description of what was built
- [x] T009 Run `make lint` — ESLint + Prettier must pass with zero errors
- [x] T010 Run `npm test` — all existing tests plus new DocsModal tests must pass
- [x] T011 Run `make build` — TypeScript type-check + production build must succeed

---

## Dependencies & Execution Order

- **T001** → no deps, run first
- **T002** → after T001 (test file setup)
- **T003** → after T002 (implement what test covers)
- **T004** → after T003 (DocsModal exists with Tabs)
- **T005** → verify during T003/T004 (same file)
- **T006** → can run alongside T004 [P]
- **T007** → after T003 (DocsModal must exist to import)
- **T008** → after T007 (accurate description requires impl complete)
- **T009–T011** → after all implementation tasks
