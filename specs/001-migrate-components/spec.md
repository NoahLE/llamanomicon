# Feature Specification: Component Store Migration & Testing

**Feature Branch**: `001-migrate-components`
**Created**: 2026-04-20
**Status**: Draft

## User Scenarios & Testing _(mandatory)_

### User Story 1 - All UI Panels Are Visible and Functional (Priority: P1)

A user opens the application and sees all four core panels — Agent List, Skills List, Snippets Panel, and Output Window — rendered and interactive. Currently three of these panels are disabled (commented out) because they depend on the updated data store but have not been migrated to use it.

**Why this priority**: The app is non-functional without all four panels. Restoring them is the prerequisite for every other workflow.

**Independent Test**: Launch the app; confirm all four panels render without errors and respond to basic interactions (selecting an agent, filtering by skill, viewing compiled output).

**Acceptance Scenarios**:

1. **Given** the app is loaded with no existing data, **When** a user views the interface, **Then** all four panels (Agent List, Skills List, Snippets Panel, Output Window) are visible and free of runtime errors.
2. **Given** seed data exists, **When** a user selects an agent, **Then** the Snippets Panel and Output Window update to reflect that agent's active snippets.
3. **Given** the app is loaded, **When** a user interacts with any panel, **Then** no type errors or console warnings appear.

---

### User Story 2 - Skills Filter Drives Snippet Visibility (Priority: P2)

A user selects a skill in the Skills List and sees only the snippets associated with that skill in the Snippets Panel. Selecting "Untagged" shows snippets with no assigned skills. Deselecting a skill shows all snippets.

**Why this priority**: Skill-based filtering is the primary navigation mechanism for finding snippets; without it the snippets list is unwieldy.

**Independent Test**: With at least two skills and tagged snippets present, selecting a skill in the Skills List shows only its associated snippets — verifiable without other panels.

**Acceptance Scenarios**:

1. **Given** snippets are tagged with various skills, **When** a user clicks a skill in the Skills List, **Then** the Snippets Panel shows only snippets tagged with that skill.
2. **Given** a skill is active, **When** the user clicks the same skill again, **Then** the filter is cleared and all snippets are shown.
3. **Given** some snippets have no skill tags, **When** the user selects "Untagged", **Then** only those untagged snippets appear.

---

### User Story 3 - Output Window Reflects Active Snippet Order (Priority: P3)

A user drags snippets in the Snippets Panel to reorder them and sees the Output Window update immediately, reflecting the new order in the compiled text.

**Why this priority**: Correct output compilation is the core value proposition of the app; output must always mirror the active snippet order.

**Independent Test**: With an agent that has multiple active snippets, reorder two snippets via drag-and-drop and verify the output text order changes to match.

**Acceptance Scenarios**:

1. **Given** an agent has multiple active snippets, **When** the user reorders them, **Then** the Output Window reflects the new order instantly.
2. **Given** an agent has no active snippets, **When** the Output Window is viewed, **Then** it displays an empty state rather than an error.
3. **Given** a snippet is deactivated from an agent, **When** the Output Window is viewed, **Then** that snippet's text no longer appears.

---

### User Story 4 - Automated Tests Verify Panel Behavior (Priority: P4)

A developer runs the test suite and receives pass/fail feedback for each component's rendering and interaction behavior. Tests are co-located under `src/components/tests/` and cover the primary happy-path and edge-case scenarios defined above.
v
**Why this priority**: Without tests, regressions go undetected as the store or components evolve further.

**Independent Test**: `npm test` runs all component tests and produces a result report with no failures.

**Acceptance Scenarios**:

1. **Given** the test suite is run, **When** no code changes have been made, **Then** all component tests pass.
2. **Given** a component is rendered in isolation with mock store data, **When** a user interaction is simulated, **Then** the correct store action is invoked and the UI updates accordingly.
3. **Given** an agent has no active snippets, **When** the OutputWindow component is rendered, **Then** it shows the empty state without throwing.

---

### User Story 5 - Documentation Reflects Current Architecture (Priority: P5)

A developer reads the project documentation and finds accurate descriptions of the store API, component structure, and testing approach — with no references to the old architecture or placeholder notes about pending migration.

**Why this priority**: Stale docs mislead future contributors; updating them closes out the migration work.

**Independent Test**: Read `docs/state-and-data-flow.md` and `docs/architecture.md`; verify they describe the current store slices, session model, and component structure without contradictions.

**Acceptance Scenarios**:

1. **Given** the migration is complete, **When** a developer reads the architecture docs, **Then** they find accurate descriptions of all store slices and the component-store integration.
2. **Given** the test suite is established, **When** a developer reads the contributing docs, **Then** they find instructions for running and adding component tests.

---

### Edge Cases

- What happens when a component renders before store data has hydrated from storage?
- How does the Snippets Panel behave when the active agent references a snippet ID that no longer exists?
- What happens when a user activates and immediately deactivates a snippet in rapid succession?
- How does the Output Window handle a snippet separator that is an empty string?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: All four core panels (Agent List, Skills List, Snippets Panel, Output Window) MUST render without errors when the app is loaded.
- **FR-002**: Each panel MUST read state exclusively from the current store API; no panel may bypass the store or use suppressed type checking.
- **FR-003**: The Skills List MUST filter snippets displayed in the Snippets Panel when a skill is selected.
- **FR-004**: The Snippets Panel MUST allow snippet activation, deactivation, and reordering within the active agent.
- **FR-005**: The Output Window MUST display the compiled text of the active agent's ordered active snippets, updating on every state change.
- **FR-006**: Component tests MUST be placed under `src/components/tests/` and cover rendering, user interactions, and edge cases for each panel.
- **FR-007**: All component tests MUST pass when the test suite is run.
- **FR-008**: Project documentation MUST be updated to accurately describe the current component structure, store integration, and testing approach.
- **FR-009**: The app MUST compile and run without TypeScript errors or suppressed type checks (`@ts-nocheck`) in any component file.

### Key Entities

- **Agent**: A named collection with an ordered set of active snippet references; drives which snippets appear in the Snippets Panel and what compiles in the Output Window.
- **Snippet**: An atomic text fragment optionally tagged with one or more skills; shared across all agents.
- **Skill**: A tag used to group and filter snippets; selecting a skill narrows the Snippets Panel to relevant snippets only.
- **Compiled Output**: The joined text of an agent's active snippets in their defined order; derived on read, never stored.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All four UI panels render and are interactive in a local development build with zero runtime errors.
- **SC-002**: 100% of component files contain no suppressed type checks; the build completes without type errors.
- **SC-003**: The test suite includes at least one test per component covering the primary rendering scenario and at least one interaction or edge case.
- **SC-004**: All component tests pass on a clean run with no skipped tests.
- **SC-005**: Project documentation contains no references to the old store API, no "pending migration" notes, and accurately describes the current architecture.

## Assumptions

- The store API is stable and will not change during this migration; the implementation in `src/store/` is the source of truth.
- Seed data utilities already present in the store are sufficient to support test setup without requiring a real persistence layer.
- The drag-and-drop reordering behavior in the Snippets Panel is considered in-scope and must work after migration, but no visual polish beyond current behavior is required.
- Documentation updates cover the five files in `docs/` and `CLAUDE.md`; no new doc files are needed.
