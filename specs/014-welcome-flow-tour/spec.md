# Feature Specification: Welcome Modal & Onboarding Tour

**Feature Branch**: `014-welcome-flow-tour`  
**Created**: 2026-05-05  
**Status**: Implemented  
**Input**: User description: "Lets add a welcome step that appears as a modal if the app has no session in storage (a new user). Welcome Step: The first step should present the user with a welcome message across the top and a row of three options followed by a last row. Row 1 - full width - welcome copy. Row 2 - 3-col - New File - New Seeded File - Import. Row 3 - full width - Not sure, let's take the tour. The tour should use intro.js. We should also add a question mark icon button to the primary nav that can be used to trigger the tour if a user needs help."

## Clarifications

### Session 2026-05-05

- Q: How should the tour step visual highlight be anchored relative to the panel being described? → A: Each tour step's outline/highlight must encompass the specific UI panel element it is describing — not a generic centered overlay.
- Q: What happens to the welcome modal when the user selects "Not sure, let's take the tour", and what is the modal behavior during/after the tour? → A: The modal closes immediately when "Not sure" is selected; the tour runs over the live UI; the modal does NOT reappear after the tour ends. Similarly, "New File" closes the modal. "New Seeded File" and "Import" both open a file picker — the modal closes on successful file selection.
- Q: Should the tour path start with an empty app or a pre-populated workspace? → A: The tour auto-loads seed data before launching so all panels are populated during the tour; after the tour ends the user keeps that seeded workspace and can clear or build on it.
- Q: Does "New Seeded File" use built-in seed data or require the user to provide a file? → A: "New Seeded File" opens a file picker so the user selects a JSON seed file; it does not use built-in app seed data.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - First-Time Welcome & Onboarding Path Selection (Priority: P1)

A brand new user opens the app for the first time with no prior session data. They are presented with a centered welcome modal that greets them and gives them three clear ways to get started: begin with an empty workspace, begin with example content, or import an existing file.

**Why this priority**: This is the entry point for every new user. Without a clear starting path, users face a blank app with no guidance. This is the most critical flow to deliver value immediately.

**Independent Test**: Can be tested by clearing localStorage and reloading the app — the modal should appear; selecting any option should dismiss it and leave the user in a working app state.

**Acceptance Scenarios**:

1. **Given** no session data exists in storage, **When** the user loads the app, **Then** the welcome modal appears before the main UI is interactive
2. **Given** the welcome modal is visible, **When** the user selects "New File", **Then** the modal closes and the app initializes with an empty state
3. **Given** the welcome modal is visible, **When** the user selects "New Seeded File", **Then** a file picker opens; on successful file selection the modal closes and the app initializes with the content from the selected file
4. **Given** the welcome modal is visible, **When** the user selects "Import", **Then** a file picker is triggered and upon successful import the modal closes with the imported state loaded
5. **Given** valid session data already exists in storage, **When** the user loads the app, **Then** the welcome modal does NOT appear

---

### User Story 2 - Guided Tour From Welcome Modal (Priority: P2)

A new user who is uncertain how to proceed clicks "Not sure, let's take the tour" from the welcome modal. The modal closes, the app auto-loads seed data so all panels are populated, and an interactive step-by-step guided tour launches walking the user through the four main panels — Agents, Skills, Snippets, and Output. After the tour the user keeps the seeded workspace and can clear or build on it.

**Why this priority**: Users who don't know which starting option to choose need orientation before making a decision. The tour should resolve uncertainty and build confidence in using the app.

**Independent Test**: Can be tested by clicking "Not sure, let's take the tour" — the tour should launch, step through all major UI landmarks, and complete without errors; after completion the user can still select a starting option.

**Acceptance Scenarios**:

1. **Given** the welcome modal is visible, **When** the user clicks "Not sure, let's take the tour", **Then** the guided tour launches (intro.js overlay) starting at the first step
2. **Given** the tour is active, **When** the user advances through steps, **Then** each major panel (Agent List, Skills List, Snippets Panel, Output Window) is highlighted with an outline anchored to that specific panel element and explained in sequence
3. **Given** the user clicks "Not sure, let's take the tour", **When** the action is triggered, **Then** the welcome modal closes immediately, seed data is loaded into the app, and the tour launches over the now-populated UI
4. **Given** the tour has completed or been skipped, **When** the final step or skip action is reached, **Then** a clear completion message is shown and the user lands in the app with the seeded workspace intact; the nav help button (?) is available to re-launch the tour at any time

---

### User Story 3 - Help Button for Returning Users (Priority: P3)

A returning user who wants a refresher on the app's features clicks the question mark icon (?) in the primary navigation bar. The same guided tour launches from step one, walking them through the full UI.

**Why this priority**: Once a user has onboarded, the welcome modal will never appear again. The help button ensures the tour is always accessible for users who need a reminder or are introducing a teammate.

**Independent Test**: Can be tested by clicking the ? icon in the nav — the tour should launch regardless of app state or current session.

**Acceptance Scenarios**:

