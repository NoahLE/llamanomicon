# Research: Llamanomicon V1 Core

**Branch**: `001-v1-core` | **Date**: 2026-03-07

## 1. shadcn/ui + Tailwind CSS v4 Compatibility

**Decision**: Use shadcn/ui with the new Tailwind v4 CSS-variable approach.

**Rationale**: shadcn/ui added official Tailwind v4 support in early 2025. The `npx shadcn
init` flow detects Tailwind v4 automatically and generates CSS-variable tokens in `index.css`
rather than `tailwind.config.js`. The `@/` alias is still required and already planned.

**Key differences from Tailwind v3**:

- No `tailwind.config.js` — all config via `@theme` directive in CSS
- Colors and design tokens injected as CSS custom properties
- shadcn components use `cn()` (clsx + tailwind-merge) — works identically

**Alternatives considered**: Rolling bespoke UI components — rejected; violates constitution
Principle V (DRY) and Principle II (UX Consistency). shadcn gives accessible primitives free.

**Action required**: Run `npx shadcn@latest init` after installing peer deps. Select
"Dark" as default theme to match the neoskeumorphic dark-first design direction.

---

## 2. Zustand + Dexie.js Persistence Sync Pattern

**Decision**: Single Zustand store as runtime state; Dexie.js as async persistence layer.
Sync is one-directional: Zustand → Dexie on every meaningful state mutation.

**Pattern**:

```
App boot:
  1. Dexie.open() → load AppState from IndexedDB
  2. Zustand.setState(loaded) — hydrates runtime store
  3. UI renders from Zustand

On mutation (create/update/delete/reorder/toggle):
  1. Zustand reducer updates in-memory state (sync, instant)
  2. Fire-and-forget: dexie.appState.put(serializedState) (async, does not block UI)
  3. Catch write errors and surface as toast (non-blocking)
```

**Key rule**: Zustand is the source of truth at runtime. Dexie is the durable backup.
Never read from Dexie during normal operation after boot — only on cold start.

**Alternatives considered**:

- Zustand `persist` middleware with custom IndexedDB storage — rejected; Dexie gives
  a cleaner migration API if the schema evolves, and explicit control over when writes happen.
- Single `dexie-react-hooks` pattern — rejected; couples UI directly to DB, violates
  store-as-single-source principle.

---

## 3. dnd-kit Snippet Reordering

**Decision**: Use `@dnd-kit/react` v0.3.2 — the new unified React adapter for dnd-kit.
The user installed this package instead of the original `@dnd-kit/core` + `@dnd-kit/sortable`

- `@dnd-kit/utilities` split. The API is meaningfully different from the original packages.

**Installed packages** (transitive deps of `@dnd-kit/react`):

- `@dnd-kit/abstract`, `@dnd-kit/collision`, `@dnd-kit/dom`, `@dnd-kit/geometry`, `@dnd-kit/state`

**Key API differences from legacy dnd-kit**:

- `DragDropProvider` (from `@dnd-kit/react`) replaces `DndContext` — no sensors config needed
- No `SortableContext` or `verticalListSortingStrategy`
- `useSortable({ id, index })` from `@dnd-kit/react/sortable` — returns callback refs
- Library handles visual item displacement automatically; no transform/transition CSS needed
- No `arrayMove` built-in — must implement inline in the store
- `KeyboardSensor` and `PointerSensor` re-exported from `@dnd-kit/dom` via `@dnd-kit/react`

**Correct sortable pattern for v1**:

```tsx
// SnippetsPanelItem.tsx
import { useSortable } from "@dnd-kit/react/sortable";

function SnippetsPanelItem({
  snippet,
  index,
}: {
  snippet: Snippet;
  index: number;
}) {
  const { ref, handleRef, isDragging } = useSortable({ id: snippet.id, index });
  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <button ref={handleRef} aria-label="Drag handle">
        <GripVertical />
      </button>
      {/* toggle, text, context menu */}
    </div>
  );
}

// SnippetsPanel.tsx
import { DragDropProvider } from "@dnd-kit/react";

function SnippetsPanel() {
  const handleDragEnd = (event: DragEndEvent) => {
    const { source, target } = event.operation;
    if (!source || !target || source.id === target.id) return;
    reorderSnippets(selectedGroupId!, String(source.id), String(target.id));
  };
  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      {snippets.map((s, i) => (
        <SnippetsPanelItem key={s.id} snippet={s} index={i} />
      ))}
    </DragDropProvider>
  );
}
```

**`arrayMove` implementation** (in `src/store/useAppStore.ts` — no external import needed):

```ts
function arrayMove<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array];
  const [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}
```

**Accessibility**: `@dnd-kit/react` includes keyboard sensor support. Announce reorder
via `aria-live="polite"` region in `SnippetsPanel.tsx`.

**Alternatives considered**: `react-beautiful-dnd` — rejected; unmaintained. Original
`@dnd-kit/core` + `@dnd-kit/sortable` — not installed; do not mix package sets.

