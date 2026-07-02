"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

/**
 * Shifts its children vertically as the element travels through the
 * viewport, creating depth between layers. `distance` is the total travel in
 * px (positive = moves against scroll, appearing further away).
 */
export function ParallaxLayer({
  children,
  distance = 60,
  className,
  style,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <motion.div ref={ref} className={className} style={{ ...style, y: reduced ? 0 : y }}>
      {children}
    </motion.div>
  );
}

/**
 * A scroll-driven sticky scene: the container spans `screens` viewport
 * heights while the child stays pinned, and the render prop receives scroll
 * progress (0 to 1, spring-smoothed) to drive any transformation.
 */
export function StickyScene({
  screens = 3,
  className,
  stickyClassName,
  children,
}: {
  screens?: number;
  className?: string;
  stickyClassName?: string;
  children: (progress: MotionValue<number>) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.6 });

  return (
    <div ref={ref} className={className} style={{ height: `${screens * 100}vh` }}>
      <div className={stickyClassName} style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {children(progress)}
      </div>
    </div>
  );
}
