import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { LoadingState, PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import {
  getProjectForEdit,
  listCategories,
  listClientOptions,
  listPickerAssets,
} from "@/lib/data/admin-content";

export const metadata: Metadata = { title: "Edit project" };

type Params = Promise<{ id: string }>;

async function EditProject({ params }: { params: Params }) {
  await requirePermission("content.manage");
  const { id } = await params;
  const [project, categories, clients, assets] = await Promise.all([
    getProjectForEdit(id),
    listCategories(),
    listClientOptions(),
    listPickerAssets(),
  ]);
  if (!project) notFound();

  return (
    <>
      <PageHeader title={project.title} description={`/work/${project.slug}`} />
      <ProjectForm
        assets={assets}
        categories={categories.map((item) => ({ value: item.id, label: item.name }))}
        clients={clients.map((item) => ({
          value: item.id,
          label: item.industry ? `${item.name} (${item.industry})` : item.name,
        }))}
        values={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          shortDescription: project.shortDescription,
          fullDescription: project.fullDescription,
          clientId: project.clientId ?? "",
          categories: project.categories.map((item) => item.categoryId),
          year: project.year,
          coverUrl: project.coverUrl,
          coverAlt: project.coverAlt,
          videoUrl: project.videoUrl ?? "",
          objectives: project.objectives,
          creativeStrategy: project.creativeStrategy,
          process: project.process as { title: string; copy: string }[],
          deliverables: project.deliverables,
          gallery: project.media.map((item) => ({
            kind: item.kind,
            url: item.url,
            posterUrl: item.posterUrl ?? "",
            alt: item.alt,
            width: item.width,
            height: item.height,
          })),
          featured: project.featured,
          isSample: project.isSample,
          status: project.status,
          seoTitle: project.seoTitle ?? "",
          seoDescription: project.seoDescription ?? "",
        }}
      />
    </>
  );
}

export default function EditProjectPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<LoadingState label="Loading the project" />}>
      <EditProject params={params} />
    </Suspense>
  );
}
