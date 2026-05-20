# Implementation Plan: Store Model Split

**Branch**: `003-store-model-split` | **Date**: 2026-03-24 | **Spec**: `specs/003-store-model-split/spec.md`

## Summary

Refactor `useAppStore.ts` into per-model Zustand slice creator files (`useFlows`, `useGroups`, `useSnippets`, `useSettings`) that are merged into a single root `create<StoreState>()` call, following the official Zustand slice pattern. Business logic (ID generation, order calculation, cross-entity cleanup, activation rules) currently embedded in or near TSX components is consolidated into store actions. Derived state is extracted into pure selector functions. A shared `StoreData` interface eliminates `any` in slice type signatures without circular module dependencies.

## Technical Context

**Language/Version**: TypeScript 5.9 — strict mode, `noUncheckedIndexedAccess: true`
**Primary Dependencies**: React 19, Zustand 5, Dexie 4, Vite 7, Tailwind CSS v4, dnd-kit 0.3.2
**Storage**: Dexie 4 → IndexedDB (single-row JSON snapshot, `appState` table id=1)
**Testing**: None — no test framework exists per CLAUDE.md; type-check + lint are the quality gate
**Target Platform**: Browser PWA, offline-first (vite-plugin-pwa 1.2.0)
**Project Type**: Web application (single-project, frontend-only)
**Performance Goals**: 60 fps; IndexedDB writes async, non-blocking
**Constraints**: Offline-capable; no server calls; bundle must be audited on dependency additions
**Scale/Scope**: Single-user local app; state serializable to/from JSON at all times

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality — TypeScript strict, ESLint, Prettier, no dead code | ✅ PASS | All slice files pass `tsc --noEmit` and `eslint src/store/` with zero errors. `StoreData` type eliminates need for `any` in slice signatures. |
| II. UX Consistency — dark-first, uniform interaction patterns | ✅ N/A | Store-only refactor; no UI changes introduced. `GroupsListItem.tsx` cleanup removed dead code without altering appearance. |
| III. Performance First — 60fps, async persistence, offline-capable | ✅ PASS | Single `persist()` closure in root store; all Dexie writes remain `void`-awaited async. No render-blocking logic added. |
| IV. Living Documentation — spec/plan updated in same commit | ✅ PASS | This plan and `research.md`, `data-model.md` are generated before implementation merges. CLAUDE.md architecture section will be updated (see Phase 1). |
| V. Simplicity & DRY — no speculative abstraction, rule of three | ✅ PASS | `storeUtils.ts` utilities each have ≥2 call sites. `selectors.ts` functions are used in `GroupsListItem` and are independently testable. No wrapper layers added. |
| Technology Standards — Zustand slices, serializable state | ✅ PASS | Slice creator pattern matches Zustand docs. `StoreState = GroupsSlice & SnippetsSlice & FlowsSlice & SettingsSlice` is fully serializable. |
| V1 scope gate — no node graph, GSAP, or neoskeumorphic design | ✅ PASS | Refactor is purely store-layer; no visual changes. |

**No violations requiring Complexity Tracking.**

## Project Structure

### Documentation (this feature)

```text
specs/003-store-model-split/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── contracts/
│   └── store-api.md     ← Phase 1 output (store public surface)
└── tasks.md             ← Phase 2 output (/speckit.tasks — not created here)
```

### Source Code

```text
src/
├── types/
│   └── index.ts               # AppState, StoreData, domain types (Snippet, Group, Flow, etc.)
├── store/
│   ├── useAppStore.ts         # Root: single create<StoreState>(), persist() closure, importState
│   ├── useFlows.ts            # createFlowsSlice — flows[], activeFlowId, CRUD, toggles
│   ├── useGroups.ts           # createGroupsSlice — library, selectedGroupId, group CRUD
│   ├── useSnippets.ts         # createSnippetsSlice — snippet CRUD (operates on library)
│   ├── useSettings.ts         # createSettingsSlice — outputSettings
│   ├── selectors.ts           # Pure selector functions (no store dependency)
│   └── utils/
│       └── storeUtils.ts      # Cross-slice utilities (clean, reindex)
├── db/
│   └── database.ts            # Dexie setup + saveState/loadState (unchanged)
└── components/
    └── GroupsListItem.tsx     # Updated: uses selectors instead of inline derivation
```

**Structure Decision**: Single-project web app. Store layer split follows Zustand slice pattern (not a monorepo or backend split). No new top-level directories introduced.

## Complexity Tracking

> No constitution violations. Table omitted per template instruction.
