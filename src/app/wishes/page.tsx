"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { burst, celebrate } from "@/lib/confetti";
import PaperNote from "@/components/PaperNote";
import PageNav from "@/components/PageNav";
import { Feather, Flower2, Heart, RotateCcw, type LucideIcon } from "lucide-react";

type Faller = {
  Icon: LucideIcon;
  left: number;
  duration: number;
  delay: number;
  className: string;
  filled?: boolean;
};

const FALLERS: Faller[] = [
  { Icon: Heart, left: 8, duration: 12, delay: 0, className: "h-3.5 w-3.5 text-rose", filled: true },
  { Icon: Flower2, left: 22, duration: 15, delay: 2.5, className: "h-4 w-4 text-rose" },
  { Icon: Heart, left: 38, duration: 10, delay: 1, className: "h-3.5 w-3.5 text-gold", filled: true },
  { Icon: Heart, left: 55, duration: 16, delay: 4, className: "h-4 w-4 text-rose", filled: true },
  { Icon: Flower2, left: 70, duration: 13, delay: 0.8, className: "h-3.5 w-3.5 text-gold" },
  { Icon: Heart, left: 84, duration: 9, delay: 3, className: "h-3.5 w-3.5 text-rose", filled: true },
  { Icon: Flower2, left: 93, duration: 14, delay: 5, className: "h-4 w-4 text-rose" },
];

export default function WishesPage() {
  // SSR-safe: match server render on first paint, then apply reduced motion.
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && prefersReduced;
  const firedRef = useRef(false);
  const [finale, setFinale] = useState(false);

  const handleFinished = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    setFinale(true);
    if (!reduced) {
      celebrate(1800);
      burst({ particleCount: 60, spread: 75, origin: { y: 0.6 } });
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative flex min-h-dvh flex-col items-center px-4 py-12"
    >
      {!reduced && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {FALLERS.map((f, i) => (
            <motion.span
              key={i}
              className="absolute opacity-50"
              style={{ left: `${f.left}%`, top: "-5%" }}
              initial={{ y: 0, rotate: 0 }}
              animate={{ y: "110vh", rotate: 360 }}
              transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: "linear" }}
            >
              <f.Icon
                aria-hidden
                className={f.className}
                fill={f.filled ? "currentColor" : "none"}
              />
            </motion.span>
          ))}
        </div>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 mb-8 flex items-center justify-center gap-2.5 text-center font-script text-4xl text-raspberry"
      >
        Wishes &amp; Prayers
        <Feather aria-hidden className="h-5 w-5 text-gold sm:h-6 sm:w-6" />
      </motion.h1>

      <div className="relative z-10 w-full">
        <PaperNote onFinished={handleFinished} />
      </div>

      {finale && !reduced && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.3, y: 40 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1, 1.05, 0.9], y: [40, -60, -140, -220] }}
          transition={{ duration: 2.6, ease: "easeOut", times: [0, 0.3, 0.6, 1] }}
          onAnimationComplete={() => setFinale(false)}
          className="pointer-events-none fixed inset-x-0 bottom-28 z-40 flex justify-center"
        >
          <Heart
            aria-hidden
            className="h-16 w-16 text-gold drop-shadow-lg"
            fill="currentColor"
          />
        </motion.div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-rose bg-white/70 px-5 py-2.5 text-sm font-bold text-cocoa shadow-sm transition-colors duration-150 hover:bg-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-raspberry/60 focus-visible:ring-offset-2 active:bg-rose/50"
          >
            <RotateCcw aria-hidden className="h-4 w-4 text-raspberry" />
            Replay from start
          </Link>
        </motion.div>
        <PageNav step={2} backHref="/memories" />
      </div>
    </motion.main>
  );
}
