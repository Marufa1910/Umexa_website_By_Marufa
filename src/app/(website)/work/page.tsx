import { Suspense } from "react";
import { WorkExplorer, WorkExplorerFromUrl } from "@/components/portfolio/WorkExplorer";
import { FinalCta } from "@/components/layout/FinalCta";
import { PageHero } from "@/components/ui/PageHero";
import { SampleTag } from "@/components/ui/SampleTag";
import { getCategoryNames, getPublishedProjects } from "@/lib/data/public";
import { toProjectCard } from "@/lib/data/cards";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Work",
  description:
    "Selected design, video, motion, 3D, branding, campaign and web projects from UMEXA.",
  path: "/work",
});

export default async function WorkPage() {
  const [projects, categories] = await Promise.all([getPublishedProjects(), getCategoryNames()]);
  const cards = projects.map(toProjectCard);

  return (
    <>
      <PageHero
        index="Index"
        label="Selected work"
        lines={[
          "The work,",
          <span key="serif" className="accent-serif text-[1.08em] text-accent">
            frame by frame.
          </span>,
        ]}
        intro="Identity, film, motion, 3D and code. Filter by craft, or search for what you have in mind."
      >
        {projects.some((project) => project.isSample) && (
          <SampleTag className="settle mt-8 bg-surface-2 md:ml-[25%] md:pl-2">
            Projects marked Sample are fictional, not client work
          </SampleTag>
        )}
      </PageHero>

      {/* The unfiltered grid is the static HTML; the URL's filter is applied once in the browser */}
      <Suspense fallback={<WorkExplorer projects={cards} categories={categories} />}>
        <WorkExplorerFromUrl projects={cards} categories={categories} />
      </Suspense>

      <FinalCta />
    </>
  );
}
