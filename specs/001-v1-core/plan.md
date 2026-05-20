# Implementation Plan: Llamanomicon V1 Core

**Branch**: `001-v1-core` | **Date**: 2026-03-07 | **Spec**: (derived from CLAUDE.md + planning docs)
**Input**: Feature requirements from `CLAUDE.md` V1 Scope + `specs/001-v1-core/research.md`

## Summary

Build the V1 core of Llamanomicon — a local-first offline PWA for composing LLM prompts
from reusable, toggleable text snippets. The core loop: select a Flow → toggle Groups/Snippets
on → copy the compiled output. Implements CRUD for Flows/Groups/Snippets, per-flow activation
toggles, live output compilation, clipboard copy, full JSON import/export (replace-not-merge),
drag-and-drop snippet reordering, IndexedDB persistence via Dexie, and PWA offline capability.
No server, no auth, no cloud dependency.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode, `noUncheckedIndexedAccess: true`)
**Primary Dependencies**: React 19, Vite 7, Zustand 5, Dexie 4, shadcn/ui (Tailwind v4), @dnd-kit/react 0.3.2, vite-plugin-pwa 1.2.0
**Storage**: IndexedDB via Dexie.js — single-row JSON snapshot (`appState` table, id=1)
**Testing**: None — TypeScript strict mode + ESLint are the quality gate for V1
**Target Platform**: Modern browser (Chrome/Edge primary; Firefox supported with reduced File I/O UX); installable PWA
**Project Type**: Single-page web application (offline-capable PWA)
**Performance Goals**: 60 fps UI; < 1ms output compilation for 50 groups × 500 snippets
**Constraints**: Fully offline after first load; no server calls; no remote endpoints; single-user, local-only
**Scale/Scope**: Single user; ~50 groups; ~500 snippets per flow

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                                                | Status  | Notes                                                                                                |
| ------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------- |
| I. Code Quality (TS strict, ESLint, Prettier, no dead code)              | ✅ PASS | Strict mode on; ESLint type-checked rules configured; Prettier default config                        |
| II. UX Consistency (dark-first; v1 = clean dark, no GSAP/neoskeumorphic) | ✅ PASS | shadcn Zinc/dark preset; CSS transitions only; GSAP deferred to v2                                   |
| III. Performance First (offline PWA, 60fps, async IndexedDB)             | ✅ PASS | vite-plugin-pwa with Workbox; Dexie writes fire-and-forget; compilation is synchronous pure function |
| IV. Living Documentation (spec/plan updated with code)                   | ✅ PASS | This plan.md + research.md + data-model.md + contracts/ + quickstart.md all present                  |
| V. Simplicity & DRY (no speculative abstractions)                        | ✅ PASS | Flat component structure; no extra layers; single Zustand store; single Dexie table                  |

**No violations — Phase 0 gate PASSED.**

_Post-design re-check_: All constitution principles maintained through Phase 1 design. No new
violations introduced. GSAP and neoskeumorphic design correctly deferred to v2.

## Project Structure

### Documentation (this feature)

```text
specs/001-v1-core/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — dependency decisions, patterns, resolved questions
├── data-model.md        # Phase 1 output — TypeScript interfaces, Zustand store shape, Dexie schema
├── quickstart.md        # Phase 1 output — setup guide, usage loop, project structure reference
├── contracts/
│   ├── compilation.md   # Pure function contract: compileOutput() algorithm and behavior
│   └── state-schema.md  # JSON schema for AppState: import/export format and validation rules
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── types/index.ts           # All TypeScript interfaces (Snippet, Group, Library, Flow, AppState, StoreState)
├── store/useAppStore.ts     # Zustand store — all runtime state + 25 actions
├── db/database.ts           # Dexie IndexedDB integration (LlamanomiconDB, loadState, saveState)
├── lib/compiler.ts          # Pure output compilation (compileOutput)
├── lib/importExport.ts      # JSON import/export with File System Access API + Firefox fallback
├── lib/utils.ts             # Shared utilities (cn)
├── hooks/useClipboard.ts    # Clipboard with 2s copied-state feedback
├── components/
│   ├── ui/                  # shadcn/ui vendor components — DO NOT EDIT
│   ├── AppLayout.tsx        # CSS Grid shell (3-column, 2-row, 100dvh)
│   ├── PanelCard.tsx        # Reusable dark panel wrapper
│   ├── FlowList.tsx         # Flows panel root
│   ├── FlowListItem.tsx     # Single flow row with context menu
│   ├── FlowListToolbar.tsx  # Flows panel header + New Flow dialog
│   ├── GroupsList.tsx       # Groups panel root
│   ├── GroupsListItem.tsx   # Single group row with toggle + context menu
│   ├── GroupsListToolbar.tsx# Groups panel header + New Group dialog
│   ├── SnippetsPanel.tsx    # Snippets panel root + DragDropProvider
│   ├── SnippetsPanelItem.tsx# Single snippet row with toggle + drag handle + context menu
│   ├── SnippetsPanelToolbar.tsx # Snippets panel header + New Snippet dialog
│   └── OutputWindow.tsx     # Compiled output display + Copy + Import/Export buttons
├── App.tsx                  # Root component — boot hydration from Dexie; first-run seed
└── main.tsx                 # Entry point
```

