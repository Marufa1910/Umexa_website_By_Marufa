"use client";

import { useRef } from "react";
import { SectionSlate } from "@/components/ui/SectionSlate";
import { processSteps } from "@/content/home";
import { useDesktopAnimation } from "@/lib/animations/useDesktopAnimation";

/**
 * Laid out as an edit timeline. On desktop the section pins and the playhead scrubs
 * across the four stages; elsewhere it is a plain vertical list.
 */
export function Process({ index = "04" }: { index?: string }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const playhead = useRef<HTMLSpanElement>(null);

  useDesktopAnimation(root, ({ gsap }) => {
    const distance = () => (track.current?.scrollWidth ?? 0) - window.innerWidth;
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root.current,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    timeline
      .to(track.current, { x: () => -distance() }, 0)
      .fromTo(playhead.current, { scaleX: 0 }, { scaleX: 1 }, 0);
  });

  return (
    <section
      ref={root}
      className="flex flex-col overflow-clip border-t border-line py-24 lg:h-svh lg:justify-between lg:py-0 lg:pt-24 lg:pb-10"
    >
      <div className="gutter flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <SectionSlate index={index} label="How we work" />
          <h2 className="display mt-5 text-section">Four stages. No surprises.</h2>
        </div>
      </div>

      <div className="relative mt-12 lg:mt-0">
        <div
          aria-hidden
          className="relative mx-[clamp(1rem,3.2vw,3rem)] hidden h-3 lg:block"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--color-line) 0 1px, transparent 1px 16px)",
          }}
        >
          <span
            ref={playhead}
            className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-signal"
          />
        </div>

        <ol
          ref={track}
          className="gutter flex flex-col will-change-transform lg:mt-8 lg:w-max lg:flex-row lg:gap-0"
        >
          {processSteps.map((step, i) => (
            <li
              key={step.title}
              className="grid grid-cols-[3rem_1fr] border-t border-line py-8 last:border-b lg:block lg:w-[48vw] lg:max-w-[52rem] lg:border-t-0 lg:border-l lg:px-8 lg:py-0 lg:last:border-b-0"
            >
              <span className="accent-serif text-3xl text-accent lg:text-6xl">{i + 1}</span>
              <div className="lg:mt-[min(7vh,4.5rem)]">
                <h3 className="display text-4xl lg:text-[clamp(3rem,min(7.4vw,13vh),8rem)]">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-lg leading-relaxed text-fg/80 lg:mt-6 lg:text-xl">
                  {step.copy}
                </p>
                <p className="slate mt-5 text-muted lg:mt-8">You get: {step.output}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
