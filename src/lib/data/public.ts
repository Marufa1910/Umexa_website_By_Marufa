import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/db";
import type {
  ClientLogo,
  Project,
  Service,
  SiteSettings,
  Step,
  TeamProfile,
  TestimonialItem,
} from "@/types/content";

/**
 * Everything the public website reads. Only published, non-deleted records leave this file,
 * and only the fields the site shows. Admin writes refresh a tag with updateTag (Phase 5).
 */

const live = { status: "PUBLISHED", deletedAt: null } as const;

export async function getPublishedProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");

  const rows = await prisma.project.findMany({
    where: live,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      client: { select: { name: true, industry: true } },
      categories: {
        orderBy: { sortOrder: "asc" },
        select: { category: { select: { name: true } } },
      },
      media: { orderBy: { sortOrder: "asc" } },
    },
  });

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    shortDescription: row.shortDescription,
    client: row.client?.name ?? "",
    industry: row.client?.industry ?? "",
    categories: row.categories.map((item) => item.category.name),
    year: row.year,
    featured: row.featured,
    isSample: row.isSample,
    cover: row.coverUrl,
    alt: row.coverAlt,
    video: row.videoUrl,
    overview: row.fullDescription,
    objectives: row.objectives,
    strategy: row.creativeStrategy,
    process: row.process as Step[],
    deliverables: row.deliverables,
    gallery: row.media.map((item) => ({
      kind: item.kind === "VIDEO" ? "video" : "image",
      src: item.url,
      poster: item.posterUrl ?? undefined,
      alt: item.alt,
      width: item.width,
      height: item.height,
    })),
    seoTitle: row.seoTitle ?? row.title,
    seoDescription: row.seoDescription ?? row.shortDescription,
  }));
}

export async function getProject(slug: string) {
  return (await getPublishedProjects()).find((project) => project.slug === slug);
}

export async function getProjectsInCategories(wanted: string[], limit = 3) {
  return (await getPublishedProjects())
    .filter((project) => project.categories.some((category) => wanted.includes(category)))
    .slice(0, limit);
}

/** Projects sharing a category come first, then the rest, so there are always enough. */
export async function getRelatedProjects(current: Project, limit = 2) {
  const others = (await getPublishedProjects()).filter((p) => p.slug !== current.slug);
  const shared = others.filter((p) => p.categories.some((c) => current.categories.includes(c)));
  const rest = others.filter((p) => !shared.includes(p));
  return [...shared, ...rest].slice(0, limit);
}

export async function getNextProject(current: Project) {
  const projects = await getPublishedProjects();
  const index = projects.findIndex((project) => project.slug === current.slug);
  return projects[(index + 1) % projects.length];
}

export async function getCategoryNames(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");

  const rows = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { name: true },
  });
  return rows.map((row) => row.name);
}

export async function getPublishedServices(): Promise<Service[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("services");

  const rows = await prisma.service.findMany({
    where: live,
    orderBy: { sortOrder: "asc" },
    include: { categories: { select: { category: { select: { name: true } } } } },
  });

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    preview: row.previewUrl,
    intro: row.intro,
    capabilities: row.capabilities,
    deliverables: row.deliverables,
    workflow: row.workflow as Step[],
    categories: row.categories.map((item) => item.category.name),
    faq: row.faq as Service["faq"],
    seoTitle: row.seoTitle ?? row.title,
    seoDescription: row.seoDescription ?? row.summary,
  }));
}

export async function getService(slug: string) {
  return (await getPublishedServices()).find((service) => service.slug === slug);
}

export async function getFeaturedClients(): Promise<ClientLogo[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("clients");

  return prisma.client.findMany({
    where: { featured: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: { name: true, logoUrl: true, isSample: true },
  });
}

export async function getTestimonials(): Promise<TestimonialItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("testimonials");

  const rows = await prisma.testimonial.findMany({
    where: live,
    orderBy: { sortOrder: "asc" },
    select: {
      quote: true,
      clientName: true,
      designation: true,
      company: true,
      photoUrl: true,
      isSample: true,
    },
  });
  return rows.map((row) => ({
    quote: row.quote,
    name: row.clientName,
    role: `${row.designation}, ${row.company}`,
    photo: row.photoUrl,
    isSample: row.isSample,
  }));
}

export async function getTeam(): Promise<TeamProfile[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("team");

  const rows = await prisma.teamMember.findMany({
    where: live,
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, jobTitle: true, photoUrl: true, isSample: true },
  });
  return rows.map((row) => ({
    name: row.name,
    role: row.jobTitle,
    image: row.photoUrl,
    isSample: row.isSample,
  }));
}

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");

  const row = await prisma.siteSetting.findUnique({ where: { id: "default" } });
  return {
    agencyName: row?.agencyName ?? "UMEXA",
    logoUrl: row?.logoUrl ?? null,
    seoTitle: row?.seoTitle ?? null,
    seoDescription: row?.seoDescription ?? null,
    email: row?.contactEmail ?? null,
    phone: row?.phone ?? null,
    whatsapp: row?.whatsapp ?? null,
    location: row?.location ?? null,
    socials: (row?.socials ?? []) as SiteSettings["socials"],
    showreelUrl: row?.showreelUrl ?? null,
    showreelPoster: row?.showreelPoster ?? null,
    showreelSample: row?.showreelSample ?? false,
  };
}
