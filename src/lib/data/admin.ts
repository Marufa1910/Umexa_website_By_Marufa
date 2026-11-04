import "server-only";
import type { InquiryStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

/** Live database values for the dashboard. Never cached: admins must see the current state. */
export async function getDashboardStats() {
  const projects = { deletedAt: null };
  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    totalInquiries,
    newInquiries,
    activeServices,
  ] = await Promise.all([
    prisma.project.count({ where: projects }),
    prisma.project.count({ where: { ...projects, status: "PUBLISHED" } }),
    prisma.project.count({ where: { ...projects, status: "DRAFT" } }),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.service.count({ where: { status: "PUBLISHED", deletedAt: null } }),
  ]);
  return {
    totalProjects,
    publishedProjects,
    draftProjects,
    totalInquiries,
    newInquiries,
    activeServices,
  };
}

export function getRecentActivity(limit = 10) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      entity: true,
      createdAt: true,
      actor: { select: { name: true } },
    },
  });
}

export function listInquiries(
  filter: { status?: InquiryStatus; search?: string; excludeArchived?: boolean },
  take = 50,
) {
  const where: Prisma.InquiryWhereInput = {};
  if (filter.status) where.status = filter.status;
  else if (filter.excludeArchived) where.status = { not: "ARCHIVED" };
  if (filter.search) {
    where.OR = (["fullName", "email", "company", "description"] as const).map((field) => ({
      [field]: { contains: filter.search, mode: "insensitive" },
    }));
  }
  return prisma.inquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    include: { service: { select: { title: true } } },
  });
}

export function getInquiry(id: string) {
  return prisma.inquiry.findUnique({
    where: { id },
    include: {
      service: { select: { title: true } },
      notes: {
        orderBy: { createdAt: "desc" },
        select: { id: true, body: true, createdAt: true, author: { select: { name: true } } },
      },
      statusChanges: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fromStatus: true,
          toStatus: true,
          createdAt: true,
          changedBy: { select: { name: true } },
        },
      },
    },
  });
}

/** Staff list. The select is explicit, so password data can never come back from here. */
export function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}
