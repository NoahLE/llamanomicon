# UI Contract: WelcomeModal

**Component**: `src/components/WelcomeModal.tsx`  
**Type**: HeroUI `Modal` (blocking, non-dismissible via outside click / Escape)

---

## Props

```typescript
interface WelcomeModalProps {
  isOpen: boolean;
  onNewFile: () => void;
  onNewSeededFile: () => Promise<void>;
  onImport: () => Promise<void>;
  onStartTour: () => void;
}
```

| Prop | Type | Behaviour |
|---|---|---|
| `isOpen` | `boolean` | Controls modal visibility. Passed from `App.tsx` |
| `onNewFile` | `() => void` | Calls `clearData()`, sets `isWelcomeModalVisible = false` |
| `onNewSeededFile` | `() => Promise<void>` | Opens file picker via `importStateFromFile()`; on success calls `importState()`; on cancel/error stays open with error message |
| `onImport` | `() => Promise<void>` | Same mechanism as `onNewSeededFile`; semantically framed as "restore a backup" |
| `onStartTour` | `() => void` | Calls `seedData()`, sets `isWelcomeModalVisible = false`, then calls `startOnboardingTour()` |

---

## Layout Structure

```
Modal (blocking, isDismissable=false, hideCloseButton=true)
├── ModalHeader
│   └── Row 1 (full width): Welcome heading + descriptive copy
├── ModalBody
│   └── Row 2 (3-column grid): [New File card] [New Seeded File card] [Import card]
└── ModalFooter
    └── Row 3 (full width): "Not sure, let's take the tour." button (ghost/text variant)
```

---

## Error Display

- Import error shown inline below Row 2 cards
- Error auto-clears after 4 000 ms (mirrors `DataControls` pattern)
- Error styled with `text-(--danger)` and `bg-(--danger)/10` tokens (matches existing `DataControls` error style)

---

## Interaction Rules

| Trigger | Behaviour |
|---|---|
| Click outside modal | No-op (modal stays open) |
| Press Escape | No-op (modal stays open) |
| Click "New File" | Synchronous — closes immediately |
| Click "New Seeded File" | Opens file picker; modal stays open until success or cancel |
| Click "Import" | Opens file picker; modal stays open until success or cancel |
| Click "Not sure, let's take the tour" | Synchronous — closes immediately, seeds app, launches tour |

---

## contract: AppSection `data-tour-target`

**Component**: `src/components/AppSection.tsx`

`Card.Root` receives `data-tour-target={variant}` when `variant` is defined. This is the only change to `AppSection`.

```tsx
<Card.Root
  data-tour-target={variant}   // ← new
  className="..."
  style={cardStyle}
>
```

No prop changes. The attribute is emitted for all four `PanelVariant` values: `agents`, `skills`, `snippets`, `output`.

---

## contract: AppHeader `?` Button and `onNewSession`

**Component**: `src/components/AppHeader.tsx`

```typescript
interface AppHeaderProps {
  onStartTour: () => void;    // passed from App.tsx → startOnboardingTour
  onNewSession: () => void;   // passed from App.tsx → setIsWelcomeModalVisible(true)
}
```

`onNewSession` is forwarded to `DataControls` → `SessionControls`. `SessionControls` calls `clearData()` from the store then calls `onNewSession()`.

`?` button:
- Icon: `CircleHelp` from `lucide-react`
- `aria-label="Launch onboarding tour"`
- Neoskeumorphic shadow via `--nav-btn-shadow` / `--nav-btn-shadow-active` tokens
- `data-tour-target="help-button"` — targeted by tour step 7

---

## contract: SessionControls / DataControls

**`DataControls`** (`src/components/DataControls.tsx`) accepts `onNewSession: () => void` and forwards it to `SessionControls`.

**`SessionControls`** (`src/components/SessionControls.tsx`) accepts `onNewSession: () => void`. In `handleConfirmClear` it: (1) calls `clearData()` from the Zustand store, (2) closes its confirmation dialog, (3) calls `onNewSession()`. It returns a React Fragment (not a wrapper `<div>`) so its buttons are direct siblings of Import/Export in AppHeader's flex container, giving uniform spacing.

---

## contract: startOnboardingTour

**Location**: `src/lib/onboardingTour.ts` (plain module — not a React hook)

```typescript
export function startOnboardingTour(): void
```

- Module-level `let tourInstance` holds the live intro.js instance
- If an instance is active, exits it cleanly before starting a new one
- Configures 8 steps from `src/data/tour.ts`; calls `.start()`
- `onComplete` / `onExit` handlers null out `tourInstance`
- Imported directly in `App.tsx` — not called as a hook

**Note**: The original `useOnboardingTour` React hook design was abandoned after `babel-plugin-react-compiler` inlined its `useRef` into `App`'s hook sequence, causing a fatal hook order violation. See research.md Decision 2.
