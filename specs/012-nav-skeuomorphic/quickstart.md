# Quickstart: Nav Skeuomorphic Design

**Branch**: `012-nav-skeuomorphic`

## Dev Setup

```bash
make install   # if not already done
make dev       # starts http://localhost:5173 with HMR
```

## Testing the Feature

1. Open `http://localhost:5173` in a browser.
2. Confirm the nav bar reads as a raised surface in **dark mode** (default):
   - Bar background is visibly lighter than the page behind it
   - Thin top-edge highlight visible
   - Drop shadow visible below the bar
   - Title "Llamanomicon" appears engraved/embossed
3. Click the theme toggle button and verify the **light mode** version:
   - Same depth cues, recalibrated for the light palette
   - No harsh dark shadows bleeding from dark mode
4. Press and hold the theme toggle and the Data button:
   - Each should visually depress (inset shadow replaces drop shadow)
   - Release restores raised state
5. Tab through the nav with keyboard:
   - Focus ring must be visible on both buttons regardless of shadow state

## Files to Edit

| File | Change |
| ---- | ------ |
| `src/style/theme.css` | Add six `--nav-*` tokens for dark (`:root`) and light (`[data-theme="light"]`) |
| `src/components/AppHeader.tsx` | Apply `--nav-surface` background, `--nav-shadow` box-shadow, `--nav-highlight` border-top, `--nav-title-shadow` text-shadow to title |
| `src/components/ThemeButton.tsx` | Apply `--nav-btn-shadow` at rest and `--nav-btn-shadow-active` on active state |
| `src/components/DataControls.tsx` | Apply same button shadow treatment to the Data dropdown trigger |

## Lint + Type Check

```bash
make lint    # ESLint + Prettier auto-fix
make build   # tsc + production build (catches type errors)
npm test     # run all tests
```

No new tests are required for this feature (pure CSS/visual change with no logic). If snapshot tests existed they would need updating — none currently exist for AppHeader.
