# Implementation Plan: Inline Store Selectors and Index Utilities

**Branch**: `006-inline-selectors` | **Date**: 2026-04-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-inline-selectors/spec.md`

## Summary

`src/store/selectors.ts` and `src/lib/indexes.ts` contain logic that belongs inside the domain store slices that own the underlying data. This plan migrates each export to its natural home, then deletes both files. All component imports, test mocks, and documentation are updated in the same pass.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict, `noUncheckedIndexedAccess: true`)
**Primary Dependencies**: Zustand 5 (slice-based), React 19, Vite 7
**Storage**: localStorage via Zustand `persist` middleware
**Testing**: Vitest 4 + React Testing Library
**Target Platform**: Browser PWA (local-first, offline)
**Project Type**: Web application (single-page)
**Performance Goals**: 60 fps, no perceptible delay on local-state interactions
**Constraints**: Offline-capable; bundle size must not grow (pure refactor — no new dependencies)
**Scale/Scope**: ~10 files changed; zero new API surface introduced

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle              | Check                                                                                                  | Status |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | ------ |
| I. Code Quality        | TypeScript strict preserved; `any` only in existing `createSelectors` inline suppression; dead files deleted in same commit | ✅ |
| II. UX Consistency     | No UI changes; N/A                                                                                     | ✅ |
| III. Performance       | Pure refactor; zero bundle impact; no new imports                                                      | ✅ |
| IV. Living Documentation | `CLAUDE.md`, `docs/architecture.md`, `docs/state-and-data-flow.md` updated in same PR               | ✅ |
| V. Simplicity & DRY    | `sortByName` duplicated (3 instances, each 2 lines); acceptable per rule-of-three for trivial helper   | ✅ |
| VI. Testing Discipline | Test files remain in `tests/` subdirs; imports updated; mocks split across new module paths            | ✅ |
| Tech Standards         | Zustand slices, Vitest — no new libraries                                                              | ✅ |
| V1 Scope Gate          | No UI, no node graph, no GSAP                                                                          | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/006-inline-selectors/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions and rationale
├── contracts/
│   └── store-exports.md # Phase 1 — new export locations per slice
└── tasks.md             # Phase 2 — /speckit.tasks output
```

### Source Code (affected files)

```text
src/
├── store/
│   ├── useAppStore.ts       # inline createSelectors; remove selectors import
│   ├── useAgents.ts         # add selectActiveAgent, selectSortedAgents, sortByName
│   ├── useSkills.ts         # add selectSelectedSkill, selectSortedSkills,
│   │                        #   selectSnippetsForSkill, UNTAGGED_SKILL_ID, sortByName
│   ├── useSnippets.ts       # add selectUntaggedSnippets, selectAllSnippets, sortByName
│   ├── useSettings.ts       # add selectCompiledOutput (imports selectActiveAgent from useAgents)
│   ├── useDataControls.ts   # inline buildSnippetsBySkill as module-private function;
│   │                        #   remove @/lib/indexes import
│   ├── selectors.ts         # DELETE after all imports updated
│   └── tests/
│       └── selectors.test.ts  # split into per-slice test sections or kept as one file
│                              #   with updated import paths
├── lib/
│   ├── indexes.ts           # DELETE after useDataControls.ts inlines the function
│   └── tests/
│       └── indexes.test.ts  # update import path → src/store/useDataControls (or delete if
│                            #   redundant once function is module-private)
└── components/
    ├── OutputWindow.tsx     # update: selectCompiledOutput, selectActiveAgent → new paths
    ├── AgentList.tsx        # update: selectSortedAgents → useAgents
    ├── SkillsList.tsx       # update: selectSortedSkills, UNTAGGED_SKILL_ID → useSkills
    └── tests/
        ├── testUtils.ts     # split namespace mock into per-module vi.spyOn calls
        ├── OutputWindow.test.tsx   # no change if testUtils handles mocking
        ├── SnippetsPanel.test.tsx  # no change if testUtils handles mocking
        └── SkillsList.test.tsx     # no change if testUtils handles mocking
```

## Migration Table

