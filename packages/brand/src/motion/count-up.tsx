"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { EASE_OUT_EXPO } from "./tokens";

/**
 * Animates a number from `from` to `to` when it scrolls into view.
 * Renders the final value immediately under prefers-reduced-motion.
 */
export function CountUp({
  to,
  from = 0,
  duration = 1.6,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? to : from);

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }
    if (!inView) return;
    const controls = animate(from, to, {
      duration,
      ease: EASE_OUT_EXPO,
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, reduced, from, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
