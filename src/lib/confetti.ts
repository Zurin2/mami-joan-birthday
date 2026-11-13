import confetti from "canvas-confetti";

const COLORS = ["#F49FBC", "#E26A8D", "#E9B94F", "#F7D98B", "#FFE9F0", "#FFF8F0"];

/** Single burst with the site palette. Respects reduced motion. */
export function burst(options?: confetti.Options) {
  return confetti({
    colors: COLORS,
    zIndex: 70,
    disableForReducedMotion: true,
    ...options,
  });
}

let celebrateRun = 0;

/** Big celebratory double cannon from both bottom corners. A newer call cancels the previous one. */
export function celebrate(durationMs = 1600) {
  const run = ++celebrateRun;
  const end = Date.now() + durationMs;
  (function frame() {
    if (run !== celebrateRun) return;
    burst({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.9 }, scalar: 1.1 });
    burst({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.9 }, scalar: 1.1 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
