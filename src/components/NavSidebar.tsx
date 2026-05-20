import { Button, Drawer } from "@heroui/react";

import { startOnboardingTour } from "@/lib/onboardingTour";

import { DocsModal } from "@/components/DocsModal";
import { ThemeButton } from "@/components/ThemeButton";
import { DataControls } from "@/components/DataControls";

export function NavSidebar() {
  return (
    <Drawer>
      <Button className="shadow-md/30">Settings</Button>

      <Drawer.Backdrop variant="blur">
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.CloseTrigger className="shadow-md/30" />

            <Drawer.Header>
              <Drawer.Heading>Settings</Drawer.Heading>
            </Drawer.Header>

            <Drawer.Body>
              <div className="flex flex-col mt-5">
                <h2 className="font-bold">App Support</h2>
                <DocsModal />

                <Button
                  onClick={startOnboardingTour}
                  aria-label="Launch onboarding tour"
                  data-tour-target="help-button"
                  className="shadow-md/30"
                >
                  Restart Tour
                </Button>

                <DataControls />

                <h2 className="mb-1 font-bold">Customization</h2>
                <ThemeButton />
              </div>
            </Drawer.Body>

            <Drawer.Footer>
              <Button className="w-full shadow-md/30" slot="close">
                Close
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
