# Quickstart: Component Store Migration & Testing

**Branch**: `001-migrate-components`

---

## Prerequisites

```bash
cd ./llamanomicon
npm install
```

## Install new test dependencies

```bash
npm install -D jsdom @testing-library/user-event
```

## Run the dev server

```bash
make dev
# → http://localhost:5173
```

All four panels should be visible: Agent List, Skills List, Snippets Panel, Output Window.

## Run the full test suite

```bash
npm test
```

Expected: all store tests + all component tests pass with no skips.

## Run tests in watch mode

```bash
npm run test:watch
```

## TypeScript check

```bash
npm run build
# or: npx tsc --noEmit
```

Expected: zero errors, zero `@ts-nocheck` suppressions.

## Lint

```bash
make lint
```

---

## Manual verification checklist

1. Open `http://localhost:5173`
2. Verify all 4 panels render without console errors
3. Add an agent → select it → add snippets → verify Output Window shows compiled text
4. Add a skill → tag snippets with it → select skill in Skills List → verify Snippets Panel filters
5. Reorder active snippets via drag-and-drop → verify Output Window order updates
6. DataControls: make changes → commit → reload page → verify data persisted
7. DataControls: make changes → discard → verify changes reverted
