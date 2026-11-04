"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { primaryNav } from "@/config/site";
import { getLenis } from "@/lib/animations/lenis";
import { Logo } from "./Logo";
import { ScrollTimecode } from "./ScrollTimecode";

const EASE = [0.19, 1, 0.22, 1] as const;

export function Header({ logoUrl }: { logoUrl: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setSolid(y > 24);
    setHidden(y > previous && y > 160);
  });

  useEffect(() => {
    if (!open) return;
    const button = menuButton.current;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      button?.focus();
    };
  }, [open]);

  return (
    <>
      <motion.header
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE }}
        className={`gutter fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between transition-colors duration-300 lg:h-[72px] ${
          solid && !open ? "bg-ink" : "bg-transparent"
        }`}
      >
        <Logo logoUrl={logoUrl} onClick={() => setOpen(false)} />
        <ScrollTimecode />

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {primaryNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group relative block h-5 overflow-hidden text-sm leading-5 aria-[current=page]:text-lime"
              >
                <span className="block transition-transform duration-500 ease-studio group-hover:-translate-y-full">
                  {item.label}
                </span>
                <span
                  aria-hidden
                  className="block text-lime transition-transform duration-500 ease-studio group-hover:-translate-y-full"
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="ml-2 flex min-h-10 items-center bg-lime px-4 text-sm font-medium text-ink transition-colors duration-300 hover:bg-paper"
          >
            Let&rsquo;s Talk
          </Link>
        </nav>

        <button
          ref={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="-mr-2 flex size-11 items-center justify-center md:hidden"
        >
          {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
        </button>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="gutter fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-surface pt-24 pb-8 md:hidden"
          >
            <nav aria-label="Mobile">
              <ul>
                {primaryNav.map((item, i) => (
                  <li key={item.href} className="border-t border-line last:border-b">
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between py-4"
                    >
                      <span className="display text-5xl">{item.label}</span>
                      <span className="slate text-muted">0{i + 1}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-10 flex min-h-14 items-center justify-center bg-lime font-medium text-ink"
            >
              Let&rsquo;s Talk
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
