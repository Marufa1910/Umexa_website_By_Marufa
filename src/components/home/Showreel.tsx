"use client";

import { useRef } from "react";
import { SampleTag } from "@/components/ui/SampleTag";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { DESKTOP_MOTION, gsap, useGSAP } from "@/lib/animations/gsap";

type Props = { src: string | null; poster: string; sample: boolean };

export function Showreel({ src, poster, sample }: Props) {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(DESKTOP_MOTION, () => {
        gsap.from(frame.current, {
          clipPath: "inset(0% 7% 0% 7%)",
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "top 15%",
            scrub: true,
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Showreel" className="relative">
      <div ref={frame}>
        <VideoPlayer
          src={src}
          poster={poster}
          alt="Movexa showreel"
          sizes="100vw"
          loop
          className="aspect-[4/5] sm:aspect-video"
          caption={(available) => (
            <>
              <p className="display text-2xl lg:text-4xl">Showreel</p>
              {!available ? (
                <SampleTag className="mt-2">Reel unavailable</SampleTag>
              ) : (
                sample && <SampleTag className="mt-2">Sample footage, not client work</SampleTag>
              )}
            </>
          )}
        />
      </div>
    </section>
  );
}
