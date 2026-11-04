"use client";

import { useEffect, useRef, type ComponentProps } from "react";

/**
 * Staggers in every `[data-reveal]` descendant when the block scrolls into view. Pure CSS once armed,
 * and only blocks still below the screen are armed, so nothing visible ever flashes. Without
 * JavaScript, or with reduced motion, everything simply stays visible.
 */
export function Reveal({ children, ...props }: ComponentProps<"div">) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    element.querySelectorAll<HTMLElement>("[data-reveal]").forEach((item, index) => {
      item.style.setProperty("--reveal-i", String(Math.min(index, 8)));
    });
    element.classList.add("reveal-armed");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.remove("reveal-armed");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.classList.remove("reveal-armed");
    };
  }, []);

  return (
    <div ref={root} {...props}>
      {children}
    </div>
  );
}
