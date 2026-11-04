"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { SampleTag } from "@/components/ui/SampleTag";

export type ProjectCardData = {
  slug: string;
  title: string;
  client: string;
  categories: readonly string[];
  year: number;
  featured: boolean;
  isSample: boolean;
  cover: string;
  alt: string;
  video: string | null;
};

type Props = {
  project: ProjectCardData;
  media?: string;
  sizes?: string;
  showFeatured?: boolean;
};

/** Project tile. A mouse hover plays a short muted loop, fetched only on first hover. */
export function ProjectCard({
  project,
  media = "aspect-[4/3]",
  sizes = "(min-width: 768px) 50vw, 100vw",
  showFeatured = false,
}: Props) {
  const [wantsVideo, setWantsVideo] = useState(false);
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  const start = (pointerType: string) => {
    if (pointerType !== "mouse" || !project.video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setWantsVideo(true);
    video.current?.play().catch(() => {});
  };

  const stop = () => {
    video.current?.pause();
    setPlaying(false);
  };

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block"
      onPointerEnter={(e) => start(e.pointerType)}
      onPointerLeave={stop}
    >
      <div className={`relative overflow-hidden bg-surface ${media}`}>
        <Image
          src={project.cover}
          alt={project.alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[1200ms] ease-studio group-hover:scale-[1.04]"
        />
        {wantsVideo && project.video && (
          <video
            ref={video}
            src={project.video}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
            onPlaying={() => setPlaying(true)}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
          />
        )}
        <div className="absolute top-3 left-3 flex gap-1">
          {project.isSample && <SampleTag />}
          {showFeatured && project.featured && (
            <span className="slate inline-block bg-lime px-2 py-1 text-ink">Featured</span>
          )}
        </div>
        <span className="absolute right-0 bottom-0 flex size-12 translate-y-2 items-center justify-center bg-lime text-ink opacity-0 transition-all duration-500 ease-studio group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 lg:size-16">
          <ArrowUpRight aria-hidden className="size-5 lg:size-6" />
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl tracking-tight transition-colors duration-300 group-hover:text-lime lg:text-3xl">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-muted">{project.client}</p>
        </div>
        <p className="slate shrink-0 pt-1.5 text-right text-muted">
          {project.categories[0]}
          <br />
          {project.year}
        </p>
      </div>
    </Link>
  );
}
