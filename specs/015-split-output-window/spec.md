# Feature Specification: Split Output Window

**Feature Branch**: `015-split-output-window`  
**Created**: 2026-05-07  
**Status**: Draft  
**Input**: User description: "the output section should be split into two components. the top component will be the output structure and will be the current implementation. the bottom will be raw output which shows the contents of the snippet text. the window should be toggleable between the current copy xml and clipboard outputs. the copy button should be moved down to this window as well."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Output Structure and Raw Text Side by Side (Priority: P1)

A user has activated snippets across several skills and wants to review both the organized structure (which snippets are grouped under which skills) and the actual raw text that will be copied. Currently these are combined, making it hard to distinguish the structural view from the content view.

**Why this priority**: This is the core of the feature — splitting the panel into two distinct sub-sections. All other stories depend on this layout change existing first.

**Independent Test**: Can be fully tested by activating snippets and observing that the output panel displays two visually distinct sub-sections: a top "Output Structure" section (accordion with skill group headings and snippet names) and a bottom "Raw Output" section (the compiled text content).

**Acceptance Scenarios**:

1. **Given** an agent has active snippets, **When** the user looks at the output panel, **Then** they see two distinct sub-sections: Output Structure (top) and Raw Output (bottom).
2. **Given** no snippets are active, **When** the user looks at the output panel, **Then** both sub-sections show appropriate empty states.
3. **Given** snippets are active, **When** the user views the Output Structure section, **Then** it displays the skill group accordion with snippet names (not snippet text content).
4. **Given** snippets are active, **When** the user views the Raw Output section, **Then** it displays the compiled snippet text content in the selected format.

---

### User Story 2 - Toggle Between XML and Plain Text Output Formats (Priority: P2)

A user wants to switch the Raw Output section between XML-formatted output (for LLMs that benefit from structured tags) and plain text output (for clipboard use in other contexts), without needing two separate copy buttons.

**Why this priority**: The toggle is the mechanism that replaces the two-button header approach and consolidates the format choice into the Raw Output section itself.

**Independent Test**: Can be fully tested by activating snippets, switching the Raw Output toggle, and confirming the displayed text changes between XML and plain text formats — independently verifiable before any copy behavior is tested.

**Acceptance Scenarios**:

1. **Given** the Raw Output section is visible, **When** the user views it initially, **Then** the toggle defaults to the XML format.
2. **Given** the toggle is set to XML, **When** the user views the Raw Output, **Then** it displays snippet text wrapped in XML skill-group tags.
3. **Given** the toggle is set to plain text, **When** the user views the Raw Output, **Then** it displays snippet text as a flat string joined by newlines, with no XML tags.
4. **Given** the user switches the toggle, **When** the format changes, **Then** the displayed text updates immediately with no page reload or navigation.

---

### User Story 3 - Copy Raw Output with a Single Button (Priority: P3)

A user has composed their prompt and wants to copy the output. Instead of choosing between two separate copy buttons in the header, they use a single copy button in the Raw Output section that copies whichever format is currently selected by the toggle.

**Why this priority**: Depends on Story 2 (toggle) existing. Consolidates the UX, but the structural split (P1) and toggle (P2) deliver most of the value independently.

**Independent Test**: Can be fully tested by setting the toggle, clicking the copy button, and confirming the clipboard receives the correct format — independently verifiable.

**Acceptance Scenarios**:

1. **Given** the toggle is set to XML, **When** the user clicks the copy button, **Then** the XML-formatted output is copied to the clipboard.
2. **Given** the toggle is set to plain text, **When** the user clicks the copy button, **Then** the plain text output is copied to the clipboard.
3. **Given** no snippets are active, **When** the user views the Raw Output section, **Then** the copy button is disabled.
4. **Given** the user clicks copy, **When** the copy succeeds, **Then** the button shows a brief visual confirmation and returns to its default state.
5. **Given** the output panel header, **When** the user looks at it, **Then** no copy buttons appear in the header (they have been removed).

---

### Edge Cases

- What happens when the active agent has no skill-grouped snippets (only untagged)? Both sections should render correctly with the "Untagged" group.
- What happens when output is empty (no agent selected or no active snippets)? The Raw Output section shows an appropriate empty state and the copy button is disabled.
- What happens when the user toggles the format while viewing a long output? The section should update the displayed content without losing scroll position if possible.
- What format does the toggle default to on first load and after page refresh? Defaults to XML; the selected format is not persisted across sessions.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The output panel MUST be divided into two vertically-stacked sub-sections: "Output Structure" (top) and "Raw Output" (bottom).
- **FR-002**: The Output Structure section MUST display the existing skill-group accordion showing skill group headings and the names of active snippets within each group (not the snippet text content).
- **FR-003**: The Raw Output section MUST display the compiled text content of all active snippets in the currently selected format.
- **FR-004**: The Raw Output section MUST include a toggle control allowing the user to switch between XML format and plain text format.
- **FR-005**: The toggle MUST default to XML format on load; the selected format does NOT need to be persisted across sessions.
- **FR-006**: The Raw Output section MUST include a single copy button that copies the content in the currently selected format.
- **FR-007**: The copy button MUST be disabled when there is no compiled output (no active snippets or no agent selected).
- **FR-008**: The copy button MUST display a brief visual confirmation after a successful copy action.
- **FR-009**: The two existing copy buttons in the output panel header MUST be removed.

### Key Entities

- **Output Format**: The selected rendering mode for the Raw Output section — either XML (skill-group tags wrapping bullet-listed snippet text) or plain text (newline-joined snippet text). Ephemeral UI state, not persisted.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can identify and distinguish the structural view (snippet names by group) from the raw content view (actual text) without any tooltip or explanation.
- **SC-002**: Users can switch between XML and plain text output in one interaction (a single toggle click).
- **SC-003**: Users can copy output in their chosen format in two interactions or fewer: select format, click copy.
- **SC-004**: The output panel header contains no copy buttons after implementation.
- **SC-005**: All existing output compilation behavior (skill group ordering, deduplication, XML structure) is preserved exactly in the new layout.

## Assumptions

- The toggle defaults to XML format (matching the most prominent existing button's behavior).
- "Plain text" format maps to the existing `compileOutputBySkillGroup` / `selectCompiledOutput` selector (newline-joined).
- "XML format" maps to the existing `compileOutputXML` / `selectCompiledOutputXML` selector.
- The Output Structure section retains all existing accordion behavior (expand/collapse, multi-expand).
- No changes are made to the compiler logic or data model.
- The selected output format (XML vs plain text) is ephemeral session UI state and is not added to `OutputSettings` or persisted.
