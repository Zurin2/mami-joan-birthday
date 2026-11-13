"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { burst } from "@/lib/confetti";
import { memories } from "@/data/memories";
import { ArrowRight, ChevronLeft, ChevronRight, Hand, Heart } from "lucide-react";

const arrowBtn =
  "hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg text-cocoa shadow-md " +
  "transition-colors duration-150 hover:bg-blush disabled:opacity-30 disabled:hover:bg-white " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-raspberry/60 focus-visible:ring-offset-2";

export default function MemoryCarousel() {
  // SSR-safe: match server render on first paint, then apply reduced motion.
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && prefersReduced;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "center" });
  const [selected, setSelected] = useState(0);
  const prevSelected = useRef(0);

  // Track the selected slide + celebrate each real change.
  const [swiped, setSwiped] = useState(false);
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const idx = emblaApi.selectedScrollSnap();
      setSelected(idx);
      if (idx !== 0) setSwiped(true);
    };
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (prevSelected.current === selected) return;
    prevSelected.current = selected;
    if (!reduced) {
      burst({ particleCount: 14, spread: 40, scalar: 0.7, origin: { y: 0.55 } });
    }
  }, [selected, reduced]);

  // Keyboard arrows (window-level; arrows don't conflict with page scrolling).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (e.key === "ArrowRight") emblaApi?.scrollNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [emblaApi]);

  const spring = reduced
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 260, damping: 22 };

  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi],
  );

  return (
    <div className="w-full">
      <div className="relative">
        <div className="pointer-events-auto overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {memories.map((m, i) => {
            const active = i === selected;
            return (
              <div key={m.photo} className="min-w-0 flex-[0_0_100%] px-4">
                <div className="mx-auto max-w-sm">
                  <motion.div
                    initial={false}
                    animate={{ opacity: active ? 1 : 0.55, scale: active ? 1 : 0.97 }}
                    transition={spring}
                    className={
                      reduced ? "" : i % 2 === 0 ? "rotate-[2deg]" : "-rotate-[2deg]"
                    }
                  >
                    {/* Polaroid frame */}
                    <figure className="relative rounded-lg bg-white p-3 pb-10 shadow-lg">
                      <Image
                        src={m.photo}
                        alt={m.alt}
                        width={640}
                        height={640}
                        className="aspect-square w-full rounded-md object-cover"
                      />
                      <figcaption
                        aria-hidden
                        className="absolute inset-x-0 bottom-1.5 text-center font-hand text-xl text-cocoasoft"
                      >
                        No. {i + 1}
                        <Heart
                          aria-hidden
                          className="ml-1 inline-block h-3 w-3 align-[-2px] text-gold"
                          fill="currentColor"
                        />
                      </figcaption>
                    </figure>
                  </motion.div>

                  {/* Message — remounts (key flip) when the slide becomes active */}
                  <motion.div
                    key={active ? "active" : "idle"}
                    initial={active && !reduced ? { opacity: 0, y: 16 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={spring}
                    className="mt-4 rounded-2xl bg-blush p-5 font-hand text-2xl leading-snug text-cocoa shadow-md"
                  >
                    <p>{m.message}</p>
                    {i === memories.length - 1 && (
                      <motion.div
                        className="mt-4 text-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Link
                          href="/wishes"
                          className="inline-flex items-center gap-2 rounded-full bg-raspberry px-6 py-3 font-bold text-white shadow-md shadow-raspberry/30 transition-colors duration-150 hover:bg-raspberry/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-raspberry/60 focus-visible:ring-offset-2"
                        >
                          Continue
                          <ArrowRight aria-hidden className="h-4 w-4" />
                        </Link>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
        </div>

        {/* Swipe guidance until the first slide change — breathes in and out
            so the photo stays visible between pulses */}
        <AnimatePresence>
          {!swiped && (
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={reduced ? { opacity: 0.9 } : { opacity: [0, 0, 1, 1, 0] }}
              transition={
                reduced
                  ? { duration: 0.3 }
                  : { duration: 3.6, repeat: Infinity, ease: "easeInOut", times: [0, 0.12, 0.3, 0.68, 0.85] }
              }
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 top-[18%] z-10 flex flex-col items-center"
            >
              <motion.span
                animate={reduced ? {} : { x: [12, -16, 12] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <Hand className="h-9 w-9 text-raspberry drop-shadow-md" />
              </motion.span>
              <span className="mt-1 rounded-full bg-white/85 px-3.5 py-1 font-hand text-lg text-cocoa shadow-md">
                Swipe left
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls: arrows (desktop), dots, counter */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={selected === 0}
          aria-label="Previous memory"
          className={arrowBtn}
        >
          <ChevronLeft aria-hidden className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {memories.map((m, i) => (
              <button
                key={m.photo}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to memory ${i + 1}`}
                aria-current={i === selected}
                className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-raspberry/60 ${
                  i === selected ? "bg-raspberry" : "bg-rose/40 hover:bg-rose/70"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-cocoasoft tabular-nums">
            {selected + 1} / {memories.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          disabled={selected === memories.length - 1}
          aria-label="Next memory"
          className={arrowBtn}
        >
          <ChevronRight aria-hidden className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
