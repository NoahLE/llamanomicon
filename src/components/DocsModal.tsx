import { useState, type ReactNode } from "react";
import { Button, Modal, Tabs } from "@heroui/react";

import { DocsPromptEngineering } from "@/components/DocsPromptEngineering";
import { DocsTips } from "@/components/DocsTips";
import { DocsSources } from "@/components/DocsSources";
import { DocsTutorial } from "./DocsTutorial";

interface TabContent {
  label: string;
  component: () => ReactNode;
}

export function DocsModal() {
  const [isOpen, setIsOpen] = useState(false);

  const tabs: TabContent[] = [
    { label: "Introduction", component: DocsPromptEngineering },
    { label: "Tips", component: DocsTips },
    { label: "Tutorials", component: DocsTutorial },
    { label: "Sources", component: DocsSources },
  ];

  return (
    <Modal>
      <Button
        aria-label="Open documentation"
        className="shadow-md/30 my-2"
        onPress={() => setIsOpen(true)}
      >
        Documentation
      </Button>

      <Modal.Backdrop variant="blur" isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Container>
          <Modal.Dialog className="h-[50vh] max-w-3xl">
            <Modal.CloseTrigger className="mt-1 shadow-md/30" />

            <Modal.Header>
              <Modal.Heading>Documentation</Modal.Heading>
            </Modal.Header>

            <Modal.Body className="overflow-hidden flex flex-col">
              <Tabs
                defaultSelectedKey="prompt-engineering"
                className="px-5 flex flex-col flex-1 min-h-0"
              >
                <Tabs.List className="shadow-md/30">
                  {tabs.map((tab) => (
                    <Tabs.Tab key={tab.label} id={tab.label}>
                      {tab.label}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>

                {tabs.map((tab) => (
                  <Tabs.Panel
                    key={tab.label}
                    id={tab.label}
                    className="mx-4 my-1 text-lg overflow-y-auto flex-1"
                  >
                    {tab.component()}
                  </Tabs.Panel>
                ))}
              </Tabs>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
