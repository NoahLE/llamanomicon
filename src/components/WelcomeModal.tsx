import { useState, useEffect } from "react";
import { FileText, Sprout, Upload, Compass } from "lucide-react";
import { Modal, Button } from "@heroui/react";

import { ActionCard } from "@/components/ActionCard";

const ERROR_TIMEOUT_MS = 4000;

interface WelcomeModalProps {
  isOpen: boolean;
  onNewFile: () => void;
  onNewSeededFile: () => Promise<void>;
  onImport: () => Promise<void>;
  onStartTour: () => void;
}

export function WelcomeModal({
  isOpen,
  onNewFile,
  onNewSeededFile,
  onImport,
  onStartTour,
}: WelcomeModalProps) {
  const [importError, setImportError] = useState<string | null>(null);
  const [isLoadingSeeded, setIsLoadingSeeded] = useState(false);
  const [isLoadingImport, setIsLoadingImport] = useState(false);

  useEffect(() => {
    if (!importError) return;
    const id = setTimeout(() => setImportError(null), ERROR_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [importError]);

  async function handleNewSeededFile() {
    setImportError(null);
    setIsLoadingSeeded(true);
    try {
      await onNewSeededFile();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsLoadingSeeded(false);
    }
  }

  async function handleImport() {
    setImportError(null);
    setIsLoadingImport(true);
    try {
      await onImport();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsLoadingImport(false);
    }
  }

  return (
    <Modal.Backdrop
      isDismissable={false}
      isKeyboardDismissDisabled
      isOpen={isOpen}
    >
      <Modal.Container size="lg" placement="center">
        <Modal.Dialog>
          <Modal.Header className="flex flex-col gap-2 pb-4">
            <Modal.Heading className="text-2xl font-bold text-(--foreground)">
              Welcome to Llamanomicon
            </Modal.Heading>
            <p className="text-sm text-muted">
              Build powerful LLM prompts from reusable, toggleable snippets.
              Choose how you'd like to get started.
            </p>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-4 overflow-hidden">
            {importError && (
              <span
                role="alert"
                aria-live="assertive"
                className="px-3 py-2 text-xs rounded text-(--danger) bg-(--danger)/10"
              >
                {importError}
              </span>
            )}

            <div className="grid grid-cols-3 gap-3">
              <ActionCard
                icon={<FileText size={28} />}
                label="New File"
                description="Start with a blank workspace"
                onClick={onNewFile}
              />
              <ActionCard
                icon={<Sprout size={28} />}
                label="New Seeded File"
                description="Load a JSON template to start from"
                onClick={() => void handleNewSeededFile()}
                isLoading={isLoadingSeeded}
              />
              <ActionCard
                icon={<Upload size={28} />}
                label="Import"
                description="Restore a previous workspace"
                onClick={() => void handleImport()}
                isLoading={isLoadingImport}
              />
            </div>
          </Modal.Body>

          <Modal.Footer className="flex justify-center pt-2">
            <Button
              variant="ghost"
              onClick={onStartTour}
              className="flex items-center gap-2 text-sm text-muted hover:text-(--foreground)"
              aria-label="Start onboarding tour"
            >
              <Compass size={16} aria-hidden="true" />
              Not sure? Let&apos;s take the tour.
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