**Structure Decision**: Single-project Vite SPA. Flat `src/components/` directory with nested
naming prefix (e.g., `FlowList.tsx`, `FlowListItem.tsx`). No feature subdirectories — scope
is small enough that flat is more navigable.

## Phase 0: Research Summary

Full research captured in `specs/001-v1-core/research.md`. Key decisions:

| Topic                    | Decision                                                                                | Reference |
| ------------------------ | --------------------------------------------------------------------------------------- | --------- |
| shadcn/ui + Tailwind v4  | CSS-variable approach; `npx shadcn@latest init`; `@/` alias to `src/`                   | §1        |
| State + persistence sync | Zustand = runtime source of truth; Dexie = async durable backup; fire-and-forget writes | §2        |
| dnd-kit                  | `@dnd-kit/react` v0.3.2 (new unified API) — NOT legacy `@dnd-kit/core`/`sortable`       | §3        |
| PWA                      | `vite-plugin-pwa` with Workbox `generateSW`; `registerType: 'autoUpdate'`               | §4        |
| Import/Export            | File System Access API primary (Chrome/Edge); download/upload fallback (Firefox)        | §5        |
| GSAP                     | Deferred to v2 — `gsap` package installed but unused in v1                              | §6        |
| Open questions           | Output settings: global; Flow icons: emoji only; Edit history: v2; Node graph: v2       | §7        |

## Phase 1: Design Artifacts

### Data Model

Full model in `specs/001-v1-core/data-model.md`. Entity hierarchy:

```
AppState (persisted to IndexedDB + exported as JSON)
├── library.groups: Group[]          — ordered; order = output order
│     └── snippets: Snippet[]        — sorted by Snippet.order (0-based, contiguous)
├── flows: Flow[]
│     └── activation: FlowActivation — Record<id, bool> for groups and snippets
└── outputSettings: OutputSettings   — showGroupHeaders, snippetSeparator

UI State (Zustand only — not persisted)
├── activeFlowId: string | null
└── selectedGroupId: string | null
```

Key rules: IDs are UUIDv4 via `crypto.randomUUID()`; IDs are immutable; absence = false
in activation maps; group toggle is outer gate for output compilation.

### Contracts

- `specs/001-v1-core/contracts/compilation.md` — `compileOutput()` algorithm contract
- `specs/001-v1-core/contracts/state-schema.md` — AppState JSON schema + import validation rules

### Architecture Decisions

**Zustand → Dexie sync**: Every state mutation calls `saveState()` as fire-and-forget async.
Zustand is authoritative at runtime. Dexie only read on cold start. `importState()` called at
boot skips the re-save to prevent a redundant write.

**Single Dexie table**: Full AppState as one row (id=1). Avoids relational complexity; matches
replace-not-merge import semantics exactly.

**Flat component structure**: No nested directories. Sub-components named with parent prefix
(e.g., `FlowListItem`). shadcn/ui files in `src/components/ui/` are vendor — never edit.

**dnd-kit API**: `DragDropProvider` (wraps `SnippetsPanel`), `useSortable({ id, index })`
(in `SnippetsPanelItem`). No `SortableContext` needed. `arrayMove` inlined in store.

## Implementation Status

| Phase                                | Tasks     | Status                                 |
| ------------------------------------ | --------- | -------------------------------------- |
| 1: Setup                             | T001–T007 | ✅ All complete                        |
| 2: Foundational                      | T008–T016 | ✅ All complete                        |
| 3: US1 (Core CRUD + Toggle + Output) | T017–T026 | ✅ Complete; T027 pending verification |
| 4: US2 (Import/Export)               | T028–T029 | ✅ Complete; T030 pending verification |
| 5: US3 (Drag-and-Drop)               | T031–T033 | ✅ All complete                        |
| 6: Polish                            | T034–T038 | ⏳ Pending (T034 may already be done)  |

See `specs/001-v1-core/tasks.md` for full task list with descriptions and execution order.

## Verification

### End-to-End Test (US1)

```
make dev
→ Create a Flow ("Senior Dev Review", 💻)
→ Create a Group ("Coding Best Practices")
→ Add two snippets with text
→ Toggle one snippet on
→ Output Window shows compiled text with group header
→ Click Copy → paste into text editor → content matches
```

### End-to-End Test (US2)

```
make dev
→ With data in app, click Export → verify .json saved matching state-schema.md
→ Clear all data
→ Click Import → select the file
→ Verify full state restored; activeFlowId and selectedGroupId reset to null
```

### End-to-End Test (US3)

```
make dev
→ Select group with 3+ snippets
→ Drag snippet from position 1 to position 3
→ Verify visual reorder
→ Toggle all snippets on → verify output order matches new order
```

### Quality Gates

```bash
make build    # TypeScript strict-mode must pass with zero errors
make lint     # ESLint + Prettier must pass with zero violations
make preview  # PWA install prompt must appear in Chrome/Edge incognito; offline must work
```
