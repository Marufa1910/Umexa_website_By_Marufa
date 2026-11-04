"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/animations/gsap";

/** Words brighten one by one as the paragraph passes through the viewport. */
export function ScrubText({ text, className = "" }: { text: string; className?: string }) {
  const root = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from("[data-word]", {
          opacity: 0.16,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 82%", end: "bottom 55%", scrub: 0.4 },
        });
      });
    },
    { scope: root },
  );

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
