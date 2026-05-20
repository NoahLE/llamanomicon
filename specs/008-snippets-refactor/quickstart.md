# Quickstart: Snippets Panel Component Refactor

**Feature**: 008-snippets-refactor  
**Date**: 2026-04-22

## What changed

Two files become one. `SnippetsPanelItem.tsx` is deleted. `SnippetsPanel.tsx` is rewritten to match the Agent/Skills component pattern.

## Files touched

| Action   | File                                          | Notes |
|----------|-----------------------------------------------|-------|
| Rewrite  | `src/components/SnippetsPanel.tsx`            | Full replacement — see Component Design in plan.md |
| Delete   | `src/components/SnippetsPanelItem.tsx`        | No longer needed |
| Expand   | `src/components/tests/SnippetsPanel.test.tsx` | 7 new tests covering all user stories |

## Key implementation notes

1. **No store changes** — `updateSnippet` already accepts `{ name, text }`.
2. **No formFields changes** — `snippetFormFields` already exists in `src/lib/formFields.ts`.
3. **DnD ref**: Pass `useSortable`'s `ref` to `ListBox.Item`. If HeroUI's `ListBox.Item` does not forward refs, wrap it in a plain `div` with the ref and no styling.
4. **Multi-select**: Use `selectionMode="multiple"` with `selectedKeys` from `activeAgent?.activeSet`.
5. **No inline edit**: Remove all `useState(false)` editing flags, `editText` state, and edit-mode JSX branches.

## Run checks

```bash
make lint        # ESLint + Prettier
npm test         # full test suite
make build       # type-check + production build
```
