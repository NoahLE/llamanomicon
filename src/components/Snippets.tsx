import { useShallow } from "zustand/react/shallow";
import { ListBox } from "@heroui/react";

import type { FormField } from "@/lib/formFields";
import { snippetFormFields } from "@/lib/formFields";
import type { Snippet } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { selectActiveAgent } from "@/store/useAgents";
import { selectAllSnippets } from "@/store/useSnippets";
import {
  selectUntaggedSnippets,
  selectSnippetsForSkill,
} from "@/store/useSnippets";
import { selectSortedSkills, UNTAGGED_SKILL_ID } from "@/store/useSkills";

import { AppFormModal } from "@/components/AppFormModal";
import { AppSection } from "@/components/AppSection";
import { SnippetItem } from "@/components/SnippetItem";

export function Snippet() {
  const updateSnippet = useAppStore((s) => s.updateSnippet);
  const deleteSnippet = useAppStore((s) => s.deleteSnippet);
  const addSkillToSnippet = useAppStore((s) => s.addSkillToSnippet);
  const removeSkillFromSnippet = useAppStore((s) => s.removeSkillFromSnippet);
  const activeSkillId = useAppStore((s) => s.activeSkillId);
  const snippets = useAppStore(
    useShallow((s) => {
      if (!activeSkillId) return selectAllSnippets(s);
      if (activeSkillId === UNTAGGED_SKILL_ID) return selectUntaggedSnippets(s);
      return selectSnippetsForSkill(s, activeSkillId);
    }),
  );
  const activeAgent = useAppStore(selectActiveAgent);
  const activateSnippet = useAppStore((s) => s.activateSnippet);
  const deactivateSnippet = useAppStore((s) => s.deactivateSnippet);
  const addSnippet = useAppStore((s) => s.addSnippet);
  const sortedSkills = useAppStore(useShallow(selectSortedSkills));

  const skillOptions = sortedSkills.map((s) => ({ id: s.id, label: s.name }));

  const snippetFields: FormField[] = [
    ...snippetFormFields,
    { key: "skills", label: "Skills", type: "taggroup", options: skillOptions },
  ];

  const addSnippetModal = (
    <AppFormModal
      triggerIcon="add"
      headerText="Add Snippet"
      fields={snippetFields}
      onSave={(v) => {
        if (v.name && v.text) {
          const skillIds = new Set((v.skills ?? "").split(",").filter(Boolean));
          addSnippet(v.name, v.text, skillIds);
        }
      }}
    />
  );

  return (
    <AppSection title="Snippets" variant="snippets" controls={addSnippetModal}>
      {snippets.length === 0 && (
        <p className="px-1 my-2 text-muted">No snippets yet</p>
      )}

      <ListBox
        aria-label="Snippets"
        selectionMode="multiple"
        selectedKeys={activeAgent?.activeSet ?? new Set()}
        onSelectionChange={(keys) => {
          if (!activeAgent) return;
          const newKeys =
            keys === "all"
              ? new Set(snippets.map((s) => s.id))
              : new Set([...keys] as string[]);
          const current = activeAgent.activeSet;
          for (const id of newKeys) {
            if (!current.has(id)) activateSnippet(activeAgent.id, id);
          }
          for (const id of current) {
            if (!newKeys.has(id)) deactivateSnippet(activeAgent.id, id);
          }
        }}
      >
        {snippets.map((snippet, index) => (
          <SnippetItem
            key={snippet.id}
            snippet={snippet}
            index={index}
            snippetFields={snippetFields}
            onUpdate={(name, text) => updateSnippet(snippet.id, { name, text })}
            onDelete={() => deleteSnippet(snippet.id)}
            onSaveWithSkills={(v) => {
              updateSnippet(snippet.id, {
                name: v.name ?? "",
                text: v.text ?? "",
              });
              const newSkillIds = new Set(
                (v.skills ?? "").split(",").filter(Boolean),
              );
              for (const id of newSkillIds) {
                if (!snippet.skills.has(id)) addSkillToSnippet(snippet.id, id);
              }
              for (const id of snippet.skills) {
                if (!newSkillIds.has(id))
                  removeSkillFromSnippet(snippet.id, id);
              }
            }}
          />
        ))}
      </ListBox>
    </AppSection>
  );
}
