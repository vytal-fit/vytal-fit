import type { CSSProperties } from "react";
import { AnimatedMark } from "./mark";

/**
 * Layered brand backdrop — drop behind heroes, auth screens, empty states.
 * Composes a drifting green radial glow, a hairline grid, and a large faint
 * breathing Vytal mark watermark. Absolutely positioned + pointer-events:none,
 * so it sits behind content. CSS-only motion (see BrandStyles).
 */
export function LogoLayer({
  intensity = "bold",
  mark = true,
  grid = true,
  className,
  style,
}: {
  intensity?: "subtle" | "bold";
  mark?: boolean;
  grid?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const glowOpacity = intensity === "bold" ? 0.5 : 0.28;
  const markOpacity = intensity === "bold" ? 0.06 : 0.035;
  const gridOpacity = intensity === "bold" ? 0.5 : 0.3;

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0, ...style }}
    >
      {/* Drifting green radial glow */}
      <div
        className="vy-drift"
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "70%",
          height: "70%",
          background: "radial-gradient(circle at 50% 50%, rgba(34,197,94,0.22), transparent 62%)",
          opacity: glowOpacity,
          filter: "blur(8px)",
        }}
      />
      <div
        className="vy-drift"
        style={{
          position: "absolute",
          bottom: "-25%",
          left: "-15%",
          width: "60%",
          height: "60%",
          background: "radial-gradient(circle at 50% 50%, rgba(0,212,255,0.10), transparent 60%)",
          opacity: glowOpacity * 0.7,
          animationDelay: "-8s",
          filter: "blur(10px)",
        }}
      />

      {/* Hairline grid */}
      {grid && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: gridOpacity,
            backgroundImage:
              "linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, #000 30%, transparent 78%)",
          }}
        />
      )}

      {/* Large faint breathing mark watermark */}
      {mark && (
        <div
          className="vy-drift"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: markOpacity,
            animationDelay: "-4s",
          }}
        >
          <AnimatedMark size={520} />
        </div>
      )}
    </div>
  );
}
