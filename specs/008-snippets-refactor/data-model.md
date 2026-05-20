# Data Model: Snippets Panel Component Refactor

**Feature**: 008-snippets-refactor  
**Date**: 2026-04-22

## Overview

No data model changes in this feature. This is a purely component-level refactor.

## Existing Entities (unchanged)

### Snippet

```typescript
interface Snippet {
  id: string;          // crypto.randomUUID()
  name: string;        // display label; editable via AppFormModal
  text: string;        // prompt text content; editable via AppFormModal
  skills: Set<string>; // tag IDs (many-to-many)
}
```

Both `name` and `text` are already supported by `updateSnippet(id, patch: Partial<Pick<Snippet, "name" | "text">>)` in `src/store/useSnippets.ts`. No store changes are needed.

## Derived State (unchanged)

- `agent.activeSet: Set<string>` — snippet IDs active for the current agent. Drives `selectedKeys` in the refactored ListBox.
- `agent.activeOrder: string[]` — user-defined ordering. Updated by `reorderSnippets` after drag-and-drop.
- `snippetsBySkill: Map<string, Set<string>>` — inverse skill→snippet index. Not affected by this refactor.

## No New Entities

This feature introduces no new fields, relationships, or state transitions.
