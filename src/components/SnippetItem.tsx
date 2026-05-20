import { Description, Label, ListBox, Switch } from "@heroui/react";

import type { FormField } from "@/lib/formFields";
import type { Snippet } from "@/types";

import { AppFormModal } from "@/components/AppFormModal";

interface SnippetItemProps {
  snippet: Snippet;
  index: number;
  snippetFields: FormField[];
  onUpdate: (name: string, text: string) => void;
  onDelete: () => void;
  onSaveWithSkills: (v: Record<string, string>) => void;
}

export function SnippetItem({
  snippet,
  snippetFields,
  onDelete,
  onSaveWithSkills,
}: SnippetItemProps) {
  return (
    <ListBox.Item id={snippet.id} textValue={snippet.name}>
      <div className="flex flex-row justify-between w-full">
        <div className="flex">
          <div className="flex flex-col ml-2">
            <Label className="text-base">{snippet.name}</Label>

            <Description className="text-sm">
              {snippet.text.slice(0, 120)}
              {snippet.text.length > 120 ? "…" : ""}
            </Description>
          </div>
        </div>
      </div>

      <div className="flex mr-4">
        <AppFormModal
          triggerIcon="edit"
          headerText="Edit Snippet"
          fields={snippetFields}
          initialValues={{
            name: snippet.name,
            text: snippet.text,
            skills: [...snippet.skills].join(","),
          }}
          onSave={onSaveWithSkills}
          onDelete={onDelete}
        />

        <ListBox.ItemIndicator>
          {({ isSelected }) => (
            <div className="pointer-events-none">
              <Switch isSelected={isSelected}>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
            </div>
          )}
        </ListBox.ItemIndicator>
      </div>
    </ListBox.Item>
  );
}
