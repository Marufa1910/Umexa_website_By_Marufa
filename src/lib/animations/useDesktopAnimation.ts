"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

export const DESKTOP_MOTION = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

type Tools = typeof import("./gsap");

/**
 * Scroll-driven GSAP work, for large screens only. GSAP is downloaded when a large screen is
 * present, including when a tablet rotates into one, and everything is reverted on unmount or
 * when the screen stops qualifying. Layouts must look complete before this runs.
 */
export function useDesktopAnimation(
  scope: RefObject<HTMLElement | null>,
  setup: (tools: Tools) => void,
) {
  const run = useEffectEvent(setup);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_MOTION);
    let cancelled = false;
    let revert: (() => void) | undefined;

    const start = async () => {
      if (revert || !query.matches) return;
      const tools = await import("./gsap");
      if (cancelled || revert) return;
      const context = tools.gsap.context(() => {
        tools.gsap.matchMedia().add(DESKTOP_MOTION, () => run(tools));
      }, scope.current ?? undefined);
      revert = () => context.revert();
    };

    start();
    query.addEventListener("change", start);
    return () => {
      cancelled = true;
      query.removeEventListener("change", start);
      revert?.();
    };
  }, [scope]);
}
