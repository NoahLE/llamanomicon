import { useState } from "react";
import { Button, Modal } from "@heroui/react";

import { useAppStore } from "@/store/useAppStore";
import { selectHasUnsavedChanges } from "@/store/useDataControls";
import { useWelcomeModal } from "@/context/WelcomeModalContext";

export function SessionControls() {
  const clearData = useAppStore((s) => s.clearData);
  const saveSession = useAppStore((s) => s.saveSession);
  const discardSession = useAppStore((s) => s.discardSession);
  const openWelcomeModal = useWelcomeModal();
  const hasUnsavedChanges = useAppStore(selectHasUnsavedChanges);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function handleClear() {
    setIsConfirmOpen(true);
  }

  function handleConfirmClear() {
    clearData();
    setIsConfirmOpen(false);
    openWelcomeModal();
  }

  return (
    <>
      <Modal.Backdrop
        variant="blur"
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
      >
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.CloseTrigger className="mt-2" />

            <Modal.Header>
              <Modal.Heading>Start New Session?</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <p className="text-sm">
                All current data will be cleared and replaced with a fresh
                session. Any unexported data will be permanently lost.
              </p>
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="secondary"
                className="shadow-md/30"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                className="shadow-md/30"
                onClick={handleConfirmClear}
              >
                New Session
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Button
        isDisabled={!hasUnsavedChanges}
        onClick={() => saveSession()}
        aria-label="Save session"
        size="sm"
        className="shadow-md/30"
      >
        Save
      </Button>

      <Button
        isDisabled={!hasUnsavedChanges}
        onClick={() => discardSession()}
        aria-label="Reset session"
        size="sm"
        className="shadow-md/30"
      >
        Reset
      </Button>

      <Button
        onClick={() => handleClear()}
        variant="secondary"
        aria-label="Reset all data"
        size="sm"
        className="shadow-md/30"
      >
        New
      </Button>
    </>
  );
}
