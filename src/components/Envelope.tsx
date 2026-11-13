"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { burst } from "@/lib/confetti";
import Typewriter from "@/components/Typewriter";
import { Heart, Sparkle } from "lucide-react";

import { greetingMessage as MESSAGE } from "@/data/greeting";

type State = "closed" | "opening" | "opened";

type Props = {
  /** Called when the letter finishes typing. */
  onOpened?: () => void;
};

const SPRING = { type: "spring", stiffness: 70, damping: 15 } as const;
const FLAP_SPRING = { type: "spring", stiffness: 85, damping: 13 } as const;
const TWEEN = { duration: 0.25, ease: "easeOut" as const };

/** Layered CSS envelope: tap to open, photo rises out, letter is pulled out and typed. */
export default function Envelope({ onOpened }: Props) {
  // SSR-safe: match server render on first paint, then apply reduced motion.
  const prefersReduced = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && prefersReduced;
  const [state, setState] = useState<State>("closed");
  const [flapOpen, setFlapOpen] = useState(false);
  const [flapBehind, setFlapBehind] = useState(false);
  const [photoOut, setPhotoOut] = useState(false);
  const [letterOut, setLetterOut] = useState(false);
  const [typing, setTyping] = useState(false);
  const [envW, setEnvW] = useState(340);
  const [letterH, setLetterH] = useState(320);
  const letterProbeRef = useRef<HTMLDivElement | null>(null);
  const envRef = useRef<HTMLDivElement>(null);
  const onOpenedRef = useRef(onOpened);

  useEffect(() => {
    onOpenedRef.current = onOpened;
  }, [onOpened]);

  // Track the real envelope width (min(80vw, 340px)) so exit distances are exact.
  useEffect(() => {
    const update = () => setEnvW(Math.min(window.innerWidth * 0.8, 340));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Track the letter card's real rendered height (font load + responsive wrap).
  useEffect(() => {
    const measure = () => setLetterH(letterProbeRef.current?.offsetHeight ?? 320);
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, []);
  const envH = envW / 1.4;
  const letterLift = envH * 0.44 - 12; // letter pulled most of the way out of the slot
  // Photo settles fully ABOVE the letter card: measure the letter's real height
  // (hidden full-text probe) so the polaroid never covers the message.
  const photoLift = letterLift + letterH + 36;

  // Staged open sequence.
  useEffect(() => {
    if (state === "opening") {
      const fast = reduced;
      const timers = [
        setTimeout(() => setFlapOpen(true), fast ? 0 : 260),
        setTimeout(() => setFlapBehind(true), fast ? 80 : 500),
        setTimeout(() => {
          const r = envRef.current?.getBoundingClientRect();
          burst({
            origin: r
              ? {
                  x: (r.left + r.width / 2) / window.innerWidth,
                  y: (r.top + r.height / 2) / window.innerHeight,
                }
              : { x: 0.5, y: 0.5 },
            particleCount: 90,
            spread: 100,
            startVelocity: 38,
            scalar: 0.9,
          });
        }, fast ? 120 : 1000),
        setTimeout(() => setPhotoOut(true), fast ? 160 : 1050),
        setTimeout(() => setLetterOut(true), fast ? 320 : 1800),
        setTimeout(() => setTyping(true), fast ? 420 : 2500),
      ];
      return () => timers.forEach(clearTimeout);
    }
    if (state === "closed") {
      setFlapOpen(false);
      setFlapBehind(false);
      setPhotoOut(false);
      setLetterOut(false);
      setTyping(false);
    }
  }, [state, reduced]);

  // Reduced motion: letter shown fully typed, report completion shortly after.
  useEffect(() => {
    if (typing && reduced) {
      const t = setTimeout(() => {
        setState("opened");
        onOpenedRef.current?.();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [typing, reduced]);

  const handleTyped = () => {
    setState("opened");
    onOpenedRef.current?.();
  };

  const toggle = () =>
    setState((s) => (s === "closed" ? "opening" : s === "opened" ? "closed" : s));

  const idle = state === "closed";
  const contentSpring = reduced ? TWEEN : SPRING;

  return (
    <div className="flex w-full flex-col items-center">
      {/* Space the photo + letter settle into above the envelope (grows as they fly out) */}
      <motion.div
        aria-hidden
        initial={false}
        // Polaroid estimate: 260px wide → p-2.5 (10) + square image (240) +
        // caption row (~30) + pb-10 (40) ≈ 330 tall. Cap raised so the big
        // polaroid + letter never overlap the Next button.
        animate={{ height: idle ? 240 : Math.min(photoLift - 12 + 330, 640) }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      <div ref={envRef} className="relative w-[min(80vw,340px)]">
        {/* Invisible full-text probe: measures the letter card's final height */}
        <div
          ref={letterProbeRef}
          aria-hidden
          className="invisible absolute left-1/2 top-0 z-[-1] w-[86%] -translate-x-1/2"
        >
          <div className="paper rotate-[1.5deg] rounded-xl border border-goldsoft/60 p-4 pb-5 font-hand text-2xl leading-snug text-cocoa">
            <p className="whitespace-pre-line">{MESSAGE}</p>
          </div>
        </div>

        {/* Soft rose glow under the envelope (breathes in sync with the idle float) */}
        <motion.div
          aria-hidden
          className="absolute -bottom-5 left-1/2 h-8 w-[78%] -translate-x-1/2 rounded-[100%] blur-xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(244,159,188,0.55) 0%, rgba(244,159,188,0) 72%)",
          }}
          animate={
            idle && !reduced
              ? { scaleX: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }
              : { scaleX: 1, opacity: 0.5 }
          }
          transition={{ duration: 5, repeat: idle && !reduced ? Infinity : 0, ease: "easeInOut" }}
        />

        <button
          type="button"
          onClick={toggle}
          aria-label={
            idle ? "Open the birthday envelope" : state === "opening" ? "Opening the envelope" : "Close the envelope"
          }
          className="block w-full cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-raspberry/40"
          style={{ perspective: 1000 }}
        >
          {/* quick scale pop on open */}
          <motion.div
            style={{ transformStyle: "preserve-3d" }}
            animate={{ scale: state === "opening" && !reduced ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.25 }}
          >
            {/* idle bob: slow, luxurious (8px over 5s) */}
            <motion.div
              style={{ transformStyle: "preserve-3d" }}
              animate={idle && !reduced ? { y: [0, -8, 0] } : { y: 0 }}
              transition={
                idle && !reduced
                  ? { duration: 5, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.4 }
              }
            >
              {/* idle sway: slightly desynced (±1.5deg over 7s) */}
              <motion.div
                className="relative aspect-[1.4/1]"
                style={{ transformStyle: "preserve-3d" }}
                animate={idle && !reduced ? { rotate: [-1.5, 1.5, -1.5] } : { rotate: 0 }}
                transition={
                  idle && !reduced
                    ? { duration: 7, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.4 }
                }
              >
                {/* back panel: rich raspberry, light from top-left, layered shadows */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(165deg, #ef7fa0 0%, #e26a8d 55%, #cf5578 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -12px 20px rgba(92,64,51,0.18), 0 2px 4px rgba(92,64,51,0.28), 0 22px 36px -14px rgba(197,90,120,0.5)",
                  }}
                />

                {/* patterned blush lining, revealed the moment the flap opens */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 z-[2] h-[57%] rounded-t-2xl"
                  style={{
                    backgroundColor: "#ffe9f0",
                    backgroundImage:
                      "radial-gradient(rgba(226,106,141,0.35) 1.5px, transparent 1.6px)",
                    backgroundSize: "13px 13px",
                    boxShadow: "inset 0 2px 6px rgba(92,64,51,0.12)",
                  }}
                />

                {/* letter (inside the slot, rises out when opened) */}
                <motion.div
                  className="absolute bottom-3 left-1/2 z-[5] w-[86%] -translate-x-1/2"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ y: letterOut ? -letterLift : 0 }}
                  transition={contentSpring}
                >
                  <div className="paper rotate-[1.5deg] rounded-xl border border-goldsoft/60 p-4 pb-5 font-hand text-2xl leading-snug text-cocoa shadow-lg shadow-cocoa/20">
                    {typing && !reduced ? (
                      <Typewriter text={MESSAGE} onDone={handleTyped} />
                    ) : typing ? (
                      <p className="whitespace-pre-line">{MESSAGE}</p>
                    ) : null}
                  </div>
                </motion.div>

                {/* polaroid photo (inside the slot, slides up and out when opened) */}
                <motion.div
                  className="absolute bottom-3 left-1/2 z-[6] w-[min(64vw,260px)] -translate-x-1/2"
                  style={{ transformStyle: "preserve-3d", transformOrigin: "50% 100%" }}
                  animate={{ y: photoOut ? -photoLift : 0, scale: photoOut ? 1.1 : 0.55 }}
                  transition={contentSpring}
                >
                  <div
                    className="rotate-[-3deg] rounded-md p-2.5 pb-10 ring-1 ring-cocoa/5"
                    style={{
                      background: "linear-gradient(180deg, #ffffff 0%, #fff6ec 100%)",
                      boxShadow:
                        "0 3px 6px rgba(92,64,51,0.12), 0 14px 26px -8px rgba(92,64,51,0.35)",
                    }}
                  >
                    <Image
                      src="/photos/mami-main.jpg"
                      alt="Mami Joan smiling"
                      width={640}
                      height={640}
                      sizes="min(64vw, 260px)"
                      priority
                      className="aspect-square w-full rounded-[3px] object-cover"
                    />
                    <p className="mt-2 flex items-center justify-center gap-1.5 text-center font-hand text-2xl leading-none text-cocoasoft">
                      Mami Joan
                      <Heart aria-hidden className="h-4 w-4 text-rose" fill="currentColor" />
                    </p>
                  </div>
                  {photoOut && !reduced && (
                    <>
                      <motion.span
                        aria-hidden
                        className="absolute -left-6 top-6 text-rose"
                        animate={{ y: [0, -7, 0], opacity: [0.5, 0.9, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                      >
                        <Heart className="h-3.5 w-3.5" fill="currentColor" />
                      </motion.span>
                      <motion.span
                        aria-hidden
                        className="absolute -right-4 -top-2 text-gold"
                        animate={{ y: [0, -9, 0], x: [0, 3, 0] }}
                        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Sparkle className="h-3 w-3" fill="currentColor" />
                      </motion.span>
                      <motion.span
                        aria-hidden
                        className="absolute -right-6 bottom-24 text-goldsoft"
                        animate={{ y: [0, -6, 0], rotate: [0, 12, 0] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                      >
                        <Sparkle className="h-2.5 w-2.5" fill="currentColor" />
                      </motion.span>
                    </>
                  )}
                </motion.div>

                {/* front pocket: V-fold, top-left light, 1px inset highlight */}
                <div
                  className="absolute inset-0 z-20"
                  style={{
                    filter:
                      "drop-shadow(0 2px 3px rgba(92,64,51,0.2)) drop-shadow(0 12px 20px rgba(197,90,120,0.28))",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath:
                        "polygon(0 24%, 50% 52%, 100% 24%, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px))",
                      background:
                        "linear-gradient(165deg, #fbc4d6 0%, #f4a5c0 30%, #e884a4 62%, #dd6f92 100%)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -8px 14px rgba(92,64,51,0.15)",
                    }}
                  />
                </div>

                {/* gold flap: crisp pointed V-fold, light goldsoft top → deeper gold at the crease */}
                <motion.div
                  className="absolute inset-x-0 top-0 h-[57%] overflow-hidden rounded-t-2xl"
                  style={{
                    zIndex: flapBehind ? 1 : 30,
                    transformOrigin: "top center",
                  }}
                  animate={{ rotateX: flapOpen ? -180 : 0 }}
                  transition={reduced ? { duration: 0.2 } : FLAP_SPRING}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                      background:
                        "linear-gradient(180deg, #fce9b8 0%, #f3cf7d 38%, #e9b94f 78%, #dca94a 100%)",
                      boxShadow:
                        "inset 0 2px 1px rgba(255,255,255,0.6), inset 0 -8px 12px rgba(146,104,32,0.22)",
                      filter: "drop-shadow(0 4px 6px rgba(92,64,51,0.25))",
                    }}
                  >
                    {/* thin highlight along the top edge + darker crease near the point */}
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 16%), linear-gradient(180deg, transparent 68%, rgba(146,104,32,0.3) 97%)",
                      }}
                    />
                  </div>
                </motion.div>

                {/* wax seal: embossed raspberry disc with gold ring; breaks on open */}
                <div className="absolute left-1/2 top-[52%] z-40 h-16 w-16 -translate-x-1/2 -translate-y-1/2">
                  {idle && !reduced && <span aria-hidden className="seal-ripple" />}
                  <motion.div
                    className="relative flex h-full w-full items-center justify-center rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 34% 28%, #f18ba7, #e26a8d 55%, #c94f73 100%)",
                      boxShadow:
                        "inset 0 2px 3px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(92,64,51,0.4), inset 0 0 0 1px rgba(255,255,255,0.15), 0 4px 8px rgba(92,64,51,0.35), 0 10px 18px -6px rgba(197,90,120,0.45)",
                    }}
                    animate={
                      idle
                        ? { scale: reduced ? 1 : [1, 1.06, 1], opacity: 1, rotate: 0 }
                        : { scale: 1.4, opacity: 0, rotate: 24 }
                    }
                    transition={
                      idle
                        ? { duration: 2.6, repeat: reduced ? 0 : Infinity, ease: "easeInOut" }
                        : { duration: 0.35, ease: "easeOut" }
                    }
                  >
                    {/* embossed gold ring */}
                    <div
                      aria-hidden
                      className="absolute inset-[6px] rounded-full"
                      style={{
                        boxShadow:
                          "inset 0 0 0 2px rgba(233,185,79,0.8), inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(146,60,86,0.6)",
                      }}
                    />
                    <Heart
                      aria-hidden
                      className="relative h-6 w-6 text-gold"
                      fill="currentColor"
                      style={{
                        filter:
                          "drop-shadow(0 1px 1px rgba(122,62,20,0.55)) drop-shadow(0 -1px 1px rgba(255,255,255,0.2))",
                      }}
                    />
                  </motion.div>
                  {/* seal fragments flying out as it breaks */}
                  {!idle && !reduced && (
                    <>
                      <motion.span
                        aria-hidden
                        className="absolute left-1/2 top-1/2 h-2 w-2 rounded-[2px] bg-goldsoft"
                        initial={{ x: 0, y: 0, opacity: 0.9, rotate: 0 }}
                        animate={{ x: -22, y: -18, rotate: -70, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                      <motion.span
                        aria-hidden
                        className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-[2px] bg-gold"
                        initial={{ x: 0, y: 0, opacity: 0.9, rotate: 0 }}
                        animate={{ x: 20, y: -14, rotate: 55, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
                      />
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </button>

        {/* tap hint: quiet gold shimmer, no loud emoji */}
        <motion.div
          className="mt-5 flex items-center justify-center"
          animate={{ opacity: idle ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.p
            className="shimmer-text font-hand text-xl"
            animate={reduced ? {} : { y: [0, -3, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            tap the golden seal
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
