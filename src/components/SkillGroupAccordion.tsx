import { Accordion } from "@heroui/react";
import type { SkillGroup } from "@/store/useAgents";

interface SkillGroupAccordionProps {
  group: SkillGroup;
  index: number;
}

export function SkillGroupAccordion({ group }: SkillGroupAccordionProps) {
  return (
    <Accordion.Item id={group.skillId}>
      <Accordion.Heading>
        <Accordion.Trigger className="justify-start text-base">
          {group.skillName}

          <Accordion.Indicator />
        </Accordion.Trigger>
      </Accordion.Heading>

      <Accordion.Panel>
        <Accordion.Body>
          <ul className="space-y-1">
            {group.snippets.map((snippet) => (
              <li key={snippet.id} className="px-1 py-0.5">
                {snippet.name}
              </li>
            ))}
          </ul>
        </Accordion.Body>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
