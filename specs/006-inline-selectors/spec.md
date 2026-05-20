# Feature Specification: Inline Store Selectors and Index Utilities

**Feature Branch**: `006-inline-selectors`
**Created**: 2026-04-20
**Status**: Draft
**Input**: User description: "the store/selectors.ts file splits the store logic apart too much. the items in this file should be migrated into the appropriate stores. for example, selectActiveAgent should be moved into the useAgentStore. items with overlap, such as selectSnippetsForSkill should go into the store based on UI component which triggers it. in this case, the skill store. the end result should be the selectors file being deleted and all enclosed logic being migrated to the appropriate store. all tests should be updated to reflect these changes. the documentation should also be updated in case there are outdated references. the same requirement can be applied to the lib/indexes.ts."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Selectors Migrated into Domain Stores (Priority: P1)

Each selector currently in `src/store/selectors.ts` is moved into the store slice that owns its primary data. The `selectors.ts` file is deleted. All existing consumers (components, tests) import from the new location.

**Why this priority**: This is the core ask. Every other story depends on it. The file cannot be deleted until all selectors are homed.

**Independent Test**: Can be verified by confirming `selectors.ts` no longer exists and all tests still pass with import paths pointing to the individual slice files.

**Acceptance Scenarios**:

1. **Given** `selectActiveAgent` is defined in `selectors.ts`, **When** the migration is complete, **Then** `selectActiveAgent` is exported from `src/store/useAgents.ts` and no file imports it from the old path.
2. **Given** `selectSelectedSkill` is defined in `selectors.ts`, **When** the migration is complete, **Then** it is exported from `src/store/useSkills.ts`.
3. **Given** `selectSortedAgents` is defined in `selectors.ts`, **When** the migration is complete, **Then** it is exported from `src/store/useAgents.ts`.
4. **Given** `selectSortedSkills` is defined in `selectors.ts`, **When** the migration is complete, **Then** it is exported from `src/store/useSkills.ts`.
5. **Given** `UNTAGGED_SKILL_ID` is defined in `selectors.ts`, **When** the migration is complete, **Then** it is exported from `src/store/useSkills.ts`.
6. **Given** `selectSnippetsForSkill` is defined in `selectors.ts`, **When** the migration is complete, **Then** it is exported from `src/store/useSkills.ts` (because the SkillsList component drives its usage).
7. **Given** `selectUntaggedSnippets` is defined in `selectors.ts`, **When** the migration is complete, **Then** it is exported from `src/store/useSnippets.ts`.
8. **Given** `selectAllSnippets` is defined in `selectors.ts`, **When** the migration is complete, **Then** it is exported from `src/store/useSnippets.ts`.
9. **Given** `selectCompiledOutput` is defined in `selectors.ts`, **When** the migration is complete, **Then** it is exported from `src/store/useSettings.ts` (because it depends on `outputSettings`).
10. **Given** `createSelectors` is defined in `selectors.ts`, **When** the migration is complete, **Then** it is inlined into `src/store/useAppStore.ts` and removed from `selectors.ts`.
11. **Given** `selectors.ts` exists, **When** all migrations are done, **Then** `selectors.ts` is deleted.

---

### User Story 2 - Index Utility Migrated into Data Controls (Priority: P2)

`buildSnippetsBySkill` from `src/lib/indexes.ts` is moved into the store slice that owns index management. The `indexes.ts` file is deleted.

**Why this priority**: Follows the same co-location principle as story 1. `buildSnippetsBySkill` is only ever called from `useDataControls.ts`.

**Independent Test**: Can be verified by confirming `indexes.ts` no longer exists and all index rebuild operations (rehydration, discard, seed) still work correctly.

**Acceptance Scenarios**:

1. **Given** `buildSnippetsBySkill` is defined in `src/lib/indexes.ts`, **When** the migration is complete, **Then** it is defined locally within `src/store/useDataControls.ts`.
2. **Given** `indexes.ts` exists, **When** all migrations are done, **Then** `indexes.ts` is deleted.
3. **Given** `src/lib/tests/indexes.test.ts` imports from `src/lib/indexes.ts`, **When** the migration is complete, **Then** the test is updated or co-located with `useDataControls` tests.

---

### User Story 3 - Tests Updated to Reflect New Import Paths (Priority: P2)

All test files that currently import from `selectors.ts` or `indexes.ts` are updated to import from the new slice locations.

**Why this priority**: Tests must remain green. Broken imports after file deletion would halt the build.

**Independent Test**: Running the full test suite produces zero failures and zero import errors.

**Acceptance Scenarios**:

