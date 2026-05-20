import { Card } from "@heroui/react";
import type { ReactNode } from "react";

type PanelVariant = "agents" | "skills" | "snippets" | "output";

interface AppSectionProps {
  title?: string;
  className?: string;
  controls?: ReactNode;
  children?: ReactNode;
  variant?: PanelVariant;
  tourTarget?: string;
}

export function AppSection({
  title,
  controls,
  children,
  variant,
  tourTarget,
}: AppSectionProps) {
  return (
    <Card.Root
      data-tour-target={tourTarget ?? variant}
      className="flex flex-col overflow-hidden border h-full w-full shadow-lg/25"
    >
      {title && (
        <div className="flex flex-row px-3 py-2 border-b border-border justify-between">
          <h2 className="flex font-semibold uppercase tracking-widest text-muted">
            {title}
          </h2>

          <div className="flex">{controls}</div>
        </div>
      )}
      <div className="flex flex-col flex-1 p-0 overflow-auto">{children}</div>
    </Card.Root>
  );
}
