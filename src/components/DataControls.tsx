import { useState } from "react";
import { Button } from "@heroui/react";

import { useAppStore } from "@/store/useAppStore";
import { exportState, importStateFromFile } from "@/lib/importExport";

const ERROR_TIMEOUT_MS = 4000;

export function DataControls() {
  const importState = useAppStore((s) => s.importState);
  const lastImportTimestamp = useAppStore((s) => s.lastImportTimestamp);

  const [importError, setImportError] = useState<string | null>(null);

  async function handleExport() {
    await exportState(useAppStore.getState());
  }

  async function handleImport() {
    setImportError(null);
    try {
      const appState = await importStateFromFile();
      if (appState === null) return;
      importState(appState);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Import failed";
      setImportError(msg);
      setTimeout(() => setImportError(null), ERROR_TIMEOUT_MS);
    }
  }

  return (
    <div className="flex flex-col my-5">
      <h1 className="mb-1 font-bold">Data Controls</h1>

      {importError && (
        <span
          role="alert"
          aria-live="assertive"
          className="px-2 py-1 text-xs text-danger rounded bg-(--danger)/10"
        >
          {importError}
        </span>
      )}

      <Button
        onClick={() => void handleExport()}
        aria-label="Export state to JSON file"
        className="shadow-md/30"
      >
        Export Data to File
      </Button>

      <Button
        onClick={() => void handleImport()}
        aria-label="Import state from JSON file"
        className="shadow-md/30 mt-3 mb-1"
      >
        Import Data from File
      </Button>

      {lastImportTimestamp && (
        <p className="text-xs text-default-500 ml-4">
          Snapshot from: {lastImportTimestamp}
        </p>
      )}
    </div>
  );
}
