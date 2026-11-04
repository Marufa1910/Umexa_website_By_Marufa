import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/animations/Reveal";
import { Button } from "@/components/ui/Button";
import { SampleTag } from "@/components/ui/SampleTag";
import { SectionSlate } from "@/components/ui/SectionSlate";
import { getPublishedProjects } from "@/lib/data/public";
import type { Project } from "@/types/content";
import { ParallaxImage } from "@/components/animations/ParallaxImage";

/* Deliberately uneven: the rhythm comes from size and offset, not a repeating card grid */
const placements = [
  { cell: "md:col-span-8", media: "aspect-[4/3]", sizes: "(min-width: 768px) 66vw, 100vw" },
  {
    cell: "md:col-span-4 md:mt-[22vw]",
    media: "aspect-[4/5]",
    sizes: "(min-width: 768px) 33vw, 100vw",
  },
  {
    cell: "md:col-span-5 md:col-start-2",
    media: "aspect-[4/5]",
    sizes: "(min-width: 768px) 42vw, 100vw",
  },
  {
    cell: "md:col-span-6 md:mt-[14vw]",
    media: "aspect-[4/3]",
    sizes: "(min-width: 768px) 50vw, 100vw",
  },
  {
    cell: "md:col-span-9 md:col-start-4",
    media: "aspect-[16/9]",
    sizes: "(min-width: 768px) 75vw, 100vw",
  },
];

function WorkCard({ project, index }: { project: Project; index: number }) {
  const { cell, media, sizes } = placements[index % placements.length];

  return (
    <article className={cell}>
      <Link href={`/work/${project.slug}`} className="group block">
        <div className="relative">
          <ParallaxImage src={project.cover} alt={project.alt} sizes={sizes} className={media} />
          {project.isSample && <SampleTag className="absolute top-3 left-3" />}
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
          <p className="slate pt-1.5 text-right text-muted">
            {project.categories[0]}
            <br />
            {project.year}
          </p>
        </div>
      </Link>
    </article>
  );
}

export async function SelectedWork() {
  const featured = (await getPublishedProjects()).filter((project) => project.featured);
  if (featured.length === 0) return null;

  return (
    <section className="gutter py-24 lg:py-40">
      <Reveal className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end lg:mb-20">
        <div>
          <div data-reveal>
            <SectionSlate index="01" label="Selected work" />
          </div>
          <h2 data-reveal className="display mt-5 max-w-4xl text-section">
            Made to be <span className="accent-serif text-[1.08em]">looked at</span> twice.
          </h2>
        </div>
        <div data-reveal>
          <Button href="/work" variant="ghost" className="min-w-52">
            All work
          </Button>
        </div>
      </Reveal>

      <div className="grid gap-x-6 gap-y-14 md:grid-cols-12 lg:gap-x-8 lg:gap-y-24">
        {featured.map((project, i) => (
          <WorkCard key={project.slug} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
