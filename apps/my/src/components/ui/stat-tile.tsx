import { cn } from "@/lib/utils";

/**
 * Compact metric tile (label + value + optional icon/hint). Used across the
 * home dashboard, records, and progress pages, which previously each drew
 * their own inline-styled stat boxes.
 */
export function StatTile({
  label,
  value,
  hint,
  icon,
  accent = "text-vytal-text",
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-vytal-border bg-vytal-card p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-vytal-muted">{label}</span>
        {icon && <span className="text-vytal-muted">{icon}</span>}
      </div>
      <p className={cn("mt-2 text-2xl font-black tracking-tight", accent)}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-vytal-muted">{hint}</p>}
    </div>
  );
}
