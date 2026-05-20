import { useCallback, useMemo, useState } from "react";
import { Button, Modal, Surface } from "@heroui/react";
import { Plus, Edit } from "lucide-react";

import type { FormField } from "@/lib/formFields";
import { AppFormFieldGenerator } from "@/components/AppFormFieldGenerator";

interface AppFormModalProps {
  triggerIcon?: "add" | "edit";
  headerText?: string;
  fields?: FormField[];
  initialValues?: Record<string, string>;
  onSave?: (values: Record<string, string>) => void;
  onClose?: () => void;
  onDelete?: () => void;
}

export function AppFormModal({
  triggerIcon = "add",
  headerText = "Add Item",
  fields = [],
  initialValues,
  onSave,
  onClose,
  onDelete,
}: AppFormModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const defaults = useMemo(
    () =>
      fields.reduce<Record<string, string>>(
        (acc, f) => ({ ...acc, [f.key]: f.defaultValue ?? "" }),
        {},
      ),
    [fields],
  );
  const [values, setValues] = useState<Record<string, string>>(defaults);

  const openModal = useCallback(() => {
    setValues(initialValues ? { ...defaults, ...initialValues } : defaults);
    setIsModalOpen(true);
  }, [initialValues, defaults]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    onClose?.();
  }, [onClose]);

  const handleSave = useCallback(() => {
    onSave?.(values);
    closeModal();
  }, [values, onSave, closeModal]);

  const handleChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleDeleteRequest = useCallback(() => {
    setIsConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    onDelete?.();
    closeModal();
  }, [onDelete, closeModal]);

  const handleDeleteCancel = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  return (
    <Modal>
      <Button
        isIconOnly
        className="flex shadow-md/30"
        variant="secondary"
        size="sm"
        onPress={openModal}
      >
        {triggerIcon === "add" ? (
          <Plus />
        ) : (
          <Edit color="var(--color-orange-400)" />
        )}
      </Button>

      <Modal.Backdrop
        variant="blur"
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger className="mt-2" />

            <Modal.Header>
              <Modal.Heading>{headerText}</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <Surface
                variant="default"
                className="flex flex-column flex-1 h-auto"
              >
                <div className="flex-1 mx-3 mt-3">
                  {fields.map((field) => (
                    <AppFormFieldGenerator
                      key={field.key}
                      field={field}
                      value={values[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={handleChange}
                    />
                  ))}
                </div>
              </Surface>
            </Modal.Body>

            <Modal.Footer>
              <div className="w-full flex justify-between">
                <div className="flex">
                  {onDelete && (
                    <Button
                      className="shadow-md/30"
                      variant="danger"
                      onClick={handleDeleteRequest}
                    >
                      Delete
                    </Button>
                  )}
                </div>

                <div className="flex">
                  <Button
                    variant="secondary"
                    className="shadow-md/30"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>

                  <Button className="shadow-md/30 ml-3" onClick={handleSave}>
                    Save
                  </Button>
                </div>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Modal.Backdrop
        variant="blur"
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
      >
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>Confirm Delete</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <p className="text-sm text-default-600">
                This action cannot be undone. Are you sure you want to delete
                this item?
              </p>
            </Modal.Body>

            <Modal.Footer>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  className="shadow-md/30"
                  onClick={handleDeleteCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="shadow-md/30"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </Button>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
