"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The page reads as a timeline: scroll position shows as a timecode and playhead.
 * Written straight to the DOM, so scrolling never re-renders React.
 */
export function ScrollTimecode() {
  const { scrollYProgress } = useScroll();
  const label = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const frames = Math.round(p * 120 * 24);
    if (label.current) {
      label.current.textContent = `00:${pad(Math.floor(frames / 1440))}:${pad(Math.floor(frames / 24) % 60)}:${pad(frames % 24)}`;
    }
    if (bar.current) bar.current.style.transform = `scaleX(${p})`;
  });

  return (
    <>
      <span
        aria-hidden
        ref={label}
        className="slate absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-muted xl:block"
      >
        00:00:00:00
      </span>
      <span
        aria-hidden
        ref={bar}
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-lime"
      />
    </>
  );
}
