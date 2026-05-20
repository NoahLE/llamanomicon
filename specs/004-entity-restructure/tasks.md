# Tasks: Entity Restructure

**Input**: Design documents from `/specs/004-entity-restructure/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Yes — FR-019 requires Vitest unit tests for all store slices and mutations.

**Organization**: Tasks are grouped by implementation phase, with user story labels mapping to spec.md stories. The architectural layering (docs → types → infrastructure → store → integration) is the primary axis; entity order within each layer is snippets → skills → agents.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Documentation

**Purpose**: Update all documentation to reflect new entity names and data model (Constitution IV: docs before code)

- [x] T001 Update CLAUDE.md with new entity names (Flow→Agent, Group→Skill, Library→3 Maps), data model, store file map, output algorithm, persistence (localStorage), Active Technologies, Recent Changes
- [x] T002 [P] Rewrite docs/models.md with Entity/Snippet/Skill/Agent interfaces, DataState, SessionState, OutputSettings, snippetsBySkill index, cascade rules, session semantics
- [x] T003 [P] Update docs/architecture.md: persistence layer (Dexie→localStorage), folder structure (remove db/, add serialization.ts/indexes.ts/Repository.ts to lib/)
- [x] T004 [P] Rewrite docs/state-and-data-flow.md: new slice names (useAgents/useSkills/useSnippets/useSession), session model, new compiler algorithm, localStorage persistence, hydration flow

**Checkpoint**: All documentation reflects the new entity structure. No code changes yet.

---

## Phase 2: Foundational — Types + Infrastructure Libraries

**Purpose**: Create the type system and shared libraries that ALL store slices depend on

**CRITICAL**: No store slice work can begin until this phase is complete

### Types

- [x] T005 Create src/types/Entity.ts with base Entity interface (id: string, name: string)
- [x] T006 [P] Create src/types/Snippet.ts with Snippet interface extending Entity (text: string, skills: Set\<string\>)
- [x] T007 [P] Create src/types/Skill.ts with Skill interface extending Entity (pure tag, no extra fields)
- [x] T008 [P] Create src/types/Agent.ts with Agent interface extending Entity (activeSet: Set\<string\>, activeOrder: string[])
- [x] T009 Rewrite src/types/index.ts: re-export Entity/Snippet/Skill/Agent, define DataState (3 Maps), SessionState (baseline+draft), OutputSettings (snippetSeparator only), AppState (serialized form with Record/Array), SerializedSnippet, SerializedAgent
- [x] T010 Delete src/types/Group.ts and src/types/Flow.ts

### Infrastructure Libraries

- [x] T011 [P] Create src/lib/serialization.ts with replacer/reviver functions for Map/Set tagged JSON serialization ({ __type: "Map", entries: [...] } / { __type: "Set", values: [...] })
- [x] T012 [P] Create src/lib/indexes.ts with buildSnippetsBySkill(snippets: Map\<string, Snippet\>): Map\<string, Set\<string\>\> pure function
- [x] T013 [P] Create src/lib/Repository.ts with generic Repository\<T extends Entity\> class (~25 lines): get, has, add, update, delete, rename, create methods returning new Map instances

### Infrastructure Tests

- [x] T014 [P] Create src/lib/serialization.test.ts: round-trip tests for Map, Set, nested structures, empty collections
- [x] T015 [P] Create src/lib/indexes.test.ts: tests for buildSnippetsBySkill with various snippet/skill combinations, empty inputs, multiple skills per snippet
- [x] T016 [P] Create src/lib/Repository.test.ts: CRUD tests for all 7 Repository methods with Entity subtypes

**Checkpoint**: Type system and infrastructure libraries complete with passing tests. Store slices can now be built.

---

## Phase 3: User Story 1 — Snippet Management with Skill Tags (Priority: P1)

**Goal**: Users can create, edit, rename, delete snippets. Snippets can be tagged with skills. Delete cascades to agents and snippetsBySkill index.

**Independent Test**: Create a snippet, tag it with a skill, verify index updated. Delete snippet, verify cascade to agents and index.

### Implementation

- [x] T017 [US1] Rewrite src/store/useSnippets.ts as createSnippetsSlice: addSnippet(name, text), updateSnippet(id, patch), deleteSnippet(id) with cascade (remove from snippetsBySkill + all agents' activeSet/activeOrder), addTag(snippetId, skillId), removeTag(snippetId, skillId)

### Tests

- [x] T018 [US1] Create src/store/useSnippets.test.ts: CRUD tests (add, update/rename, delete), addTag/removeTag tests with snippetsBySkill index verification, delete cascade tests (remove from agents' activeSet/activeOrder + snippetsBySkill), no dangling IDs after delete

**Checkpoint**: Snippet CRUD and tagging works. Cascade deletes clean up agents and index.

---

## Phase 4: User Story 2 — Skill Management as Tags (Priority: P1)

**Goal**: Users can create, rename, delete skills. Delete cascades to all tagged snippets' skills sets and snippetsBySkill index.

**Independent Test**: Create a skill, tag snippets with it, delete skill, verify removed from all snippets.

### Implementation

- [x] T019 [US2] Create src/store/useSkills.ts as createSkillsSlice: addSkill(name), updateSkill(id, patch), deleteSkill(id) with cascade (remove from all snippets' skills sets + snippetsBySkill), setSelectedSkillId(id | null)

### Tests

- [x] T020 [US2] Create src/store/useSkills.test.ts: CRUD tests, delete cascade (skill removed from all tagged snippets' skills sets + snippetsBySkill entry removed), rename propagation, setSelectedSkillId

**Checkpoint**: Skill CRUD works. Delete cascade cleans tagged snippets.

---

## Phase 5: User Story 3 — Agent Management with Ordered Active Snippets (Priority: P1)

**Goal**: Users can create, rename, delete agents. Activate/deactivate snippets within an agent. Reorder active snippets. Compiled output follows activeOrder.

**Independent Test**: Create agent, activate snippets, reorder, verify output order matches activeOrder.

### Implementation

- [x] T021 [US3] Create src/store/useAgents.ts as createAgentsSlice: addAgent(name), updateAgent(id, patch), deleteAgent(id) (no cascade), setActiveAgentId(id | null), activateSnippet(agentId, snippetId), deactivateSnippet(agentId, snippetId), reorderSnippets(agentId, orderedIds)
- [x] T022 [US3] Rewrite src/lib/compiler.ts: compileOutput(agent: Agent | null, snippets: Map\<string, Snippet\>, settings: OutputSettings) — map activeOrder to snippet texts, join with separator, trim

### Tests

- [x] T023 [US3] Create src/store/useAgents.test.ts: CRUD tests, activate/deactivate (verify activeSet/activeOrder sync per FR-009), reorder tests, delete (verify no cascade), idempotent activation
- [x] T024 [US3] Create src/lib/compiler.test.ts: test with ordered snippets, null agent, missing snippet IDs, custom separator

**Checkpoint**: Agent CRUD, snippet activation/deactivation, reordering, and output compilation all work.

---

## Phase 6: User Story 4 — Bulk Toggle via Skill (Priority: P2)

**Goal**: Toggle all snippets tagged with a skill on/off within an agent in one operation.

**Independent Test**: Tag snippets with a skill, toggle skill on for agent, verify all added to activeSet/activeOrder. Toggle off, verify removed.

### Implementation

- [x] T025 [US4] Add toggleSkillForAgent(agentId, skillId) to src/store/useAgents.ts: use snippetsBySkill index for bulk activate/deactivate, maintain activeSet/activeOrder sync

### Tests

- [x] T026 [US4] Add toggleSkillForAgent tests to src/store/useAgents.test.ts: toggle on (all skill snippets added), toggle off (all removed), mixed state handling, activeSet/activeOrder sync

**Checkpoint**: Bulk skill toggle works without breaking activeSet/activeOrder sync.

---

## Phase 7: User Story 5 — Session Commit/Discard (Priority: P2)

**Goal**: All edits apply to live session state. Commit persists session as baseline. Discard reverts session to baseline.

**Independent Test**: Make edits, discard → state reverts. Make edits, commit → persists through reload.

### Implementation

- [x] T027 [US5] Create src/store/useSession.ts as createSessionSlice: commit() (baseline = structuredClone(session), trigger persist), discard() (session = structuredClone(baseline), rebuild snippetsBySkill)
- [x] T028 [US5] Modify src/store/useSettings.ts: remove showGroupHeaders from defaults, OutputSettings = { snippetSeparator: string }

### Tests

- [x] T029 [US5] Create src/store/useSession.test.ts: commit (baseline matches session), discard (session reverts to baseline), structuredClone independence (mutating session does not affect baseline after clone)
- [x] T030 [US5] Create src/store/useSettings.test.ts: updateOutputSettings test, verify showGroupHeaders removed

**Checkpoint**: Session model works. Settings simplified.

---

## Phase 8: Integration — Store Root + Import/Export + Seeds

**Purpose**: Wire everything together into the unified store with persistence

- [x] T031 Rewrite src/store/storeTypes.ts: new StoreState interface with baseline, draft, snippetsBySkill, activeAgentId, selectedSkillId, outputSettings, all actions (agents/skills/snippets/session/settings), importState, rebuildIndex
- [x] T032 Rewrite src/store/selectors.ts: selectActiveAgent, selectSelectedSkill, selectSnippetsForSkill, selectUntaggedSnippets, selectCompiledOutput, selectSortedSkills, selectSortedAgents
- [x] T033 Rewrite src/store/useAppStore.ts: combine all slices, configure persist with localStorage + custom serialization (replacer/reviver), partialize (baseline + outputSettings only), onRehydrateStorage (draft = structuredClone(baseline), rebuildIndex), importState, rebuildIndex
- [x] T034 [P] Create src/data/seeds.ts: default seed data with example snippets, skills, and agent as Maps/Sets
- [x] T035 Rewrite src/lib/importExport.ts: validateAppState for new shape (Records for snippets/skills/agents, no showGroupHeaders), exportState (Maps/Sets → Records/Arrays), importStateFromFile (parse → validate → return serialized AppState)
- [x] T036 [P] Create src/lib/importExport.test.ts: validation tests for new AppState shape, round-trip export/import tests

**Checkpoint**: Unified store works with persistence, import/export, and seed data.

---

## Phase 9: Polish & Cleanup

**Purpose**: Remove dead code, uninstall deprecated dependencies, suppress UI type errors

- [x] T037 Delete old files: src/store/useGroups.ts, src/store/useFlows.ts, src/store/utils/storeUtils.ts, src/store/utils.ts (if unused), src/db/database.ts, src/data/groups.ts, src/data/flows.ts, src/store/useAppStore.test.ts
- [x] T038 Remove dexie and dexie-react-hooks from package.json dependencies and run npm install
- [x] T039 Add // @ts-nocheck with TODO comment to affected UI components: FlowList.tsx, FlowListItem.tsx, GroupsList.tsx, GroupsListItem.tsx, SnippetsPanel.tsx, SnippetsPanelItem.tsx, OutputWindow.tsx, AppLayout.tsx
- [x] T040 Run npm test to verify all Vitest tests pass
- [x] T041 Run make lint to verify ESLint + Prettier clean
- [x] T042 Run make build to verify TypeScript compiles (with @ts-nocheck on deferred components)

**Checkpoint**: All old code removed. Tests pass. Lint clean. Build succeeds.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Docs)**: No dependencies — start immediately
- **Phase 2 (Types + Infrastructure)**: Depends on Phase 1 — BLOCKS all store work
- **Phases 3-7 (User Stories)**: All depend on Phase 2 completion
  - US1 (Snippets): Can start after Phase 2
  - US2 (Skills): Can start after Phase 2 (tests need snippets for cascade, so practically after US1)
  - US3 (Agents): Can start after Phase 2 (tests need snippets for activation, so practically after US1)
  - US4 (Bulk Toggle): Depends on US3 (extends agent slice) + US2 (needs skills/snippetsBySkill)
  - US5 (Session): Can start after Phase 2 (standalone slice)
- **Phase 8 (Integration)**: Depends on all user stories (Phases 3-7)
- **Phase 9 (Cleanup)**: Depends on Phase 8

### User Story Dependencies

- **US1 (Snippets)**: Independent — can start immediately after foundational
- **US2 (Skills)**: Cascade tests need snippet store to exist → depends on US1
- **US3 (Agents)**: Activation tests need snippet store to exist → depends on US1
- **US4 (Bulk Toggle)**: Extends agent slice, needs snippetsBySkill → depends on US2 + US3
- **US5 (Session)**: Standalone concept but wraps DataState → depends on US1 (needs entities to test with)

### Recommended Execution Order

```
Phase 1 (Docs) → Phase 2 (Types + Infra) → US1 (Snippets) → US2 (Skills) → US3 (Agents) → US4 (Bulk Toggle) → US5 (Session) → Phase 8 (Integration) → Phase 9 (Cleanup)
```

### Parallel Opportunities

```bash
# Phase 1: Documentation (T002, T003, T004 in parallel after T001)
# Phase 2: Types (T006, T007, T008 in parallel after T005)
# Phase 2: Infrastructure (T011, T012, T013 in parallel)
# Phase 2: Infrastructure tests (T014, T015, T016 in parallel)
# Phase 8: Seeds + import/export test (T034, T036 in parallel)
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Documentation
2. Complete Phase 2: Types + Infrastructure
3. Complete Phase 3: US1 — Snippet CRUD + tagging
4. Complete Phase 4: US2 — Skill CRUD + cascade
5. Complete Phase 5: US3 — Agent CRUD + activation + compiler
6. **STOP and VALIDATE**: Core entity loop is functional

### Full Delivery

7. Complete Phase 6: US4 — Bulk toggle
8. Complete Phase 7: US5 — Session model
9. Complete Phase 8: Integration (store root, import/export)
10. Complete Phase 9: Cleanup

---

## Notes

- Entity creation order within types: Entity base → Snippet/Skill/Agent (parallel) → composites
- Store slice order: Snippets → Skills → Agents (dependency order for cascade testing)
- All store tests use native-mechanism setup (call real store actions, not manual state construction)
- UI component updates are deferred to a follow-up feature (FR-017, FR-020)
- No data migration — clean break from old format
