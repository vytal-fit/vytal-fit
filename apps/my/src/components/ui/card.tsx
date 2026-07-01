import { cn } from "@/lib/utils";

/**
 * Surface primitive for myVytal. Replaces the ad-hoc
 * `style={{ background: "var(--color-vytal-card)", border: ... }}` blocks
 * that were repeated on every page with a single token-driven component.
 */
export function Card({
  className,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-vytal-border bg-vytal-card p-4",
        interactive && "card-interactive cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}
