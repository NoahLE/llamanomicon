# Research: Snippets Panel Component Refactor

**Feature**: 008-snippets-refactor  
**Date**: 2026-04-22

## R-001 — updateSnippet store action

**Decision**: No store changes needed.  
**Rationale**: `updateSnippet(id, patch: Partial<Pick<Snippet, "name" | "text">>)` in `src/store/useSnippets.ts` already supports patching both `name` and `text`. The current `SnippetsPanelItem` only used the `text` field; the new modal will use both.

---

## R-002 — snippetFormFields

**Decision**: No formFields changes needed.  
**Rationale**: `snippetFormFields` in `src/lib/formFields.ts` already defines `name` (text input) and `text` (textfield). Both modals (add and edit) consume this array directly.

---

## R-003 — HeroUI ListBox + dnd-kit useSortable integration

**Decision**: Pass `useSortable`'s `ref` directly to `ListBox.Item`. Fallback: thin unstyled `div` wrapper if ref forwarding is unavailable.  
**Rationale**: HeroUI components are built on React Aria and support ref forwarding in React 19. The `handleRef` (drag grip) attaches to an inner element as before. The `DragDropProvider` wraps the full `ListBox`.  
**Fallback**: If `ListBox.Item` does not accept a ref, each item is wrapped in `<div ref={ref}>` with no className — this is structural only and adds no design code (satisfies FR-011).

---

## R-004 — Multi-select snippet toggling in ListBox

**Decision**: `selectionMode="multiple"`, `selectedKeys` from `activeAgent?.activeSet`, `onSelectionChange` computes diff and calls `activateSnippet` / `deactivateSnippet`.  
**Rationale**: Uses ListBox's native selection model. Avoids custom onClick toggle on each item and ensures the visual selection state always matches store state.  
**Implementation note**: When `activeAgent` is null, pass an empty Set for `selectedKeys` and no-op on `onSelectionChange`.

---

## R-005 — Snippet item display

**Decision**: `<Label>{snippet.name}</Label>` + `<Description>{snippet.text.slice(0, 60)}{snippet.text.length > 60 ? "…" : ""}</Description>`  
**Rationale**: Matches Agent/Skills ListBox item pattern (Label + Description). 60-char truncation sourced from existing aria-label logic in `SnippetsPanelItem.tsx:90`.

---

## R-006 — Test mock structure

**Decision**: Hoisted vi.mock pattern from `Skills.test.tsx`. Mock `@/store/useAppStore`, `zustand/react/shallow`, relevant selectors. Stub `@dnd-kit/react` and `@dnd-kit/react/sortable` to prevent drag sensor errors in jsdom.  
**Rationale**: Skills test is the established template. DnD libs need stubbing in jsdom because they rely on pointer/mouse sensors that aren't fully implemented.

```typescript
// Minimal dnd-kit stub
vi.mock("@dnd-kit/react", () => ({
  DragDropProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: () => ({ ref: () => null, handleRef: () => null, isDragging: false }),
}));
```
