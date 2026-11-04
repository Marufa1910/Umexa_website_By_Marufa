import type { Metadata } from "next";

type PageSeo = { title: string; description: string; path: string; image?: string };

/** Title, description, canonical URL and Open Graph for one page. */
export function pageMetadata({ title, description, path, image }: PageSeo): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}
