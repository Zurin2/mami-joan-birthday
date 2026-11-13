"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import MemoryCarousel from "@/components/MemoryCarousel";
import PageNav from "@/components/PageNav";
import { Camera, Heart } from "lucide-react";

const TITLE = "Little Things I'm Grateful For";

export default function MemoriesPage() {
  // SSR-safe: match server render on first paint, then apply reduced motion.
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && prefersReduced;

  return (
    <motion.main
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.5 }}
      className="paper flex min-h-dvh flex-col items-center justify-center px-4 py-10"
    >
      <h1
        aria-label={TITLE}
        className="text-center font-script text-5xl text-raspberry sm:text-6xl"
      >
        {TITLE.split("").map((ch, i) => (
          <motion.span
            key={i}
            aria-hidden
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : { delay: i * 0.03, type: "spring", stiffness: 300, damping: 20 }
            }
            className="inline-block whitespace-pre px-[0.1em] -mx-[0.1em] py-[0.12em] -my-[0.12em]"
          >
            {ch}
          </motion.span>
        ))}
        <Heart
          aria-hidden
          className="ml-2 inline-block h-5 w-5 align-middle text-gold sm:h-6 sm:w-6"
          fill="currentColor"
        />
      </h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.8, duration: 0.6 }}
        className="mt-3 flex items-center justify-center gap-1.5 text-sm text-cocoasoft"
      >
        <Camera aria-hidden className="h-4 w-4 text-gold" />
        Swipe through our memories
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.3, duration: 0.5 }}
        className="mt-8 w-full"
      >
        <MemoryCarousel />
      </motion.div>

      <PageNav step={1} backHref="/" nextHref="/wishes" />
    </motion.main>
  );
}
