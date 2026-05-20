# Feature Specification: Fix Output Window Snippet Ordering

**Feature Branch**: `011-fix-output-ordering`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: User description: "there is a bug in the output window. this could be due to old logic which has not been updated to match the current design. the expectation is this: when a skill has an active text snippet, the skill appears in the output section with the active text snippets nested in the accordion. the order should the snippets should be in the same order as how they appear in the snippets section. when a snippet is dragged and dropped to a new location, the order of the snippets should reflect the new order both in the snippets window and output window."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Active Snippets Appear in Output in Panel Order (Priority: P1)

As a user, when I activate snippets in the Snippets panel, I expect each skill group in the Output window accordion to display its active snippets in exactly the same top-to-bottom order that those snippets appear in the Snippets panel. Currently snippets are sorted alphabetically by name inside skill groups in the output, which does not match the panel and contradicts the per-agent ordering model.

**Why this priority**: This is the core correctness bug — the output does not reflect what the user sees in the snippets panel, breaking the "what you see is what you get" contract.

**Independent Test**: Activate multiple snippets belonging to the same skill in a non-alphabetical order and verify they appear in that same order inside the skill group accordion in the Output window.

**Acceptance Scenarios**:

1. **Given** an agent with two active snippets "Zebra" and "Alpha" both tagged with skill "Writing", where "Zebra" was activated before "Alpha", **When** the Output window is viewed, **Then** the "Writing" accordion group shows "Zebra" before "Alpha".
2. **Given** an agent with active snippets displayed in a specific order in the Snippets panel, **When** the Output window is viewed, **Then** the relative order of snippets within each skill group matches the order they appear in the Snippets panel.
3. **Given** no active agent, **When** the Output window is viewed, **Then** the output remains empty and no skill groups are displayed.

---

### User Story 2 - Drag-and-Drop Reorder Reflected in Both Panels (Priority: P1)

As a user, when I drag a snippet to a new position in the Snippets panel, I expect the new order to be immediately reflected both in the Snippets panel itself and inside the corresponding skill group in the Output window. Currently, the Snippets panel ignores the stored ordering and always re-sorts alphabetically, so drags appear to have no effect.

**Why this priority**: Equal priority with Story 1 — drag-and-drop is the primary user mechanism for controlling output order; if the reorder is not reflected anywhere it is effectively broken.

**Independent Test**: Drag an active snippet to a new position in the Snippets panel, then verify both the Snippets panel and the Output window show the updated order without a page reload.

**Acceptance Scenarios**:

1. **Given** an agent with three active snippets displayed in the Snippets panel, **When** the user drags the bottom snippet to the top position, **Then** the Snippets panel immediately shows the snippet at the top.
2. **Given** the same drag operation as above, **When** the Output window is viewed, **Then** the corresponding skill group accordion reflects the same new top-to-bottom order.
3. **Given** a drag operation that does not change position (dropped at same index), **When** the drag completes, **Then** the order in both panels is unchanged.

---

### User Story 3 - Inactive Snippets Remain Stable in Snippets Panel (Priority: P2)

As a user, when I reorder active snippets via drag-and-drop, inactive snippets that I have not activated should maintain a consistent, predictable position in the Snippets panel relative to the active snippets so I can still locate and activate them.

**Why this priority**: Supporting concern — the primary fix is for active snippet ordering, but the behaviour of inactive snippets during reorder must not regress.

**Independent Test**: Activate two of three snippets, drag one active snippet, and confirm the inactive snippet's position in the panel is stable and predictable.

**Acceptance Scenarios**:

1. **Given** three snippets where two are active and one is inactive, **When** the user drags one active snippet to a new position, **Then** the inactive snippet remains visible in the panel at a consistent position (e.g., alphabetically appended after all active snippets).
2. **Given** the above state, **When** the user activates the previously inactive snippet, **Then** it is appended to the end of the active ordering.

---

### Edge Cases

- What happens when a snippet belongs to multiple skills — does it appear in both skill groups in the output, or only one? (Assumption: deduplicated; appears only in the first matching skill group per current design.)
- What happens when all snippets in a skill group are deactivated — does the skill group header disappear from the output? (Assumption: yes, the group is hidden.)
- What happens when an agent has no `activeOrder` data (e.g., freshly created or migrated from an older save) — does the output fall back gracefully? (Assumption: falls back to alphabetical ordering.)
- What happens when a snippet is dragged past the boundary of the current skill filter view into a position occupied by an inactive snippet?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Snippets panel MUST display active snippets in the order defined by the agent's stored snippet ordering, not alphabetically by name.
- **FR-002**: Inactive snippets MUST remain visible in the Snippets panel in a consistent, predictable position (alphabetical by name, appended after all active snippets) regardless of drag operations on active snippets.
- **FR-003**: The Output window MUST display active snippets within each skill group accordion in the same order that those snippets appear in the Snippets panel (i.e., the agent's stored snippet ordering), not alphabetically by name.
- **FR-004**: When a user drags a snippet to a new position in the Snippets panel, the agent's stored snippet ordering MUST be updated to reflect the new position immediately.
- **FR-005**: After a drag-and-drop reorder, both the Snippets panel and the Output window MUST reflect the new order without requiring a page reload or manual refresh.
- **FR-006**: The ordering of skill groups in the Output window accordion (group-level drag-and-drop) MUST be unaffected by snippet-level reordering.
- **FR-007**: Multi-skill snippets (belonging to more than one skill) MUST continue to be deduplicated in the output — appearing only once, in the first skill group where they qualify.

### Key Entities

- **Agent**: Owns `activeOrder: string[]` — the canonical ordered list of active snippet IDs for that agent. This array drives snippet display order in both the Snippets panel and the Output window.
- **Snippet**: A text fragment with a `skills: Set<string>` membership. Has no intrinsic order; order is defined per-agent via `activeOrder`.
- **Skill Group**: A logical grouping of active snippets in the Output window, keyed by skill ID. Snippet order within a group is derived from `activeOrder`, not from alphabetical name sorting.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: After activating two or more snippets with the same skill tag in any order, 100% of those snippets appear in the Output window skill group in activation order (not alphabetical order).
- **SC-002**: After performing a drag-and-drop reorder in the Snippets panel, the new order is visible in both the Snippets panel and the Output window within one render cycle (no reload required).
- **SC-003**: Drag-and-drop reorder operations produce a visually consistent result 100% of the time — there are no cases where the panel and output show different orderings for the same agent's active snippets.
- **SC-004**: Zero regressions in skill-group-level reordering (dragging accordion sections in the Output window) as a result of this fix.

## Assumptions

- `activeOrder` on the Agent is the intended source of truth for per-agent snippet ordering. No new data field needs to be introduced.
- The Snippets panel currently always sorts alphabetically regardless of `activeOrder`; this is the root display bug.
- `selectSkillGroupsForOutput` and the related compiler function both call `sortByName` within skill groups, ignoring `activeOrder`; this is the root output bug.
- Inactive snippets should not be stored in `activeOrder` (they are filtered out on deactivation); their panel position should fall back to alphabetical.
- The drag-and-drop handler in the Snippets panel currently filters dragged IDs to only active snippet IDs before calling `reorderSnippets`; this logic may need adjustment to correctly rebuild `activeOrder` when the visual list includes both active and inactive snippets.
