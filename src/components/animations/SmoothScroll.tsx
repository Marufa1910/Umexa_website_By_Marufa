"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getLenis, setLenis } from "@/lib/animations/lenis";

const WANTS_SMOOTH_SCROLL =
  "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * Drives Lenis from GSAP's ticker so ScrollTrigger and smooth scroll share one clock. Mouse users on
 * large screens only: touch devices already scroll smoothly, so they never download either library.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.matchMedia(WANTS_SMOOTH_SCROLL).matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("@/lib/animations/gsap"),
      ]);
      if (cancelled) return;

      const lenis = new Lenis({ lerp: 0.11 });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        setLenis(null);
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  // New page, new height. Next has already set the scroll position (top, or restored on
  // back), so kill any leftover inertia at that spot and re-measure the scroll animations.
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    import("@/lib/animations/gsap").then(({ ScrollTrigger }) => ScrollTrigger.refresh());
  }, [pathname]);

  return null;
}
