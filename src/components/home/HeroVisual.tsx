"use client";

import Image from "next/image";
import { useRef } from "react";
import { useDesktopAnimation } from "@/lib/animations/useDesktopAnimation";

/** Sample 3D render that drifts away as the hero scrolls out. Decorative, so it has no alt. */
export function HeroVisual() {
  const root = useRef<HTMLDivElement>(null);

  useDesktopAnimation(root, ({ gsap }) => {
    gsap.to(root.current, {
      yPercent: 22,
      rotate: 7,
      ease: "none",
      scrollTrigger: { start: 0, end: () => window.innerHeight, scrub: true },
    });
  });

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none absolute top-[19%] right-[-24%] aspect-[4/5] w-[100vw] sm:top-[8%] sm:right-[-12%] sm:w-[62vw] lg:top-[-4%] lg:right-[-5%] lg:w-[44vw]"
    >
      <Image
        src="/media/samples/hero.webp"
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 44vw, (min-width: 640px) 62vw, 100vw"
        className="settle object-cover"
      />
    </div>
  );
}
