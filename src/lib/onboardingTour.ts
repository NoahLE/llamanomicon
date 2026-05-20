import introJs from "intro.js";

import { tourSteps } from "@/data/tour";

let tourInstance: ReturnType<typeof introJs.tour> | null = null;

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (tourInstance) {
      void tourInstance.exit(true);
      tourInstance = null;
    }
  });
}

export function startOnboardingTour(): void {
  if (tourInstance) {
    void tourInstance.exit(true);
    tourInstance = null;
  }

  tourInstance = introJs.tour();

  tourInstance
    .setOptions({
      steps: tourSteps,
      showStepNumbers: false,
      exitOnOverlayClick: false,
      showBullets: true,
      scrollToElement: true,
    })
    .onComplete(() => {
      tourInstance = null;
    })
    .onExit(() => {
      tourInstance = null;
    });

  void tourInstance.start();
}
