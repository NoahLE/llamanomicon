# Implementation Plan: In-App Documentation Modal

**Branch**: `016-in-app-docs` | **Date**: 2026-05-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/016-in-app-docs/spec.md`

## Summary

Add a self-contained documentation modal to the app. A `BookOpen` icon button is inserted into `AppHeader` immediately left of the existing `ThemeButton`. Clicking it opens a HeroUI `Modal` containing three tabs (Prompt Engineering, Prompting Tips, Sources) with static placeholder content. All state is local to the component — no Zustand changes needed.

## Technical Context

**Language/Version**: TypeScript 6.0 strict, `noUncheckedIndexedAccess: true`
**Primary Dependencies**: React 19, HeroUI v3 (Modal.*, Tabs.*), lucide-react (BookOpen)
**Storage**: N/A — no persistence, all state is ephemeral component-local
**Testing**: Vitest + React Testing Library; test in `src/components/tests/DocsModal.test.tsx`
**Target Platform**: Browser (PWA), offline-capable
**Project Type**: Single-page web application
**Performance Goals**: 60 fps; tab switches must be imperceptible (<16 ms frame)
**Constraints**: Offline-capable, no new runtime dependencies, bundle impact zero (HeroUI Tabs already shipped with HeroUI v3)
**Scale/Scope**: Single new component (~80–100 lines), one header insertion, one test file

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                | Check                                                                                                                               | Status |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| I. Code Quality          | TypeScript strict, no `any`, single responsibility per unit, active dead-code removal + simplification                              | [x]    |
| II. UX Consistency       | Dark-first, uniform interaction patterns, no new motion without precedent                                                           | [x]    |
| III. Performance         | Offline capable, 60 fps, no async paths, no new bundle cost (HeroUI Tabs in existing package)                                      | [x]    |
| IV. Living Documentation | CLAUDE.md Recent Changes updated in same PR                                                                                         | [x]    |
| V. Simplicity & DRY      | No speculative abstractions; no new shared logic; one component, one concern                                                        | [x]    |
| VI. Testing Discipline   | tests/ subdir per source dir, AAA pattern, native-mechanism setup, isolated tests                                                   | [x]    |
| Tech Standards           | Uses HeroUI v3 Modal + Tabs (not custom primitives), no Zustand changes needed, `@/` alias for all intra-src imports                | [x]    |
| V1 Scope Gate            | No node graph, no GSAP; neoskeumorphic button shadow applied via existing CSS token pattern                                         | [x]    |

## Project Structure

### Documentation (this feature)

```text
specs/016-in-app-docs/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── DocsModal.tsx          ← NEW: self-contained docs modal with embedded trigger
│   ├── AppHeader.tsx          ← MODIFIED: add <DocsModal /> before <ThemeButton />
│   └── tests/
│       ├── DocsModal.test.tsx  ← NEW: component tests
│       └── (existing tests unchanged)
```

**Structure Decision**: Single project layout. `DocsModal` is a new sibling component in `src/components/`, test file in the existing `src/components/tests/` subdirectory. No new directories required.

## Phase 0: Research Findings

See [research.md](./research.md).

## Phase 1: Design

See [data-model.md](./data-model.md) and [quickstart.md](./quickstart.md).

No contracts file — this component has no external interface (purely internal UI).

## Implementation Steps

### Step 1 — Create `DocsModal.tsx`

**File**: `src/components/DocsModal.tsx`

Pattern: mirrors `AppFormModal` — `<Modal>` wrapper with embedded trigger button, `useState` for open/close, `Tabs` compound component for tab switching.

Key decisions (from research.md):
- Trigger button: `variant="tertiary"`, `isIconOnly`, shadow tokens matching existing nav buttons
- Icon: `BookOpen` from `lucide-react`
- Modal size: `"lg"` (matches AppFormModal)
- Tabs: `Tabs` → `Tabs.List` → `Tabs.Tab` (with `id` prop) → `Tabs.Panel`
- Default tab: `"prompt-engineering"` set via `defaultSelectedKey` on `Tabs`
- Content: static lorem ipsum per tab, no external data source
- No tab state persisted on close (modal unmounts tab selection on close via `key` or defaultSelectedKey reset)

```tsx
// Structural sketch (not final code):
<Modal>
  <Button isIconOnly variant="tertiary" onPress={openModal} aria-label="Open documentation" className={NAV_BTN_CLASSES}>
    <BookOpen aria-hidden="true" />
  </Button>
  <Modal.Backdrop variant="blur" isOpen={isOpen} onOpenChange={setIsOpen}>
    <Modal.Container size="lg">
      <Modal.Dialog>
        <Modal.CloseTrigger className="mt-2" />
        <Modal.Header>
          <Modal.Heading>Documentation</Modal.Heading>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultSelectedKey="prompt-engineering">
            <Tabs.List>
              <Tabs.Tab id="prompt-engineering">Prompt Engineering</Tabs.Tab>
              <Tabs.Tab id="prompting-tips">Prompting Tips</Tabs.Tab>
              <Tabs.Tab id="sources">Sources</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel id="prompt-engineering">…lorem ipsum…</Tabs.Panel>
            <Tabs.Panel id="prompting-tips">…lorem ipsum…</Tabs.Panel>
            <Tabs.Panel id="sources">…lorem ipsum…</Tabs.Panel>
          </Tabs>
        </Modal.Body>
      </Modal.Dialog>
    </Modal.Container>
  </Modal.Backdrop>
</Modal>
```

### Step 2 — Modify `AppHeader.tsx`

**File**: `src/components/AppHeader.tsx`

Add `<DocsModal />` between the `CircleHelp` tour button and `<ThemeButton />`:

```tsx
// Before ThemeButton, after the CircleHelp button:
<DocsModal />
<ThemeButton />
```

Import: `import { DocsModal } from "@/components/DocsModal";`

### Step 3 — Write `DocsModal.test.tsx`

**File**: `src/components/tests/DocsModal.test.tsx`

Tests (AAA pattern, RTL):
1. Renders the book icon trigger button without throwing
2. Clicking the trigger opens the modal (Prompt Engineering tab visible by default)
3. Clicking the Prompting Tips tab shows Prompting Tips content and hides Prompt Engineering content
4. Clicking the Sources tab shows Sources content
5. Pressing the close trigger closes the modal

Use `ResizeObserver` mock from `src/components/tests/testSetup.ts` (already configured).

### Step 4 — Update `CLAUDE.md`

Add entry to the `## Recent Changes` section describing the feature.

## Verification

1. `make lint` — ESLint + Prettier pass with no errors
2. `make build` — TypeScript type-check passes, production build succeeds
3. `npm test` — all existing tests pass + new DocsModal tests pass
4. `make dev` — manual smoke test:
   - Book icon visible in header, left of theme toggle
   - Clicking opens modal, Prompt Engineering tab active by default
   - Clicking each tab replaces content correctly
   - Escape key and close button both dismiss the modal
   - Light/dark theme toggle works while modal is closed and open
   - No app state changes after opening and closing the modal
