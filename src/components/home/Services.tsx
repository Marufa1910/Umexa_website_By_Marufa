import { Reveal } from "@/components/animations/Reveal";
import { SectionSlate } from "@/components/ui/SectionSlate";
import { ServicesList } from "@/components/services/ServicesList";
import { getPublishedServices } from "@/lib/data/public";

export async function Services() {
  const services = await getPublishedServices();

  return (
    <section className="gutter bg-surface py-24 lg:py-36">
      <Reveal>
        <div className="mb-12 grid gap-5 md:grid-cols-12 lg:mb-20">
          <div data-reveal className="md:col-span-4">
            <SectionSlate index="02" label="What we do" />
          </div>
          <h2 data-reveal className="display text-section md:col-span-8">
            One studio, from first frame to final build.
          </h2>
        </div>
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
  );
}
