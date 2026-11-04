"use client";

import { motion, MotionConfig } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { SampleTag } from "@/components/ui/SampleTag";
import { SectionSlate } from "@/components/ui/SectionSlate";
import type { TestimonialItem } from "@/types/content";

export function Testimonials({ items }: { items: TestimonialItem[] }) {
  const [active, setActive] = useState(0);
  if (items.length === 0) return null;

  return (
    <MotionConfig reducedMotion="user">
      <section className="gutter grid gap-10 py-24 md:grid-cols-12 lg:py-40">
        <div className="md:col-span-4">
          <SectionSlate index="05" label="Client words" />
          {items[active]?.isSample && (
            <SampleTag className="mt-4 bg-surface-2">Sample quotes, not real feedback</SampleTag>
          )}
          <div className="mt-8 flex gap-1" role="group" aria-label="Choose a quote">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={active === i}
                aria-label={`Quote ${i + 1}`}
                onClick={() => setActive(i)}
                className={`slate flex size-11 items-center justify-center border transition-colors duration-300 ${
                  active === i
                    ? "border-lime bg-lime text-ink"
                    : "border-line text-muted hover:border-paper hover:text-paper"
                }`}
              >
                0{i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* All quotes share one grid cell, so the section's height never jumps */}
        <div className="grid md:col-span-8" aria-live="polite">
          {items.map((item, i) => (
            <motion.figure
              key={i}
              initial={false}
              animate={{ opacity: active === i ? 1 : 0, y: active === i ? 0 : 16 }}
              transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
              aria-hidden={active !== i}
              className={`col-start-1 row-start-1 ${active === i ? "" : "invisible"}`}
            >
              <blockquote className="accent-serif text-[clamp(2rem,4.6vw,4.5rem)] leading-[1.06]">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3 text-sm">
                {item.photo && (
                  <Image
                    src={item.photo}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 object-cover"
                  />
                )}
                <span>
                  {item.name}
                  <span className="mt-1 block text-muted">{item.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>
    </MotionConfig>
  );
}
