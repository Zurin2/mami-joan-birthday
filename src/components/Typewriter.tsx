"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

type Props = {
  text: string;
  /** Ms per character. */
  speed?: number;
  onDone?: () => void;
};

/** Types `text` character by character with a blinking caret. */
export default function Typewriter({ text, speed = 35, onDone }: Props) {
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (count >= text.length) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current?.();
      }
      return;
    }
    const t = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(t);
  }, [count, text, speed]);

  return (
    <p aria-label={text} className="whitespace-pre-line">
      <span aria-hidden="true">
        {text.slice(0, count)}
        {count < text.length && (
          <motion.span
            className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] rounded-full bg-raspberry align-middle"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 0.9, times: [0, 0.5, 0.5, 1], repeat: Infinity }}
          />
        )}
      </span>
    </p>
  );
}
