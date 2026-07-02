"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_OUT_EXPO, STAGGER } from "./tokens";

const DIRECTIONS = {
  up: { x: 0, y: 32 },
  down: { x: 0, y: -32 },
  left: { x: 32, y: 0 },
  right: { x: -32, y: 0 },
  none: { x: 0, y: 0 },
} as const;

export type RevealDirection = keyof typeof DIRECTIONS;

function itemVariants(direction: RevealDirection, duration: number): Variants {
  const { x, y } = DIRECTIONS[direction];
  return {
    hidden: { opacity: 0, x, y },
    visible: { opacity: 1, x: 0, y: 0, transition: { duration, ease: EASE_OUT_EXPO } },
  };
}

/**
 * Stagger container: children wrapped in RevealItem cascade in when the
 * group enters the viewport. Renders content statically under
 * prefers-reduced-motion.
 */
export function RevealGroup({
  children,
  stagger = STAGGER.base,
  delay = 0,
  once = true,
  amount = 0.2,
  className,
  style,
}: {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  once?: boolean;
  amount?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A single cascading child of RevealGroup. Also works standalone (reveals on
 * its own viewport entry when not inside a group).
 */
export function RevealItem({
  children,
  direction = "up",
  duration = 0.7,
  className,
  style,
}: {
  children: ReactNode;
  direction?: RevealDirection;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div className={className} style={style} variants={itemVariants(direction, duration)}>
      {children}
    </motion.div>
  );
}
