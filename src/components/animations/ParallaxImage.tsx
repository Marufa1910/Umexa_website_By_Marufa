"use client";

import Image from "next/image";
import { useRef } from "react";
import { DESKTOP_MOTION, gsap, MOTION_OK, useGSAP } from "@/lib/animations/gsap";

type Props = { src: string; alt: string; sizes: string; className?: string };

/** Wipes open on entry and drifts inside its frame while scrolling. */
export function ParallaxImage({ src, alt, sizes, className = "" }: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(frame.current, {
          clipPath: "inset(100% 0% 0% 0%)",
          duration: 1.3,
          ease: "expo.out",
          scrollTrigger: { trigger: frame.current, start: "top 88%", once: true },
        });
      });
      mm.add(DESKTOP_MOTION, () => {
        gsap.fromTo(
          layer.current,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: "none",
            scrollTrigger: {
              trigger: frame.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: frame },
  );

  return (
    <div ref={frame} className={`relative overflow-hidden bg-surface ${className}`}>
      <div ref={layer} className="absolute inset-x-0 -inset-y-[6%]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[1200ms] ease-studio group-hover:scale-[1.04]"
        />
      </div>
    </div>
  );
}
