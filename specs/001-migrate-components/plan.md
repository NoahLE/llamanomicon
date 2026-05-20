# Implementation Plan: Component Store Migration & Testing

**Branch**: `001-migrate-components` | **Date**: 2026-04-20 | **Spec**: [spec.md](spec.md)

## Summary

Migrate the remaining unmigrated UI component (`OutputWindow.tsx`) to the new Zustand store API, re-enable the three commented-out panels in `App.tsx`, configure component testing infrastructure (jsdom + user-event), write React Testing Library tests for all components under `src/components/tests/`, and update project documentation to reflect the completed migration.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode, `noUncheckedIndexedAccess: true`)  
**Primary Dependencies**: React 19, Vite 7, Zustand 5, HeroUI, Tailwind CSS v4, dnd-kit 0.3.2  
**Storage**: localStorage via Zustand `persist` middleware (custom Map/Set serialization)  
**Testing**: Vitest 4 + React Testing Library 16 + jsdom (to be installed) + @testing-library/user-event (to be installed)  
**Target Platform**: Browser PWA (offline-capable, dark-first)  
**Project Type**: Single-page web application  
**Performance Goals**: 60 fps UI; offline after first load  
**Constraints**: No server calls; store state must remain serializable; no new UI patterns beyond existing  
**Scale/Scope**: ~12 component files; ~5 component test files to create

## Constitution Check

_GATE: Must pass before implementation._

| Principle              | Check                                                                                                           | Status |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- | ------ |
| I. Code Quality        | Removes `@ts-nocheck`, all components pass strict TS; dead commented-out imports/code removed from App.tsx      | ✅     |
| II. UX Consistency     | No new interaction patterns; restoring existing panels; dark-first preserved                                    | ✅     |
| III. Performance       | Offline-capable preserved; RTL + jsdom are devDependencies only; no runtime bundle impact                       | ✅     |
| IV. Living Documentation | `CLAUDE.md`, `docs/architecture.md`, `docs/state-and-data-flow.md`, `docs/contributing.md` updated in same PR | ✅     |
| V. Simplicity & DRY    | Reuses `selectCompiledOutput`, `createTestStore()`, existing selectors; no new abstractions                     | ✅     |
| VI. Testing Discipline | tests/ subdir per source dir (`src/components/tests/`), AAA pattern, real store actions for setup, isolated tests | ✅     |
| Tech Standards         | HeroUI, dnd-kit, Zustand slices, Vitest + RTL — all used as specified                                           | ✅     |
| V1 Scope Gate          | No node graph, no GSAP, no neoskeumorphic design                                                                | ✅     |

## Project Structure

### Documentation (this feature)

```text
specs/001-migrate-components/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (via /speckit.tasks)
```

### Source Code Changes

```text
src/
├── App.tsx                              ← uncomment SkillsList, SnippetsPanel, OutputWindow
├── components/
│   ├── OutputWindow.tsx                 ← MIGRATE: remove @ts-nocheck, rewrite to new store API
│   ├── AgentList.tsx                    ← read only (verify no changes needed)
│   ├── SkillsList.tsx                   ← read only (already migrated)
│   ├── SnippetsPanel.tsx                ← read only (already migrated)
│   └── tests/
│       ├── AgentList.test.tsx           ← CREATE
│       ├── SkillsList.test.tsx          ← CREATE
│       ├── SnippetsPanel.test.tsx       ← CREATE
│       ├── OutputWindow.test.tsx        ← CREATE
│       └── DataControls.test.tsx        ← CREATE

docs/
├── architecture.md                      ← update component status, remove "pending" notes
├── state-and-data-flow.md               ← update store slice summary, session model
└── contributing.md                      ← add component testing instructions

CLAUDE.md                                ← update "Recent Changes", remove @ts-nocheck note
vite.config.ts                           ← no global change; jsdom set per test file
package.json                             ← add jsdom, @testing-library/user-event as devDeps
```

**Structure Decision**: Single-project React app. Source in `src/`; component tests in `src/components/tests/` per domain-area test subdirectory convention.

## Complexity Tracking

> **No violations** — all Constitution checks pass.

## Implementation Phases

### Phase 1: Dependency installation
- `npm install -D jsdom @testing-library/user-event`
- Verify: `npm test` still passes (store tests unaffected)

### Phase 2: OutputWindow migration
- Read current `OutputWindow.tsx` — remove `// @ts-nocheck`
- Replace `s.library`, `s.flows`, `s.activeFlowId` with:
  - `useAppStore(selectCompiledOutput)` for compiled text
  - `useAppStore(selectActiveAgent)` for agent name/null state
  - `useAppStore.use.outputSettings()` for settings if needed
- Remove `compileOutput(library, activeFlow, outputSettings)` call — delegate entirely to `selectCompiledOutput`
- Verify: `npx tsc --noEmit` passes; no lint errors

### Phase 3: Re-enable panels in App.tsx
- Remove comment blocks around `SkillsList`, `SnippetsPanel`, `OutputWindow` imports and JSX
- Remove any stale commented-out imports
- Verify: `make dev` → all 4 panels visible; `make build` passes

### Phase 4: Component tests
Each test file must:
- Begin with `// @vitest-environment jsdom`
- Import from `@testing-library/react` and `@testing-library/user-event`
- Use the real Zustand store (wrap component with actual provider or use `useAppStore` directly)
- Follow AAA pattern with real store actions for setup (per Constitution VI)
- Cover: render, primary interaction, and at least one edge case per component

**Test coverage targets per component:**

| Component | Render test | Interaction test | Edge case |
|-----------|-------------|-----------------|-----------|
| AgentList | renders list of agents | add agent via form, select agent | empty state |
| SkillsList | renders skills | select skill filters snippets | untagged filter |
| SnippetsPanel | renders snippets for active agent | toggle snippet active/inactive | active agent with stale snippet ID |
| OutputWindow | renders compiled output | output updates when snippet deactivated | no active agent → empty state |
| DataControls | renders commit/discard buttons | commit persists state | discard reverts session |

### Phase 5: Documentation updates

- `docs/architecture.md`: update component inventory table, remove "pending migration" notes
- `docs/state-and-data-flow.md`: update store slice list, confirm DataControls and session model description
- `docs/contributing.md`: add "Component Tests" section with path convention and environment setup
- `CLAUDE.md` "Recent Changes": add entry for 005-update-store-components / this branch; remove @ts-nocheck note from component descriptions

## Verification

```bash
# 1. TypeScript passes clean
npx tsc --noEmit        # zero errors

# 2. Lint clean
make lint               # zero warnings

# 3. All tests pass
npm test                # zero failures, zero skips

# 4. Dev server shows all panels
make dev                # open http://localhost:5173; verify 4 panels render

# 5. Production build succeeds
make build              # zero errors
```

**End-to-end smoke test** (manual):
1. Add an agent, add snippets, activate snippets → OutputWindow shows compiled text
2. Add a skill, tag snippets, click skill in SkillsList → SnippetsPanel filters
3. Reorder snippets via drag → output order changes
4. Commit → reload → data persists
5. Make changes → discard → changes gone
