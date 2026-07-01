import { cn } from "@/lib/utils";

type Tone = "green" | "blue" | "amber" | "red" | "purple" | "muted";

const TONES: Record<Tone, string> = {
  green: "bg-[rgba(34,197,94,0.12)] text-vytal-green",
  blue: "bg-[rgba(0,212,255,0.12)] text-vytal-blue",
  amber: "bg-[rgba(255,179,0,0.12)] text-vytal-amber",
  red: "bg-[rgba(255,71,87,0.12)] text-vytal-red",
  purple: "bg-[rgba(192,132,252,0.12)] text-vytal-purple",
  muted: "bg-vytal-bg3 text-vytal-muted",
};

/**
 * Small status pill. Replaces per-page inline-styled tag chips.
 */
export function Badge({
  tone = "muted",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
