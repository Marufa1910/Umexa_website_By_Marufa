"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useDesktopAnimation } from "@/lib/animations/useDesktopAnimation";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** For the main image of a page: loads first and skips the wipe */
  priority?: boolean;
};

/** Wipes open on entry (CSS), and drifts inside its frame while scrolling on large screens. */
export function ParallaxImage({ src, alt, sizes, className = "", priority }: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element || priority) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    element.classList.add("wipe-armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.remove("wipe-armed");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.classList.remove("wipe-armed");
    };
  }, [priority]);

  useDesktopAnimation(frame, ({ gsap }) => {
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

  return (
    <div ref={frame} className={`wipe relative overflow-hidden bg-surface ${className}`}>
      <div ref={layer} className="absolute inset-x-0 -inset-y-[6%]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-[1200ms] ease-studio group-hover:scale-[1.04]"
        />
      </div>
    </div>
  );
}
