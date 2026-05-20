# UI Contract: AppSection variant prop

**Component**: `src/components/AppSection.tsx`
**Date**: 2026-05-01

## Purpose

`AppSection` is the shared panel container used by all five app panels. The `variant` prop is the injection point for panel color identity. This contract defines the accepted values, their visual effect, and the guarantees the component makes to callers.

---

## Prop definition

```
variant?: "agents" | "skills" | "snippets" | "output"
```

Optional. When omitted, the panel renders with its default neutral border and no box-shadow glow.

---

## Behavior per value

| `variant`    | Border color                        | Box-shadow                                     | Title `color`                      | Title `text-shadow`                 |
| ------------ | ----------------------------------- | ---------------------------------------------- | ---------------------------------- | ----------------------------------- |
| `"agents"`   | `--panel-agents-border-color`       | `--panel-agents-shadow`                        | `--panel-agents-title-color`       | `--panel-agents-title-glow`         |
| `"skills"`   | `--panel-skills-border-color`       | `--panel-skills-shadow`                        | `--panel-skills-title-color`       | `--panel-skills-title-glow`         |
| `"snippets"` | `--panel-snippets-border-color`     | `--panel-snippets-shadow`                      | `--panel-snippets-title-color`     | `--panel-snippets-title-glow`       |
| `"output"`   | `--panel-output-border-color`       | `--panel-output-shadow`                        | _(unchanged — no title token)_     | _(unchanged — no title token)_      |
| _(omitted)_  | `--border` (HeroUI default)         | _(none)_                                       | _(unchanged)_                      | _(unchanged)_                       |

---

## Guarantees

- The `variant` prop only affects `box-shadow` and `border-color` on the card root, and `color` + `text-shadow` on the header `<h2>` (when the `title` prop is also provided).
- If `variant` is set but `title` is omitted (e.g., Output panel), title styling is silently skipped — no error.
- If a variant's title tokens are absent from the token set (e.g., `"output"`), title styling is silently skipped — no error.
- Token values are resolved by the browser from `src/style/theme.css`; dark/light mode switching is handled automatically by `[data-theme="light"]` overrides.
- The component applies styles via the `style` prop (inline styles), which take precedence over HeroUI's internal Tailwind classes.

---

## Conditional usage pattern (Output panel)

```tsx
// Pass variant only when output is non-empty:
<AppSection variant={output ? "output" : undefined}>
```

This is the canonical way to drive a reactive glow. Do not reach into Zustand from inside `AppSection`; keep the condition at the call site.

---

## Extension

To add a new panel variant:
1. Add the new name to `PanelVariant` in `AppSection.tsx`
2. Add its token set to `src/style/theme.css` (both `:root` and `[data-theme="light"]`)
3. Add its lookup entry to `variantTokens` in `AppSection.tsx`
4. Pass the variant from the consuming component
