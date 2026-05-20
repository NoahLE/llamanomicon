# Data Model: In-App Documentation Modal (016-in-app-docs)

## Summary

This feature introduces **no new persistent data entities**. All state is ephemeral local component state. No Zustand slice changes are required.

---

## Component-Local State

### `DocsModal` internal state

| Field    | Type      | Default  | Description                                          |
| -------- | --------- | -------- | ---------------------------------------------------- |
| `isOpen` | `boolean` | `false`  | Whether the modal overlay is currently visible       |

Tab selection state is managed by the HeroUI `Tabs` component internally via `defaultSelectedKey="prompt-engineering"`. It is uncontrolled (not held in React state) and resets on every modal open.

---

## Tab Content Model

Each tab has a static string ID and display label. Content is static placeholder text (lorem ipsum).

| ID                    | Display Label        | Content     |
| --------------------- | -------------------- | ----------- |
| `prompt-engineering`  | Prompt Engineering   | Lorem ipsum |
| `prompting-tips`      | Prompting Tips       | Lorem ipsum |
| `sources`             | Sources              | Lorem ipsum |

This structure is compile-time constant — not stored in state or any data structure. Content lives directly in JSX.

---

## Zustand Store

No changes to any slice (`useSnippets`, `useSkills`, `useAgents`, `useAgentSnippets`, `useSettings`, `useDataControls`). The documentation modal is entirely UI-layer and does not interact with stored data.

---

## Persistence

Nothing from this feature is persisted to localStorage.
