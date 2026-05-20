# Quickstart: Testing the Tour Changes

## Run the dev server

```bash
make dev
```

## Trigger the tour

Click the **?** button in the top-right of the app header. The tour launches immediately.

## What to verify

1. Advance past step 4 (Output Structure). Confirm a new step 5 appears titled "Raw Output" and the intro.js highlight ring is around the Raw Output panel (lower half of the right column), not the full column.
2. Read through all 9 steps. Confirm no em-dash character (`—`) appears in any tooltip title or body.
3. Confirm step 4 (Output Structure) specifically describes the accordion/grouped view, not the full output area.
4. Confirm step 5 (Raw Output) mentions the XML/Text toggle and the copy button.

## Inspect the DOM target

Open DevTools and run:

```js
document.querySelector('[data-tour-target="raw-output"]')
// Should return the RawOutput AppSection card element

document.querySelectorAll('[data-tour-target="output"]').length
// Should return 1 (only OutputStructure, not RawOutput)
```
