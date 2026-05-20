# Research: Nav Skeuomorphic Design

**Branch**: `012-nav-skeuomorphic` | **Phase**: 0

## Theme Switching Mechanism

**Decision**: Target `[data-theme="dark"]` and `[data-theme="light"]` CSS selectors for per-mode token overrides.

**Rationale**: `useTheme` sets both `data-theme` attribute and `className` on `<html>`. The attribute form is more explicit and avoids collision with Tailwind's own `.dark` class utilities. Default (`:root`) values serve the dark mode (app default); `[data-theme="light"]` overrides for light mode.

**Alternatives considered**: Using `.dark` / `.light` class selectors — rejected because Tailwind v4's built-in dark mode utilities also use `.dark`, making the attribute selector the less ambiguous choice.

---

## Existing Token Coverage

**Decision**: Add six new CSS custom properties to `src/style/theme.css`; do not modify HeroUI internals.

**Rationale**: `src/style/theme.css` currently defines only `--panel-gap`. HeroUI's `@heroui/styles` provides semantic tokens (`--background`, `--foreground`, `--border`, `--muted`, `--card`) but no shadow or depth tokens. The skeuomorphic depth layer is purely cosmetic and orthogonal to HeroUI's component tokens — it belongs in `theme.css`.

**Tokens needed**:

| Token | Purpose |
| ----- | ------- |
| `--nav-surface` | Nav bar background, distinct from page `--background` |
| `--nav-highlight` | Top-edge border color simulating a light source from above |
| `--nav-shadow` | `box-shadow` value for the nav bar drop shadow beneath |
| `--nav-title-shadow` | `text-shadow` value for engraved/embossed title |
| `--nav-btn-shadow` | `box-shadow` for raised button resting state |
| `--nav-btn-shadow-active` | `box-shadow` for inset pressed button state |

**Alternatives considered**: Hardcoding Tailwind shadow utilities directly in JSX — rejected because it would require hardcoded color values that violate FR-006.

---

## Shadow Technique for Dark vs Light Modes

**Decision**: Neoskeumorphic depth uses a dual-shadow pattern (one lighter, one darker than the surface) rather than a single shadow.

**Rationale**: Single-color shadows look flat or artificial on mid-tone surfaces. The dual-shadow technique — one shadow lighter than the surface (top-left direction) and one darker (bottom-right direction) — creates a convincing three-dimensional lift.

- **Dark mode**: surface is lighter than the page background. Top-left highlight uses a near-white semi-transparent value; bottom-right shadow uses near-black semi-transparent. Bottom border-shadow uses a single dark drop shadow to separate from content.
- **Light mode**: surface is slightly darker than the light page background. The same dual-shadow logic applies but with recalibrated opacity so neither shadow looks harsh.

**Alternatives considered**: CSS `filter: drop-shadow()` — rejected because it applies to the element's visual outline rather than its box, making it harder to compose with border-top highlight. Standard `box-shadow` gives precise control over each shadow layer.

---

## Engraved Title Text Effect

**Decision**: Use `text-shadow` with a two-shadow stack: a dark shadow offset down-right and a lighter shadow offset up-left.

**Rationale**: This is the standard CSS technique for engraved text on neoskeumorphic surfaces. No new library needed; pure CSS.

**Alternatives considered**: SVG filters for text embossing — rejected as disproportionate complexity for a one-line label.

---

## Button Press State

**Decision**: Override HeroUI button shadow via `className` prop using Tailwind `active:` variant and a CSS variable for the inset shadow.

**Rationale**: HeroUI buttons accept arbitrary `className`. Using `active:shadow-[var(--nav-btn-shadow-active)]` and `shadow-[var(--nav-btn-shadow)]` for rest state keeps everything in the token system with no custom component wrappers.

**Alternatives considered**: Wrapping HeroUI Button in a custom component — rejected (rule of three not met; only two buttons need this treatment).

---

## No New Dependencies

**Decision**: Zero new npm packages required.

**Rationale**: All depth effects are achievable with `box-shadow`, `text-shadow`, CSS custom properties, and Tailwind utilities already present in the project. Adding a library for two CSS effects would violate the Simplicity principle and bloat the bundle.
