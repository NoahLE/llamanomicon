# Quickstart: Skill Active Snippet Count

**Branch**: `001-skill-active-count`

## What This Feature Does

Every row in the Skills List panel shows `(active/total)` after the skill name — for example, `Computer Styling (1/5)`. The count reflects how many of the skill's snippets are active in the currently selected agent. The "Untagged" row also shows its count.

## How to Verify It Works

1. Run `make dev` and open http://localhost:5173
2. Create at least one agent, one skill, and a few snippets tagged with that skill
3. Select the agent and activate one or more snippets in the Snippets Panel
4. Look at the Skills List panel — each skill row now shows `(active/total)`
5. Toggle a snippet on or off and confirm the count updates immediately without refreshing

## Key Files Changed

| File | Change |
| ---- | ------ |
| `src/store/useSkills.ts` | Added `selectSnippetCountForSkill` selector |
| `src/store/useSnippets.ts` | Added `selectUntaggedSnippetCount` selector |
| `src/components/SkillsListItem.tsx` | Renders `(active/total)` count after skill name |
| `src/components/SkillsList.tsx` | Renders `(active/total)` count on the Untagged row |
| `src/store/tests/useSkills.test.ts` | Appended count selector tests |
| `src/store/tests/useSnippets.test.ts` | Appended count selector tests |
| `src/components/tests/SkillsListItem.test.tsx` | New count rendering tests |

## Running Tests

```bash
npx vitest run src/store/tests/useSkills.test.ts
npx vitest run src/store/tests/useSnippets.test.ts
npx vitest run src/components/tests/SkillsListItem.test.tsx
```
