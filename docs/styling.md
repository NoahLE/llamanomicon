# Styling

## Design Philosophy

Llamanomicon uses a **neoskeumorphic / skeumorphic** visual style on a dark-first base. Unlike flat design, skeumorphic UI mimics tactile, physical objects — surfaces have depth, shadows suggest elevation, and interactive elements look pressable. The "neo" prefix means this is a modern, minimal interpretation: realistic depth without literal texture maps or gradients from the 2010s.

In practice this means:

- Inset shadows on inactive/recessed elements, drop shadows on elevated ones
- Subtle border highlights to simulate a light source
- Components should feel like they belong in a physical grimoire or control panel

## Color Scheme

Dark-first. All color tokens are CSS custom properties defined in:

- `src/style/theme.css` — design tokens (background, surface, border, text, accent colors)
- `src/main.css` — global resets and base styles

Do not hardcode color values in components. Use the token names from `theme.css`.

## Component Library

**HeroUI** with Tailwind v4. HeroUI provides accessible, composable primitives (buttons, inputs, modals, etc.) that integrate with Tailwind utility classes.

When building UI:

1. **Check HeroUI first** — use its primitives before writing custom components
2. Apply skeumorphic depth via Tailwind shadow utilities (`shadow-inner`, `shadow-md`, etc.) and `theme.css` tokens
3. Custom components go in `src/components/`

## Motion Libraries

- **motion-primitives** — [https://github.com/ibelick/motion-primitives](https://github.com/ibelick/motion-primitives) — layout transitions, enter/exit animations, page-level motion
- **react-bits** — [https://github.com/DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) — micro-interactions, hover effects, component-level animation primitives

Use motion-primitives for structural transitions (panels appearing, lists reordering). Use react-bits for small interactive feedback (button presses, toggle flips).

## Depth Token System

Neoskeumorphic depth is expressed through CSS custom properties in `src/style/theme.css`. Each depth-bearing component gets a scoped token set rather than inline values.

### Nav tokens (`--nav-*`)

Six tokens drive the `AppHeader` depth treatment:

| Token                     | Used for                                                      |
| ------------------------- | ------------------------------------------------------------- |
| `--nav-surface`           | Nav bar background (slightly lighter/darker than page bg)     |
| `--nav-highlight`         | Top-edge `border-top` color (simulates overhead light source) |
| `--nav-shadow`            | `box-shadow` drop shadow separating bar from content below    |
| `--nav-title-shadow`      | `text-shadow` for engraved (dark) / embossed (light) title    |
| `--nav-btn-shadow`        | `box-shadow` for raised resting state on nav buttons          |
| `--nav-btn-shadow-active` | `box-shadow` for inset pressed state on nav buttons           |

**Shadow technique**: All shadows use a dual-layer `box-shadow` value — one layer lighter than the surface (top-left direction) and one darker (bottom-right direction) — to create convincing three-dimensional depth without gradients.

**Theme overrides**: Dark-mode values live in `:root`. Light-mode overrides live in `[data-theme="light"]`, which matches the `data-theme` attribute set by `useTheme`. Follow this same pattern for depth tokens on future panels.

**Component application**:

- `AppHeader` `<header>`: `bg-[var(--nav-surface)]`, `border-t border-t-[var(--nav-highlight)]`, inline `boxShadow: var(--nav-shadow)`
- Title `<span>`: inline `textShadow: var(--nav-title-shadow)` (inline style required — Tailwind v4 has no `text-shadow` arbitrary variant)
- Nav buttons: `shadow-[var(--nav-btn-shadow)] active:shadow-[var(--nav-btn-shadow-active)]` via `className`

**Token schema per variant**:

| Token                            | Used for                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| `--panel-{variant}-shadow`       | 5-layer `box-shadow`: 1px color ring → inner glow → ambient haze → depth shadow → top highlight |
| `--panel-{variant}-border-color` | Panel card `border-color`                                                                       |
| `--panel-{variant}-title-color`  | Header `<h2>` text color _(left-column panels only)_                                            |
| `--panel-{variant}-title-glow`   | Header `<h2>` `text-shadow` _(left-column panels only)_                                         |

The `output` variant defines only shadow and border tokens — it has no title tokens because `OutputWindow` renders its own custom header.

**Component application**: All panel tokens are applied by `AppSection` via the `variant` prop. Static colors are applied unconditionally; the Output glow is applied conditionally at the call site:

```tsx
// Always-on (left-column panels):
<AppSection variant="agents">

// Conditional (Output panel):
<AppSection variant={output ? "output" : undefined}>
```

Inline `style` prop is used for `boxShadow` and `borderColor` (takes precedence over HeroUI's Tailwind classes). The `textShadow` on `<h2>` also requires inline style — Tailwind v4 has no `text-shadow` arbitrary variant.

**Theme overrides**: Same pattern as nav tokens — dark-mode defaults in `:root`, light-mode overrides in `[data-theme="light"]`. Light variants use softer, lower-saturation values with no neon bloom; `--panel-{variant}-title-glow` resolves to `none` in light mode.

## Conventions

- Prefer HeroUI primitives over custom components
- Prefer Tailwind utilities over custom CSS classes
- Color: always use `theme.css` tokens, never raw hex values
- Shadows: use `rgba()` with numeric channels — no hardcoded hex or named colors in token values
- Animations: keep them subtle — this is a productivity tool, not a demo reel
- Theme selectors: `[data-theme="light"]` for light-mode overrides (matches `useTheme`'s `setAttribute`)
