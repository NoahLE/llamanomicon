# Research: In-App Documentation Modal (016-in-app-docs)

## Decision 1: Tab Implementation — HeroUI Tabs vs ButtonGroup

**Decision**: Use HeroUI `Tabs` compound component (`Tabs` → `Tabs.List` → `Tabs.Tab` → `Tabs.Panel`)

**Rationale**: HeroUI v3 ships a full `Tabs` compound component backed by `react-aria-components` Tabs. It provides keyboard navigation, ARIA roles, and accessible selection state out of the box. The `ButtonGroup` approach (used in `RawOutput` for two-option format switching) is appropriate for binary toggles but lacks tab semantics and panel association for three distinct content areas. `Tabs` is the semantically correct and accessible choice here.

**Alternatives considered**:
- `ButtonGroup` + conditional rendering (used in RawOutput): Rejected — semantically a toggle, not a tabbed panel. No built-in panel association or ARIA `tabpanel` role.
- Custom tab implementation: Rejected — YAGNI, HeroUI Tabs already available.

**API confirmed** (from `node_modules/@heroui/react/dist/components/tabs/index.d.ts`):
```tsx
import { Tabs } from "@heroui/react";

<Tabs defaultSelectedKey="prompt-engineering">
  <Tabs.List>
    <Tabs.Tab id="prompt-engineering">Prompt Engineering</Tabs.Tab>
    <Tabs.Tab id="prompting-tips">Prompting Tips</Tabs.Tab>
    <Tabs.Tab id="sources">Sources</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="prompt-engineering">…</Tabs.Panel>
  <Tabs.Panel id="prompting-tips">…</Tabs.Panel>
  <Tabs.Panel id="sources">…</Tabs.Panel>
</Tabs>
```

`defaultSelectedKey` sets the initial tab without controlled state. Tab identity is by `id` string matching between `Tabs.Tab` and `Tabs.Panel`.

---

## Decision 2: Component Control Model — Embedded Trigger vs Externally Controlled

**Decision**: Embed the trigger button inside the `DocsModal` component (same pattern as `AppFormModal`)

**Rationale**: `AppFormModal` uses the `<Modal>` wrapper with the trigger button and backdrop together as a single self-contained unit. This keeps open/close state private to the component and avoids leaking `isOpen`/`onOpen` props into `AppHeader`. `AppHeader` simply renders `<DocsModal />` with no props, reducing coupling. The docs modal has no state the parent needs to observe.

**Alternatives considered**:
- Controlled modal (parent holds `isOpen`, passes to `DocsModal`): Rejected — the parent (AppHeader) has no use for the open/close state. Adding `useState` to AppHeader for this is unnecessary coupling.

---

## Decision 3: Button Icon — BookOpen vs Book vs BookText

**Decision**: Use `BookOpen` from `lucide-react`

**Rationale**: `BookOpen` (an open book) conveys "reading / documentation" more clearly than `Book` (closed book) at icon sizes. `lucide-react` exports `BookOpen` (confirmed in type definitions). Both `Book` and `BookOpenText` also exist, but `BookOpen` is the conventional documentation/docs icon.

**Alternatives considered**:
- `Book`: Closed book — less intuitive for "open documentation"
- `BookOpenText`: More complex icon, heavier visual weight at small sizes

---

## Decision 4: Tab Selection Persistence on Close

**Decision**: No persistence — modal always opens to default tab (Prompt Engineering)

**Rationale**: The spec explicitly states this and it's the simpler implementation. Using `defaultSelectedKey` (uncontrolled) rather than `selectedKey` (controlled) naturally resets on remount. HeroUI `Modal.Backdrop` with `isOpen={false}` unmounts its children, so tab state is discarded on close automatically.

**Alternatives considered**:
- Persist last selected tab: Rejected — spec says no, adds unnecessary complexity (would require either `useState` lifting or localStorage).

---

## No NEEDS CLARIFICATION Items

All decisions were resolvable from the codebase and HeroUI v3 type definitions. No unknowns remain.
