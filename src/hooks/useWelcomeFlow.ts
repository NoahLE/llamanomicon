import { useState } from "react";

import { startOnboardingTour } from "@/lib/onboardingTour";
import { useAppStore } from "@/store/useAppStore";
import { importStateFromFile } from "@/lib/importExport";

export function useWelcomeFlow() {
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(
    () => localStorage.getItem("llamanomicon-v2") === null,
  );

  function open() {
    setIsWelcomeOpen(true);
  }

  function handleNewFile() {
    useAppStore.getState().clearData();
    setIsWelcomeOpen(false);
  }

  async function handleFileImport() {
    const appState = await importStateFromFile();
    if (appState === null) return;
    useAppStore.getState().importState(appState);
    setIsWelcomeOpen(false);
  }

  function handleStartTour() {
    useAppStore.getState().seedData();
    setIsWelcomeOpen(false);
    setTimeout(startOnboardingTour, 0);
  }

  return {
    isWelcomeOpen,
    open,
    handleNewFile,
    handleFileImport,
    handleStartTour,
  };
}
