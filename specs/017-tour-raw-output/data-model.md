# Data Model: Tour Raw Output Step and Copy Cleanup

## TourStep (existing interface, `src/data/tour.ts`)

No schema changes. The `TourStep` interface already covers all required fields.

```
TourStep {
  element: string     // CSS selector for the highlight target
  title?: string      // Optional tooltip heading
  intro: string       // Tooltip body text
}
```

**Constraint**: `intro` MUST NOT contain em-dash characters (`—`).

## Updated Step Sequence

After this feature the `tourSteps` array contains 9 steps in this order:

| Index | Title              | Target selector                        |
|-------|--------------------|----------------------------------------|
| 0     | Welcome to Llamanomicon | `body`                            |
| 1     | Agent List         | `[data-tour-target="agents"]`          |
| 2     | Skills             | `[data-tour-target="skills"]`          |
| 3     | Snippets           | `[data-tour-target="snippets"]`        |
| 4     | Output Structure   | `[data-tour-target="output"]`          |
| 5     | Raw Output         | `[data-tour-target="raw-output"]`  ← new |
| 6     | Session Controls   | `[data-tour-target="session-controls"]`|
| 7     | Need help?         | `[data-tour-target="help-button"]`     |
| 8     | You're all set!    | `body`                                 |

## AppSection prop extension (`src/components/AppSection.tsx`)

Add `tourTarget?: string` to `AppSectionProps`. When provided, it replaces `variant` as the `data-tour-target` value:

```
data-tour-target = tourTarget ?? variant
```

`RawOutput.tsx` passes `tourTarget="raw-output"` to its `AppSection`.
`OutputStructure.tsx` continues using `variant="output"` with no `tourTarget`, so its `data-tour-target` remains `"output"`.
