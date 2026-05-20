# Quickstart: Split Output Window (Feature 015)

## Prerequisites

```bash
git checkout 015-split-output-window
make install   # npm install (if not already done)
make dev       # starts dev server at http://localhost:5173
```

## Verify the Feature

1. Open the app and select an Agent.
2. Activate at least two snippets from different skill groups.
3. Observe the Output panel — it should show **two distinct sub-sections**:
   - **Top ("Output Structure")**: Accordion with skill group headings and snippet names. Expand/collapse works as before.
   - **Bottom ("Raw Output")**: Compiled text content with a format toggle and copy button.
4. In the Raw Output section, confirm the toggle defaults to **XML**.
5. Click the toggle to switch to **Text** — the displayed content changes to plain newline-joined text.
6. Switch back to **XML** — content reverts to tagged XML sections.
7. Click the **Copy** button while in XML mode — paste into a text editor to confirm XML format.
8. Switch to **Text** mode and copy again — paste confirms plain text format.
9. Confirm no copy buttons appear in the Output panel **header**.

## Run Tests

```bash
npx vitest run src/components/tests/OutputWindow.test.tsx
```

## Lint & Type Check

```bash
make lint    # ESLint + Prettier auto-fix
make build   # TypeScript type check + production build
```
