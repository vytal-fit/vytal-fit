"use client";

import { type CSSProperties, type ElementType, useMemo } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_OUT_EXPO, STAGGER } from "./tokens";

/**
 * Kinetic typography: reveals text word-by-word (or char-by-char) with a
 * blur + rise. Falls back to plain static text under prefers-reduced-motion.
 */
export function KineticText({
  text,
  as: Tag = "span",
  per = "word",
  delay = 0,
  stagger = STAGGER.base,
  duration = 0.8,
  y = "0.6em",
  blur = 8,
  once = true,
  className,
  unitClassName,
  style,
}: {
  text: string;
  as?: ElementType;
  per?: "word" | "char";
  delay?: number;
  stagger?: number;
  duration?: number;
  y?: string | number;
  blur?: number;
  once?: boolean;
  className?: string;
  /** Applied to each word/char span (e.g. gradient bg-clip-text, which must
   * live on the animated spans themselves, not the container). */
  unitClassName?: string;
  style?: CSSProperties;
}) {
  const reduced = useReducedMotion();

  const units = useMemo(() => {
    if (per === "char") return Array.from(text);
    // Keep trailing spaces attached so layout matches the plain string.
    return text.split(/(?<=\s)/);
  }, [text, per]);

  if (reduced) {
    return (
      <Tag className={className} style={style}>
        {text}
      </Tag>
    );
  }

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const unit: Variants = {
    hidden: { opacity: 0, y, filter: `blur(${blur}px)` },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <Tag className={className} style={style}>
      {/* Real text for screen readers (aria-label on a generic span is
          prohibited ARIA); the animated pieces below are decorative. */}
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {text}
      </span>
      <motion.span
        style={{ display: "inline" }}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.5 }}
        aria-hidden="true"
      >
        {units.map((u, i) => (
          <motion.span
            key={i}
            variants={unit}
            className={unitClassName}
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {u}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
