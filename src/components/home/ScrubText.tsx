"use client";

import { useRef } from "react";
import { useDesktopAnimation } from "@/lib/animations/useDesktopAnimation";

/** Words brighten one by one on large screens. On phones the text is simply there to read. */
export function ScrubText({ text, className = "" }: { text: string; className?: string }) {
  const root = useRef<HTMLParagraphElement>(null);

  useDesktopAnimation(root, ({ gsap }) => {
    gsap.from("[data-word]", {
      // Starts at a readable contrast for large text, even mid-animation
      opacity: 0.55,
      stagger: 0.1,
      ease: "none",
      scrollTrigger: { trigger: root.current, start: "top 82%", end: "bottom 55%", scrub: 0.4 },
    });
  });

  return (
    <p ref={root} className={className}>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} data-word>
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
