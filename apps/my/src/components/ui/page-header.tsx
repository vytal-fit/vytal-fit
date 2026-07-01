import { cn } from "@/lib/utils";

/**
 * Consistent page title block. Every myVytal page opened with a slightly
 * different hand-rolled heading; this normalizes size, spacing, and the
 * optional trailing action slot.
 */
export function PageHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-black tracking-tight text-vytal-text">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-vytal-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
