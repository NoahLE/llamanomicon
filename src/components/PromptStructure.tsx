import { Accordion } from "@heroui/react";

import { useAppStore } from "@/store/useAppStore";
import {
  selectActiveAgent,
  selectSkillGroupsForOutput,
} from "@/store/useAgents";
import { selectCompiledOutputXML } from "@/store/useSettings";

import { AppSection } from "@/components/AppSection";
import { SkillGroupAccordion } from "@/components/SkillGroupAccordion";

export function PromptStructure() {
  const xmlOutput = useAppStore(selectCompiledOutputXML);
  const activeAgent = useAppStore(selectActiveAgent);
  const skillGroups = useAppStore(selectSkillGroupsForOutput);

  const emptyText = (
    <p className="px-3 py-4 text-xs text-muted">
      {activeAgent
        ? "Toggle snippets to build your prompt"
        : "Select an agent to get started"}
    </p>
  );

  return (
    <AppSection title="Structure" variant={xmlOutput ? "output" : undefined}>
      {skillGroups.length === 0 && emptyText}

      {skillGroups.length > 0 && (
        <Accordion
          allowsMultipleExpanded
          variant="surface"
          defaultExpandedKeys={new Set(skillGroups.map((g) => g.skillId))}
        >
          {skillGroups.map((group, index) => (
            <SkillGroupAccordion
              key={group.skillId}
              group={group}
              index={index}
            />
          ))}
        </Accordion>
      )}
    </AppSection>
  );
}
