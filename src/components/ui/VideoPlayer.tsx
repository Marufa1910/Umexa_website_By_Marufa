"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Status = "idle" | "playing" | "paused" | "error";

type Props = {
  src: string | null;
  poster: string;
  /** Describes the video, used for the poster and the button */
  alt: string;
  sizes: string;
  className?: string;
  loop?: boolean;
  /** Text over the bottom-left of the frame. Receives whether the video can play. */
  caption?: (available: boolean) => ReactNode;
};

const clock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Click-to-play video. Nothing downloads until the first click, it pauses when scrolled
 * off screen, and if the file can't be played it stays on the poster.
 */
export function VideoPlayer({ src, poster, alt, sizes, className = "", loop, caption }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [status, setStatus] = useState<Status>(src ? "idle" : "error");

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && !el.paused) el.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const el = video.current;
    if (!el || status === "error") return;
    if (el.paused) {
      el.play().catch((e: DOMException) => {
        // AbortError only means a pause interrupted the play request
        if (e.name !== "AbortError") setStatus("error");
      });
    } else {
      el.pause();
    }
  };

  const onTime = () => {
    const el = video.current;
    if (!el || !el.duration) return;
    if (time.current) time.current.textContent = `${clock(el.currentTime)} / ${clock(el.duration)}`;
    if (bar.current) bar.current.style.transform = `scaleX(${el.currentTime / el.duration})`;
  };

  const unavailable = status === "error";

  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      {src && (
        <video
          ref={video}
          src={src}
          preload="none"
          playsInline
          muted
          loop={loop}
          onPlaying={() => setStatus("playing")}
          onPause={() => setStatus((s) => (s === "error" ? s : "paused"))}
          onTimeUpdate={onTime}
          onError={() => setStatus("error")}
          className="absolute inset-0 size-full object-cover"
        />
      )}

      {(status === "idle" || unavailable) && (
        <Image src={poster} alt={alt} fill sizes={sizes} className="object-cover" />
      )}

      <button
        type="button"
        onClick={toggle}
        disabled={unavailable}
        aria-label={`${status === "playing" ? "Pause" : "Play"}: ${alt}`}
        className={`group absolute inset-0 flex items-center justify-center ${unavailable ? "cursor-default" : "cursor-pointer"}`}
      >
        {!unavailable && (
          <span
            className={`flex size-16 items-center justify-center bg-lime text-ink transition-all duration-500 ease-studio group-hover:scale-110 lg:size-24 ${
              status === "playing"
                ? "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                : ""
            }`}
          >
            {status === "playing" ? (
              <Pause aria-hidden className="size-5 fill-current lg:size-7" />
            ) : (
              <Play aria-hidden className="size-5 fill-current lg:size-7" />
            )}
          </span>
        )}
      </button>

      <div
        className={`gutter pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-linear-to-t from-ink/80 to-transparent pb-4 ${caption ? "pt-24" : "pt-10"}`}
      >
        <div>{caption?.(!unavailable)}</div>
        <span aria-hidden ref={time} className="slate shrink-0 text-paper" />
      </div>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-paper/20" />
      <span
        aria-hidden
        ref={bar}
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-lime"
      />
    </div>
  );
}
