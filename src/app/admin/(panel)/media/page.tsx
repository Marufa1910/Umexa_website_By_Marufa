import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { MediaCardActions, UploadButton } from "@/components/admin/MediaLibrary";
import { EmptyState, LoadingState, Notice, PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { listMedia } from "@/lib/data/admin-content";

export const metadata: Metadata = { title: "Media" };

type Search = { kind?: string };

const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function UploadControl() {
  await requirePermission("content.manage");
  return isCloudinaryConfigured() ? <UploadButton /> : null;
}

async function Library({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("content.manage");
  const { kind } = await searchParams;
  const filter = kind === "IMAGE" || kind === "VIDEO" ? kind : undefined;
  const assets = await listMedia(filter);

  const tabs = [
    { label: "All", href: "/admin/media", active: !filter },
    { label: "Images", href: "/admin/media?kind=IMAGE", active: filter === "IMAGE" },
    { label: "Videos", href: "/admin/media?kind=VIDEO", active: filter === "VIDEO" },
  ];

  return (
    <>
      {!isCloudinaryConfigured() && (
        <Notice>
          Uploads aren&rsquo;t set up yet. Add <code>CLOUDINARY_CLOUD_NAME</code>,{" "}
          <code>CLOUDINARY_API_KEY</code> and <code>CLOUDINARY_API_SECRET</code> to the server
          environment, then restart. Until then, content can use files under <code>/media/</code>.
        </Notice>
      )}

      <nav aria-label="Filter media" className="mb-4 flex gap-1">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.active ? "page" : undefined}
            className={`flex min-h-10 items-center border px-3 text-sm ${
              tab.active ? "border-lime bg-lime text-ink" : "border-line hover:border-paper"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {assets.length === 0 ? (
        <EmptyState title="No files yet">Uploaded images and videos will appear here.</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => {
            const name = asset.publicId.split("/").pop() ?? asset.publicId;
            return (
              <li key={asset.id} className="border border-line">
                <div className="relative aspect-video bg-surface">
                  {asset.kind === "IMAGE" ? (
                    <Image
                      src={asset.url}
                      alt={asset.alt}
                      fill
                      sizes="(min-width: 1280px) 20vw, (min-width: 640px) 40vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <video
                      src={asset.url}
                      controls
                      preload="none"
                      aria-label={asset.alt || name}
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <div className="space-y-2 p-3 text-xs">
                  <p className="truncate text-sm">{name}</p>
                  <p className="text-muted">
                    {asset.format.toUpperCase()}, {formatBytes(asset.bytes)}
                    {asset.width && asset.height ? `, ${asset.width} x ${asset.height}` : ""}
                  </p>
                  <p className={asset.alt ? "text-muted" : "text-red-300"}>
                    {asset.alt || "No description yet"}
                  </p>
                  <MediaCardActions id={asset.id} name={name} alt={asset.alt} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function MediaPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <>
      <PageHeader
        title="Media"
        description="Images up to 10 MB and videos up to 100 MB, stored on Cloudinary."
      >
        <Suspense>
          <UploadControl />
        </Suspense>
      </PageHeader>
      <Suspense fallback={<LoadingState label="Loading media" />}>
        <Library searchParams={searchParams} />
      </Suspense>
    </>
  );
}
