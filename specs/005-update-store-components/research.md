# Research: Component Refactor & React Testing Strategy

## Decisions

### 1. Refactoring Strategy: Incremental & Entity-Focused
- **Decision**: Refactor components in order of dependency: Snippets -> Skills (Groups) -> Agents (Flows) -> Layout/Integration.
- **Rationale**: Snippets are the atomic units used by both Skills and Agents. Working from the bottom up ensures that shared primitives are updated before the containers that consume them.
- **Alternatives**: Big-bang refactor (too risky, harder to debug).

### 2. Mocking Zustand in Tests
- **Decision**: Use `vi.mock` to mock individual store hooks (`useSnippets`, `useSkills`, `useAgents`) for component integration tests.
- **Rationale**: This isolates components from the actual store logic, persistence side effects, and async hydration. It allows for precise control over the state (Maps/Sets) provided to the component.
- **Implementation**:
  ```typescript
  vi.mock('@/store/useAgents', () => ({
    useAgents: vi.fn(() => ({
      agents: new Map([['id1', { id: 'id1', name: 'Test Agent', ... }]]),
      addAgent: vi.fn(),
      // ...
    })),
  }));
  ```

### 3. Iterating over Maps/Sets in React
- **Decision**: Convert Maps/Sets to Arrays within the component or selector for rendering.
- **Rationale**: React rendering logic and most list components (like HeroUI or standard `.map()`) expect Arrays.
- **Implementation**: `Array.from(agents.values())` or `[...skills]`.

### 4. Handling Renames (Flow -> Agent, Group -> Skill)
- **Decision**: Perform file renames first, then update all internal references, then update UI labels.
- **Rationale**: Maintains file-system consistency with the new domain model. Using `git mv` preserves history.

## Best Practices

### React Testing Library (RTL)
- **Co-location**: `*.test.tsx` stays next to the component.
- **Role-based Queries**: Use `screen.getByRole('listbox')`, `screen.getByLabelText('Agent name')`, etc., to ensure accessibility.
- **Action Simulation**: Use `userEvent` (from `@testing-library/user-event`) for realistic interaction simulation.

### HeroUI Testing
- Since HeroUI components are heavily styled and often use portals or complex DOM structures, focus on testing behavior and text content rather than internal DOM structure.

## Unresolved Items / Needs Clarification
- **Serialization**: Verify if the existing `Zustand` persist middleware in `useAppStore` already handles Map/Set or if the custom replacer/reviver from `src/lib/serialization.ts` needs to be integrated into the new slices. (Resolved: 004 handled store logic, this feature focuses on UI).
