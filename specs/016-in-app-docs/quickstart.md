# Quickstart: In-App Documentation Modal (016-in-app-docs)

## Using the Feature

1. Start the dev server: `make dev`
2. In the app header (top bar), find the **book icon** (BookOpen) to the left of the light/dark theme toggle
3. Click it — the Documentation modal opens with three tabs
4. Click any tab to switch content

## Updating Tab Content

All documentation content lives inline in `src/components/DocsModal.tsx` inside `Tabs.Panel` elements. To replace placeholder text with real content:

```tsx
<Tabs.Panel id="prompt-engineering">
  {/* Replace this with real content */}
  <p>…your prompt engineering documentation…</p>
</Tabs.Panel>
```

No configuration files, no data store, no external content source — it is plain JSX.

## Running Tests

```bash
# Run only the DocsModal tests
npx vitest run src/components/tests/DocsModal.test.tsx

# Run all tests
npm test
```

## Adding a New Tab

1. Add a `Tabs.Tab` with a unique `id` to `Tabs.List`
2. Add a matching `Tabs.Panel` with the same `id`
3. Add test coverage in `DocsModal.test.tsx`

Tabs render in DOM order, so insert in the desired display position.
