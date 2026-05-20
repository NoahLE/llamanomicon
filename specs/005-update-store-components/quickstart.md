# Quickstart: Updating UI to the New Store Model

## Step 1: Renaming Components
Rename existing "Flow" and "Group" related components to their new domain names:
```bash
git mv src/components/FlowList.tsx src/components/AgentList.tsx
git mv src/components/FlowListItem.tsx src/components/AgentListItem.tsx
git mv src/components/GroupsList.tsx src/components/SkillsList.tsx
git mv src/components/GroupsListItem.tsx src/components/SkillsListItem.tsx
```

## Step 2: Update Component Logic
Refactor components to use the `draft` state and handle `Map`/`Set` structures:
```typescript
// Example: Iterating over Agents in AgentList.tsx
const agentsMap = useAppStore((s) => s.draft.agents);
const agentsArray = Array.from(agentsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
```

## Step 3: Add React Tests
Create co-located test files for each major component:
```typescript
// Example: src/components/AgentList.test.tsx
import { render, screen } from '@testing-library/react';
import { AgentList } from './AgentList';

describe('AgentList', () => {
  it('renders all agents from the store', () => {
    // ... test logic
  });
});
```

## Step 4: Run Tests
Execute the Vitest suite to verify your changes:
```bash
make test # or npm test
```
Ensure all store unit tests (from 004) and new UI integration tests pass.

## Step 5: Update Global Layout
Update `src/AppLayout.tsx` to use the new component names and handle the top-level selection logic correctly.
```typescript
import { AgentList } from './components/AgentList';
import { SkillsList } from './components/SkillsList';
// ...
```
