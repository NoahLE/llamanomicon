# UI Contract: AppHeader

**Component**: `src/components/AppHeader.tsx`  
**Feature**: `012-nav-skeuomorphic`

## Visual States

The AppHeader must render correctly in all combinations of the two axes below:

| Axis | Values |
| ---- | ------ |
| Theme | `dark` (default), `light` |
| Button state | resting, hover, active (pressed) |

### Nav Bar Surface

| State | Expected appearance |
| ----- | ------------------- |
| Any theme | Background uses `--nav-surface` token (distinct from page background) |
| Any theme | Bottom drop shadow uses `--nav-shadow` token |
| Any theme | Top border uses `--nav-highlight` token (1px, simulates overhead light) |
| Theme change | Shadow and highlight transition smoothly; no layout shift |

### Title Text

| State | Expected appearance |
| ----- | ------------------- |
| Dark mode | Text appears engraved (recessed into surface) using `--nav-title-shadow` |
| Light mode | Text appears embossed (raised from surface) using `--nav-title-shadow` |

### Buttons (ThemeButton, DataControls trigger)

| State | Expected appearance |
| ----- | ------------------- |
| Resting | Raised — drop shadow using `--nav-btn-shadow` |
| Hover | Subtle lift or highlight (brightness increase acceptable) |
| Active/pressed | Inset — shadow flips to `--nav-btn-shadow-active` |
| Focus (keyboard) | Visible focus ring independent of shadow state |

## Layout Contract

- Flex row, full width
- Title pinned left
- Controls (DataControls + ThemeButton) pinned right
- No change to padding, gap, or grid placement (`gridRow: 1`, `gridColumn: 1 / -1`)
- No minimum height increase beyond what the shadow adds (shadow is `overflow: visible`, not block space)

## Accessibility

- `role="banner"` retained
- All interactive elements retain visible `:focus-visible` ring
- Depth/shadow effects are additive — removing them must not cause any information loss
