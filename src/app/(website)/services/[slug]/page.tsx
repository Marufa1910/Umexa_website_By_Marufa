import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ParallaxImage } from "@/components/animations/ParallaxImage";
import { Reveal } from "@/components/animations/Reveal";
import { FinalCta } from "@/components/layout/FinalCta";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { SectionSlate } from "@/components/ui/SectionSlate";
import { toProjectCard } from "@/lib/data/cards";
import { getProjectsInCategories, getPublishedServices, getService } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

/* The first visit after publishing or editing waits for the full page, rather than sending a
   shell that only fills in with JavaScript, so crawlers always get real content and real 404s. */
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const services = await getPublishedServices();
  // Cache Components needs at least one param, even on a brand-new empty database
  if (services.length === 0) return [{ slug: "__placeholder__" }];
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService((await params).slug);
  if (!service) return {};
  return pageMetadata({
    title: service.seoTitle,
    description: service.seoDescription,
    path: `/services/${service.slug}`,
    image: service.preview,
  });
}

export default async function ServicePage({ params }: Props) {
  const service = await getService((await params).slug);
  if (!service) notFound();

  const work = await getProjectsInCategories(service.categories, 2);
  const contactHref = `/contact?service=${service.slug}`;

  return (
    <>
      <PageHero
        index="Service"
        label={service.summary}
        lines={[service.title]}
        intro={service.intro}
      >
        <div className="settle mt-8 md:ml-[25%]">
          <Button href={contactHref} className="w-full sm:w-auto sm:min-w-60">
            Talk about {service.title.toLowerCase()}
          </Button>
        </div>
      </PageHero>

      <ParallaxImage
        priority
        src={service.preview}
        alt=""
        sizes="100vw"
        className="aspect-[4/3] md:aspect-[21/9]"
      />

      <section className="gutter py-16 lg:py-28">
        <Reveal className="grid gap-6 md:grid-cols-12">
          <div data-reveal className="md:col-span-3">
            <SectionSlate as="h2" index="01" label="Capabilities" />
          </div>
          <ul className="md:col-span-9">
            {service.capabilities.map((capability) => (
              <li
                key={capability}
                data-reveal
                className="border-t border-line py-4 font-display text-2xl tracking-tight last:border-b lg:text-4xl"
              >
                {capability}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-16 grid gap-6 md:grid-cols-12 lg:mt-28">
          <div data-reveal className="md:col-span-3">
            <SectionSlate as="h2" index="02" label="What you receive" />
          </div>
          <ul className="grid gap-x-6 sm:grid-cols-2 md:col-span-9">
            {service.deliverables.map((deliverable) => (
              <li
                key={deliverable}
                data-reveal
                className="border-t border-line py-4 text-lg leading-snug"
              >
                {deliverable}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="gutter bg-surface py-16 lg:py-28">
        <Reveal className="grid gap-6 md:grid-cols-12">
          <div data-reveal className="md:col-span-3">
            <SectionSlate as="h2" index="03" label="How it runs" />
          </div>
          <ol className="grid gap-8 sm:grid-cols-2 md:col-span-9 lg:grid-cols-4 lg:gap-6">
            {service.workflow.map((step, i) => (
              <li key={step.title} data-reveal className="border-t border-line pt-4">
                <span className="accent-serif text-3xl text-accent">{i + 1}</span>
                <h3 className="mt-2 font-display text-2xl tracking-tight">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-fg/80">{step.copy}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {work.length > 0 && (
        <section className="gutter py-16 lg:py-28">
          <SectionSlate as="h2" index="04" label="Relevant work" />
          <div className="mt-8 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:gap-x-8">
            {work.map((project) => (
              <ProjectCard key={project.slug} project={toProjectCard(project)} />
            ))}
          </div>
        </section>
      )}

      <section className="gutter border-t border-line py-16 lg:py-28">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-3">
            <SectionSlate as="h2" index="05" label="Questions" />
          </div>
          <div className="md:col-span-9">
            {service.faq.map((item) => (
              <details key={item.question} className="group border-t border-line last:border-b">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-xl tracking-tight lg:text-3xl [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <Plus
                    aria-hidden
                    className="size-5 shrink-0 text-accent transition-transform duration-300 group-open:rotate-45"
                  />
                </summary>
                <p className="max-w-2xl pb-6 leading-relaxed text-fg/80 lg:text-lg">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <FinalCta href={contactHref} />
    </>
  );
}
