# Implementation Plan: Output Skill Accordions

**Branch**: `010-output-skill-accordions` | **Date**: 2026-04-24 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/010-output-skill-accordions/spec.md`

## Summary

Replace the Output Window's flat compiled-text block with a skill-grouped HeroUI Accordion layout. Each skill with active snippets gets a collapsible section; sections are drag-and-droppable (dnd-kit, same pattern as SnippetsPanel) to control compilation order. A new `skillGroupOrder: string[]` field on `Agent` persists group arrangement in the existing draft/baseline model. Within each section, snippets appear alphabetically — the same order as the SnippetsPanel when that skill is selected. `activeOrder` is no longer consulted for output compilation; a new `compileOutputBySkillGroup` function drives the output path.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict, `noUncheckedIndexedAccess`), React 19  
**Primary Dependencies**: HeroUI v3 (Accordion — already bundled), @dnd-kit/react 0.3.2 (already installed), Zustand 5  
**Storage**: localStorage via Zustand `persist` — `skillGroupOrder` is a plain array, no custom serialization needed  
**Testing**: Vitest 4 + React Testing Library  
**Target Platform**: Browser PWA (offline-capable)  
**Project Type**: Single-page web application  
**Performance Goals**: 60 fps — all derivation is synchronous selector logic; no new async work  
**Constraints**: No new npm dependencies; offline-capable; `structuredClone` compatible (plain array only)  
**Scale/Scope**: OutputWindow refactor + 1 new child component + 3 store changes + 1 new compiler function

## Constitution Check

| Principle                | Check                                                                                                    | Status |
| ------------------------ | -------------------------------------------------------------------------------------------------------- | ------ |
| I. Code Quality          | TypeScript strict, no `any`; `<pre>` block removed; new code has single clear responsibility             | [x]    |
| II. UX Consistency       | Dark-first; dnd-kit pattern mirrors SnippetsPanel; CSS transitions only (no GSAP)                       | [x]    |
| III. Performance         | No new deps; HeroUI Accordion already bundled; synchronous selectors only; offline-capable               | [x]    |
| IV. Living Documentation | CLAUDE.md, docs/models.md, docs/state-and-data-flow.md updated in same PR                               | [x]    |
| V. Simplicity & DRY      | `SkillGroupAccordion` mirrors `SnippetItem` pattern; alphabetical order reuses `sortByName` already in use | [x]    |
| VI. Testing Discipline   | Tests in `src/store/tests/`, `src/lib/tests/`, `src/components/tests/`; AAA; native store actions       | [x]    |
| Tech Standards           | HeroUI Accordion ✓, dnd-kit ✓, Zustand slices ✓, Vitest + RTL ✓                                        | [x]    |
| V1 Scope Gate            | No node graph, no GSAP, no neoskeumorphic design                                                         | [x]    |

## Project Structure

### Documentation (this feature)

```text
specs/010-output-skill-accordions/
├── plan.md              # This file
├── research.md          # Phase 0 — Accordion API, dnd-kit pattern, data model, compiler strategy
├── data-model.md        # Phase 1 — Agent changes, SkillGroup type, compilation contract
├── quickstart.md        # Phase 1 — implementation order, invariants, dev verification
├── contracts/
│   └── store-interface.md   # Phase 1 — new action, selectors, compiler signatures
└── tasks.md             # Phase 2 output (created by /speckit.tasks — NOT by /speckit.plan)
```

### Source Code (affected files)

```text
src/
├── types/
│   ├── Agent.ts                         # add skillGroupOrder: string[]
│   └── index.ts                         # add skillGroupOrder to SerializedAgent
├── store/
│   ├── useAgents.ts                     # reorderSkillGroups action + selectSkillGroupsForOutput selector
│   ├── useSkills.ts                     # deleteSkill cascade: remove skillId from skillGroupOrder on all agents
│   ├── useSettings.ts                   # selectCompiledOutput → compileOutputBySkillGroup
│   ├── useDataControls.ts               # importState: default skillGroupOrder to [] for old data
│   └── tests/
│       └── useAgents.test.ts            # reorderSkillGroups + deleteSkill cascade tests
├── lib/
│   ├── compiler.ts                      # add compileOutputBySkillGroup; keep compileOutput intact
│   └── tests/
│       └── compiler.test.ts             # new file: compileOutputBySkillGroup unit tests
└── components/
    ├── OutputWindow.tsx                 # replace <pre> with DragDropProvider + Accordion
    ├── SkillGroupAccordion.tsx          # new: draggable Accordion.Item per skill group
    └── tests/
        └── OutputWindow.test.tsx        # new: accordion render + empty state tests
```

**Structure Decision**: Single-project layout. All new files follow the existing `tests/` subdirectory convention. No new top-level directories.

## Implementation Sequence

### Step 1 — Types
- `src/types/Agent.ts`: add `skillGroupOrder: string[]`
- `src/types/index.ts`: add `skillGroupOrder: string[]` to `SerializedAgent`

### Step 2 — Store
- `src/store/useDataControls.ts`: default `skillGroupOrder` to `[]` in `importState`
- `src/store/useAgents.ts`: initialize `skillGroupOrder: []` in `addAgent`; add `reorderSkillGroups` action; add `selectSkillGroupsForOutput` selector
- `src/store/useSkills.ts`: cascade `deleteSkill` to remove deleted skill ID from `skillGroupOrder` on every agent

### Step 3 — Compiler
- `src/lib/compiler.ts`: add `compileOutputBySkillGroup` (alphabetical within groups, first-group dedup for multi-skill)
- `src/store/useSettings.ts`: update `selectCompiledOutput` to call `compileOutputBySkillGroup`

### Step 4 — UI
- `src/components/SkillGroupAccordion.tsx` (new): `useSortable` wrapping `Accordion.Item`; snippets listed alphabetically in body
- `src/components/OutputWindow.tsx`: remove `<pre>` block; add `DragDropProvider` + `Accordion.Root` driven by `selectSkillGroupsForOutput`

### Step 5 — Tests
- `src/store/tests/useAgents.test.ts`: `reorderSkillGroups` + `deleteSkill` cascade
- `src/lib/tests/compiler.test.ts` (new): `compileOutputBySkillGroup` — multi-group order, dedup, alphabetical, empty
- `src/components/tests/OutputWindow.test.tsx` (new): section count, empty states, copy button disabled state

### Step 6 — Docs
- `CLAUDE.md`: `skillGroupOrder` on Agent; new action/selector; OutputWindow update
- `docs/models.md`: `skillGroupOrder` in Agent type table
- `docs/state-and-data-flow.md`: compiler section updated

## Key Design Decisions

| Decision | Choice | Rationale |
| -------- | ------ | --------- |
| Accordion component | HeroUI `Accordion` with `allowsMultipleExpanded` + `defaultExpandedKeys` | Already bundled; no new dependency |
| DnD pattern | `useSortable` wrapping `<div>` around each `Accordion.Item` | Mirrors SnippetItem pattern exactly |
| Group ordering | `skillGroupOrder: string[]` on Agent in session | One field; participates in save/discard automatically |
| Within-group snippet order | Alphabetical by name (`sortByName`) | Matches SnippetsPanel exactly; `activeOrder` not consulted |
| Multi-skill dedup | Visual: all groups; Compiled: first-group-alphabetical wins | User confirmed; `seen` Set in compiler |
| Compiler strategy | New `compileOutputBySkillGroup`; keep `compileOutput` | Preserves existing tests |
| No new deps | HeroUI + dnd-kit already installed | Zero bundle impact |

## Complexity Tracking

_No constitution violations._