1. **Given** the app is fully loaded with a session, **When** the user clicks the ? icon in the primary nav, **Then** the guided tour launches from the first step
2. **Given** the tour is launched from the nav, **When** the user completes or skips the tour, **Then** the app returns to its previous state with no data loss
3. **Given** any app state, **When** the ? icon is clicked, **Then** the tour starts — it is never disabled

---

### Edge Cases

- What happens if the user closes the welcome modal without selecting any option (e.g., presses Escape or clicks outside)? The modal should remain open or re-open — users must make an active choice to proceed; there is no implicit "dismiss to empty file."
- What happens if the import file is invalid or the user cancels the file picker? The modal should remain open with an error message, allowing the user to try again or select a different option.
- What happens if the user clears localStorage manually and revisits? The welcome modal should appear again as if it's a first visit.
- What if the guided tour is triggered while the app is mid-edit or has unsaved session changes? The tour should launch without discarding any in-progress work.
- What happens if the user rapidly opens the tour multiple times (e.g., double-clicking the ? icon)? Only one tour instance should run at a time.
- What happens when a returning user clicks "New Session" in the nav? All data is cleared and the welcome modal re-appears so they can choose a new starting path.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST detect the absence of persisted session data in storage on app load and display the welcome modal before the user can interact with the main UI
- **FR-002**: The welcome modal MUST be structured with three rows: (1) a full-width welcome heading and descriptive copy, (2) three equal-width action cards — "New File", "New Seeded File", and "Import" — and (3) a full-width "Not sure, let's take the tour" secondary call-to-action
- **FR-003**: Selecting "New File" MUST initialize the app with a clean empty state (no agents, skills, or snippets) and dismiss the modal
- **FR-004**: Selecting "New Seeded File" MUST open a file picker; on successful selection of a valid JSON file the app initializes with that file's content and the modal closes; on failure or cancellation the modal MUST remain open
- **FR-005**: Selecting "Import" MUST open a file picker; on successful selection of a valid JSON file the app state is replaced with the imported content and the modal closes; on failure or cancellation the modal MUST remain open
- **FR-006**: The welcome modal MUST NOT be dismissible by clicking outside or pressing Escape; the only dismissal paths are: selecting "New File", successfully completing "New Seeded File" or "Import" file selection, or selecting "Not sure, let's take the tour"
- **FR-007**: Clicking "Not sure, let's take the tour" MUST launch a multi-step guided tour using intro.js where each step's highlight outline is anchored to the specific UI panel it describes; the tour covers the four main panels in sequence: Agent List, Skills List, Snippets Panel, Output Window
- **FR-008**: The tour MUST include a minimum of one step per major panel and a welcome/completion step; total steps MUST be between 6 and 12
- **FR-009**: Selecting "Not sure, let's take the tour" MUST immediately close the welcome modal, auto-load the built-in seed data set so all panels are populated, then launch the tour; after the tour ends the seeded workspace remains — the modal does NOT reappear
- **FR-010**: A question mark icon button MUST be added to the primary navigation bar (`AppHeader`), visually consistent with existing nav controls
- **FR-011**: Clicking the ? icon button MUST launch the same guided tour as FR-007 at any point when the main app is loaded; it MUST work regardless of current session state
- **FR-012**: Only one instance of the tour may be active at a time; triggering the tour while it is already running MUST be a no-op or restart from step one
- **FR-013**: The "New Session" button in the nav MUST clear all current data and re-display the welcome modal so returning users can switch starting paths; the modal MUST be non-dismissible until a path is chosen

### Key Entities

- **WelcomeModal**: A blocking modal UI state that is active when no session baseline exists. Tracks: `isVisible: boolean`. Dismissed only via explicit user action. Not persisted.
- **OnboardingTour**: An intro.js–driven overlay sequence. Tracks: `isActive: boolean`. Triggered from both the welcome modal CTA and the nav help button. Not persisted — always restarts from step one.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: New users encounter the welcome modal on first load within 500ms of the app becoming interactive — no blank-state confusion
- **SC-002**: All three onboarding paths (new file, seeded, import) are reachable in exactly one click from the welcome modal
- **SC-003**: The guided tour covers all four main app panels and can be completed by a new user in under 3 minutes
- **SC-004**: The help button (? icon) is reachable from any app state in one click without navigating away or opening a settings menu
- **SC-005**: After completing any onboarding path, the app is in a functional, ready-to-use state — no additional setup steps required

## Assumptions

- "New Seeded File" and "Import" both use the same file picker and file format (app state JSON); the semantic difference is user intent — "New Seeded File" frames the file as a starting template, "Import" frames it as restoring a prior session. Both use the existing `importStateFromFile` utility.
- The "Not sure, let's take the tour" path uses the built-in `seedData` store action (the same seed set used elsewhere in the app) to populate the workspace before launching the tour.
- "No session in storage" is defined as: the Zustand `persist` key (`llamanomicon-v2`) is absent from localStorage, or the `baseline` value within it is empty/null.
- The welcome modal does not need its own persistence entry — its appearance is derived entirely from the absence of a session, not from a separate "hasSeenWelcome" flag.
- The guided tour steps are fixed (not user-configurable) for v1.
- The Import option on the welcome modal reuses the existing `importStateFromFile` utility without modification.
- Intro.js will be added as a new dependency; no existing tour infrastructure exists.
