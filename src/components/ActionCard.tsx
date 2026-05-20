import type { ReactNode } from "react";

interface ActionCardProps {
  icon: ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  isLoading?: boolean;
}

export function ActionCard({
  icon,
  label,
  description,
  onClick,
  isLoading = false,
}: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="flex flex-col items-center gap-3 p-5 rounded-lg border border-border text-center cursor-pointer transition-[box-shadow,transform] duration-100 bg-[var(--nav-surface)] shadow-[var(--nav-btn-shadow)] hover:brightness-110 active:shadow-[var(--nav-btn-shadow-active)] active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      aria-label={label}
    >
      <span className="text-(--foreground) opacity-70">{icon}</span>

      <span className="font-semibold text-sm tracking-wide text-(--foreground)">
        {label}
      </span>

      <span className="text-xs text-muted">{description}</span>
    </button>
  );
}
