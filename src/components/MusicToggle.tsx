"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Volume2, VolumeX } from "lucide-react";

/** Floating music toggle (top-right). Off by default; hides itself if /audio/song.mp3 is missing. */
export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const audio = new Audio("/audio/song.mp3");
    audio.loop = true;
    audio.addEventListener("canplaythrough", () => setAvailable(true));
    audio.addEventListener("error", () => setAvailable(false));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  if (!available) return null;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={playing ? "Turn music off" : "Turn music on"}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.06 }}
      className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-xl shadow-md ring-1 ring-raspberry/20 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-raspberry/50"
    >
      <span aria-hidden className="flex">
        {playing ? (
          <Volume2 className="h-5 w-5 text-raspberry" />
        ) : (
          <VolumeX className="h-5 w-5 text-cocoasoft" />
        )}
      </span>
    </motion.button>
  );
}
