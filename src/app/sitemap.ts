import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPublishedProjects, getPublishedServices } from "@/lib/data/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, services] = await Promise.all([getPublishedProjects(), getPublishedServices()]);
  const url = (path: string) => `${siteConfig.url}${path}`;

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/work"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/services"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/contact"), changeFrequency: "monthly", priority: 0.8 },
    ...services.map((service) => ({
      url: url(`/services/${service.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // Sample case studies stay out of search results until they are replaced by real work
    ...projects
      .filter((project) => !project.isSample)
      .map((project) => ({
        url: url(`/work/${project.slug}`),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    { url: url("/privacy-policy"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
