# Tasks: Sync UI Components with New Data Structure & Add Automated Tests

**Feature**: Sync UI Components with New Data Structure & Add Automated Tests
**Branch**: `005-update-store-components`
**Spec**: [specs/005-update-store-components/spec.md](spec.md)
**Plan**: [specs/005-update-store-components/plan.md](plan.md)

## Implementation Strategy

We follow an incremental refactoring strategy ordered by dependency: **Snippets -> Skills -> Agents -> Layout/Integration**. This ensures that atomic units are updated before the containers that consume them. Every component update will be accompanied by a co-located React Testing Library test to verify its behavior with the new Map/Set-based store structure.

### MVP Scope
- User Story 1 (Agent Management) and User Story 2 (Skill Filtering) updated to work with the new data model, verified by basic integration tests.

---

## Phase 1: Setup
Initialization and environment preparation.

- [X] T001 Verify test environment setup for React Testing Library and Vitest in `package.json` and `vitest.config.ts`
- [X] T002 Create test utility for mocking Zustand stores in `src/test/storeMocks.ts` (if shared mocking logic is needed)

## Phase 2: Foundational
Renaming entities and components to match the new domain model.

- [ ] T003 [P] Rename Flow components to Agent components: `src/components/FlowList.tsx` -> `src/components/AgentList.tsx`, `src/components/FlowListItem.tsx` -> `src/components/AgentListItem.tsx`
- [ ] T004 [P] Rename Group components to Skill components: `src/components/GroupsList.tsx` -> `src/components/SkillsList.tsx`, `src/components/GroupsListItem.tsx` -> `src/components/SkillsListItem.tsx`
- [ ] T005 Update all internal imports and references for renamed components in `src/components/` and `src/AppLayout.tsx`

## Phase 3: [US2] Skill-based Content Filtering
Updating Snippets and Skills components to use the new Map-based storage and Set-based tagging.

**Goal**: Users can filter snippets by Skill tags using the new data structure.
**Independent Test**: Render `SkillsList` and `SnippetsPanel`, select a skill, and verify that only snippets with that skill ID in their `skills` Set are displayed.

- [ ] T006 [P] [US2] Implement `SnippetsPanel.test.tsx` to verify filtering behavior with mocked Map/Set store
- [ ] T007 [US2] Refactor `SnippetsPanel.tsx` to use `draft.snippets` (Map) and implement filtering logic using `snippet.skills.has(selectedSkillId)`
- [ ] T008 [P] [US2] Implement `SkillsListItem.test.tsx` to verify rename/delete/select interactions
- [ ] T009 [US2] Refactor `SkillsListItem.tsx` to work with the `Skill` type and `useSkills` slice
- [ ] T010 [P] [US2] Implement `SkillsList.test.tsx` to verify alphabetical sorting and "Untagged" filter
- [ ] T011 [US2] Refactor `SkillsList.tsx` to iterate over `draft.skills` Map and display alphabetical list

## Phase 4: [US1] Unified Agent Management
Updating Agent management components to handle ordered snippet activation.

**Goal**: Users can manage Agents and their active snippets using the new ordered data structure.
**Independent Test**: Render `AgentList`, select an agent, and verify that its details and active snippets are correctly retrieved from the `agents` Map.

- [ ] T012 [P] [US1] Implement `AgentListItem.test.tsx` to verify selection and CRUD actions
- [ ] T013 [US1] Refactor `AgentListItem.tsx` to use the `Agent` type and `useAgents` slice
- [ ] T014 [P] [US1] Implement `AgentList.test.tsx` to verify alphabetical listing of agents
- [ ] T015 [US1] Refactor `AgentList.tsx` to iterate over `draft.agents` Map and handle agent creation

## Phase 5: [US3] Output & Integration
Finalizing the compilation logic and global application layout.

**Goal**: Ensure the compiled output matches the agent's active order and the app layout is fully functional.
**Independent Test**: Select an agent, activate/reorder snippets, and verify the `OutputWindow` displays the joined text in the correct sequence.

- [ ] T016 [P] [US3] Implement `OutputWindow.test.tsx` to verify compilation based on `activeOrder` and `activeSet`
- [ ] T017 [US3] Refactor `OutputWindow.tsx` to use `draft.agents` and compile output from the `activeOrder` array
- [ ] T018 [US3] Update `AppLayout.tsx` to correctly integrate all renamed components and handle the top-level session state
- [ ] T019 [US3] Run full test suite (`make test`) to ensure zero regressions in store logic or UI components

## Phase 6: Polish
Final cleanup and cross-cutting concern verification.

- [ ] T020 [P] Update `docs/architecture.md` and `docs/state-and-data-flow.md` to reflect the final UI-Store integration patterns
- [ ] T021 Perform a final pass to remove any remaining "Flow" or "Group" terminology in UI labels, tooltips, or ARIA labels

---

## Dependencies

- **US2** (Skill Filtering) depends on **Phase 2** (Renaming)
- **US1** (Agent Management) depends on **US2** (Snippet primitives updated)
- **US3** (Output & Integration) depends on **US1** and **US2**

## Parallel Execution Examples

- **Setup & Foundational**: T001, T003, T004 can run in parallel (different files/config).
- **Component Tests**: T006, T008, T010, T012, T014, T016 can all run in parallel as they only create new test files.
- **Independent Stories**: While US1 generally follows US2 in the implementation strategy, T013 and T009 can be refactored in parallel as they touch different component sets.
