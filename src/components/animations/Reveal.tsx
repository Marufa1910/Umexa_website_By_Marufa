"use client";

import { useRef, type ComponentProps } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/animations/gsap";

/** Staggers in every `[data-reveal]` descendant once the block scrolls into view. */
export function Reveal({ children, ...props }: ComponentProps<"div">) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from("[data-reveal]", {
          y: 36,
          autoAlpha: 0,
          duration: 1.05,
          stagger: 0.08,
          ease: "expo.out",
          scrollTrigger: { trigger: root.current, start: "top 84%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} {...props}>
      {children}
    </div>
  );
}
