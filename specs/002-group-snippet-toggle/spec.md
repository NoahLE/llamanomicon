# Feature Specification: Group & Snippet Toggle Behavior

**Feature Branch**: `001-group-snippet-toggle`
**Created**: 2026-03-23
**Status**: Draft
**Input**: User description: "groups and text snippets are missing toggle commands. when groups is toggled, all text snippets are enabled or disabled. when a snippet is toggled, the group will show an indicator for all, multiple, or no snippets selected. when a text snippet is enabled, it should appear in the output window."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Toggle Group Cascades to All Snippets (Priority: P1)

A user selects a flow and wants to quickly enable or disable all snippets within a group at once. When they toggle the group's activation switch, every snippet belonging to that group is simultaneously enabled or disabled. This allows the user to batch-activate or batch-deactivate content without individually toggling each snippet.

**Why this priority**: This is the most critical interaction — without cascade behavior, toggling a group has no visible effect on snippets or output, making the group toggle feel broken.

**Independent Test**: Can be tested fully by toggling a group switch and observing that all snippet switches in that group change state and the output window updates accordingly.

**Acceptance Scenarios**:

1. **Given** a flow is selected and a group with 3 snippets is inactive, **When** the user toggles the group ON, **Then** all 3 snippets in that group become active and their content appears in the output window.
2. **Given** a flow is selected and a group with 3 active snippets is toggled OFF, **When** the user toggles the group OFF, **Then** all 3 snippets become inactive and their content is removed from the output window.
3. **Given** no flow is selected, **When** the user attempts to toggle a group, **Then** the toggle is disabled and no action occurs.

---

### User Story 2 - Group Shows Snippet Selection Indicator (Priority: P2)

A user wants to know at a glance how many snippets within a group are currently active without opening the snippets panel. The group row displays a visual indicator that communicates one of three states: all snippets selected, some snippets selected, or no snippets selected.

**Why this priority**: Without an indicator, users lose situational awareness — they cannot tell whether a group has partial, full, or zero snippet coverage without drilling into the snippets panel.

**Independent Test**: Can be tested by individually toggling snippets while observing the group row indicator updates in real-time to reflect all/partial/none selection states.

**Acceptance Scenarios**:

1. **Given** a group has 3 snippets and all 3 are active, **When** the user views the groups list, **Then** the group row shows an "all selected" indicator (e.g., solid badge or checkmark).
2. **Given** a group has 3 snippets and 1–2 are active, **When** the user views the groups list, **Then** the group row shows a "partial" indicator (e.g., a dash or mixed state badge).
3. **Given** a group has 3 snippets and none are active, **When** the user views the groups list, **Then** the group row shows a "none selected" indicator (e.g., empty badge or no checkmark).
4. **Given** a group has no snippets, **When** the user views the groups list, **Then** the group row shows no indicator or a neutral empty state.
5. **Given** the user individually toggles a snippet ON while others are OFF, **When** the indicator is observed, **Then** it shows "partial" state without requiring interaction with the group row.

---

### User Story 3 - Active Snippets Appear in Output Window (Priority: P3)

A user toggles individual snippets within an active group and observes the output window update in real-time. Each enabled snippet's content flows into the output, and disabling a snippet immediately removes it from the output.

**Why this priority**: This completes the core interaction loop — the output window must reflect snippet-level granularity. Without this, the per-snippet toggle appears decorative.

**Independent Test**: Can be tested by toggling individual snippets within an active group and verifying the output window content changes immediately.

**Acceptance Scenarios**:

1. **Given** a flow is selected and a group is active with 3 snippets, **When** the user enables snippet 2 (while snippets 1 and 3 remain disabled), **Then** only snippet 2's text appears in the output window under that group's heading.
2. **Given** snippet 2 is active and visible in the output, **When** the user toggles snippet 2 OFF, **Then** snippet 2's text is immediately removed from the output window.
3. **Given** a group is toggled OFF (all snippets disabled via cascade), **When** the user re-enables the group, **Then** all snippets become active again and their content appears in the output window.

---

### Edge Cases

- What happens when a group has no snippets and is toggled on? The group toggle should succeed (group becomes active) but no snippet changes occur and the output shows nothing for that group.
- What happens when all snippets are individually toggled off after a group cascade-ON? The group toggle switch automatically flips to OFF (group becomes inactive), the indicator shows "none selected", and the output shows nothing for that group.
- What happens when snippets are individually toggled in a group that is itself inactive? The snippet toggles update their state, but content does not appear in the output until the group is also active.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST cascade-enable all snippets in a group when the group is toggled ON by the user.
- **FR-002**: System MUST cascade-disable all snippets in a group when the group is toggled OFF by the user.
- **FR-003**: System MUST display a visual indicator on each group row reflecting the snippet selection state: all selected, partially selected, or none selected.
- **FR-004**: The snippet selection indicator MUST update in real-time as individual snippets are toggled without requiring a page reload or manual refresh.
- **FR-005**: The output window MUST include content only from snippets that are individually active within an active group.
- **FR-006**: Individual snippet toggles MUST work independently of group cascade — toggling one snippet must not affect others in the group.
- **FR-007**: Group and snippet toggles MUST be disabled (non-interactive) when no flow is selected.
- **FR-008**: When the last active snippet in a group is individually toggled OFF, the system MUST automatically set the group's active state to OFF.

### Key Entities _(include if feature involves data)_

- **Group**: A named collection of snippets; has an active/inactive state per flow; when toggled, cascades its state to all owned snippets.
- **Snippet**: A text fragment belonging to a group; has an independent active/inactive state per flow; contributes its text to the output when both it and its group are active.
- **Flow Activation**: The saved record of which groups and snippets are active; updated when the user toggles either a group (cascade) or an individual snippet.
- **Snippet Selection State**: Derived view on a group — computed from how many of the group's snippets are active (all / some / none).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Toggling a group switch changes the active state of all snippets in that group within one user interaction (no additional steps required).
- **SC-002**: The group row indicator accurately reflects snippet selection state (all/partial/none) at all times without requiring user navigation away from and back to the groups list.
- **SC-003**: Changes to snippet toggle state are reflected in the output window immediately — no noticeable delay between toggling and output update.
- **SC-004**: A user can compose a complete prompt output entirely through toggle interactions (no text editing required once snippets are created).

## Clarifications

### Session 2026-03-23

- Q: When all snippets in a group are individually toggled OFF, should the group switch auto-flip to OFF? → A: Yes — group switch automatically flips OFF when all snippets become individually inactive (FR-008).

## Assumptions

- Group activation is a prerequisite for snippet output: a snippet's text only appears in the output if its parent group is also active. This two-layer gate is preserved — the cascade behavior (FR-001/FR-002) satisfies this by keeping group and snippet states synchronized.
- The snippet selection indicator derives its state from the active flow's activation record; if no flow is selected, no indicator is shown (or it shows a neutral/disabled state).
- The cascade triggered by a group toggle is a full all-or-nothing operation — there is no partial cascade. Individual snippet overrides after a cascade are supported (users may freely toggle individual snippets after a group cascade).
