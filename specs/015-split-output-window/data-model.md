# Data Model: Split Output Window (Feature 015)

## Summary

This feature introduces no new persisted entities and makes no changes to the store data model. The only new state is ephemeral UI state local to the `OutputWindow` component.

## Ephemeral UI State

### Output Format Selection

| Field          | Type                  | Default | Scope                          |
| -------------- | --------------------- | ------- | ------------------------------ |
| `outputFormat` | `"xml" \| "text"`     | `"xml"` | Local `OutputWindow` component |

**Rules**:
- Resets to `"xml"` on page load / component mount.
- Not persisted to localStorage.
- Not added to `OutputSettings` or any Zustand slice.

## Existing Selectors (reused, unchanged)

| Selector                  | Source                     | Returns                                        |
| ------------------------- | -------------------------- | ---------------------------------------------- |
| `selectCompiledOutput`    | `src/store/useSettings.ts` | `string` — plain text, newline-joined snippets |
| `selectCompiledOutputXML` | `src/store/useSettings.ts` | `string` — XML-tagged skill-group sections     |
| `selectSkillGroupsForOutput` | `src/store/useAgents.ts` | `SkillGroup[]` — ordered skill groups with snippets |
| `selectActiveAgent`       | `src/store/useAgents.ts`   | `Agent \| undefined`                           |

## No Store Changes

- `OutputSettings` type (`src/store/useSettings.ts`) — unchanged.
- `SessionState` / `DataState` (`docs/models.md`) — unchanged.
- `localStorage` persist key (`llamanomicon-v2`) — unchanged.
- No migration required.
