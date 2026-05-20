# Feature Specification: In-App Documentation Modal

**Feature Branch**: `016-in-app-docs`  
**Created**: 2026-05-08  
**Status**: Draft  
**Input**: User description: "a new feature is going to be added. it will be launched by a docs icon in the top right corner to the left the light and dark theme toggle button. the icon for this button will be a book icon. when the button is clicked, a full heroui modal will open. at the top of the modal will be three tabs. one will be prompt engineering, then prompting tips, and the final one is sources. when a tab is clicked, the area below it will fill in with text. use a fake text snippet like lorem ipsum. when clicking on different tabs, the text will be replaced. this component is an in-app documentation system. structure the files in the current style of the project."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Open the Documentation Modal (Priority: P1)

A user clicks the book icon in the app header to open the in-app documentation modal. The modal opens full-width and presents three content tabs: Prompt Engineering, Prompting Tips, and Sources. The first tab (Prompt Engineering) is selected by default and its content is visible immediately.

**Why this priority**: This is the core entry point and minimum viable interaction — without it, no documentation content can be accessed.

**Independent Test**: Can be fully tested by clicking the book icon and verifying the modal opens with the Prompt Engineering tab active and its content displayed.

**Acceptance Scenarios**:

1. **Given** the app is open and the header is visible, **When** the user clicks the book icon button, **Then** a large modal opens displaying documentation content with the Prompt Engineering tab selected by default.
2. **Given** the documentation modal is open, **When** the user clicks the close button (or presses Escape), **Then** the modal closes and the user returns to the main app view.

---

### User Story 2 - Switch Between Documentation Tabs (Priority: P2)

A user navigates between the three documentation tabs — Prompt Engineering, Prompting Tips, and Sources — by clicking each tab. The content area below the tabs updates to show the selected tab's content, replacing the previous content.

**Why this priority**: Tab navigation is the core interaction within the modal; without it the documentation feature is effectively a single page.

**Independent Test**: Can be fully tested by clicking each tab in sequence and verifying the content area changes to match the selected tab.

**Acceptance Scenarios**:

1. **Given** the documentation modal is open with Prompt Engineering selected, **When** the user clicks the Prompting Tips tab, **Then** the Prompting Tips content replaces the Prompt Engineering content in the content area.
2. **Given** the documentation modal is open with Prompting Tips selected, **When** the user clicks the Sources tab, **Then** the Sources content replaces the Prompting Tips content.
3. **Given** any tab is active, **When** the user clicks the already-active tab, **Then** no change occurs and the content remains visible.

---

### User Story 3 - Access Docs Icon in Header (Priority: P3)

The book icon button is permanently visible in the app header, positioned to the left of the light/dark theme toggle button. It is accessible at all times regardless of which panel or state the app is in.

**Why this priority**: The icon placement and always-visible presence is a usability concern — the feature works without perfect placement, but discoverability depends on it.

**Independent Test**: Can be fully tested by verifying the book icon appears in the header to the left of the theme toggle in both light and dark modes.

**Acceptance Scenarios**:

1. **Given** the app is loaded, **When** the user views the header, **Then** a book icon button is visible to the left of the theme toggle button.
2. **Given** the app is in dark mode, **When** the user views the header, **Then** the book icon is styled consistently with the dark theme.
3. **Given** the app is in light mode, **When** the user views the header, **Then** the book icon is styled consistently with the light theme.

---

### Edge Cases

- What happens when the modal is opened while a long compilation output is visible in the output panel — modal should layer on top without disrupting app state.
- How does the modal behave on very small viewports — content should remain scrollable and tabs should not overflow or wrap awkwardly.
- What happens if the user opens the modal, switches tabs, then closes and reopens — the default tab (Prompt Engineering) is shown fresh each time (no state persistence needed).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The app header MUST display a book icon button permanently, positioned to the left of the theme toggle button.
- **FR-002**: Clicking the book icon MUST open a full-size documentation modal overlay.
- **FR-003**: The documentation modal MUST contain exactly three tabs in this order: Prompt Engineering, Prompting Tips, Sources.
- **FR-004**: The modal MUST display the Prompt Engineering tab as the default active tab when opened.
- **FR-005**: Clicking any tab MUST replace the content area with that tab's associated content.
- **FR-006**: Each tab MUST have distinct, static placeholder content (lorem ipsum style) for this initial implementation.
- **FR-007**: The modal MUST be closable via a close button and via the Escape key.
- **FR-008**: The modal MUST render using the existing HeroUI modal component, consistent with other modal usage in the project.
- **FR-009**: The documentation component MUST be structured as a self-contained component following the existing project file conventions.

### Assumptions

- Content for each tab is static placeholder text for this implementation; real content will be filled in separately.
- No tab state is persisted between modal open/close sessions — default tab always shown on open.
- The modal is not accessible via any keyboard shortcut (icon click only) in this initial implementation.
- The book icon uses `lucide-react` (already in the project stack) for consistency.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can open the documentation modal in one click from any app state.
- **SC-002**: All three documentation tabs are accessible and display distinct content within a single modal session.
- **SC-003**: The documentation modal closes without affecting any app state (active agent, snippets, output) that was present before opening.
- **SC-004**: The book icon is visually identifiable and correctly positioned in the header in both light and dark themes.
- **SC-005**: Tab switching replaces content instantly with no visible delay or flicker.
