"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type ServiceRow = { slug: string; title: string; summary: string; preview: string };

const SPRING = { stiffness: 220, damping: 28, mass: 0.5 };

/** Rows of services; on mouse devices, a preview image follows the cursor over the list. */
export function ServicesList({ services }: { services: ServiceRow[] }) {
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  return (
    <div
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        x.set(e.clientX);
        y.set(e.clientY);
      }}
      onPointerLeave={() => setActive(null)}
    >
      <ul className="border-b border-line">
        {services.map((service, i) => (
          <li key={service.slug} data-reveal className="border-t border-line">
            <Link
              href={`/services/${service.slug}`}
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                // First hover: start at the cursor rather than springing in from the corner
                if (active === null) {
                  sx.jump(e.clientX);
                  sy.jump(e.clientY);
                }
                setActive(i);
              }}
              className="group grid grid-cols-[2rem_1fr_auto] items-center gap-x-2 py-5 md:grid-cols-12 md:gap-x-6 lg:py-7"
            >
              <span className="slate text-muted md:col-span-1">0{i + 1}</span>
              <span className="display text-[2rem] transition-[color,translate] duration-500 ease-studio group-hover:translate-x-2 group-hover:text-lime sm:text-4xl md:col-span-6 lg:text-6xl lg:group-hover:translate-x-5">
                {service.title}
              </span>
              <span className="col-start-2 row-start-2 mt-2 text-sm text-muted md:col-span-4 md:col-start-auto md:row-start-auto md:mt-0 lg:text-base">
                {service.summary}
              </span>
              <ArrowUpRight
                aria-hidden
                className="col-start-3 row-start-1 size-5 justify-self-end transition-all duration-500 ease-studio group-hover:text-lime md:col-span-1 md:col-start-auto md:row-start-auto lg:size-7 lg:group-hover:translate-x-1 lg:group-hover:-translate-y-1"
              />
            </Link>
          </li>
        ))}
      </ul>

      <motion.div
        aria-hidden
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed top-0 left-0 z-30 hidden lg:block"
      >
        <AnimatePresence>
          {active !== null && (
            <motion.div
              key={services[active].slug}
              initial={{ opacity: 0, scale: 0.9, clipPath: "inset(12% 12% 12% 12%)" }}
              animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
              className="absolute -top-36 left-10 h-72 w-56 overflow-hidden"
            >
              <Image
                src={services[active].preview}
                alt=""
                fill
                sizes="224px"
                className="object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
