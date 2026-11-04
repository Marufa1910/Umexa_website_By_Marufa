"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { Wordmark } from "@/components/layout/Logo";

const EASE = "cubic-bezier(0.19, 1, 0.22, 1)";

/**
 * A curtain that lifts as each new page arrives. It only plays once the page is already there and
 * never catches clicks, so it can't delay navigating. Layout effects run before the browser paints,
 * so the new page is never seen uncovered. The first page load is left alone, for speed.
 */
export function PageTransition() {
  const pathname = usePathname();
  const previous = useRef(pathname);
  const curtain = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    curtain.current?.animate(
      [
        { visibility: "visible", clipPath: "inset(0 0 0% 0)" },
        { visibility: "visible", clipPath: "inset(0 0 100% 0)" },
      ],
      { duration: 800, easing: EASE },
    );
    document
      .getElementById("main")
      ?.animate([{ translate: "0 32px" }, { translate: "0 0" }], { duration: 800, easing: EASE });
  }, [pathname]);

  return (
    <div
      ref={curtain}
      aria-hidden
      className="pointer-events-none invisible fixed inset-0 z-[45] flex items-center justify-center bg-surface text-4xl"
    >
      <Wordmark />
    </div>
  );
}
