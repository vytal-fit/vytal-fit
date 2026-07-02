/**
 * Shared motion vocabulary for Vytal surfaces. Every choreographed animation
 * should pull from these tokens so the product moves with one voice.
 */

/** Expressive deceleration used for entrances and reveals. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Gentle symmetric ease for looping/ambient motion. */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 0.9,
  cinematic: 1.4,
} as const;

/** Soft spring for UI elements settling into place. */
export const SPRING_SOFT = { type: "spring", stiffness: 170, damping: 26, mass: 1 } as const;

/** Snappy spring for hover/press feedback. */
export const SPRING_SNAPPY = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } as const;

/** Default stagger between sibling entrances. */
export const STAGGER = {
  tight: 0.04,
  base: 0.08,
  loose: 0.14,
} as const;
