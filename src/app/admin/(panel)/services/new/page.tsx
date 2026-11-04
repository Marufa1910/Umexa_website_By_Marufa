import type { Metadata } from "next";
import { Suspense } from "react";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { LoadingState, PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { listCategories, listPickerAssets } from "@/lib/data/admin-content";

export const metadata: Metadata = { title: "New service" };

async function NewService() {
  await requirePermission("content.manage");
  const [categories, assets] = await Promise.all([listCategories(), listPickerAssets()]);

  return (
    <ServiceForm
      assets={assets}
      categories={categories.map((item) => ({ value: item.id, label: item.name }))}
      values={{
        id: null,
        title: "",
        slug: "",
        summary: "",
        intro: "",
        previewUrl: "",
        capabilities: [],
        deliverables: [],
        workflow: [],
        faq: [],
        categories: [],
        status: "DRAFT",
        seoTitle: "",
        seoDescription: "",
      }}
    />
  );
}

export default function NewServicePage() {
  return (
    <>
      <PageHeader title="New service" description="New services stay hidden until published." />
      <Suspense fallback={<LoadingState />}>
        <NewService />
      </Suspense>
    </>
  );
}
