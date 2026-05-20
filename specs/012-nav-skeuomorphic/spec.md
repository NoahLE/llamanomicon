# Feature Specification: Nav Skeuomorphic Design

**Feature Branch**: `012-nav-skeuomorphic`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: User description: "add skeuomorphic design to the nav in both the light and dark modes of the ui following the project specs and guidelines."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Dark Mode Nav Has Physical Depth (Priority: P1)

A user opens the app in dark mode (the default) and immediately perceives the navigation bar as a raised, physical surface — like a bar panel on a control board — rather than a flat strip. The title reads as etched or embossed lettering, and the bar has a visible top-edge highlight simulating a light source above.

**Why this priority**: Dark mode is the default experience, so this must land first. It defines the depth vocabulary (shadows, highlights, surface color) that light mode then adapts.

**Independent Test**: Load the app in dark mode without switching themes; the nav bar must visually read as elevated — independently verifiable with no other work needed.

**Acceptance Scenarios**:

1. **Given** the app is in dark mode, **When** the page loads, **Then** the nav bar surface appears raised above the page background with a visible drop shadow beneath it and a subtle highlight on its top edge.
2. **Given** the app is in dark mode, **When** the user views the nav title "Llamanomicon", **Then** the text appears engraved or embossed against the nav surface (not flat).
3. **Given** the app is in dark mode, **When** the user inspects the nav, **Then** all color values used are drawn from the design token system — no hardcoded values.

---

### User Story 2 - Light Mode Nav Has Matching Physical Depth (Priority: P2)

A user switches to light mode and the nav bar retains the same physical depth language — still raised, still having a top-edge highlight and base shadow — adapted to the lighter color palette. It does not look like the dark nav re-skinned in white; the shadows and highlights are recalibrated for a light surface.

**Why this priority**: Without light mode adaptation, the skeuomorphic effect either disappears (invisible shadows on light background) or looks broken (dark shadows look harsh and wrong). Both modes must feel intentional.

**Independent Test**: Toggle to light mode; nav bar must still appear as an elevated physical surface — testable independently by switching the theme.

**Acceptance Scenarios**:

1. **Given** the app is in light mode, **When** the page loads, **Then** the nav bar appears as a raised panel with visible depth appropriate for the light palette.
2. **Given** the app is in light mode, **When** the user views the nav, **Then** shadows and highlights use tokens appropriate for light mode — the nav does not appear washed out or have dark-mode shadows bleeding through.
3. **Given** the user toggles between light and dark mode, **When** the theme changes, **Then** the nav's skeuomorphic treatment transitions cleanly without layout shifts or visual artifacts.

---

### User Story 3 - Nav Buttons Feel Tactile and Pressable (Priority: P3)

The interactive controls in the nav — the theme toggle button and the Data dropdown trigger — look like physical buttons: raised at rest and pressing inward on activation. Users receive a tactile visual cue when interacting with them.

**Why this priority**: Tactile buttons reinforce the overall skeuomorphic feel and provide interactive feedback. The nav reads as coherent only when its interactive elements match the depth vocabulary of the surface they sit on.

**Independent Test**: Click the theme toggle and the Data dropdown trigger; each must visually depress on press — testable with no dependency on dark/light mode work.

**Acceptance Scenarios**:

1. **Given** any theme mode, **When** the user hovers over a nav button, **Then** the button subtly lifts or highlights to signal interactivity.
2. **Given** any theme mode, **When** the user presses and holds a nav button, **Then** the button appears to press inward (inset shadow replaces drop shadow).
3. **Given** any theme mode, **When** the user releases a nav button, **Then** the button returns to its raised resting state.

---

### Edge Cases

- What happens when the nav bar is rendered before the theme is resolved? The default dark-mode styling must apply immediately without a visible flash to the wrong theme.
- How does the nav depth appearance hold up on high-contrast accessibility settings? Depth cues must not be the sole means of conveying information — all interactive elements retain visible focus indicators.
- What happens on very narrow viewports where the title and controls are crowded? The skeuomorphic surface treatment must not break the layout; surface depth is cosmetic and must not interfere with responsive behavior.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The nav bar surface MUST appear visually elevated above the page background in both dark and light modes using shadows and border highlights drawn from the design token system.
- **FR-002**: The nav bar MUST display a top-edge highlight border that simulates a directional light source from above, adapted for each color mode.
- **FR-003**: The nav bar MUST display a bottom shadow that separates it from the content below, adapted for each color mode.
- **FR-004**: The nav title text MUST appear engraved or embossed against the nav surface (not flat) in both color modes.
- **FR-005**: Nav interactive elements (theme toggle, Data dropdown trigger) MUST display a raised resting state and an inset pressed state in both color modes.
- **FR-006**: All color values used for the skeuomorphic treatment MUST reference design tokens — no hardcoded hex, rgb, or named color values.
- **FR-007**: The nav's visual treatment MUST transition without layout shift when the user toggles between dark and light mode.
- **FR-008**: All interactive nav elements MUST retain visible keyboard focus indicators independent of the skeuomorphic depth treatment.
- **FR-009**: The skeuomorphic treatment MUST not break the existing nav layout (flex row, title left, controls right).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of color values applied to the nav skeuomorphic treatment reference design tokens — zero hardcoded color values remain after implementation.
- **SC-002**: The nav bar's raised appearance is visually distinguishable from the page background in both dark and light modes when viewed at standard display brightness — verifiable by visual review on each theme.
- **SC-003**: Theme toggle between dark and light mode produces no observable layout shift in the nav — verified by measuring zero CLS contribution from the nav during toggle.
- **SC-004**: All interactive nav buttons pass WCAG 2.1 AA focus-visibility requirements — each control has a visible focus ring independent of shadow styling.
- **SC-005**: The skeuomorphic nav passes visual review in both themes from at least two reviewers before merge — no "looks flat" or "shadows look wrong" feedback remains unresolved.

## Assumptions

- The nav bar refers to the `AppHeader` component — the horizontal bar spanning the full top of the app containing the "Llamanomicon" title, DataControls dropdown, and ThemeButton.
- "Light and dark modes" refers to the two themes already toggled by `ThemeButton` using the existing `useTheme` hook.
- Design tokens for shadows and highlights will be added to the token system if they do not already exist — tokens are the single source of truth for all colors.
- "Engraved/embossed" title treatment means a subtle text-shadow effect consistent with the neoskeumorphic style, not a decorative font change.
- Micro-interaction on button press (inset shadow) is the extent of button animation — no complex sequences that would distract from the productivity context.
- The nav does not currently have a background color distinct from the page; adding one (using a surface token) is within scope as a prerequisite for the depth effect.
