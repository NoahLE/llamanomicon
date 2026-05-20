# Data Model: Nav Skeuomorphic Design

**Branch**: `012-nav-skeuomorphic`

This feature introduces no new data entities, store state, or persistence changes.

## Design Token Additions

The only "data" this feature introduces are CSS custom properties added to `src/style/theme.css`. These are not runtime data — they are static design values resolved at paint time.

### New tokens (`src/style/theme.css`)

```
:root (dark mode defaults)
  --nav-surface          Nav bar background color
  --nav-highlight        Top-edge border color (light source simulation)
  --nav-shadow           box-shadow value for nav bar drop shadow
  --nav-title-shadow     text-shadow value for engraved title
  --nav-btn-shadow       box-shadow for button raised resting state
  --nav-btn-shadow-active  box-shadow for button inset pressed state

[data-theme="light"] overrides
  (same six properties, recalibrated for light palette)
```

### Constraints

- All six tokens MUST be defined for both `:root` and `[data-theme="light"]`.
- No token value may contain a hardcoded hex, rgb, or named color — values MUST use `rgba()` with numeric channels or reference other CSS custom properties.
- Token names are scoped with `--nav-` prefix to avoid collision with HeroUI token namespace.
