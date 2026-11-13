"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = ["/", "/memories", "/wishes"];

type Props = {
  step: 0 | 1 | 2;
  backHref?: string;
  nextHref?: string;
  nextLabel?: string;
};

/** Bottom navigation: Back link, three dot indicators, Next button. */
export default function PageNav({ step, backHref, nextHref, nextLabel = "Next" }: Props) {
  return (
    <motion.nav
      aria-label="Page navigation"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mt-8 flex items-center justify-center gap-4 pb-10"
    >
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-cocoasoft transition-colors duration-150 hover:text-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-raspberry/50"
        >
          <ChevronLeft aria-hidden className="h-3.5 w-3.5" />
          Back
        </Link>
      ) : (
        <span className="w-[68px]" />
      )}

      <div className="flex items-center gap-2" aria-hidden>
        {STEPS.map((href, i) => (
          <span
            key={href}
            className={`h-2 w-2 rounded-full transition-colors duration-300 ${
              i === step ? "bg-raspberry" : "bg-rose/40"
            }`}
          />
        ))}
      </div>

      {nextHref ? (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Link
            href={nextHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-raspberry px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-raspberry/30 transition-colors duration-150 hover:bg-raspberry/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-raspberry/60 focus-visible:ring-offset-2"
          >
            {nextLabel}
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      ) : (
        <span className="w-[68px]" />
      )}
    </motion.nav>
  );
}
