# Implementation Plan: Entity Restructure

**Branch**: `004-entity-restructure` | **Date**: 2026-04-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-entity-restructure/spec.md`

## Summary

Rename Flows to Agents and Groups to Skills. Flatten the Library/Group/Snippet hierarchy into three independent entity Maps (`snippets`, `skills`, `agents`). Introduce a session draft/baseline model with commit/discard. Replace Dexie/IndexedDB with Zustand persist + localStorage. Add comprehensive Vitest unit tests. UI component updates are deferred.

## Technical Context

**Language/Version**: TypeScript 6.0.3 (strict mode, `noUncheckedIndexedAccess: true`)
**Primary Dependencies**: React 19, Zustand 5, Vite 7, Tailwind CSS 4, HeroUI, dnd-kit 0.3.2
**Storage**: localStorage via Zustand `persist` middleware (replacing Dexie/IndexedDB)
**Testing**: Vitest 4.1.4 + React Testing Library 16.3.2 (co-located `*.test.ts`)
**Target Platform**: Browser PWA (offline-first)
**Project Type**: Web application (local-first PWA)
**Performance Goals**: 60 fps, sub-100ms for operations on up to 2,000 snippets
**Constraints**: Offline-capable, no server calls, Map/Set serialization at persist boundary
**Scale/Scope**: Single-user local app, ~3 entity types, ~5 store slices

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Check | Status |
| --------- | ----- | ------ |
| I. Code Quality | TypeScript strict, no `any`, active dead-code removal (old Group/Flow/Library types and Dexie code removed) | [x] |
| II. UX Consistency | UI deferred; no new visual patterns introduced | [x] |
| III. Performance | Offline PWA preserved, localStorage is sync but persist is async via middleware, Map/Set for O(1) lookups | [x] |
| IV. Living Documentation | CLAUDE.md, docs/models.md, docs/architecture.md, docs/state-and-data-flow.md all updated in Phase 1 | [x] |
| V. Simplicity & DRY | Repository<T> base class has 3 consumers (meets rule of three). No speculative abstractions. | [x] |
| VI. Testing Discipline | Co-located *.test.ts, AAA pattern, native-mechanism setup (call real store actions), isolated tests | [x] |
| Tech Standards | Zustand slices, Vitest + RTL, dnd-kit preserved. Dexie replaced per FR-021. HeroUI unchanged. | [x] |
| V1 Scope Gate | No node graph, no GSAP, no neoskeumorphic design | [x] |

## Project Structure

### Source Code (repository root)

```text
src/
├── types/
│   ├── Entity.ts         # NEW: base interface (id, name)
│   ├── Snippet.ts        # NEW: replaces Group.ts
│   ├── Skill.ts          # NEW: pure tag
│   ├── Agent.ts          # NEW: replaces Flow.ts
│   └── index.ts          # REWRITE: re-exports + DataState, SessionState, OutputSettings, AppState
├── store/
│   ├── useAppStore.ts    # REWRITE: new slices, localStorage persist, Map/Set serialization
│   ├── useAgents.ts      # NEW: replaces useFlows.ts
│   ├── useAgents.test.ts # NEW
│   ├── useSkills.ts      # NEW: replaces useGroups.ts
│   ├── useSkills.test.ts # NEW
│   ├── useSnippets.ts    # REWRITE: independent entity with skill tags
│   ├── useSnippets.test.ts # NEW
│   ├── useSettings.ts    # MODIFY: remove showGroupHeaders
│   ├── useSettings.test.ts # NEW
│   ├── useSession.ts     # NEW: draft/baseline, commit/discard
│   ├── useSession.test.ts # NEW
│   ├── storeTypes.ts     # REWRITE: new StoreState interface
│   └── selectors.ts      # REWRITE: new selectors for agents/skills/snippets
├── lib/
│   ├── serialization.ts      # NEW: Map/Set tagged JSON serialization
│   ├── serialization.test.ts # NEW
│   ├── indexes.ts            # NEW: buildSnippetsBySkill pure function
│   ├── indexes.test.ts       # NEW
│   ├── Repository.ts         # NEW: generic CRUD for Map<string, T extends Entity>
│   ├── Repository.test.ts    # NEW
│   ├── compiler.ts           # REWRITE: activeOrder -> snippet texts -> join
│   ├── compiler.test.ts      # NEW
│   ├── importExport.ts       # REWRITE: new AppState shape validation + Map/Set conversion
│   └── importExport.test.ts  # NEW
├── data/
│   └── seeds.ts              # NEW: replaces groups.ts + flows.ts
└── db/
    └── database.ts           # DELETE
