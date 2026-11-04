"use client";

import Image from "next/image";
import { useRef } from "react";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { useDesktopAnimation } from "@/lib/animations/useDesktopAnimation";
import type { MediaItem } from "@/types/content";

/**
 * Items have a fixed height, so an image's displayed width follows the screen's height and its
 * shape, not the screen's width. On phones a wide image is cropped, so it still needs this size.
 */
const sizesFor = ({ width, height }: MediaItem) => {
  const ratio = width / height;
  return `(min-width: 1024px) ${Math.round(74 * ratio)}vh, ${Math.round(56 * ratio)}vh`;
};

/**
 * A row of media. On its own it is a normal swipeable, keyboard-scrollable strip, which is what
 * phones, reduced motion and no JavaScript get. On large screens the section pins, and scrolling
 * down moves the row sideways. If everything already fits, it just stays a plain row.
 */
export function ProjectGallery({ items, title }: { items: MediaItem[]; title: string }) {
  const section = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);

  useDesktopAnimation(section, ({ gsap }) => {
    const distance = () => (track.current?.scrollWidth ?? 0) - window.innerWidth;
    if (distance() <= 0) return;

    gsap.set(scroller.current, { overflow: "clip" });
    gsap.to(track.current, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: section.current,
        start: "center center",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
  });

  if (items.length === 0) return null;

  return (
    <section ref={section} aria-label={`${title} gallery`}>
      <div
        ref={scroller}
        // Lets keyboard users scroll the strip with the arrow keys
        tabIndex={0}
        role="group"
        aria-label={`${title} gallery. Scroll sideways to see more.`}
        className="snap-x snap-mandatory [scrollbar-width:thin] overflow-x-auto lg:snap-none"
      >
        <ol ref={track} className="gutter flex w-max gap-4 lg:gap-8">
          {items.map((item) => (
            <li
              key={item.src + item.kind}
              style={{ aspectRatio: `${item.width} / ${item.height}` }}
              className="relative h-[56svh] max-w-[88vw] flex-none snap-center overflow-hidden bg-surface lg:h-[74svh] lg:max-w-none"
            >
              {item.kind === "video" ? (
                <VideoPlayer
                  src={item.src}
                  poster={item.poster ?? ""}
                  alt={item.alt}
                  sizes={sizesFor(item)}
                  loop
                  className="size-full"
                />
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes={sizesFor(item)}
                  className="object-cover"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
