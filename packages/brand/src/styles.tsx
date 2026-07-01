/**
 * Global brand motion stylesheet — mount <BrandStyles /> once in an app's root
 * layout. Defines the keyframes + utility classes the brand components use, plus
 * a full prefers-reduced-motion fallback. Framework-agnostic (a plain <style>).
 */
const CSS = `
@keyframes vy-pulse-draw {
  0%   { stroke-dashoffset: 120; }
  55%  { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 0; }
}
@keyframes vy-breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
}
@keyframes vy-drift {
  0%   { transform: translate3d(0,0,0) scale(1); }
  33%  { transform: translate3d(3%, -4%, 0) scale(1.06); }
  66%  { transform: translate3d(-2%, 2%, 0) scale(0.97); }
  100% { transform: translate3d(0,0,0) scale(1); }
}
@keyframes vy-spin-slow { to { transform: rotate(360deg); } }
@keyframes vy-shimmer { 0% { background-position: -150% 0; } 100% { background-position: 250% 0; } }

.vy-reveal { opacity: 0; transform: translateY(18px); transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1); will-change: opacity, transform; }
.vy-reveal.vy-in { opacity: 1; transform: none; }

.vy-drift { animation: vy-drift 20s ease-in-out infinite; will-change: transform; }
.vy-breathe { animation: vy-breathe 4.5s ease-in-out infinite; transform-origin: center; }
.vy-pulse-draw { stroke-dasharray: 120; animation: vy-pulse-draw 3.4s cubic-bezier(.65,0,.35,1) infinite; }
.vy-spin-slow { animation: vy-spin-slow 40s linear infinite; }

/* Green shimmer sweep for CTAs. */
.vy-shimmer { position: relative; overflow: hidden; }
.vy-shimmer::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%);
  background-size: 200% 100%; background-position: -150% 0;
  transition: opacity .2s; opacity: 0; pointer-events: none;
}
.vy-shimmer:hover::after { opacity: 1; animation: vy-shimmer 1.1s ease-out; }

@media (prefers-reduced-motion: reduce) {
  .vy-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
  .vy-drift, .vy-breathe, .vy-pulse-draw, .vy-spin-slow { animation: none !important; }
  .vy-pulse-draw { stroke-dashoffset: 0 !important; }
  .vy-shimmer:hover::after { animation: none !important; }
}
`;

export function BrandStyles() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}
