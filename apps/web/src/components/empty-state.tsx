import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-vytal-border bg-vytal-card px-6 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-vytal-bg3">
        <Icon className="h-8 w-8 text-vytal-muted" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-vytal-text">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-center text-sm text-vytal-muted">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
