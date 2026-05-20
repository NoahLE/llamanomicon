# Implementation Plan: Nav Skeuomorphic Design

**Branch**: `012-nav-skeuomorphic` | **Date**: 2026-04-29 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/012-nav-skeuomorphic/spec.md`

## Summary

Apply neoskeumorphic depth treatment to the `AppHeader` navigation bar in both dark and light modes. The approach adds six new CSS custom property tokens to `theme.css` (no new libraries, no store changes), then applies those tokens to `AppHeader`, `ThemeButton`, and the `DataControls` dropdown trigger via Tailwind utility classes. Dark mode is the default; `[data-theme="light"]` overrides recalibrate all six tokens for the light palette.

## Technical Context

**Language/Version**: TypeScript 5.9, strict mode, `noUncheckedIndexedAccess: true`  
**Primary Dependencies**: React 19, Tailwind CSS v4, HeroUI, Vite 7  
**Storage**: N/A — no data model changes  
**Testing**: Vitest + React Testing Library (no new tests required; pure visual change)  
**Target Platform**: Browser PWA (Chrome/Firefox/Safari, dark-first)  
**Project Type**: Web application (local-first PWA)  
**Performance Goals**: 60 fps — CSS transitions only, no JS animation  
**Constraints**: Offline-capable; all color values via CSS custom properties (no hardcoded values); no new npm packages  
**Scale/Scope**: Single component (`AppHeader`) + two child components (`ThemeButton`, `DataControls`)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                | Check                                                                                                  | Status |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | ------ |
| I. Code Quality          | TypeScript strict, no `any`, single responsibility per unit, active dead-code removal + simplification | [x]    |
| II. UX Consistency       | Dark-first, uniform interaction patterns, no new motion without precedent                              | [x]    |
| III. Performance         | Offline capable, 60 fps, async IndexedDB, bundle impact reviewed                                       | [x]    |
| IV. Living Documentation | README.md, CLAUDE.md, and docs/ will be updated in the same PR                                         | [x]    |
| V. Simplicity & DRY      | No speculative abstractions; rule of three for any new shared logic                                    | [x]    |
| VI. Testing Discipline   | tests/ subdir per source dir, AAA pattern, native-mechanism setup, isolated tests                      | [x]    |
| Tech Standards           | Uses HeroUI (not custom primitives), dnd-kit, Zustand slices, Dexie, Vitest + RTL                      | [x]    |
| V1 Scope Gate            | No node graph, no GSAP in this feature; neoskeumorphic styling is permitted                            | [x]    |

**Notes**:
- II: Neoskeumorphic design is now explicitly permitted in V1 per constitution v1.3.0.
- III: No bundle impact — zero new dependencies.
- VI: No new tests required; the change is purely visual with no logic under test. Existing `OutputWindow.test.tsx` and store tests are unaffected.

## Project Structure

### Documentation (this feature)

```text
specs/012-nav-skeuomorphic/
├── plan.md              ✅ This file
├── research.md          ✅ Phase 0 output
├── data-model.md        ✅ Phase 1 output (token additions only)
├── quickstart.md        ✅ Phase 1 output
├── contracts/
│   └── AppHeader.md     ✅ Phase 1 output
├── checklists/
│   └── requirements.md  ✅ Spec quality checklist
└── tasks.md             ⬜ Phase 2 output (created by /speckit.tasks)
```

### Source Code (affected files only)

```text
src/
├── style/
│   └── theme.css             # Add six --nav-* CSS custom properties (dark + light)
└── components/
    ├── AppHeader.tsx          # Apply surface bg, shadow, highlight border, title text-shadow
    ├── ThemeButton.tsx        # Apply btn shadow tokens to resting + active states
    └── DataControls.tsx       # Apply same btn shadow treatment to Data dropdown trigger
```

**Structure Decision**: Single-project layout; no new files or directories created in `src/`. All changes are additive within existing files.

## Phase 0: Research Summary

See [research.md](research.md) for full findings. Key decisions:

1. **Theme targeting**: Use `[data-theme="light"]` selector (attribute set by `useTheme`); `:root` defaults serve dark mode.
2. **Token strategy**: Six new `--nav-*` properties in `theme.css`; no HeroUI internals touched.
3. **Shadow technique**: Dual-shadow `box-shadow` pattern (lighter above, darker below surface) for authentic neoskeumorphic depth.
4. **Engraved title**: Two-layer `text-shadow` stack (dark offset down-right + light offset up-left).
5. **Button press**: `shadow-[var(--nav-btn-shadow)]` at rest + `active:shadow-[var(--nav-btn-shadow-active)]` via Tailwind `active:` variant on HeroUI Button `className`.
6. **No new dependencies**: Zero bundle impact.

## Phase 1: Design Summary

### Token Definitions (to be added to `src/style/theme.css`)

**Dark mode (`:root`):**
```css
--nav-surface: /* slightly lighter than --background */
--nav-highlight: /* near-white at low opacity, top-edge border */
--nav-shadow: /* box-shadow: inset 0 1px 0 <highlight>, 0 4px 12px <dark> */
--nav-title-shadow: /* text-shadow: 0 1px 2px <dark>, 0 -1px 0 <light> */
--nav-btn-shadow: /* box-shadow: 2px 2px 5px <dark>, -1px -1px 3px <light> */
--nav-btn-shadow-active: /* box-shadow: inset 2px 2px 5px <dark>, inset -1px -1px 3px <light> */
```

**Light mode (`[data-theme="light"]`):**  
Same six tokens, values recalibrated so neither shadow is harsh and surface depth reads clearly against a light background.

### Component Changes

| Component | Change |
| --------- | ------ |
| `AppHeader` `<header>` | Add `background: var(--nav-surface)`, `box-shadow: var(--nav-shadow)`, `border-top: 1px solid var(--nav-highlight)` |
| `AppHeader` title `<span>` | Add `text-shadow: var(--nav-title-shadow)` |
| `ThemeButton` `<Button>` | Add `className` with `shadow-[var(--nav-btn-shadow)] active:shadow-[var(--nav-btn-shadow-active)] transition-shadow` |
| `DataControls` dropdown trigger `<Button>` | Same shadow className treatment as ThemeButton |

### Transition

Add `transition: box-shadow 200ms ease, background-color 200ms ease` to the `<header>` element so the depth treatment animates smoothly when the theme toggles. Keep it under 250ms to stay imperceptible as a layout change.

## Complexity Tracking

_No constitution violations — table omitted._
