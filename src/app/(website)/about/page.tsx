import Image from "next/image";
import { ParallaxImage } from "@/components/animations/ParallaxImage";
import { Reveal } from "@/components/animations/Reveal";
import { Process } from "@/components/home/Process";
import { FinalCta } from "@/components/layout/FinalCta";
import { PageHero } from "@/components/ui/PageHero";
import { SampleTag } from "@/components/ui/SampleTag";
import { SectionSlate } from "@/components/ui/SectionSlate";
import { collaboration, missionVision, principles, story } from "@/content/about";
import { getTeam } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "UMEXA is one creative studio for design, film, motion, 3D, marketing and code. Our story, how we think and how we work with clients.",
  path: "/about",
});

export default async function AboutPage() {
  const team = await getTeam();

  return (
    <>
      <PageHero
        index="About"
        label="The studio"
        lines={[
          "Built to keep",
          <span key="serif" className="accent-serif text-[1.08em] text-accent">
            ideas sharp.
          </span>,
        ]}
      />

      <ParallaxImage
        priority
        src="/media/samples/bone-study.webp"
        alt=""
        sizes="100vw"
        className="aspect-[4/3] md:aspect-[21/9]"
      />

      <section className="gutter py-16 lg:py-28">
        <Reveal className="grid gap-6 md:grid-cols-12">
          <div data-reveal className="md:col-span-3">
            <SectionSlate as="h2" index="01" label="Our story" />
          </div>
          <div className="space-y-6 md:col-span-9">
            {story.map((paragraph) => (
              <p
                key={paragraph}
                data-reveal
                className="font-display text-[clamp(1.5rem,3vw,3rem)] leading-[1.12] font-medium tracking-[-0.03em]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-16 grid gap-px border-y border-line md:grid-cols-2 lg:mt-28">
          {missionVision.map((item, i) => (
            <div
              key={item.label}
              data-reveal
              className={`py-8 md:px-8 lg:py-12 ${i === 0 ? "md:border-r md:border-line md:pl-0" : "border-t border-line md:border-t-0"}`}
            >
              <h2 className="slate text-accent">{item.label}</h2>
              <p className="accent-serif mt-4 text-[clamp(1.75rem,3.2vw,3rem)] leading-[1.1]">
                {item.copy}
              </p>
            </div>
          ))}
        </Reveal>

        <Reveal className="mt-16 grid gap-6 md:grid-cols-12 lg:mt-28">
          <div data-reveal className="md:col-span-3">
            <SectionSlate as="h2" index="02" label="Creative philosophy" />
          </div>
          <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 md:col-span-9">
            {principles.map((principle) => (
              <li key={principle.title} data-reveal className="border-t border-line pt-4">
                <h3 className="font-display text-2xl tracking-tight lg:text-3xl">
                  {principle.title}
                </h3>
                <p className="mt-2 max-w-md leading-relaxed text-fg/80">{principle.copy}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="gutter bg-surface py-16 lg:py-28">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div data-reveal>
              <SectionSlate as="h2" index="03" label="The team" />
            </div>
            {team.some((member) => member.isSample) && (
              <div data-reveal>
                <SampleTag className="bg-surface-2">
                  Placeholder profiles, not real people
                </SampleTag>
              </div>
            )}
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-12 lg:grid-cols-4 lg:gap-x-6">
            {team.map((member) => (
              <li key={member.role} data-reveal>
                <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
                  {member.image && (
                    <Image
                      src={member.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <p className="mt-3 font-display text-lg tracking-tight lg:text-xl">{member.name}</p>
                <p className="mt-1 text-sm text-muted">{member.role}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <Process index="04" />

      <section className="gutter border-t border-line py-16 lg:py-28">
        <Reveal className="grid gap-6 md:grid-cols-12">
          <div data-reveal className="md:col-span-3">
            <SectionSlate as="h2" index="05" label="Working together" />
          </div>
          <ul className="md:col-span-9">
            {collaboration.map((item) => (
              <li
                key={item.title}
                data-reveal
                className="grid gap-2 border-t border-line py-6 last:border-b md:grid-cols-2 md:items-baseline"
              >
                <h3 className="font-display text-2xl tracking-tight lg:text-4xl">{item.title}</h3>
                <p className="leading-relaxed text-fg/80 lg:text-lg">{item.copy}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <FinalCta />
    </>
  );
}
