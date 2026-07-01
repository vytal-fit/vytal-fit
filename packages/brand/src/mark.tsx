import type { CSSProperties } from "react";

/**
 * The Vytal mark: a vital-sign pulse on a rounded green tile. Brand rules
 * (see /brand): green tile, dark pulse, never recolored or gradient-filled.
 * When `animated`, the pulse draws itself and the tile gently breathes — the
 * signature motion reused across the product.
 */
export function AnimatedMark({
  size = 40,
  animated = true,
  className,
  style,
}: {
  size?: number;
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="#22c55e"
        className={animated ? "vy-breathe" : undefined}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
      <path
        d="M11 35 L23 35 L27 25 L32 45 L37 16 L41 35 L53 35"
        fill="none"
        stroke="#08120c"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? "vy-pulse-draw" : undefined}
      />
    </svg>
  );
}
