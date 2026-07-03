// ── Noise texture SVG ────────────────────────────────────────────────────────
export const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`;

// ── CSS Keyframes (injected via style tag) ──────────────────────────────────
export const LANDING_KEYFRAMES = `
@keyframes landing-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
@keyframes landing-float-delayed {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes landing-fade-in-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes landing-gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes landing-pulse-glow {
  0%, 100% { box-shadow: 0 0 4px rgba(34,197,94,0.4); }
  50% { box-shadow: 0 0 12px rgba(34,197,94,0.8); }
}
@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-scroll 32s linear infinite;
}
.marquee-track:hover {
  animation-play-state: paused;
}
.scroll-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.scroll-reveal[data-revealed="true"] {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal { opacity: 1; transform: none; transition: none; }
}
.animated-gradient-border {
  background: linear-gradient(90deg, var(--color-vytal-green), var(--color-vytal-blue), var(--color-vytal-purple), var(--color-vytal-green));
  background-size: 300% 100%;
  animation: landing-gradient-shift 4s ease infinite;
}
`;

// Landing CTAs. Pre-launch: signup and demo aren't public yet, so every
// conversion CTA drives to the on-page early-bird form; only "sign in" goes
// to the live product (for existing/demo accounts).
export const APP_LINKS = {
  signIn: "https://pro.vytal.fit/login",
  getStarted: "#early-bird",
  demo: "#early-bird",
} as const;
