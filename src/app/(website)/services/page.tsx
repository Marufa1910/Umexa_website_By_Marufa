import { Reveal } from "@/components/animations/Reveal";
import { FinalCta } from "@/components/layout/FinalCta";
import { ServicesList } from "@/components/services/ServicesList";
import { PageHero } from "@/components/ui/PageHero";
import { SectionSlate } from "@/components/ui/SectionSlate";
import { engagements } from "@/content/home";
import { getPublishedServices } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Graphic design, video editing, motion graphics, 3D, branding, digital marketing, web and software, available by project, on retainer or white-label.",
  path: "/services",
});

export default async function ServicesPage() {
  const services = await getPublishedServices();

  return (
    <>
      <PageHero
        index="Services"
        label="What we do"
        lines={[
          "Every craft,",
          <span key="serif" className="accent-serif text-[1.08em] text-lime">
            one studio.
          </span>,
        ]}
        intro="Bring us one job, or the whole brand. Every discipline works side by side, so an idea keeps its edge from the first sketch to the final file."
      />

      <section className="gutter pb-20 lg:pb-32">
        <Reveal>
          <ServicesList
            services={services.map(({ slug, title, summary, preview }) => ({
              slug,
              title,
              summary,
              preview,
            }))}
          />
        </Reveal>
      </section>

      <section className="gutter bg-surface py-20 lg:py-32">
        <Reveal className="grid gap-6 md:grid-cols-12">
          <div data-reveal className="md:col-span-3">
            <SectionSlate index="Ways to work" label="Engagements" />
          </div>
          <ul className="md:col-span-9">
            {engagements.map((item) => (
              <li
                key={item.title}
                data-reveal
                className="grid gap-2 border-t border-line py-6 last:border-b md:grid-cols-2 md:items-baseline lg:py-8"
              >
                <h2 className="display text-4xl lg:text-6xl">{item.title}</h2>
                <p className="text-paper/80 lg:text-lg">{item.copy}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <FinalCta />
    </>
  );
}