1. **Given** `src/store/tests/selectors.test.ts` imports selectors from `selectors.ts`, **When** migration is complete, **Then** tests import each selector from its new slice file.
2. **Given** component tests in `src/components/tests/` mock selectors via namespace import from `selectors.ts`, **When** migration is complete, **Then** mocks reference the new module paths.
3. **Given** all tests pass before the migration, **When** migration is complete, **Then** all tests still pass.

---

### User Story 4 - Documentation Updated (Priority: P3)

All documentation files that reference `selectors.ts` or `indexes.ts` are updated to reflect the new locations.

**Why this priority**: Docs are lower risk to correctness than code, but stale references create confusion for future contributors.

**Independent Test**: A search for `selectors.ts` and `indexes.ts` across `docs/` and `CLAUDE.md` returns no results after the update.

**Acceptance Scenarios**:

1. **Given** `docs/architecture.md` references `selectors.ts`, **When** migration is complete, **Then** references are updated to the new slice files.
2. **Given** `docs/state-and-data-flow.md` describes all selectors by file location, **When** migration is complete, **Then** docs reflect their new homes.
3. **Given** `CLAUDE.md` references `src/store/selectors.ts` under Key Selectors, **When** migration is complete, **Then** the reference is updated to show selectors live in their respective slices.

---

### Edge Cases

- `createSelectors` is used only in `useAppStore.ts` — it should be inlined there rather than moved to a slice, since it is a framework utility, not domain logic.
- `selectCompiledOutput` calls `selectActiveAgent` internally — after migration, `useSettings.ts` must import `selectActiveAgent` from `useAgents.ts`. This import direction (`useSettings` → `useAgents`) must be verified to introduce no circular dependency.
- The private `sortByName` helper in `selectors.ts` is used by multiple selectors across different slices — it must be duplicated into each destination file or extracted into a small shared utility.
- Component test mocking currently uses a namespace import (`import * as selectors from ...`) to mock all selectors at once — after migration, each mock may need to reference multiple modules.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Each selector in `src/store/selectors.ts` MUST be moved to the store slice file that owns its primary data, following the placement rules described in User Story 1.
- **FR-002**: `buildSnippetsBySkill` from `src/lib/indexes.ts` MUST be moved into `src/store/useDataControls.ts` as a module-local function.
- **FR-003**: `src/store/selectors.ts` MUST be deleted after all migrations are complete.
- **FR-004**: `src/lib/indexes.ts` MUST be deleted after the index utility migration is complete.
- **FR-005**: All import statements in component files MUST be updated to reference the new export locations.
- **FR-006**: All import statements in test files MUST be updated to reference the new export locations.
- **FR-007**: The private `sortByName` helper MUST be available in each slice that needs it — either duplicated locally or moved to a shared utility file — without importing from the deleted `selectors.ts`.
- **FR-008**: `createSelectors` MUST be inlined into `src/store/useAppStore.ts` without changing the public API of `useAppStore`.
- **FR-009**: Documentation files (`docs/architecture.md`, `docs/state-and-data-flow.md`) MUST be updated to remove references to `selectors.ts` and `indexes.ts`.
- **FR-010**: `CLAUDE.md` MUST be updated to reflect that selectors live in their respective slice files.
- **FR-011**: The full test suite MUST pass after all changes are applied.
- **FR-012**: No circular dependencies MUST be introduced between store slice files during migration.

### Key Entities

- **Store slices**: `useAgents.ts`, `useSkills.ts`, `useSnippets.ts`, `useSettings.ts`, `useDataControls.ts` — destination files for migrated logic.
- **Selectors**: Pure functions that accept `StoreState` and return derived values. They remain pure functions after migration; only their file location changes.
- **`UNTAGGED_SKILL_ID`**: A constant re-exported from `useSkills.ts` so all consumers can update their imports without any behavior change.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero files in the project import from `src/store/selectors.ts` or `src/lib/indexes.ts` after migration.
- **SC-002**: Both `src/store/selectors.ts` and `src/lib/indexes.ts` are absent from the repository after migration.
- **SC-003**: The full test suite (store tests + component tests) passes with no failures after migration.
- **SC-004**: No new circular dependency warnings are introduced between store slice files.
- **SC-005**: All documentation references to `selectors.ts` and `indexes.ts` are replaced with references to the correct slice files.

## Assumptions

- `selectCompiledOutput` is assigned to `useSettings.ts` because it consumes `outputSettings` (owned by settings). If the team prefers it in `useAgents.ts`, that is an equally valid placement and does not change scope.
- `buildSnippetsBySkill` will be a module-private function inside `useDataControls.ts` and will not be exported, since it has no callers outside that file.
- `sortByName` will be duplicated into each destination slice rather than extracted into a new shared file, to minimize the footprint of this refactor.
- Historical spec files (e.g., `specs/001-migrate-components/research.md`) that reference `selectors.ts` are not updated, as they are read-only historical artifacts.
