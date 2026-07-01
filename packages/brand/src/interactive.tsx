"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/**
 * Cursor-follow spotlight. Wraps a block; a soft green radial glow tracks the
 * pointer inside it (fades out when the pointer leaves). Pure transform/opacity.
 * Give the wrapper `position: relative`; the glow is behind content.
 */
export function Spotlight({
  children,
  className,
  color = "rgba(34,197,94,0.16)",
  size = 480,
  style,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  size?: number;
  style?: CSSProperties;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", ...style }}
      onPointerMove={onMove}
      onPointerLeave={() => setPos(null)}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: pos ? 1 : 0,
          transition: "opacity .35s ease",
          background: pos
            ? `radial-gradient(${size}px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 70%)`
            : undefined,
        }}
      />
      {children}
    </div>
  );
}

/**
 * Magnetic wrapper — the child (a button/link) is pulled toward the pointer on
 * hover and springs back on leave. `strength` scales the pull (px).
 */
export function Magnetic({
  children,
  strength = 18,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });

  const onMove = useCallback(
    (e: ReactPointerEvent<HTMLSpanElement>) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      setT({ x: (dx / r.width) * strength, y: (dy / r.height) * strength });
    },
    [strength],
  );

  return (
    <span
      ref={ref}
      className={className}
      style={{
        display: "inline-block",
        transform: `translate3d(${t.x}px, ${t.y}px, 0)`,
        transition: t.x === 0 && t.y === 0 ? "transform .4s cubic-bezier(.2,.8,.2,1)" : "transform .08s linear",
        willChange: "transform",
      }}
      onPointerMove={onMove}
      onPointerLeave={() => setT({ x: 0, y: 0 })}
    >
      {children}
    </span>
  );
}

/**
 * 3D tilt card — rotates toward the pointer for a tactile, physical hover.
 * `max` is the max tilt in degrees.
 */
export function TiltCard({
  children,
  className,
  max = 8,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tf, setTf] = useState("perspective(900px) rotateX(0deg) rotateY(0deg)");

  const onMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      setTf(`perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`);
    },
    [max],
  );

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: tf,
        transition: "transform .18s ease",
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...style,
      }}
      onPointerMove={onMove}
      onPointerLeave={() => setTf("perspective(900px) rotateX(0deg) rotateY(0deg)")}
    >
      {children}
    </div>
  );
}