```

### Files to Delete

- `src/types/Group.ts` — replaced by Snippet.ts
- `src/types/Flow.ts` — replaced by Agent.ts
- `src/store/useGroups.ts` — replaced by useSkills.ts
- `src/store/useFlows.ts` — replaced by useAgents.ts
- `src/store/utils/storeUtils.ts` — cascade logic moves into slice actions
- `src/store/utils.ts` — createSelectors helper (evaluate if still needed)
- `src/db/database.ts` — Dexie removed
- `src/data/groups.ts` — replaced by seeds.ts
- `src/data/flows.ts` — replaced by seeds.ts
- `src/store/useAppStore.test.ts` — placeholder, replaced by real tests

### Dependencies to Remove

- `dexie` (4.4.2) — from package.json dependencies
- `dexie-react-hooks` (4.2.0) — from package.json dependencies

---

## Implementation Phases

### Phase 1: Documentation

**Dependencies**: None

Update all docs to reflect the new entity names and data model before code changes (Constitution IV).

| File | Changes |
| ---- | ------- |
| `CLAUDE.md` | Replace Flow→Agent, Group→Skill, Library→3 Maps. Update data model, store file map, output algorithm, persistence (localStorage not Dexie), Active Technologies, Recent Changes |
| `docs/models.md` | Complete rewrite: Entity/Snippet/Skill/Agent interfaces, DataState, SessionState, OutputSettings (no showGroupHeaders), snippetsBySkill index, cascade rules, session semantics |
| `docs/architecture.md` | Update persistence layer (Dexie→localStorage), folder structure (remove db/, add serialization.ts/indexes.ts/Repository.ts) |
| `docs/state-and-data-flow.md` | Rewrite: new slice names (useAgents/useSkills/useSnippets/useSession), session model, new compiler algorithm, localStorage persistence, hydration flow |

### Phase 2: Types

**Dependencies**: Phase 1

Create new type files, rewrite index.ts, delete old type files. Order: Entity base → Agent → Skill → Snippet → composites.

**New files**:
- `src/types/Entity.ts` — `interface Entity { id: string; name: string; }`
- `src/types/Agent.ts` — `interface Agent extends Entity { activeSet: Set<string>; activeOrder: string[]; }`
- `src/types/Skill.ts` — `interface Skill extends Entity {}`
- `src/types/Snippet.ts` — `interface Snippet extends Entity { text: string; skills: Set<string>; }`

**Rewrite** `src/types/index.ts`:
- Re-export Entity, Agent, Skill, Snippet
- Define: `DataState` (3 Maps), `SessionState` (baseline + draft), `OutputSettings` (snippetSeparator only), `AppState` (serialized form with Record/Array)
- Define serialized variants: `SerializedSnippet`, `SerializedAgent` (Set→string[], Map→Record)

**Delete**: `src/types/Group.ts`, `src/types/Flow.ts`

### Phase 3: Infrastructure Libraries

**Dependencies**: Phase 2

Create shared modules that store slices depend on.

1. **`src/lib/serialization.ts`** — `replacer`/`reviver` functions for JSON.stringify/parse that handle Map (`{ __type: "Map", entries: [...] }`) and Set (`{ __type: "Set", values: [...] }`). Used at Zustand persist boundary.

2. **`src/lib/indexes.ts`** — `buildSnippetsBySkill(snippets: Map<string, Snippet>): Map<string, Set<string>>`. Pure function, iterates snippets, builds inverse index.

3. **`src/lib/Repository.ts`** — Generic `Repository<T extends Entity>` class (~25 lines):
   - `get(map, id)`, `has(map, id)`, `add(map, entity)`, `update(map, id, patch)`, `delete(map, id)`, `rename(map, id, name)`, `create(name, defaults?)`
   - All methods return new Map instances (Zustand immutability)
   - 3 consumers: agents, skills, snippets slices

4. **Co-located tests** for each: `serialization.test.ts`, `indexes.test.ts`, `Repository.test.ts`

### Phase 4: Store Slices

**Dependencies**: Phase 2 + Phase 3
**Order**: Agent → Skill → Snippet → Settings → Session → StoreTypes → Selectors

#### `src/store/useAgents.ts` (replaces useFlows.ts)
- State: reads from `draft.agents`, `activeAgentId`
- Actions: `addAgent`, `updateAgent`, `deleteAgent` (no cascade), `setActiveAgentId`, `activateSnippet`, `deactivateSnippet`, `reorderSnippets`, `toggleSkillForAgent`
- `activateSnippet`: add to both activeSet and activeOrder (append)
- `deactivateSnippet`: remove from both activeSet and activeOrder
- `toggleSkillForAgent`: uses `snippetsBySkill` index for bulk toggle

#### `src/store/useSkills.ts` (replaces useGroups.ts)
- State: reads from `draft.skills`, `selectedSkillId`
- Actions: `addSkill`, `updateSkill`, `deleteSkill` (cascade: remove from all snippets' skills sets + snippetsBySkill), `setSelectedSkillId`

#### `src/store/useSnippets.ts` (rewrite)
- State: reads from `draft.snippets`
- Actions: `addSnippet(name, text)`, `updateSnippet(id, patch)`, `deleteSnippet(id)` (cascade: remove from snippetsBySkill + all agents' activeSet/activeOrder), `addTag(snippetId, skillId)`, `removeTag(snippetId, skillId)`

#### `src/store/useSettings.ts` (modify)
- Remove `showGroupHeaders` from defaults. OutputSettings = `{ snippetSeparator: string }`

#### `src/store/useSession.ts` (new)
- `commit()`: `baseline = structuredClone(draft)` → trigger persist
- `discard()`: `draft = structuredClone(baseline)` → rebuild snippetsBySkill

#### `src/store/storeTypes.ts` (rewrite)
- New `StoreState` interface with: `baseline`, `draft`, `snippetsBySkill`, `activeAgentId`, `selectedSkillId`, `outputSettings`, all actions, `commit`, `discard`, `importState`, `rebuildIndex`

#### `src/store/selectors.ts` (rewrite)
- `selectActiveAgent`, `selectSelectedSkill`, `selectSnippetsForSkill`, `selectUntaggedSnippets`, `selectCompiledOutput`, `selectSortedSkills`, `selectSortedAgents`

#### Tests (co-located)
- `useAgents.test.ts` — CRUD, activate/deactivate (FR-009 sync), reorder, toggleSkillForAgent, delete (no cascade)
- `useSkills.test.ts` — CRUD, delete cascade (remove from snippets' skills + snippetsBySkill)
- `useSnippets.test.ts` — CRUD, addTag/removeTag, delete cascade (remove from agents + snippetsBySkill)
- `useSettings.test.ts` — updateOutputSettings
- `useSession.test.ts` — commit persists, discard reverts, structuredClone independence

### Phase 5: Store Root + Compiler + Import/Export

**Dependencies**: Phase 4

#### `src/store/useAppStore.ts` (rewrite)
- Combine slices: createAgentsSlice, createSkillsSlice, createSnippetsSlice, createSettingsSlice, createSessionSlice
- Persist config: `storage: createJSONStorage(() => localStorage)` with custom serialization (replacer/reviver from serialization.ts)
- `partialize`: persist only `baseline` and `outputSettings`
- `onRehydrateStorage`: set `draft = structuredClone(baseline)`, call `rebuildIndex()`
- `importState(appState)`: deserialize Records/Arrays → Maps/Sets, set baseline+draft, rebuild index
- `rebuildIndex()`: `snippetsBySkill = buildSnippetsBySkill(draft.snippets)`

#### `src/lib/compiler.ts` (rewrite)
- New: `compileOutput(agent: Agent | null, snippets: Map<string, Snippet>, settings: OutputSettings): string`
- Algorithm: if no agent, return "". Map `agent.activeOrder` → snippet texts (skip missing). Join with separator. Trim.

#### `src/lib/importExport.ts` (rewrite)
- `validateAppState`: validate new shape (snippets/skills/agents as Records, outputSettings without showGroupHeaders)
- `exportState`: convert Maps/Sets → Records/Arrays for JSON
- `importStateFromFile`: parse JSON → validate → return AppState (serialized form)

#### `src/data/seeds.ts` (new, replaces groups.ts + flows.ts)
- Default seed data as Maps: a few example snippets, skills, and an agent

#### Tests: `compiler.test.ts`, `importExport.test.ts`

### Phase 6: Cleanup

**Dependencies**: Phase 5 + all tests passing (`npm test`)

1. Delete old files: `src/types/Group.ts`, `src/types/Flow.ts`, `src/store/useGroups.ts`, `src/store/useFlows.ts`, `src/store/utils/storeUtils.ts`, `src/store/utils.ts` (if unused), `src/db/database.ts`, `src/data/groups.ts`, `src/data/flows.ts`, `src/store/useAppStore.test.ts`
2. Remove `dexie` and `dexie-react-hooks` from `package.json`
3. Run `npm install` to update lockfile
4. Verify `npm test` passes
5. Verify `make lint` passes (catch unused imports in deleted files)

---

## UI Breakage (Expected and Accepted)

UI components will fail TypeScript compilation after this restructure. This is accepted per FR-017 (UI deferred). Components affected: `FlowList`, `FlowListItem`, `GroupsList`, `GroupsListItem`, `SnippetsPanel`, `SnippetsPanelItem`, `OutputWindow`, `AppLayout`.

**Mitigation**: Add `// @ts-nocheck` with a TODO comment to each affected component file so `make build` doesn't block store development. These will be fixed in the follow-up UI feature.

---

## Verification

1. `npm test` — all Vitest unit tests pass (store slices, serialization, indexes, Repository, compiler, import/export, session)
2. `make lint` — ESLint + Prettier clean
3. `make build` — TypeScript compiles (with `// @ts-nocheck` on deferred UI components)
4. Manual: open dev server, verify localStorage persistence works (create data, reload, data persists)
5. Manual: verify commit/discard (make edits, discard → reverts; make edits, commit → persists across reload)

## Complexity Tracking

No Constitution violations. All design decisions stay within established principles.
