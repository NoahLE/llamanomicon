import { useShallow } from "zustand/react/shallow";
import { Button, Description, Label, ListBox, Avatar } from "@heroui/react";
import { CheckCheck, X } from "lucide-react";

import { useAppStore } from "@/store/useAppStore";
import { selectSortedSkills, UNTAGGED_SKILL_ID } from "@/store/useSkills";
import {
  selectSnippetCountForSkill,
  selectUntaggedSnippetCount,
} from "@/store/useSkills";
import {
  selectSnippetsForSkill,
  selectUntaggedSnippets,
} from "@/store/useSnippets";

import { AppSection } from "@/components/AppSection";
import { AppFormModal } from "@/components/AppFormModal";
import { skillFormFields } from "@/lib/formFields";

export function Skills() {
  const activeSkillId = useAppStore((s) => s.activeSkillId);
  const activeAgentId = useAppStore((s) => s.activeAgentId);
  const setActiveSkillId = useAppStore((s) => s.setActiveSkillId);
  const addSkill = useAppStore((s) => s.addSkill);
  const updateSkill = useAppStore((s) => s.updateSkill);
  const deleteSkill = useAppStore((s) => s.deleteSkill);
  const skills = useAppStore(useShallow(selectSortedSkills));
  const untaggedCount = useAppStore(useShallow(selectUntaggedSnippetCount));
  const skillActiveCounts = useAppStore(
    useShallow((state) => {
      const counts: Record<string, number> = {};
      for (const skill of state.skills.values()) {
        counts[skill.id] = selectSnippetCountForSkill(state, skill.id).active;
      }
      return counts;
    }),
  );
  const skillTotalCounts = useAppStore(
    useShallow((state) => {
      const counts: Record<string, number> = {};
      for (const skill of state.skills.values()) {
        counts[skill.id] = selectSnippetCountForSkill(state, skill.id).total;
      }
      return counts;
    }),
  );

  const activateSnippet = useAppStore((s) => s.activateSnippet);
  const deactivateSnippet = useAppStore((s) => s.deactivateSnippet);

  function handleToggleAll(skillId: string, activate: boolean) {
    if (!activeAgentId) return;
    const state = useAppStore.getState();
    const snippets =
      skillId === UNTAGGED_SKILL_ID
        ? selectUntaggedSnippets(state)
        : selectSnippetsForSkill(state, skillId);
    for (const snippet of snippets) {
      if (activate) {
        activateSnippet(activeAgentId, snippet.id);
      } else {
        deactivateSnippet(activeAgentId, snippet.id);
      }
    }
  }

  const addSkillModal = (
    <AppFormModal
      triggerIcon="add"
      headerText="Add Skill"
      fields={skillFormFields}
      onSave={(values) => {
        if (values.name) {
          addSkill(values.name);
        }
      }}
    />
  );

  return (
    <AppSection title="Skills" variant="skills" controls={addSkillModal}>
      <ListBox
        aria-label="Skills"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={new Set([activeSkillId ?? UNTAGGED_SKILL_ID])}
        onSelectionChange={(keys) => {
          const id =
            keys === "all" ? UNTAGGED_SKILL_ID : ([...keys][0] as string);
          if (id !== activeSkillId) {
            setActiveSkillId(id);
          }
        }}
      >
        <ListBox.Item
          id={UNTAGGED_SKILL_ID}
          textValue="Untagged"
          className={activeSkillId === UNTAGGED_SKILL_ID ? "shadow-lg/20" : ""}
        >
          <div className="flex w-full justify-between">
            <div className="flex">
              <Avatar
                size="sm"
                className={
                  activeSkillId === UNTAGGED_SKILL_ID ? "shadow-md/20" : ""
                }
              >
                <Avatar.Fallback
                  className={
                    activeSkillId === UNTAGGED_SKILL_ID
                      ? "bg-blue-500 text-white"
                      : ""
                  }
                >
                  U
                </Avatar.Fallback>
              </Avatar>

              <div className="flex flex-col ml-3">
                <Label className="text-base">Untagged</Label>
                <Description
                  className={
                    "text-sm font-mono" +
                    `${untaggedCount.active > 0 ? " text-green-600" : ""}`
                  }
                >
                  {untaggedCount.active}/{untaggedCount.total} active
                </Description>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 mr-2" />

              <div
                className="flex gap-1 mr-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  isIconOnly
                  size="sm"
                  variant="secondary"
                  className={
                    activeSkillId === UNTAGGED_SKILL_ID ? "shadow-md/30" : ""
                  }
                  isDisabled={!activeAgentId}
                  onPress={() => handleToggleAll(UNTAGGED_SKILL_ID, true)}
                  aria-label="Activate all snippets"
                >
                  <CheckCheck />
                </Button>

                <Button
                  isIconOnly
                  size="sm"
                  variant="secondary"
                  className={
                    activeSkillId === UNTAGGED_SKILL_ID ? "shadow-md/30" : ""
                  }
                  isDisabled={!activeAgentId}
                  onPress={() => handleToggleAll(UNTAGGED_SKILL_ID, false)}
                  aria-label="Deactivate all snippets"
                >
                  <X />
                </Button>
              </div>
              <ListBox.ItemIndicator />
            </div>
          </div>
        </ListBox.Item>

        {skills.map((skill) => {
          const isActive = activeSkillId === skill.id;
          return (
            <ListBox.Item
              id={skill.id}
              key={skill.id}
              textValue={skill.name}
              className={isActive ? "shadow-md/30" : ""}
            >
              <div className="flex w-full justify-between">
                <div className="flex">
                  <Avatar size="sm" className={isActive ? "shadow-md/30" : ""}>
                    <Avatar.Fallback
                      className={isActive ? "bg-blue-500 text-white" : ""}
                    >
                      {skill.name.slice(0, 1)}
                    </Avatar.Fallback>
                  </Avatar>

                  <div className="flex flex-col ml-3">
                    <Label className="text-base">{skill.name}</Label>
                    <Description
                      className={
                        "text-sm font-mono" +
                        `${skillActiveCounts[skill.id]! > 0 ? " text-green-600" : ""}`
                      }
                    >
                      {skillActiveCounts[skill.id] ?? 0}/
                      {skillTotalCounts[skill.id] ?? 0} active
                    </Description>
                  </div>
                </div>

                <div className="flex items-center">
                  <div
                    className={`flex flex-row mr-2${!isActive ? " invisible pointer-events-none" : ""}`}
                  >
                    <AppFormModal
                      triggerIcon="edit"
                      headerText="Edit Skill"
                      fields={skillFormFields}
                      initialValues={{ name: skill.name }}
                      onSave={(field) => {
                        updateSkill(skill.id, { name: field.name });
                      }}
                      onDelete={() => deleteSkill(skill.id)}
                    />
                  </div>

                  <div
                    className="flex gap-1 mr-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      isIconOnly
                      size="sm"
                      variant="secondary"
                      className={isActive ? "shadow-md/30" : ""}
                      isDisabled={!activeAgentId}
                      onPress={() => handleToggleAll(skill.id, true)}
                      aria-label="Activate all snippets"
                    >
                      <CheckCheck size={14} />
                    </Button>

                    <Button
                      isIconOnly
                      size="sm"
                      variant="secondary"
                      className={isActive ? "shadow-md/30" : ""}
                      isDisabled={!activeAgentId}
                      onPress={() => handleToggleAll(skill.id, false)}
                      aria-label="Deactivate all snippets"
                    >
                      <X size={14} />
                    </Button>
                  </div>

                  <ListBox.ItemIndicator />
                </div>
              </div>
            </ListBox.Item>
          );
        })}
      </ListBox>
    </AppSection>
  );
}
