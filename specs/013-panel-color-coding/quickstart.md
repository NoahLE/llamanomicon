# Quickstart: Panel Color Coding

**Branch**: `013-panel-color-coding` | **Date**: 2026-05-01

## What was built

Each of the four app panels (Agents, Skills, Snippets, Output) now has a distinct futuristic color identity expressed through border color, box-shadow glow, and (for the left-column panels) header title color and text-shadow. The Output panel's glow activates only when compiled output is non-empty.

---

## Files changed

| File | Change |
| ---- | ------ |
| `src/style/theme.css` | Added 14 CSS custom property tokens (3 per left-column variant × 4 + 2 for output), with dark-mode defaults and light-mode overrides |
| `src/components/AppSection.tsx` | Added `PanelVariant` type, `variantTokens` lookup, `variant` prop; applies tokens via inline `style` on `Card.Root` and `<h2>` |
| `src/components/Agents.tsx` | Added `variant="agents"` to `<AppSection>` |
| `src/components/Skills.tsx` | Added `variant="skills"` to `<AppSection>` |
| `src/components/Snippets.tsx` | Added `variant="snippets"` to `<AppSection>` |
| `src/components/OutputWindow.tsx` | Added `variant={output ? "output" : undefined}` to `<AppSection>` |

---

## How to adjust a panel color

All color values live in `src/style/theme.css`. Find the token group for the panel you want to change:

```css
/* Example: change the Agents panel to a rose/pink identity */
:root {
  --panel-agents-shadow:
    0 0 0 1px rgba(255, 80, 120, 0.18),
    0 0 18px rgba(255, 80, 120, 0.1),
    ...;
  --panel-agents-border-color: rgba(255, 80, 120, 0.28);
  --panel-agents-title-color: rgba(255, 100, 140, 0.82);
  --panel-agents-title-glow:
    0 0 6px rgba(255, 80, 120, 0.45), ...;
}
```

No component code changes needed.

---

## How to add a new panel variant

1. Add the name to `PanelVariant` in `src/components/AppSection.tsx`:
   ```ts
   type PanelVariant = "agents" | "skills" | "snippets" | "output" | "my-new-panel";
   ```

2. Add its entry to `variantTokens`:
   ```ts
   "my-new-panel": {
     shadow: "var(--panel-my-new-panel-shadow)",
     border: "var(--panel-my-new-panel-border-color)",
     titleColor: "var(--panel-my-new-panel-title-color)",
     titleGlow: "var(--panel-my-new-panel-title-glow)",
   },
   ```

3. Define the tokens in `src/style/theme.css` (both `:root` and `[data-theme="light"]`).

4. Pass `variant="my-new-panel"` from the consuming panel component.

---

## How to verify the Output glow

1. `make dev` to start the dev server.
2. Open the app. Confirm Output panel has no glow (no agent selected).
3. Select an agent, activate a snippet. Confirm green glow appears on the Output panel immediately.
4. Deactivate all snippets. Confirm glow disappears.
