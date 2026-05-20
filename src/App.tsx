import { useEffect } from "react";

import { Skills } from "@/components/Skills";
import { Snippet } from "@/components/Snippets";
import { PromptStructure } from "@/components/PromptStructure";
import { PromptOutput } from "@/components/PromptOutput";
import { AppHeader } from "@/components/NavHeader";
import { Agents } from "@/components/Agents";
import { WelcomeModal } from "@/components/WelcomeModal";

import { WelcomeModalContext } from "@/context/WelcomeModalContext";
import { useWelcomeFlow } from "@/hooks/useWelcomeFlow";
import { useAppStore } from "@/store/useAppStore";
import { selectHasUnsavedChanges } from "@/store/useDataControls";

export default function App() {
  const hasUnsavedChanges = useAppStore(selectHasUnsavedChanges);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const {
    isWelcomeOpen,
    open,
    handleNewFile,
    handleFileImport,
    handleStartTour,
  } = useWelcomeFlow();

  return (
    <WelcomeModalContext value={open}>
      <div className="flex flex-col h-full">
        <AppHeader />

        <div className="flex flex-row h-full p-3 space-x-3 overflow-hidden">
          <div className="flex flex-col grow min-w-md max-w-md space-y-3">
            <Agents />
            <Skills />
          </div>

          <div className="flex grow flex-col min-w-xl max-w-xl space-y-3">
            <PromptStructure />
            <Snippet />
          </div>

          <div className="flex grow flex-col min-w-lg space-y-3">
            <PromptOutput />
          </div>
        </div>

        <WelcomeModal
          isOpen={isWelcomeOpen}
          onNewFile={handleNewFile}
          onNewSeededFile={handleFileImport}
          onImport={handleFileImport}
          onStartTour={handleStartTour}
        />
      </div>
    </WelcomeModalContext>
  );
}
