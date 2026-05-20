# Feature Specification: Tour Raw Output Step and Copy Cleanup

**Feature Branch**: `017-tour-raw-output`  
**Created**: 2026-05-10  
**Status**: Draft  
**Input**: User description: "Add the raw output panel to the welcome tour and update all tour copy to not use em-dashes"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - New User Sees Raw Output Explained (Priority: P1)

A first-time user runs the welcome tour and reaches a step that introduces the Raw Output panel, explaining the format toggle (XML / Text) and the copy button.

**Why this priority**: The Raw Output panel is a core V1 feature added in 015-split-output-window but is currently absent from the tour. New users have no guided context for the format toggle or copy button.

**Independent Test**: Run the tour to completion and verify a Raw Output step appears after the Output Window step, highlighting the Raw Output section with a tooltip that covers its purpose.

**Acceptance Scenarios**:

1. **Given** the tour is active and the user advances past the Output Structure step, **When** they click Next, **Then** a tour step appears that highlights the Raw Output panel specifically.
2. **Given** the Raw Output tour step is visible, **When** the user reads the tooltip, **Then** it explains the XML/Text format toggle and the copy button.
3. **Given** the tour reaches the Raw Output step, **When** the tooltip is displayed, **Then** the tour highlight targets the Raw Output section, not the full Output Window column.

---

### User Story 2 - All Tour Copy is Em-Dash Free (Priority: P2)

Any user who runs the tour reads tooltips that use only standard punctuation with no em-dashes.

**Why this priority**: Consistent, clean copy is a presentation-quality requirement. Em-dashes are a stylistic mismatch with the app's voice and can render inconsistently across environments.

**Independent Test**: Read every tour tooltip from start to finish and confirm zero em-dash characters appear in any step title or intro text.

**Acceptance Scenarios**:

1. **Given** the tour is running, **When** the user advances through every step, **Then** no tooltip contains an em-dash character.
2. **Given** the Agent List step is displayed, **When** the user reads the intro, **Then** "Agents are your prompt profiles — one per context" is rewritten without an em-dash while preserving meaning.
3. **Given** the Output Window step is displayed, **When** the user reads the intro, **Then** "send it straight to your clipboard — ready to paste" is rewritten without an em-dash while preserving meaning.

---

### Edge Cases

- What happens if the Raw Output section is not yet rendered when the tour step tries to highlight it? The Raw Output panel is always mounted regardless of agent/snippet state, so the target element is always present.
- Does inserting a new step shift the user experience? Step numbers are not shown in this tour configuration, so insertion order is the only concern.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The tour MUST include a dedicated step that highlights the Raw Output panel, positioned after the Output Structure step and before the Session Controls step.
- **FR-002**: The Raw Output tour step MUST describe the XML/Text format toggle and the copy button in its intro text.
- **FR-003**: The Raw Output component MUST expose a `data-tour-target="raw-output"` attribute so the tour highlight can target it precisely.
- **FR-004**: Every tour step title and intro text MUST be free of em-dash characters.
- **FR-005**: Em-dashes in existing steps MUST be replaced with commas, periods, or rephrased clauses that preserve original meaning.
- **FR-006**: The new Raw Output step copy MUST NOT introduce em-dashes.
- **FR-007**: The existing "Output Window" step MUST be updated to scope its copy to the Output Structure accordion specifically (the skill-grouped view), so users understand it as distinct from the Raw Output panel introduced in the following step.

### Key Entities

- **Tour Step**: A single tooltip in the welcome tour sequence. Has an element selector, optional title, and intro body text.
- **Raw Output panel**: The lower sub-section of the Output column containing the format toggle (XML / Text) and the copy button, targeted by `data-tour-target="raw-output"`.

## Clarifications

### Session 2026-05-10

- Q: Should the existing "Output Window" step copy be updated to scope it to the Output Structure accordion now that Raw Output gets its own step? → A: Yes — update the existing step to specifically introduce the Output Structure accordion, then the new Raw Output step introduces the flat text panel.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The tour contains exactly one more step than the baseline (9 steps total vs. 8 currently).
- **SC-002**: Zero em-dash characters appear across all tour step titles and intro text.
- **SC-003**: The Raw Output tour step highlights the Raw Output panel element, not the broader Output column.
- **SC-004**: The Raw Output step appears in logical sequence: after the Output Structure step and before the Session Controls step.
- **SC-005**: The existing Output Window step copy specifically describes the Output Structure accordion (skill-grouped view), not the full output column.
