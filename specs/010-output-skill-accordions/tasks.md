# Tasks: Output Skill Accordions

**Input**: Design documents from `/specs/010-output-skill-accordions/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/store-interface.md ✓, quickstart.md ✓

**Tests**: Included — plan.md explicitly specifies test tasks in Step 5.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm no new infrastructure is needed. HeroUI Accordion and @dnd-kit/react 0.3.2 are already installed — no npm installs, no new config files.

- [x] T001 Verify HeroUI Accordion export is accessible and @dnd-kit/react is importable by checking `node_modules/@heroui/react` and `node_modules/@dnd-kit/react` exist

**Checkpoint**: All dependencies confirmed present — no install step needed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the `Agent` type with `skillGroupOrder` and wire backward-compatible import defaults. These changes are required before any user story implementation can begin.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Add `skillGroupOrder: string[]` field to the `Agent` interface in `src/types/Agent.ts`
- [x] T003 [P] Add `skillGroupOrder: string[]` field to the `SerializedAgent` interface in `src/types/index.ts`
- [x] T004 Default `skillGroupOrder` to `[]` when missing during deserialization in `importState` in `src/store/useDataControls.ts` (backward compatibility with existing localStorage data)
- [x] T005 Initialize `skillGroupOrder: []` in the `repo.create` call inside `addAgent` in `src/store/useAgents.ts`

**Checkpoint**: Foundation ready — `Agent` type is extended, old data loads safely, new agents initialize with empty group order

---

## Phase 3: User Story 1 — View Active Snippets Grouped by Skill (Priority: P1) 🎯 MVP

**Goal**: Replace the flat `<pre>` compiled-text block in OutputWindow with a HeroUI Accordion layout where each section is a skill that has at least one active snippet. All sections default to expanded. An "Untagged" section handles snippets with no skill tags. Empty-state messages are preserved.

**Independent Test**: Activate snippets from at least two different skills on an active agent. Open the Output Window and verify: (1) one accordion section per skill appears, (2) each section is labeled with the skill name, (3) each section lists only snippets belonging to that skill, (4) all sections are expanded by default, (5) an "Untagged" section appears for any active untagged snippets, (6) skills with no active snippets have no section.

### Implementation for User Story 1

- [x] T006 [P] [US1] Define `SkillGroup` interface (`{ skillId: string; skillName: string; snippets: Snippet[] }`) and add `selectSkillGroupsForOutput(state: StoreState): SkillGroup[]` selector to `src/store/useAgents.ts`; ordering: (1) skills in `agent.skillGroupOrder` with ≥1 active snippet, (2) remaining skills with active snippets alphabetically by name, (3) `UNTAGGED_SKILL_ID` group last if untagged snippets exist; snippets within each group sorted alphabetically by name via `sortByName` filtered to `agent.activeSet`
- [x] T007 [US1] Create `src/components/SkillGroupAccordion.tsx`: renders a single `Accordion.Item` with `group.skillName` as heading and `group.snippets` listed alphabetically in the body; no drag-and-drop yet (static component, props: `group: SkillGroup`, `index: number`)
- [x] T008 [US1] Refactor `src/components/OutputWindow.tsx`: remove the `<pre>` block; add `Accordion.Root` with `allowsMultipleExpanded` and `defaultExpandedKeys` set to all skill IDs from `selectSkillGroupsForOutput`; render one `SkillGroupAccordion` per group; preserve empty-state messages ("Select an agent to get started" / "Toggle snippets to build your prompt")

### Tests for User Story 1

- [x] T009 [P] [US1] Add `selectSkillGroupsForOutput` unit tests to `src/store/tests/useAgents.test.ts`: (a) groups appear in `skillGroupOrder` sequence, (b) skills absent from `skillGroupOrder` appear alphabetically after, (c) untagged group is always last, (d) skills with no active snippets are excluded, (e) snippets within a group are alphabetically sorted, (f) empty agent returns `[]`
- [x] T010 [P] [US1] Create `src/components/tests/OutputWindow.test.tsx`: (a) renders one section per skill with active snippets, (b) "Select an agent" empty state when no active agent, (c) "Toggle snippets" empty state when agent has no active snippets, (d) all sections are expanded by default

**Checkpoint**: User Story 1 is fully functional — Output Window shows grouped accordion sections, all expanded, correct content per group, empty states preserved

---

## Phase 4: User Story 2 — Reorder Skill Groups via Drag and Drop (Priority: P2)

**Goal**: Allow users to drag accordion sections to new positions within the Output Window. Reordering updates `agent.skillGroupOrder` in session state and participates in the existing save/discard model. The `deleteSkill` action cascades to remove deleted skill IDs from `skillGroupOrder` on all agents.

**Independent Test**: With multiple skill group accordions visible, drag one section to a new position. Verify: (1) sections reorder visually immediately, (2) clicking "Discard" reverts the order to the previously saved state.

### Implementation for User Story 2

- [x] T011 [P] [US2] Add `reorderSkillGroups(agentId: string, newOrder: string[]): void` action to `src/store/useAgents.ts`; effect: `draft.agents[agentId].skillGroupOrder = newOrder`; no other fields modified
- [x] T012 [P] [US2] Extend `deleteSkill` in `src/store/useSkills.ts` to cascade: after removing the skill from snippets and `snippetsBySkill`, iterate all agents in `draft.agents` and filter the deleted skill ID out of each agent's `skillGroupOrder`
- [x] T013 [US2] Update `src/components/SkillGroupAccordion.tsx` to accept `index` prop and call `useSortable({ id: group.skillId, index })` from `@dnd-kit/react`; wrap the `Accordion.Item` in `<div ref={ref}>`; add a `<div ref={handleRef}><GripVertical /></div>` drag handle inside `Accordion.Trigger`
- [x] T014 [US2] Update `src/components/OutputWindow.tsx` to wrap `Accordion.Root` with `DragDropProvider` from `@dnd-kit/react`; implement `handleDragEnd({ operation })` using `isSortableOperation` guard; on drag end call `reorderSkillGroups(activeAgentId, newOrder)` with the reordered skill IDs derived from the `source`/`target` positions

### Tests for User Story 2

- [x] T015 [P] [US2] Add store tests to `src/store/tests/useAgents.test.ts`: (a) `reorderSkillGroups` updates `skillGroupOrder` and leaves `activeSet`/`activeOrder` untouched, (b) `reorderSkillGroups` no-ops gracefully when called with the same order, (c) `deleteSkill` cascade removes the deleted skill ID from `skillGroupOrder` on every agent

**Checkpoint**: User Stories 1 AND 2 work independently — drag reordering persists to draft, discard reverts order, deleteSkill cascade keeps data clean

---

## Phase 5: User Story 3 — Copy Compiled Output in Current Order (Priority: P3)

**Goal**: The Copy button produces plain text where snippets are ordered by the current skill group arrangement. A snippet tagged to multiple skills is emitted only once at its first matching group. The existing `compileOutput` function is retained unchanged.

**Independent Test**: Arrange skill groups in a specific order, then click Copy. Verify the clipboard contains all snippets joined by the configured separator in skill-group order (all snippets from group 1 first, then group 2, etc.), with multi-skill snippets appearing exactly once.

### Implementation for User Story 3

- [x] T016 [P] [US3] Add `compileOutputBySkillGroup(agent: Agent, snippets: Map<string, Snippet>, skills: Map<string, Skill>, snippetsBySkill: Map<string, Set<string>>, settings: OutputSettings): string` to `src/lib/compiler.ts`; algorithm: build ordered groups using the same ordering rules as `selectSkillGroupsForOutput`; iterate groups; within each group iterate alphabetically-sorted active snippets; track `seen: Set<string>` and skip already-emitted IDs; join with `settings.snippetSeparator` and trim; keep existing `compileOutput` intact
- [x] T017 [US3] Update `selectCompiledOutput` in `src/store/useSettings.ts` to call `compileOutputBySkillGroup` instead of `compileOutput`, passing `state.snippetsBySkill` and `state.draft.skills` in addition to the existing arguments; function signature is unchanged

### Tests for User Story 3

- [x] T018 [P] [US3] Create `src/lib/tests/compiler.test.ts`: (a) single group emits all snippets alphabetically, (b) multiple groups emit in group order with alphabetical within each group, (c) multi-skill snippet appears in every group visually but is emitted only once at first-group position, (d) empty agent (no active snippets) returns `""`, (e) skills absent from `skillGroupOrder` append alphabetically after explicit ones

**Checkpoint**: All three user stories are independently functional — accordion view, drag reordering, and copy-to-clipboard all work correctly together

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation updates and dev server validation

- [x] T019 [P] Update `CLAUDE.md`: add `skillGroupOrder: string[]` to Agent description in Architecture section; add `reorderSkillGroups` and `selectSkillGroupsForOutput` to store slice notes; update OutputWindow description in UI Layout section
- [x] T020 [P] Update `docs/models.md`: add `skillGroupOrder` row to Agent type definition table with type `string[]`, default `[]`, and description
- [x] T021 [P] Update `docs/state-and-data-flow.md`: update compiler section to document `compileOutputBySkillGroup` as the active output path; note that `compileOutput` is retained for backward compatibility with existing tests
- [x] T022 Run dev server (`make dev`) and execute quickstart.md golden path: select agent → activate snippets across ≥2 skills → verify accordion sections → verify alphabetical within-group order → drag reorder → copy and verify output → discard and verify order reverts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 completion — no dependency on US2 or US3
- **US2 (Phase 4)**: Depends on Phase 2 completion — builds on US1 components (dnd additions)
- **US3 (Phase 5)**: Depends on Phase 2 completion — independent of US1/US2 at the store/compiler level
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependency on US2 or US3 — accordion layout is independently testable
- **US2 (P2)**: Adds dnd to US1 components — US1 components must exist first (T007, T008)
- **US3 (P3)**: Compiler and settings changes are independent of UI; Copy button already calls `selectCompiledOutput`

### Within Each User Story

- Selectors/actions before components (store drives UI)
- Components before tests (RTL tests render components)
- Core implementation before integration

### Parallel Opportunities

- T002 + T003 (Phase 2): Different files — run in parallel
- T006 + T007 (Phase 3): Different files — run in parallel after Phase 2
- T009 + T010 (Phase 3 tests): Different files — run in parallel
- T011 + T012 (Phase 4): Different files — run in parallel after Phase 2
- T016 + T017 (Phase 5): Compiler is independent of settings — T016 can run in parallel with Phase 3/4
- T019 + T020 + T021 (Phase 6): Different docs files — run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch store selector + component creation in parallel:
Task: "T006 — selectSkillGroupsForOutput selector in src/store/useAgents.ts"
Task: "T007 — SkillGroupAccordion component in src/components/SkillGroupAccordion.tsx"

# After T006 + T007 complete, launch tests in parallel:
Task: "T009 — selectSkillGroupsForOutput tests in src/store/tests/useAgents.test.ts"
Task: "T010 — OutputWindow component tests in src/components/tests/OutputWindow.test.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch store action + cascade update in parallel:
Task: "T011 — reorderSkillGroups action in src/store/useAgents.ts"
Task: "T012 — deleteSkill cascade in src/store/useSkills.ts"

# Then add dnd to components (T013 before T014 — T014 calls the action from T011):
Task: "T013 — useSortable in src/components/SkillGroupAccordion.tsx"
Task: "T014 — DragDropProvider in src/components/OutputWindow.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify deps)
2. Complete Phase 2: Foundational (types + backward compat)
3. Complete Phase 3: User Story 1 (accordion layout, no dnd)
4. **STOP and VALIDATE**: accordion renders correctly, empty states work, all sections expanded
5. Demo accordion layout before adding drag-and-drop

### Incremental Delivery

1. Phase 1 + 2 → Types extended, old data safe
2. Phase 3 → Visual accordion layout complete (MVP — users can see grouped output)
3. Phase 4 → Drag reordering added (users can control group order)
4. Phase 5 → Copy produces correctly ordered output (core loop complete)
5. Phase 6 → Docs + dev server verification

---

## Notes

- `[P]` tasks operate on different files with no unmet dependencies — safe to parallelize
- `[Story]` label maps each task to a user story for traceability
- `compileOutput` must NOT be modified — existing tests depend on it
- `activeOrder` must NOT be removed — activation/cascade logic still uses it
- `UNTAGGED_SKILL_ID = "__untagged__"` is already defined in `src/store/useSkills.ts` — reuse it
- `sortByName` is already in use in `selectSnippetsForSkill` — reuse it for within-group ordering
- Run `make lint` after each phase to catch TypeScript strict-mode violations early
