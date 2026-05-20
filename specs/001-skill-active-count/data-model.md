# Data Model: Skill Active Snippet Count

**Branch**: `001-skill-active-count` | **Date**: 2026-04-20

## Overview

No new entities or stored fields. All counts are **derived** at render time from existing state.

## Derived Computation

### Count for a named skill

```
inputs:
  snippetsBySkill: Map<skillId, Set<snippetId>>   (existing index)
  activeAgent.activeSet: Set<snippetId>            (from active agent, or empty if none)
  skillId: string

output:
  total  = snippetsBySkill.get(skillId)?.size ?? 0
  active = count of snippetIds in snippetsBySkill.get(skillId) that are also in activeSet
```

### Count for the "Untagged" virtual skill

```
inputs:
  draft.snippets: Map<snippetId, Snippet>
  activeAgent.activeSet: Set<snippetId>

output:
  total  = count of snippets where snippet.skills.size === 0
  active = count of untagged snippets whose id is in activeSet
```

## Existing Entities (unchanged)

### Skill
| Field | Type   | Notes                             |
| ----- | ------ | --------------------------------- |
| id    | string | UUID, immutable                   |
| name  | string | User-editable display name        |

*No new fields added.*

### Agent (relevant fields)
| Field       | Type       | Notes                                        |
| ----------- | ---------- | -------------------------------------------- |
| activeSet   | Set<string> | Snippet IDs active in this agent             |
| activeOrder | string[]   | Ordered list of active snippet IDs (in sync) |

*No new fields added.*

### snippetsBySkill (derived index, not persisted)
| Key      | Value         | Notes                                              |
| -------- | ------------- | -------------------------------------------------- |
| skillId  | Set<snippetId> | Inverse index maintained in sync with tag mutations |

*No changes to index structure or maintenance logic.*

## Validation Rules

- `active ≤ total` is always true by construction (active is a subset intersection)
- `total = 0` implies `active = 0`
- Count values are non-negative integers
- Counts are recomputed on every relevant state change — no caching or invalidation logic needed
