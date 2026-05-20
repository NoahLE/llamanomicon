import { useShallow } from "zustand/react/shallow";
import {
  Avatar,
  ButtonGroup,
  Description,
  Label,
  ListBox,
} from "@heroui/react";

import { useAppStore } from "@/store/useAppStore";
import { selectSortedAgents } from "@/store/useAgents";
import { agentFormFields } from "@/lib/formFields";

import { AppSection } from "@/components/AppSection";
import { AppFormModal } from "@/components/AppFormModal";

export function Agents() {
  const activeAgentId = useAppStore((s) => s.activeAgentId);
  const agents = useAppStore(useShallow(selectSortedAgents));
  const setActiveAgentId = useAppStore((s) => s.setActiveAgentId);
  const addAgent = useAppStore((s) => s.addAgent);
  const deleteAgent = useAppStore((s) => s.deleteAgent);
  const updateAgent = useAppStore((s) => s.updateAgent);

  const addAgentModal = (
    <AppFormModal
      triggerIcon="add"
      headerText="Add Agent"
      fields={agentFormFields}
      onSave={(agent) => agent.name && addAgent(agent.name)}
    />
  );

  return (
    <AppSection title="Agents" variant="agents" controls={addAgentModal}>
      {agents.length === 0 && (
        <p className="px-1 py-2 text-xs text-muted">Please create an agent</p>
      )}

      <ListBox
        aria-label="agents"
        selectionMode="single"
        selectedKeys={activeAgentId ? new Set([activeAgentId]) : new Set()}
        onSelectionChange={(keys) => {
          const id =
            keys === "all" ? null : ([...keys][0] as string | undefined);
          if (id !== undefined) setActiveAgentId(id);
        }}
      >
        {agents.map((agent) => {
          const isActive = activeAgentId === agent.id;
          return (
            <ListBox.Item
              id={agent.id}
              key={agent.id}
              textValue={agent.name}
              className={isActive ? "shadow-lg/20" : ""}
            >
              <div className="flex justify-between w-full">
                <div className="flex items-center">
                  <Avatar size="sm" className={isActive ? "shadow-md/30" : ""}>
                    <Avatar.Fallback
                      className={isActive ? "bg-blue-500 text-white" : ""}
                    >
                      {agent.name.slice(0, 1)}
                    </Avatar.Fallback>
                  </Avatar>

                  <div className="flex flex-col ml-3">
                    <Label className="text-base">{agent.name}</Label>
                    <Description
                      className={`text-sm font-mono${agent.activeSet.size > 0 ? " text-green-600" : ""}`}
                    >
                      {agent.activeSet.size} active
                    </Description>
                  </div>
                </div>

                <div className="flex flex-row mr-4">
                  {isActive && (
                    <ButtonGroup>
                      <AppFormModal
                        triggerIcon="edit"
                        headerText="Update Agent"
                        fields={agentFormFields}
                        initialValues={{ name: agent.name }}
                        onSave={(field) =>
                          updateAgent(agent.id, { name: field.name })
                        }
                        onDelete={() => deleteAgent(agent.id)}
                      />
                    </ButtonGroup>
                  )}

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
