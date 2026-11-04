import type { Project } from "@/types/content";

/** Only what a project card shows, so full case studies aren't sent to the browser. */
export function toProjectCard(project: Project) {
  const { slug, title, client, categories, year, featured, isSample, cover, alt, video } = project;
  return { slug, title, client, categories, year, featured, isSample, cover, alt, video };
}
