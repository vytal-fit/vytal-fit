"use client";

// ── SVG Decorative Components ────────────────────────────────────────────────
export function DotGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
      <defs>
        <pattern id="hero-dots" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(34,197,94,0.15)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-dots)" />
    </svg>
  );
}

export function WaveDivider({ flip = false, color = "rgba(34,197,94,0.06)" }: { flip?: boolean; color?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-[40px]">
        <path
          d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,60 L0,60 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
