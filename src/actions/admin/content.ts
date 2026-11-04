"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { attempt, runForm } from "@/lib/admin/action";
import { recordAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  categorySchema,
  clientSchema,
  projectSchema,
  serviceSchema,
  settingsSchema,
  teamMemberSchema,
  testimonialSchema,
} from "@/schemas/admin";
import type { ActionState } from "@/types/admin";

const nextOrder = async (
  model: "project" | "service" | "category" | "client" | "testimonial" | "teamMember",
) => {
  const delegate = prisma[model] as unknown as {
    aggregate(args: unknown): Promise<{ _max: { sortOrder: number | null } }>;
  };
  const { _max } = await delegate.aggregate({ _max: { sortOrder: true } });
  return (_max.sortOrder ?? -1) + 1;
};

export async function saveProject(
  id: string | null,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await runForm("content.manage", projectSchema, formData, async (data, user) => {
    const { categories, gallery, ...fields } = data;
    const relations = {
      categories: {
        create: categories.map((categoryId, sortOrder) => ({ categoryId, sortOrder })),
      },
      media: { create: gallery.map((item, sortOrder) => ({ ...item, sortOrder })) },
    };

    const saved = id
      ? await prisma.$transaction(async (tx) => {
          const current = await tx.project.findUniqueOrThrow({
            where: { id },
            select: { publishedAt: true },
          });
          await tx.projectCategory.deleteMany({ where: { projectId: id } });
          await tx.projectMedia.deleteMany({ where: { projectId: id } });
          return tx.project.update({
            where: { id },
            data: {
              ...fields,
              ...relations,
              publishedAt:
                current.publishedAt ?? (fields.status === "PUBLISHED" ? new Date() : null),
            },
          });
        })
      : await prisma.project.create({
          data: {
            ...fields,
            ...relations,
            sortOrder: await nextOrder("project"),
            publishedAt: fields.status === "PUBLISHED" ? new Date() : null,
          },
        });

    await recordAudit({
      actorId: user.id,
      action: id ? "project.updated" : "project.created",
      entity: "project",
      entityId: saved.id,
    });
    updateTag("projects");
    return "Project saved.";
  });
  if (result.ok && !id) redirect("/admin/projects");
  return result;
}

export async function saveService(
  id: string | null,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await runForm("content.manage", serviceSchema, formData, async (data, user) => {
    const { categories, ...fields } = data;
    const relation = { create: categories.map((categoryId) => ({ categoryId })) };

    const saved = id
      ? await prisma.$transaction(async (tx) => {
          await tx.serviceCategory.deleteMany({ where: { serviceId: id } });
          return tx.service.update({ where: { id }, data: { ...fields, categories: relation } });
        })
      : await prisma.service.create({
          data: { ...fields, categories: relation, sortOrder: await nextOrder("service") },
        });

    await recordAudit({
      actorId: user.id,
      action: id ? "service.updated" : "service.created",
      entity: "service",
      entityId: saved.id,
    });
    updateTag("services");
    return "Service saved.";
  });
  if (result.ok && !id) redirect("/admin/services");
  return result;
}

export async function saveCategory(
  id: string | null,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runForm("content.manage", categorySchema, formData, async (data, user) => {
    const saved = id
      ? await prisma.category.update({ where: { id }, data })
      : await prisma.category.create({
          data: { ...data, sortOrder: await nextOrder("category") },
        });
    await recordAudit({
      actorId: user.id,
      action: id ? "category.updated" : "category.created",
      entity: "category",
      entityId: saved.id,
    });
    ["categories", "projects", "services"].forEach((tag) => updateTag(tag));
    return "Category saved.";
  });
}

/** Deleting a category only removes it from projects and services, never the projects themselves. */
export async function deleteCategory(id: string): Promise<ActionState> {
  const user = await requirePermission("content.manage");
  return attempt(async () => {
    await prisma.category.delete({ where: { id } });
    await recordAudit({
      actorId: user.id,
      action: "category.deleted",
      entity: "category",
      entityId: id,
    });
    ["categories", "projects", "services"].forEach((tag) => updateTag(tag));
    return "Category deleted.";
  });
}

export async function saveClient(
  id: string | null,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runForm("content.manage", clientSchema, formData, async (data, user) => {
    const saved = id
      ? await prisma.client.update({ where: { id }, data })
      : await prisma.client.create({ data: { ...data, sortOrder: await nextOrder("client") } });
    await recordAudit({
      actorId: user.id,
      action: id ? "client.updated" : "client.created",
      entity: "client",
      entityId: saved.id,
    });
    ["clients", "projects"].forEach((tag) => updateTag(tag));
    return "Client saved.";
  });
}

export async function saveTestimonial(
  id: string | null,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runForm("content.manage", testimonialSchema, formData, async (data, user) => {
    const saved = id
      ? await prisma.testimonial.update({ where: { id }, data })
      : await prisma.testimonial.create({
          data: { ...data, sortOrder: await nextOrder("testimonial") },
        });
    await recordAudit({
      actorId: user.id,
      action: id ? "testimonial.updated" : "testimonial.created",
      entity: "testimonial",
      entityId: saved.id,
    });
    updateTag("testimonials");
    return "Testimonial saved.";
  });
}

export async function saveTeamMember(
  id: string | null,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runForm("content.manage", teamMemberSchema, formData, async (data, user) => {
    const saved = id
      ? await prisma.teamMember.update({ where: { id }, data })
      : await prisma.teamMember.create({
          data: { ...data, sortOrder: await nextOrder("teamMember") },
        });
    await recordAudit({
      actorId: user.id,
      action: id ? "teamMember.updated" : "teamMember.created",
      entity: "teamMember",
      entityId: saved.id,
    });
    updateTag("team");
    return "Team member saved.";
  });
}

export async function saveSettings(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runForm("settings.manage", settingsSchema, formData, async (data, user) => {
    await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
    await recordAudit({ actorId: user.id, action: "settings.updated", entity: "settings" });
    updateTag("settings");
    return "Settings saved.";
  });
}
