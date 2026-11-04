import { PageHero } from "@/components/ui/PageHero";
import { SampleTag } from "@/components/ui/SampleTag";

export type LegalSection = { heading: string; body: string[] };

/** Shared layout for legal text. Stays marked as a draft until a lawyer has reviewed it. */
export function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <>
      <PageHero index="Legal" label={title} lines={[title]}>
        <SampleTag className="settle mt-8 bg-surface-2">
          Draft for review: not yet checked by a lawyer
        </SampleTag>
      </PageHero>
      <div className="gutter grid pb-20 md:grid-cols-12 lg:pb-32">
        <div className="md:col-span-8 md:col-start-4">
          {sections.map((section) => (
            <section key={section.heading} className="border-t border-line py-8">
              <h2 className="font-display text-2xl tracking-tight">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 max-w-2xl leading-relaxed text-paper/80">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
