# Developer Quickstart: Snippet Skill Tags (009)

**Branch**: `009-snippet-skill-tags`

## Prerequisites

- Node.js installed
- Dependencies installed: `make install`

## Setup

No migrations. No new dependencies. No config changes. Just run:

```bash
make dev
```

Open `http://localhost:5173`.

## How to Test the Feature Manually

1. **Create some skills**: In the Skills panel, add two or three skills (e.g., "Writing", "Code", "Analysis").

2. **Add a snippet with skills**: Click the `+` button in the Snippets panel header. In the modal, fill in Name and Text, then select one or more skills from the tag group. Click Save. Confirm the snippet appears under each selected skill when you switch skill filters.

3. **Edit skill assignments**: Click the edit icon on a snippet. The tag group shows current assignments pre-selected. Change the selection. Click Save. Confirm the Skills panel reflects the new assignments.

4. **Deferred update test**: Open an edit modal, change skill selections — confirm the Skills panel does NOT update while the modal is open. Save — confirm it updates.

5. **Edge cases**:
   - Save a snippet with no skills selected → it appears under "Untagged".
   - Cancel the modal after changing skills → assignments unchanged.
   - Delete a skill while no modal is open → that skill disappears from all snippets automatically.

## Running Tests

```bash
npm test                                              # all tests
npx vitest run src/store/tests/useSnippets.test.ts    # snippet store tests
npx vitest run src/components/tests/Snippet.test.tsx  # snippet component tests
```

## Files Changed in This Feature

| File | What changed |
| ---- | ------------ |
| `src/lib/formFields.ts` | Added `"taggroup"` to `FormField.type`; added optional `options` property |
| `src/components/AppFormFieldGenerator.tsx` | Added `"taggroup"` case rendering HeroUI `TagGroup` |
| `src/components/Snippets.tsx` | Builds dynamic `snippetFields` with taggroup; `onSave` split/join logic |
| `src/store/useSnippets.ts` | Extended `addSnippet` with optional `skills` parameter |
