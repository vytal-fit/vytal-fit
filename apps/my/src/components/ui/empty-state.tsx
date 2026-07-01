import { cn } from "@/lib/utils";

/**
 * Standard empty / zero-data placeholder. Every list page needs one and they
 * were previously bespoke; this gives a consistent icon + message + action.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-vytal-border bg-vytal-card/50 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(34,197,94,0.1)] text-vytal-green">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-vytal-text">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs text-vytal-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
