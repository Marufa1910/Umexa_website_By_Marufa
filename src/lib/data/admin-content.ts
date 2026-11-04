import "server-only";
import type { MediaKind, Prisma, PublicationStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { PickerAsset } from "@/types/admin";

/** Admin lists and forms. Drafts are included here, unlike the public data layer. */

const notDeleted = { deletedAt: null };

export function listProjects(filter: {
  search?: string;
  status?: PublicationStatus;
  categoryId?: string;
}) {
  const where: Prisma.ProjectWhereInput = { ...notDeleted };
  if (filter.status) where.status = filter.status;
  if (filter.categoryId) where.categories = { some: { categoryId: filter.categoryId } };
  if (filter.search) where.title = { contains: filter.search, mode: "insensitive" };
  return prisma.project.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      year: true,
      status: true,
      featured: true,
      isSample: true,
      client: { select: { name: true } },
      categories: {
        orderBy: { sortOrder: "asc" },
        select: { category: { select: { name: true } } },
      },
    },
  });
}

export function getProjectForEdit(id: string) {
  return prisma.project.findFirst({
    where: { id, ...notDeleted },
    include: {
      categories: { orderBy: { sortOrder: "asc" }, select: { categoryId: true } },
      media: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export function listServicesForAdmin() {
  return prisma.service.findMany({
    where: notDeleted,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, title: true, slug: true, status: true, summary: true },
  });
}

export function getServiceForEdit(id: string) {
  return prisma.service.findFirst({
    where: { id, ...notDeleted },
    include: { categories: { select: { categoryId: true } } },
  });
}

export function listCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { projects: true, services: true } } },
  });
}

export function listClientsForAdmin() {
  return prisma.client.findMany({
    where: notDeleted,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { projects: { where: notDeleted } } } },
  });
}

export function listClientOptions() {
  return prisma.client.findMany({
    where: notDeleted,
    orderBy: { name: "asc" },
    select: { id: true, name: true, industry: true },
  });
}

export function listTestimonialsForAdmin() {
  return prisma.testimonial.findMany({
    where: notDeleted,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export function listTeamForAdmin() {
  return prisma.teamMember.findMany({
    where: notDeleted,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export function getSettingsForEdit() {
  return prisma.siteSetting.findUnique({ where: { id: "default" } });
}

export function listMedia(kind?: MediaKind) {
  return prisma.mediaAsset.findMany({
    where: kind ? { kind } : {},
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true } } },
  });
}

export function listPickerAssets(): Promise<PickerAsset[]> {
  return prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, kind: true, alt: true, width: true, height: true },
  });
}
