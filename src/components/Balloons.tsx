"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { burst } from "@/lib/confetti";

type Balloon = {
  id: number;
  x: number; // vw %
  size: number; // px
  color: string;
  delay: number;
  duration: number;
  sway: number; // px
};

/* Softer, calmer palette: dusty rose, champagne gold, blush, cream. */
const COLORS = ["#E9A8BE", "#E9C87E", "#F4C6D4", "#FBEEDD", "#DB8FA9", "#F0DCA8"];

/** Sheened balloon body: top-left white highlight + bottom shading over the base color. */
const BALLOON_BG = (color: string) =>
  `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55), rgba(255,255,255,0) 45%), radial-gradient(circle at 68% 85%, rgba(146,72,96,0.14), transparent 55%), ${color}`;

const BODY_SHAPE = "rounded-[50%_50%_50%_50%/60%_60%_40%_40%]";
const BODY_SHADOW =
  "inset -6px -10px 16px rgba(146,72,96,0.12), inset 5px 8px 12px rgba(255,255,255,0.18)";
const KNOT_CLIP = "polygon(50% 0, 100% 100%, 0 100%)";

function makeBalloons(n: number): Balloon[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: 8 + Math.random() * 84,
    size: 34 + Math.random() * 42,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * -24,
    duration: 20 + Math.random() * 12,
    sway: 10 + Math.random() * 18,
  }));
}

function Balloon({ b, reduced }: { b: Balloon; reduced: boolean }) {
  const [popped, setPopped] = useState(false);

  const pop = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setPopped(true);
      burst({
        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        particleCount: 22,
        spread: 50,
        scalar: 0.8,
      });
      setTimeout(() => setPopped(false), 400);
    },
    []
  );

  if (reduced) {
    // Calm static balloons, still tappable — same sheened styling.
    return (
      <span
        aria-hidden
        className="fixed bottom-0 block opacity-50"
        style={{ left: `${b.x}vw`, width: b.size, height: b.size * 1.2 }}
      >
        <span
          className={`block h-full w-full ${BODY_SHAPE}`}
          style={{ background: BALLOON_BG(b.color), boxShadow: BODY_SHADOW }}
        />
        <span
          className="mx-auto -mt-0.5 block h-2 w-2.5"
          style={{ background: b.color, clipPath: KNOT_CLIP }}
        />
      </span>
    );
  }

  return (
    <AnimatePresence>
      {!popped && (
        <motion.button
          key={b.id}
          aria-label="Pop a balloon"
          onPointerDown={pop}
          className="fixed bottom-[-90px] cursor-pointer"
          style={{ left: `${b.x}vw`, width: b.size, height: b.size * 1.2 }}
          initial={{ y: 0 }}
          animate={{
            y: "-115vh",
            x: [0, b.sway, 0, -b.sway, 0],
            rotate: [-3, 3, -3],
          }}
          transition={{
            y: { duration: b.duration, repeat: Infinity, delay: b.delay, ease: "linear" },
            x: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
          exit={{ scale: [1, 1.4, 0], opacity: [1, 1, 0], transition: { duration: 0.25 } }}
        >
          {/* sheened body + teardrop knot + curved string */}
          <span
            className={`block h-full w-full opacity-90 ${BODY_SHAPE}`}
            style={{ background: BALLOON_BG(b.color), boxShadow: BODY_SHADOW }}
          />
          <span
            className="mx-auto -mt-0.5 block h-2 w-2.5 opacity-90"
            style={{ background: b.color, clipPath: KNOT_CLIP }}
          />
          <svg
            aria-hidden
            className="mx-auto block"
            width="16"
            height="46"
            viewBox="0 0 16 46"
            fill="none"
          >
            <path
              d="M8 0C11 10 4 20 8 30C10.5 36 6.5 40 8 46"
              stroke="rgba(92,64,51,0.28)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function Balloons() {
  // SSR-safe: match server render on first paint, then apply reduced motion.
  const prefersReduced = !!useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && prefersReduced;
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  useEffect(() => {
    // Hydrate after mount so widths randomize client-side only
    setBalloons(makeBalloons(reduced ? 6 : 12));
  }, [reduced]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* pointer-events pass through container; each button re-enables its own */}
      <div className="pointer-events-auto contents">
        {balloons.map((b) => (
          <Balloon key={b.id} b={b} reduced={reduced} />
        ))}
      </div>
    </div>
  );
}
