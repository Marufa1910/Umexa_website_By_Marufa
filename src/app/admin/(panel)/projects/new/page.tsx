import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { LoadingState, PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { listCategories, listClientOptions, listPickerAssets } from "@/lib/data/admin-content";

export const metadata: Metadata = { title: "New project" };

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

async function NewProject() {
  await requirePermission("content.manage");
  const [categories, clients, assets, year] = await Promise.all([
    listCategories(),
    listClientOptions(),
    listPickerAssets(),
    currentYear(),
  ]);

  return (
    <ProjectForm
      assets={assets}
      categories={categories.map((item) => ({ value: item.id, label: item.name }))}
      clients={clients.map((item) => ({
        value: item.id,
        label: item.industry ? `${item.name} (${item.industry})` : item.name,
      }))}
      values={{
        id: null,
        title: "",
        slug: "",
        shortDescription: "",
        fullDescription: "",
        clientId: "",
        categories: [],
        year,
        coverUrl: "",
        coverAlt: "",
        videoUrl: "",
        objectives: [],
        creativeStrategy: "",
        process: [],
        deliverables: [],
        gallery: [],
        featured: false,
        isSample: false,
        status: "DRAFT",
        seoTitle: "",
        seoDescription: "",
      }}
    />
  );
}

export default function NewProjectPage() {
  return (
    <>
      <PageHeader title="New project" description="New projects stay hidden until published." />
      <Suspense fallback={<LoadingState />}>
        <NewProject />
      </Suspense>
    </>
  );
}
