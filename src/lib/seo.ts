import type { Metadata } from "next";

type PageSeo = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
};

/** Title, description, canonical URL and Open Graph for one page. */
export function pageMetadata({ title, description, path, image, noindex }: PageSeo): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      url: path,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}
