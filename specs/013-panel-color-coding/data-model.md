# Data Model: Panel Color Coding

**Branch**: `013-panel-color-coding` | **Date**: 2026-05-01

## Overview

This feature introduces no persistent data model changes. It operates entirely in the styling layer. The "data model" for this feature is the **panel color token schema** — the structured set of CSS custom properties that define each panel's visual identity.

---

## Panel Color Token Set

A token set is a named group of CSS custom properties associated with one panel variant. Every token set follows the same schema.

### Schema

| Token name pattern                 | Required | Purpose                                                    |
| ---------------------------------- | -------- | ---------------------------------------------------------- |
| `--panel-{variant}-shadow`         | Yes      | Multi-layer `box-shadow` value (border ring + glow + depth) |
| `--panel-{variant}-border-color`   | Yes      | `border-color` applied to the panel card edge              |
| `--panel-{variant}-title-color`    | Optional | `color` applied to the panel header `<h2>` title           |
| `--panel-{variant}-title-glow`     | Optional | `text-shadow` applied to the panel header `<h2>` title     |

Title tokens are optional. Variants whose panel header is not rendered by `AppSection` (e.g., Output) omit them.

### Token Sets Defined

| Variant    | Hue family    | Has title tokens | Condition       |
| ---------- | ------------- | ---------------- | --------------- |
| `agents`   | Electric cyan | Yes              | Always active   |
| `skills`   | Amber gold    | Yes              | Always active   |
| `snippets` | Violet        | Yes              | Always active   |
| `output`   | Signal green  | No               | When output ≠ ∅ |

### Theme Variants

Each token set is defined twice in `src/style/theme.css`:

- **Dark mode** (default): defined in `:root`. Includes neon glow layers in `--panel-{variant}-shadow` and a `text-shadow` on title tokens.
- **Light mode** (override): defined in `[data-theme="light"]`. Uses softer, lower-saturation values; no neon bloom; `--panel-{variant}-title-glow` resolves to `none`.

---

## Panel Variant Type

The `PanelVariant` union type in `AppSection.tsx` enumerates the valid variant names:

```
PanelVariant = "agents" | "skills" | "snippets" | "output"
```

This type is the single source of truth for which variants exist. Adding a new variant requires:
1. Adding its name to `PanelVariant`
2. Adding its token set to `theme.css` (dark + light)
3. Adding its lookup entry to `variantTokens` in `AppSection.tsx`
4. Passing the variant from the consuming panel component

---

## Shadow Layer Anatomy

Each `--panel-{variant}-shadow` value is composed of five ordered layers (dark mode):

| Layer | Value pattern                              | Role                        |
| ----- | ------------------------------------------ | --------------------------- |
| 1     | `0 0 0 1px rgba(R,G,B, 0.18)`             | Tight 1px colored edge ring |
| 2     | `0 0 18px rgba(R,G,B, 0.10)`              | Inner glow bloom            |
| 3     | `0 0 48px rgba(R,G,B, 0.04)`              | Wide ambient haze           |
| 4     | `0 8px 32px rgba(0,0,0, 0.55)`            | Neoskeumorphic depth shadow |
| 5     | `-1px -1px 6px rgba(255,255,255, 0.03)`   | Subtle top-left highlight   |

Light-mode shadows use only layers 1–2 + a simplified depth shadow; layers 3 and 5 are omitted.
