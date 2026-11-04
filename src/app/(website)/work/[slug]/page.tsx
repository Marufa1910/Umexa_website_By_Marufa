import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ParallaxImage } from "@/components/animations/ParallaxImage";
import { Reveal } from "@/components/animations/Reveal";
import { FinalCta } from "@/components/layout/FinalCta";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { PageHero } from "@/components/ui/PageHero";
import { SampleTag } from "@/components/ui/SampleTag";
import { SectionSlate } from "@/components/ui/SectionSlate";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { toProjectCard } from "@/lib/data/cards";
import {
  getNextProject,
  getProject,
  getPublishedProjects,
  getRelatedProjects,
} from "@/lib/data/public";
import type { MediaItem } from "@/types/content";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

/* The first visit after publishing or editing waits for the full page, rather than sending a
   shell that only fills in with JavaScript, so crawlers always get real content and real 404s. */
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  // Cache Components needs at least one param, even on a brand-new empty database
  if (projects.length === 0) return [{ slug: "__placeholder__" }];
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  return pageMetadata({
    title: project.seoTitle,
    description: project.seoDescription,
    path: `/work/${project.slug}`,
    image: project.cover,
    noindex: project.isSample,
  });
}

function GalleryItem({
  item,
  className,
  sizes,
}: {
  item: MediaItem;
  className: string;
  sizes: string;
}) {
  if (item.kind === "video") {
    return (
      <VideoPlayer
        src={item.src}
        poster={item.poster ?? ""}
        alt={item.alt}
        sizes={sizes}
        loop
        className={className}
      />
    );
  }
  return <ParallaxImage src={item.src} alt={item.alt} sizes={sizes} className={className} />;
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProject((await params).slug);
  if (!project) notFound();

  const [next, related] = await Promise.all([getNextProject(project), getRelatedProjects(project)]);

  /* Portrait and landscape share a row: 5 and 7 columns fill it, slightly offset */
  const layout = project.gallery.map((item, i) => {
    const portrait = item.height > item.width;
    return {
      cell: `${portrait ? "md:col-span-5" : "md:col-span-7"} ${i % 2 === 1 ? "md:mt-[8vw]" : ""}`,
      media: portrait ? "aspect-[4/5]" : "aspect-[4/3]",
      sizes: portrait ? "(min-width: 768px) 42vw, 100vw" : "(min-width: 768px) 58vw, 100vw",
    };
  });

  const facts = [
    { label: "Client", value: project.client },
    { label: "Industry", value: project.industry },
    { label: "Services", value: project.categories.join(", ") },
    { label: "Year", value: String(project.year) },
  ].filter((fact) => fact.value);

  return (
    <>
      <PageHero
        index="Case study"
        label={project.categories[0]}
        lines={[project.title]}
        intro={project.shortDescription}
      >
        {project.isSample && (
          <SampleTag className="settle mt-8 bg-surface-2 md:ml-[25%]">
            Sample case study: a fictional brief, not client work
          </SampleTag>
        )}
      </PageHero>

      {project.video ? (
        <VideoPlayer
          src={project.video}
          poster={project.cover}
          priority
          alt={`${project.title} film`}
          sizes="100vw"
          loop
          className="aspect-[4/5] sm:aspect-video"
        />
      ) : (
        <div className="relative aspect-[4/5] overflow-hidden bg-surface sm:aspect-video">
          <Image
            src={project.cover}
            alt={project.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <section className="gutter py-16 lg:py-28">
        <Reveal>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-b border-line pb-10 md:grid-cols-4 lg:pb-14">
            {facts.map((fact) => (
              <div key={fact.label} data-reveal>
                <dt className="slate text-muted">{fact.label}</dt>
                <dd className="mt-2 text-lg leading-snug">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal className="mt-14 grid gap-6 md:grid-cols-12 lg:mt-24">
          <div data-reveal className="md:col-span-3">
            <SectionSlate as="h2" index="01" label="Overview" />
          </div>
          <p
            data-reveal
            className="font-display text-[clamp(1.625rem,3.4vw,3.25rem)] leading-[1.1] font-medium tracking-[-0.03em] md:col-span-9"
          >
            {project.overview}
          </p>
        </Reveal>

        <Reveal className="mt-16 grid gap-6 md:grid-cols-12 lg:mt-28">
          <div data-reveal className="md:col-span-3">
            <SectionSlate as="h2" index="02" label="Objectives" />
          </div>
          <ol className="md:col-span-9">
            {project.objectives.map((objective, i) => (
              <li
                key={objective}
                data-reveal
                className="grid grid-cols-[2.5rem_1fr] border-t border-line py-5 last:border-b lg:grid-cols-[4rem_1fr]"
              >
                <span className="accent-serif text-2xl text-accent">{i + 1}</span>
                <span className="text-lg leading-snug lg:text-2xl lg:leading-snug">
                  {objective}
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="mt-16 grid gap-6 md:grid-cols-12 lg:mt-28">
          <div data-reveal className="md:col-span-3">
            <SectionSlate as="h2" index="03" label="Creative strategy" />
          </div>
          <p
            data-reveal
            className="accent-serif text-[clamp(1.75rem,3.6vw,3.5rem)] leading-[1.1] md:col-span-9"
          >
            {project.strategy}
          </p>
        </Reveal>
      </section>

      <section
        aria-label="Gallery"
        className="gutter grid items-start gap-6 md:grid-cols-12 lg:gap-8"
      >
        {project.gallery.map((item, i) => (
          <div key={item.src} className={layout[i].cell}>
            <GalleryItem item={item} className={layout[i].media} sizes={layout[i].sizes} />
          </div>
        ))}
      </section>

      <section className="gutter py-16 lg:py-28">
        <Reveal className="grid gap-6 md:grid-cols-12">
          <div data-reveal className="md:col-span-3">
            <SectionSlate as="h2" index="04" label="Creative process" />
          </div>
          <ol className="grid gap-8 md:col-span-9 md:grid-cols-3 md:gap-6">
            {project.process.map((step, i) => (
              <li key={step.title} data-reveal className="border-t border-line pt-4">
                <span className="slate text-accent">Stage {i + 1}</span>
                <h3 className="mt-3 font-display text-2xl tracking-tight">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-fg/80">{step.copy}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="mt-16 grid gap-6 md:grid-cols-12 lg:mt-24">
          <div data-reveal className="md:col-span-3">
            <SectionSlate as="h2" index="05" label="Final deliverables" />
          </div>
          <ul className="md:col-span-9">
            {project.deliverables.map((deliverable) => (
              <li
                key={deliverable}
                data-reveal
                className="border-t border-line py-4 font-display text-2xl tracking-tight last:border-b lg:text-4xl"
              >
                {deliverable}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="gutter border-t border-line py-16 lg:py-24">
        <SectionSlate as="h2" index="06" label="Related projects" />
        <div className="mt-8 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:gap-x-8">
          {related.map((item) => (
            <ProjectCard key={item.slug} project={toProjectCard(item)} />
          ))}
        </div>
      </section>

      <Link href={`/work/${next.slug}`} className="group relative block overflow-hidden bg-surface">
        <Image
          src={next.cover}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-45 transition-all duration-[1200ms] ease-studio group-hover:scale-[1.03] group-hover:opacity-70"
        />
        <div className="gutter relative flex items-end justify-between gap-4 pt-28 pb-8 lg:pt-52">
          <div>
            <p className="slate text-fg">Next project</p>
            <p className="display mt-3 text-section">{next.title}</p>
          </div>
          <ArrowUpRight
            aria-hidden
            strokeWidth={1.25}
            className="size-12 shrink-0 transition-transform duration-700 ease-studio group-hover:translate-x-1 group-hover:-translate-y-1 lg:size-24"
          />
        </div>
      </Link>

      <FinalCta />
    </>
  );
}
