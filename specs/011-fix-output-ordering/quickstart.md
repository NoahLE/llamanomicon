# Quickstart: Verify Fix Output Window Snippet Ordering

**Feature**: 011-fix-output-ordering  
**Date**: 2026-04-28

---

## Prerequisites

```bash
git checkout 011-fix-output-ordering
make install   # if dependencies have changed
make dev       # starts at http://localhost:5173
```

---

## Manual Verification Steps

### Step 1 — Seed data (or create manually)

Use the seed button in DataControls to load sample data, or create:
- One agent (e.g., "Test Agent")
- One skill (e.g., "Writing")
- Three snippets all tagged with "Writing":
  - Name: "Zebra", Text: "Z text"
  - Name: "Alpha", Text: "A text"
  - Name: "Middle", Text: "M text"

### Step 2 — Verify activation order appears in output

1. Select "Test Agent"
2. Select the "Writing" skill filter in the Skills panel
3. Activate "Zebra", then "Alpha", then "Middle" (in that order)
4. Open the Output window → expand the "Writing" accordion group
5. **Expected**: snippets appear as Zebra → Alpha → Middle (activation order)
6. **Previously broken**: snippets appeared as Alpha → Middle → Zebra (alphabetical)

### Step 3 — Verify drag-and-drop updates both panels

1. In the Snippets panel, drag "Zebra" to the bottom (after "Middle")
2. **Expected in Snippets panel**: order immediately updates to Alpha → Middle → Zebra
3. **Expected in Output window** (Writing group): Alpha → Middle → Zebra
4. **Previously broken**: Snippets panel stays alphabetical; drag has no visible effect

### Step 4 — Verify cross-skill drag does not corrupt other skill groups

1. Create a second skill "Code" with one active snippet "Script"
2. Drag "Alpha" (Writing skill) to a new position
3. **Expected**: "Script" (Code group) remains in its position in the Output window

### Step 5 — Verify no-agent fallback

1. Deselect the active agent (click the active agent to deselect, or select none)
2. **Expected**: Snippets panel shows all snippets in alphabetical order (no `activeOrder` to reference)

---

## Running Tests

```bash
npm test
# or to run just the affected test files:
npx vitest run src/lib/tests/compiler.test.ts
npx vitest run src/store/tests/useAgents.test.ts
npx vitest run src/store/tests/useSnippets.test.ts
npx vitest run src/store/tests/useSkills.test.ts
```

---

## Lint and Type-check

```bash
make lint    # ESLint + Prettier auto-fix
make build   # type-check + production build
```

All three commands must complete with zero errors before this feature is considered done.
