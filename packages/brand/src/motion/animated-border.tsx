"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Wraps content in a rotating conic-gradient border ring. The gradient layer
 * spins behind a solid inner surface, so only a thin ring of moving color
 * shows. Static gradient under reduced motion.
 */
export function AnimatedBorder({
  children,
  colors = ["#22c55e", "rgba(34,197,94,0.05)", "#22c55e"],
  borderWidth = 1,
  radius = 16,
  duration = 4,
  innerClassName,
  innerStyle,
  className,
  style,
}: {
  children: ReactNode;
  colors?: string[];
  borderWidth?: number;
  radius?: number;
  duration?: number;
  innerClassName?: string;
  innerStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = useReducedMotion();
  const gradient = `conic-gradient(from 0deg, ${colors.join(", ")}, ${colors[0]})`;

  return (
    <div
      className={className}
      style={{ position: "relative", borderRadius: radius, overflow: "hidden", padding: borderWidth, ...style }}
    >
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-100%",
          background: gradient,
        }}
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      />
      <div
        className={innerClassName}
        style={{ position: "relative", borderRadius: radius - borderWidth, ...innerStyle }}
      >
        {children}
      </div>
    </div>
  );
}
