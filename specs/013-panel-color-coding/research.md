# Research: Panel Color Coding

**Branch**: `013-panel-color-coding` | **Date**: 2026-05-01

## Decision Log

---

### Decision 1: Color palette selection

**Decision**: Assign electric cyan to Agents, amber-gold to Skills, violet to Snippets, and signal green to Output (active state only).

**Rationale**: The three hues are maximally spaced around the color wheel — no two share a hue family — ensuring distinctness at a glance in both dark and light themes. Cyan connotes digital/AI identity (Agents). Amber connotes capability/energy (Skills). Violet connotes fragments and composition (Snippets). Green is a universal "ready/active" signal color, appropriate for the conditional Output state.

**Alternatives considered**:
- Red/green/blue (too close to status semantics; red implies error)
- All warm tones (insufficient distinction between panels)
- Single accent color with brightness variation (fails distinctness requirement in light mode)

---

### Decision 2: CSS custom property (token) strategy over utility classes

**Decision**: Express all panel colors as CSS custom properties (`--panel-{variant}-shadow`, `--panel-{variant}-border-color`, `--panel-{variant}-title-color`, `--panel-{variant}-title-glow`) with dark-mode defaults in `:root` and light-mode overrides in `[data-theme="light"]`.

**Rationale**: CSS tokens allow all color values to be changed in one file (`theme.css`) with zero component code changes (FR-007, SC-005). Tailwind v4 utility classes cannot express `box-shadow` with multiple color layers or `text-shadow` as arbitrary values in a maintainable way; inline styles referencing tokens are the established pattern for this project (see `AppHeader.tsx` nav depth tokens).

**Alternatives considered**:
- Hardcoded inline RGBA values in component: fails SC-005 (multi-file change to update a color)
- CSS-in-JS (e.g., `styled-components`): not in the stack, violates constitution Tech Standards
- Tailwind arbitrary values (`shadow-[...]`): unwieldy for 5-layer shadows; no `text-shadow` support

---

### Decision 3: Inline style override on HeroUI Card.Root

**Decision**: Apply `boxShadow` and `borderColor` to `Card.Root` via the `style` prop rather than overriding Tailwind utility classes.

**Rationale**: This is an already-established pattern in the codebase. `AppHeader.tsx` uses `style={{ boxShadow: ... }}` for nav depth tokens and `style={{ textShadow: ... }}` for title engraving. `docs/styling.md` documents this explicitly: inline styles are used when Tailwind v4 lacks an arbitrary variant. Inline styles have highest CSS specificity, ensuring the override wins over HeroUI's internal Tailwind classes.

**Alternatives considered**:
- CSS class with `!important`: works but fragile against HeroUI class-name changes; also pollutes global stylesheet
- Tailwind `[style]` arbitrary property: non-standard, poor DX
- Wrapping `Card.Root` in a styled `div`: doubles the DOM node count for all panels; adds unnecessary complexity

---

### Decision 4: Conditional Output glow driven by existing compiled output selector

**Decision**: `OutputWindow` reads `selectCompiledOutput` (already subscribed for display) and passes `variant="output"` to `AppSection` only when the output string is truthy.

**Rationale**: `selectCompiledOutput` is already a Zustand subscription in `OutputWindow`. No new state, no new selector, no new effect. The conditional expression `output ? "output" : undefined` is a one-liner at the call site (FR-008, SC-002). The glow activates within the same React render cycle as the output text appears.

**Alternatives considered**:
- Separate boolean selector (`hasOutput`): adds a selector for no benefit — the existing string selector is already falsy when empty
- CSS `:has()` driven by child content: no reliable way to target non-empty `<pre>` text in all browsers; fragile

---

### Decision 5: No title tokens for the Output variant

**Decision**: The Output variant defines only `shadow` and `border` tokens — no `titleColor` or `titleGlow` — because `OutputWindow` renders its own custom header (not using `AppSection`'s `title` prop).

**Rationale**: Adding unused tokens would be speculative. `AppSection`'s title style code already guards against missing tokens (`tokens?.titleColor`). If `OutputWindow`'s header ever migrates to use `AppSection`'s title prop, title tokens can be added then.

**Alternatives considered**:
- Define placeholder title tokens anyway: YAGNI — violates constitution Principle V (Simplicity & DRY)

---

### Contrast verification

Title text colors were checked against the HeroUI dark surface background (`oklch(21%)`):

| Panel    | Title color                  | Approx contrast | WCAG AA (4.5:1) |
| -------- | ---------------------------- | --------------- | --------------- |
| Agents   | `rgba(0, 210, 255, 0.82)`   | ~5.2:1          | ✅ Pass          |
| Skills   | `rgba(255, 195, 20, 0.82)`  | ~7.1:1          | ✅ Pass          |
| Snippets | `rgba(175, 100, 255, 0.82)` | ~4.6:1          | ✅ Pass          |

Light-mode title colors use darker, higher-saturation values that pass on the light surface background (`oklch(97%)`).
