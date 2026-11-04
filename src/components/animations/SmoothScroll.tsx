"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { getLenis, setLenis } from "@/lib/animations/lenis";

/** Drives Lenis from GSAP's ticker so ScrollTrigger and smooth scroll share one clock. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.11 });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // New page, new height. Next has already set the scroll position (top, or restored on
  // back), so kill any leftover inertia at that spot and re-measure the scroll animations.
  useEffect(() => {
    getLenis()?.scrollTo(window.scrollY, { immediate: true, force: true });
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
