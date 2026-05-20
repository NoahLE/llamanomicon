# Quickstart: Llamanomicon V1 Core

**Branch**: `001-v1-core` | **Date**: 2026-03-07

> All project commands run through the **Makefile**. Use `make <target>` rather than
> invoking npm scripts directly.

## Prerequisites

- Node.js 20+ and npm 10+
- A modern browser (Chrome or Edge recommended; Firefox supported with reduced File I/O UX)
- Git

## 1. Install Dependencies

```bash
# Clone and enter the repo
git clone <repo-url> llamanomicon
cd llamanomicon

# Install all dependencies via Makefile
make install

# Install missing V1 dependencies (not yet in package.json)
npm install zustand dexie @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D vite-plugin-pwa workbox-window
```

## 2. Initialize shadcn/ui

```bash
make setup
# Equivalent to: npx shadcn@latest init
```

When prompted:

- Style: **Default**
- Base color: **Zinc** (dark theme compatible)
- CSS variables: **Yes**
- `@/` alias: confirm as `src/`

Then add required components:

```bash
npx shadcn@latest add button input textarea switch badge dialog \
  dropdown-menu context-menu scroll-area separator sonner
```

## 3. Run the Dev Server

```bash
make dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 4. Lint and Type-check

```bash
make lint     # ESLint auto-fix + Prettier auto-fix
make build    # TypeScript strict type-check + production build
```

Both MUST pass before any commit is considered complete.

## 5. Preview Production Build

```bash
make preview
```

## 6. Basic Usage Loop

Once the app is running:

1. **Create a Flow** — Click the `+` button in the Flow List panel (top-left). Give it a
   name and an emoji icon.

2. **Create a Group** — Click `+` in the Groups List panel (bottom-left). Give it a name.

3. **Add Snippets** — With a Group selected, click `+` in the Snippets Panel (bottom-center).
   Type your prompt text and save.

4. **Toggle Snippets** — Use the toggle switch on each snippet row to activate/deactivate it
   for the current Flow.

5. **Copy the Output** — The Output Window (right column) shows the compiled prompt in
   real time. Click **Copy** to copy it to the clipboard.

## 7. Import / Export

- **Export**: Click the **Export** button in the Output Window. A JSON file
  (`llamanomicon-export-YYYY-MM-DD.json`) is saved (native save dialog in Chrome/Edge;
  auto-download in Firefox).

- **Import**: Click **Import** and select a previously exported JSON file. This **replaces**
  all current data — there is no merge or undo.

## 8. PWA Installation

In Chrome/Edge, a browser install prompt appears after the first page load. Click **Install**
to add Llamanomicon to your desktop/dock. After installation, the app works fully offline.

## 9. Project Structure Reference

```
src/
├── components/          # All components (flat directory, nested naming convention)
│   ├── ui/              # shadcn/ui generated components (do not edit)
│   ├── AppLayout.tsx    # Grid shell
│   ├── PanelCard.tsx    # Dark panel wrapper
│   ├── FlowList.tsx     # + FlowListItem.tsx, FlowListToolbar.tsx
│   ├── GroupsList.tsx   # + GroupsListItem.tsx, GroupsListToolbar.tsx
│   ├── SnippetsPanel.tsx # + SnippetsPanelItem.tsx, SnippetsPanelToolbar.tsx
│   └── OutputWindow.tsx
├── store/useAppStore.ts  # All runtime state (Zustand)
├── db/database.ts        # IndexedDB via Dexie
├── lib/compiler.ts       # Pure output compilation
├── lib/importExport.ts   # JSON import/export
├── hooks/useClipboard.ts # Clipboard with feedback
└── types/index.ts        # All TypeScript interfaces
```

See `specs/001-v1-core/data-model.md` for the full data model and
`specs/001-v1-core/contracts/` for system contracts.

## 10. V2 Planned Features

The following are intentionally out of scope for V1 and will be addressed in V2:

- **GSAP animations** — entrance animations, copy-success pulse, list item stagger
- **Neoskeumorphic design** — tactile panel styling, inset shadows, depth effects
- **Node graph** — visual group relationship viewer (React Flow)
- **Append zone** — freeform editable area below compiled output
- **Group reordering per flow** — drag groups to change output order per flow
