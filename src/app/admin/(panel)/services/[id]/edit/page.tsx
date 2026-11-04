import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { LoadingState, PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { getServiceForEdit, listCategories, listPickerAssets } from "@/lib/data/admin-content";

export const metadata: Metadata = { title: "Edit service" };

type Params = Promise<{ id: string }>;

async function EditService({ params }: { params: Params }) {
  await requirePermission("content.manage");
  const { id } = await params;
  const [service, categories, assets] = await Promise.all([
    getServiceForEdit(id),
    listCategories(),
    listPickerAssets(),
  ]);
  if (!service) notFound();

  return (
    <>
      <PageHeader title={service.title} description={`/services/${service.slug}`} />
      <ServiceForm
        assets={assets}
        categories={categories.map((item) => ({ value: item.id, label: item.name }))}
        values={{
          id: service.id,
          title: service.title,
          slug: service.slug,
          summary: service.summary,
          intro: service.intro,
          previewUrl: service.previewUrl,
          capabilities: service.capabilities,
          deliverables: service.deliverables,
          workflow: service.workflow as { title: string; copy: string }[],
          faq: service.faq as { question: string; answer: string }[],
          categories: service.categories.map((item) => item.categoryId),
          status: service.status,
          seoTitle: service.seoTitle ?? "",
          seoDescription: service.seoDescription ?? "",
        }}
      />
    </>
  );
}

export default function EditServicePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<LoadingState label="Loading the service" />}>
      <EditService params={params} />
    </Suspense>
  );
}
