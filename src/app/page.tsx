"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { burst } from "@/lib/confetti";
import Envelope from "@/components/Envelope";
import PageNav from "@/components/PageNav";
import { Sparkles, ChevronDown } from "lucide-react";

const TITLE = "Happy Birthday, Mami Joan!";
const TITLE_TEXT = "Happy Birthday, Mami Joan!";
const STAGGER = 0.045;
const LAST_LETTER_DELAY = (TITLE_TEXT.length - 1) * STAGGER;
const EMOJI_DELAY = (TITLE_TEXT.length + 1) * STAGGER;

/** Elegant gold sparkle accent sitting beside the title (replaces the old emoji). */
const TitleSparkle = () => (
  <Sparkles aria-hidden className="h-5 w-5 text-gold sm:h-6 sm:w-6" />
);

/** Words with a global letter index so the stagger reads continuously across the line. */
const WORDS = (() => {
  let n = 0;
  return TITLE_TEXT.split(" ").map((word) => {
    const start = n;
    n += word.length + 1; // +1 for the following space
    return { word, start };
  });
})();

/** Ambient sparkle dots around the title area (kept small + few). */
const SPARKLE_DOTS = [
  { left: "6%", top: "16%", size: 2.5, dur: 5.2, delay: 0 },
  { left: "15%", top: "36%", size: 2, dur: 6.1, delay: 1.2 },
  { left: "30%", top: "8%", size: 1.5, dur: 4.4, delay: 2.1 },
  { left: "68%", top: "10%", size: 2.5, dur: 5.8, delay: 0.6 },
  { left: "84%", top: "28%", size: 1.5, dur: 4.9, delay: 1.8 },
  { left: "92%", top: "46%", size: 2, dur: 6.4, delay: 0.3 },
  { left: "8%", top: "54%", size: 3, dur: 5.5, delay: 2.6 },
];

export default function HomePage() {
  // Match the server's (animated) render on first paint to avoid a hydration
  // mismatch; switch to the reduced-motion variant only after mount.
  const prefersReduced = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && prefersReduced;
  const [opened, setOpened] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hide the scroll prompt once the visitor actually scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Welcome confetti shortly after mount.
  useEffect(() => {
    const t = setTimeout(() => burst({ particleCount: 80, spread: 75, startVelocity: 30 }), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative flex min-h-dvh flex-col items-center px-4 pt-14 text-center"
    >
      {/* Ambient sparkle dots around the title area */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[30rem]">
        {SPARKLE_DOTS.map((s, i) => (
          <span
            key={i}
            className="sparkle-dot"
            style={
              {
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                "--dur": `${s.dur}s`,
                "--delay": `${s.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <h1
        aria-label={TITLE}
        className="relative max-w-xl font-script text-5xl leading-tight text-raspberry sm:max-w-2xl sm:text-7xl"
      >
        {reduced ? (
          <>
            <span className="title-gradient">{TITLE_TEXT}</span>{" "}
            <span aria-hidden className="inline-block align-middle">
              <TitleSparkle />
            </span>
          </>
        ) : (
          <>
            {/* Static gradient overlay — plain text (no per-letter spans), fades in
                once the letters have settled so bg-clip-text renders correctly. */}
            <motion.span
              aria-hidden
              className="absolute inset-0"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: LAST_LETTER_DELAY + 0.45, duration: 0.9, ease: "easeOut" }}
            >
              <span className="title-gradient">{TITLE_TEXT}</span>{" "}
              <span className="inline-block align-middle">
                <TitleSparkle />
              </span>
            </motion.span>

            {/* Per-letter entrance: solid color, y + blur + fade (no bg-clip on moving spans). */}
            <motion.span
              aria-hidden
              className="relative"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: LAST_LETTER_DELAY + 0.55, duration: 0.7, ease: "easeOut" }}
            >
              {WORDS.map(({ word, start }, w) => (
                <span key={w}>
                  <span className="inline-block whitespace-nowrap">
                    {Array.from(word).map((ch, i) => (
                      <motion.span
                        key={`${w}-${i}`}
                        className="inline-block px-[0.1em] -mx-[0.1em] py-[0.12em] -my-[0.12em]"
                        initial={{ y: 24, opacity: 0, filter: "blur(6px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        transition={{
                          y: {
                            type: "spring",
                            stiffness: 150,
                            damping: 16,
                            delay: (start + i) * STAGGER,
                          },
                          opacity: { duration: 0.35, delay: (start + i) * STAGGER },
                          filter: { duration: 0.55, delay: (start + i) * STAGGER },
                        }}
                      >
                        {ch}
                      </motion.span>
                    ))}
                  </span>
                  {w < WORDS.length - 1 ? " " : null}
                </span>
              ))}
              <motion.span
                aria-hidden
                className="inline-block"
                initial={{ scale: 0, rotate: -14, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  delay: EMOJI_DELAY,
                  type: "spring",
                  stiffness: 200,
                  damping: 13,
                }}
              >
                <TitleSparkle />
              </motion.span>
            </motion.span>
          </>
        )}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 2, duration: 0.7, ease: "easeOut" }}
        className="mt-4 font-hand text-xl text-cocoasoft"
      >
        Tap the envelope — I made something for you{" "}
        <motion.span
          aria-hidden
          className="inline-block align-middle"
          animate={reduced ? {} : { opacity: [0.25, 1, 0.25], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="h-4 w-4 text-gold" />
        </motion.span>
      </motion.p>

      {/* Ambient rose/gold glow breathing behind the envelope */}
      <div className="relative isolate mt-6 flex w-full justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            className="h-80 w-80 max-w-[90vw] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(233,185,79,0.28) 0%, rgba(244,159,188,0.22) 45%, rgba(244,159,188,0) 72%)",
            }}
            animate={reduced ? {} : { scale: [1, 1.08, 1], opacity: [0.65, 0.95, 0.65] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <Envelope onOpened={() => setOpened(true)} />

        {/* Gentle scroll guidance once the envelope is opened — sits in the
            reserved space above the polaroid, scrolls with the page. */}
        <AnimatePresence>
          {opened && !scrolled && (
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute left-1/2 top-1 z-20 flex -translate-x-1/2 flex-col items-center"
            >
              <motion.span
                animate={reduced ? {} : { y: [0, 9, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <ChevronDown className="h-8 w-8 text-raspberry drop-shadow" />
              </motion.span>
              <span className="rounded-full bg-white/90 px-4 py-1 font-hand text-xl text-cocoa shadow-md ring-1 ring-rose/30">
                Scroll down
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            <PageNav step={0} nextHref="/memories" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
