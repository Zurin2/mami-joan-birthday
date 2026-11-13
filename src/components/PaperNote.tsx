"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "motion/react";
import { wishes, type NoteSection } from "@/data/wishes";
import { Cross, Heart, HeartHandshake } from "lucide-react";

type Props = {
  onFinished?: () => void;
};

function Section({ section }: { section: NoteSection }) {
  if (section.kind === "greeting") {
    return <p className="font-hand text-3xl text-cocoa">{section.text}</p>;
  }
  if (section.kind === "prayer") {
    return (
      <div className="rounded-lg bg-blush/70 p-4">
        <p className="font-hand text-2xl leading-relaxed text-cocoa">
          <HeartHandshake
            aria-hidden
            className="mr-1.5 inline-block h-5 w-5 align-[-4px] text-raspberry"
          />
          {section.text}
        </p>
      </div>
    );
  }
  if (section.kind === "verse") {
    return (
      <div className="text-center">
        <div aria-hidden className="mb-3 flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-gold/60" />
          <Cross className="h-4 w-4 text-gold" />
          <span className="h-px w-8 bg-gold/60" />
        </div>
        <p className="font-hand text-xl italic leading-relaxed text-cocoasoft">{section.text}</p>
        <div aria-hidden className="mt-3 flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-gold/60" />
          <Cross className="h-4 w-4 text-gold" />
          <span className="h-px w-8 bg-gold/60" />
        </div>
      </div>
    );
  }
  if (section.kind === "signature") {
    const marker = "— Jm";
    const at = section.text.indexOf(marker);
    return (
      <p className="font-hand text-3xl leading-relaxed text-cocoa">
        {at === -1 ? section.text : section.text.slice(0, at)}
        {at !== -1 && (
          <span className="font-bold text-raspberry">
            {marker}
            <Heart
              aria-hidden
              className="ml-1 inline-block h-4 w-4 align-[-2px]"
              fill="currentColor"
            />
          </span>
        )}
      </p>
    );
  }
  return <p className="font-hand text-2xl leading-relaxed text-cocoa">{section.text}</p>;
}

/** Centered lined-paper note that unfolds on mount; sections reveal while scrolling. */
export default function PaperNote({ onFinished }: Props) {
  // SSR-safe: match server render on first paint, then apply reduced motion.
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && prefersReduced;
  const lastRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);
  const lastInView = useInView(lastRef, { once: true, margin: "-60px" });

  useEffect(() => {
    if (lastInView && !doneRef.current) {
      doneRef.current = true;
      onFinished?.();
    }
  }, [lastInView, onFinished]);

  return (
    <div style={{ perspective: 900 }} className="mx-auto w-full max-w-md">
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, scaleY: 0.05, rotateX: 18 }}
        // Final transform is ALWAYS in the target — if reduced motion flips on
        // mid-unfold, a target missing these keys would freeze the note warped.
        animate={{ opacity: 1, scaleY: 1, rotateX: 0 }}
        transition={reduced ? { duration: 0.3 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "top center" }}
        className="paper rounded-xl border border-goldsoft/60 p-6 shadow-xl sm:p-10"
      >
        <div className="flex flex-col gap-6">
          {wishes.map((section, i) => {
            const isLast = i === wishes.length - 1;
            return (
              <motion.div
                key={i}
                ref={isLast ? lastRef : undefined}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
                whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Section section={section} />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