---

## 4. vite-plugin-pwa Configuration

**Decision**: Use `vite-plugin-pwa` with Workbox `generateSW` strategy, caching all app
assets for full offline capability.

**Minimal config**:

```ts
VitePWA({
  registerType: "autoUpdate",
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
  },
  manifest: {
    name: "Llamanomicon",
    short_name: "Llamanomicon",
    theme_color: "#0f0f0f",
    background_color: "#0f0f0f",
    display: "standalone",
    icons: [
      /* 192x192, 512x512 */
    ],
  },
});
```

**Key behaviour**: On first load, SW caches all assets. On subsequent loads, app works
fully offline. `registerType: 'autoUpdate'` silently updates the SW in the background.

**Alternatives considered**: Manual service worker — rejected; maintenance burden with no
benefit; vite-plugin-pwa is the canonical solution for Vite PWAs.

---

## 5. File System Access API + Fallback

**Decision**: Use File System Access API (`showOpenFilePicker` / `showSaveFilePicker`) as
the primary import/export mechanism, with a download-link/file-input fallback for Firefox.

**Export flow**:

```ts
// Chrome/Edge
const handle = await window.showSaveFilePicker({
  suggestedName: "llamanomicon.json",
});
const writable = await handle.createWritable();
await writable.write(JSON.stringify(state, null, 2));
await writable.close();

// Firefox fallback
const blob = new Blob([JSON.stringify(state, null, 2)], {
  type: "application/json",
});
const url = URL.createObjectURL(blob);
// trigger <a download> click
```

**Import flow**: Chrome/Edge uses `showOpenFilePicker`; Firefox uses `<input type="file">`.
Feature detection: `'showOpenFilePicker' in window`.

**Alternatives considered**: Always use download/upload fallback — simpler, but gives up
the native save-dialog UX in Chrome/Edge which is significantly better.

---

## 6. GSAP + React Integration _(Deferred to v2)_

**Decision**: GSAP animations are NOT implemented in V1. `gsap` is already present in
`package.json` from initial project setup but `@gsap/react` is not installed and no
animation code ships in V1.

**V2 plan**: Use `@gsap/react` (`useGSAP` hook) for panel entrance animations (staggered
list items), copy-success pulse feedback on the Output Window copy button, and group/flow
list item appearance animations. Neoskeumorphic tactile hover/press animations are also
planned for v2 alongside the visual design upgrade.

**V1 approach**: CSS transitions only for hover states and focus rings (handled by shadcn/ui
component defaults). No GSAP code, no `@gsap/react` import.

**Rationale for deferral**: Animations add no functional value to v1 and increase bundle
size and implementation complexity. Ship the core loop first; polish in v2.

---

## 7. Open Questions Resolution (from project summary)

| Question                                        | Resolution for V1                                                                         |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Output format settings: per-flow or global?     | **Global** — one `outputSettings` object in store; simpler, sufficient for V1             |
| Icon system for flows: emoji only or picker?    | **Emoji only** — plain text emoji input/picker via native emoji keyboard; no icon library |
| Snippet edit history / versioning?              | **Deferred to v2** — no history in V1                                                     |
| Node graph: group-to-group or group membership? | **Deferred to v2** — no graph in V1 at all                                                |

---

## 8. Missing Dependencies (not yet installed)

The following packages are required but not present in `package.json`:

All runtime and dev dependencies have been installed by the user. Current `package.json` state:

| Package             | Version | Notes                                                                 |
| ------------------- | ------- | --------------------------------------------------------------------- |
| `zustand`           | ^5.0.11 | ✅ Installed                                                          |
| `dexie`             | ^4.3.0  | ✅ Installed                                                          |
| `dexie-react-hooks` | ^4.2.0  | ✅ Installed — available but not required; Zustand is source of truth |
| `@dnd-kit/react`    | ^0.3.2  | ✅ Installed — new unified API (see §3 above)                         |
| `vite-plugin-pwa`   | ^1.2.0  | ✅ Installed (dev dep)                                                |
| `gsap`              | ^3.14.2 | ✅ Present — unused in v1; reserved for v2 animations                 |

`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` are NOT installed and MUST NOT
be imported. All dnd-kit usage goes through `@dnd-kit/react` and `@dnd-kit/react/sortable`.

shadcn/ui components are installed individually via `npx shadcn@latest add <component>` (no
separate npm install). Required: `button`, `input`, `textarea`, `switch`, `badge`, `dialog`,
`dropdown-menu`, `context-menu`, `scroll-area`, `separator`, `sonner`.

shadcn/ui components are installed individually via `npx shadcn add <component>` — they
copy source files into `src/components/ui/`. No extra `npm i` step for the package itself.

**Required shadcn components**: `button`, `input`, `textarea`, `switch`, `badge`,
`dialog`, `dropdown-menu`, `context-menu`, `scroll-area`, `separator`, `toast`.