| Export | Current file | Destination | Notes |
|--------|-------------|-------------|-------|
| `createSelectors` | `selectors.ts` | `useAppStore.ts` (inline) | Used only once, not exported |
| `selectActiveAgent` | `selectors.ts` | `useAgents.ts` | Pure function; same signature |
| `selectSortedAgents` | `selectors.ts` | `useAgents.ts` | Pure function; same signature |
| `selectSelectedSkill` | `selectors.ts` | `useSkills.ts` | Pure function; same signature |
| `selectSortedSkills` | `selectors.ts` | `useSkills.ts` | Pure function; same signature |
| `selectSnippetsForSkill` | `selectors.ts` | `useSkills.ts` | Driven by SkillsList UI |
| `UNTAGGED_SKILL_ID` | `selectors.ts` | `useSkills.ts` | Constant; same value |
| `selectUntaggedSnippets` | `selectors.ts` | `useSnippets.ts` | Pure function; same signature |
| `selectAllSnippets` | `selectors.ts` | `useSnippets.ts` | Pure function; same signature |
| `selectCompiledOutput` | `selectors.ts` | `useSettings.ts` | Imports `selectActiveAgent` from `useAgents.ts`; see Research |
| `sortByName` | `selectors.ts` (private) | Duplicated into each destination | 3 instances, 2 lines each |
| `buildSnippetsBySkill` | `lib/indexes.ts` | `useDataControls.ts` (module-private) | Not exported; removes `@/lib/indexes` import |

## Key Design Decisions

### 1. No circular dependencies introduced
`selectCompiledOutput` (→ `useSettings.ts`) must import `selectActiveAgent` from `useAgents.ts`. The dependency graph becomes:

```
useAppStore.ts → useSettings.ts → useAgents.ts → useAppStore.ts (type-only)
```

The `useAgents.ts` → `useAppStore.ts` link is a **type-only import** (`import type { StoreState }`), which TypeScript erases at compile time. At runtime the chain is: `useAppStore` → `useSettings` → `useAgents` (no cycle). Confirmed safe.

### 2. `createSelectors` inlined, not re-exported
The utility is called once in `useAppStore.ts` and has no other consumers. Moving it to any slice would be an unnecessary re-export. It is pasted directly into `useAppStore.ts` and removed from `selectors.ts`.

### 3. `sortByName` duplicated (not extracted)
Three destination slices need it (`useAgents`, `useSkills`, `useSnippets`). At 2 lines each this satisfies the rule-of-three threshold, but the function is so small that extracting it to a new `src/lib/sort.ts` would add more overhead than value. Duplication is the right call here. If a fourth site ever appears, extract it then.

### 4. `buildSnippetsBySkill` becomes module-private
The function has exactly one caller: `useDataControls.ts`. Making it module-private (unexported) is correct. The existing `src/lib/tests/indexes.test.ts` must be updated: since the function is no longer exported, the test either needs to be deleted (the function's behavior is implicitly covered by the `rebuildIndex` integration path) or the test is moved to `src/store/tests/useDataControls.test.ts` using the store action as the test entry point (preferred — follows native-mechanism-first rule from Constitution §VI).

### 5. `testUtils.ts` mock strategy
Currently mocks all selectors via a single namespace import (`import * as selectors`). After migration the mocks must reference each module separately:

```typescript
import * as agentSelectors from "@/store/useAgents";
import * as skillSelectors from "@/store/useSkills";
import * as snippetSelectors from "@/store/useSnippets";
import * as settingsSelectors from "@/store/useSettings";
```

Each `vi.spyOn` call is updated to target the correct module. Component test files (`OutputWindow.test.tsx`, `SnippetsPanel.test.tsx`, `SkillsList.test.tsx`) remain unchanged if `testUtils.mockStore()` centralises all mock setup.

### 6. `selectors.test.ts` renamed and split
The test file currently tests all selectors in one file. After migration the tests should follow the constitution's naming convention: `src/store/tests/selectors.test.ts` is deleted and its cases are distributed into `useAgents.test.ts`, `useSkills.test.ts`, `useSnippets.test.ts`, and `useSettings.test.ts`. If those files do not yet exist, they are created. If they do exist, new `describe` blocks are appended.

## Verification

1. `npm test` — full suite passes, zero import errors
2. `make lint` — ESLint + Prettier clean, no unused imports
3. `make build` — TypeScript type-check passes, production build succeeds
4. Manual: `grep -r "from.*selectors" src/` returns zero results
5. Manual: `grep -r "from.*lib/indexes" src/` returns zero results
6. Manual: `ls src/store/selectors.ts src/lib/indexes.ts` returns "No such file"
