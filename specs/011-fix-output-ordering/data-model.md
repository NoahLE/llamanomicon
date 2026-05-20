# Data Model: Fix Output Window Snippet Ordering

**Feature**: 011-fix-output-ordering  
**Date**: 2026-04-28

---

## No New Entities

This feature introduces no new data model fields, entity types, or persistence changes. It is a pure bug fix to the ordering logic that reads existing data.

---

## Existing Entity: Agent — Clarified Semantics for `activeOrder`

The `Agent` entity already has `activeOrder: string[]`. This field's contract is clarified and enforced by this fix:

| Field | Type | Previous (Broken) Behaviour | Correct Behaviour After Fix |
|-------|------|-----|-----|
| `activeOrder` | `string[]` | Written by drag-and-drop; never read for display or output ordering | **Canonical display order** for active snippets — drives both Snippets panel ordering and Output window snippet ordering within skill groups |

### Invariants (unchanged, now enforced end-to-end)

- `activeOrder` and `activeSet` MUST always be in sync: `activeOrder.length === activeSet.size` and every ID in `activeOrder` is in `activeSet`.
- When a snippet is activated, its ID is appended to `activeOrder`.
- When a snippet is deactivated, its ID is removed from `activeOrder`.
- When snippets are reordered via drag-and-drop, `activeOrder` is updated to reflect the new sequence.
- `activeOrder` contains IDs of active snippets **across all skills** for the agent, not per-skill sub-lists.

---

## Derived Ordering Logic (read path — not persisted)

### Within a skill group (Output window and compiler)

Snippets in a skill group are emitted in the order their IDs appear in `agent.activeOrder`, reading left-to-right and taking only those IDs whose corresponding snippet is tagged with the current skill.

### Snippets panel display order (when agent is active)

1. Active snippets first — sorted by their index in `agent.activeOrder` (ascending).
2. Inactive snippets second — sorted alphabetically by `snippet.name`.

### Snippets panel display order (when no agent is active)

All snippets sorted alphabetically by `snippet.name` (unchanged from current behaviour).

---

## No Migration Required

`activeOrder` was already serialized and persisted via the Zustand `persist` middleware. Existing stored `activeOrder` arrays remain valid; they now simply drive display ordering that was previously ignored. No data migration is needed.
