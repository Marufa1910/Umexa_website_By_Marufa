import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { LoadingState, PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { getSettingsForEdit, listPickerAssets } from "@/lib/data/admin-content";

export const metadata: Metadata = { title: "Settings" };

async function Settings() {
  await requirePermission("settings.manage");
  const [settings, assets] = await Promise.all([getSettingsForEdit(), listPickerAssets()]);

  return (
    <SettingsForm
      assets={assets}
      values={{
        agencyName: settings?.agencyName ?? "UMEXA",
        logoUrl: settings?.logoUrl ?? "",
        contactEmail: settings?.contactEmail ?? "",
        phone: settings?.phone ?? "",
        whatsapp: settings?.whatsapp ?? "",
        location: settings?.location ?? "",
        socials: (settings?.socials ?? []) as { label: string; href: string }[],
        seoTitle: settings?.seoTitle ?? "",
        seoDescription: settings?.seoDescription ?? "",
        showreelUrl: settings?.showreelUrl ?? "",
        showreelPoster: settings?.showreelPoster ?? "",
        showreelSample: settings?.showreelSample ?? false,
      }}
    />
  );
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Site-wide details shown on the public website." />
      <Suspense fallback={<LoadingState label="Loading settings" />}>
        <Settings />
      </Suspense>
    </>
  );
}
