"use server";

import { updateTag } from "next/cache";
import { attempt, AdminError } from "@/lib/admin/action";
import { recordAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import type { ActionState } from "@/types/admin";

/** Row actions shared by the content lists. Models are a fixed list, never free text. */

type Publishable = "project" | "service" | "testimonial" | "teamMember";
type Featurable = "project" | "client";
type Removable = Publishable | "client";
type Orderable = Removable | "category";

const tagFor: Record<Orderable, string[]> = {
  project: ["projects"],
  service: ["services"],
  testimonial: ["testimonials"],
  teamMember: ["team"],
  client: ["clients", "projects"],
  category: ["categories", "projects", "services"],
};

const PUBLISHABLE: readonly string[] = ["project", "service", "testimonial", "teamMember"];
const FEATURABLE: readonly string[] = ["project", "client"];
const REMOVABLE: readonly string[] = [...PUBLISHABLE, "client"];
const ORDERABLE: readonly string[] = [...REMOVABLE, "category"];

/** Action arguments can be tampered with in the browser, so TypeScript's types aren't enough. */
function assertAllowed(allowed: readonly string[], model: string, id: unknown) {
  if (!allowed.includes(model) || typeof id !== "string") throw new AdminError("Invalid request.");
}

// Prisma's delegates share these calls, but TypeScript can't express a union of them
type Delegate = {
  findMany(args: unknown): Promise<{ id: string; sortOrder: number }[]>;
  findUnique(args: unknown): Promise<Record<string, unknown> | null>;
  update(args: unknown): Promise<unknown>;
};
const delegate = (model: Orderable) => prisma[model] as unknown as Delegate;

function refresh(model: Orderable) {
  tagFor[model].forEach((tag) => updateTag(tag));
}

export async function setPublished(
  model: Publishable,
  id: string,
  published: boolean,
): Promise<ActionState> {
  const user = await requirePermission("content.manage");
  return attempt(async () => {
    assertAllowed(PUBLISHABLE, model, id);
    const data: Record<string, unknown> = { status: published ? "PUBLISHED" : "DRAFT" };
    if (model === "project" && published) {
      const row = await delegate(model).findUnique({ where: { id } });
      if (!row?.publishedAt) data.publishedAt = new Date();
    }
    await delegate(model).update({ where: { id }, data });
    await recordAudit({
      actorId: user.id,
      action: published ? `${model}.published` : `${model}.unpublished`,
      entity: model,
      entityId: id,
    });
    refresh(model);
    return published ? "Published." : "Moved to drafts.";
  });
}

export async function setFeatured(
  model: Featurable,
  id: string,
  featured: boolean,
): Promise<ActionState> {
  const user = await requirePermission("content.manage");
  return attempt(async () => {
    assertAllowed(FEATURABLE, model, id);
    await delegate(model).update({ where: { id }, data: { featured: featured === true } });
    await recordAudit({
      actorId: user.id,
      action: `${model}.featured`,
      entity: model,
      entityId: id,
      metadata: { featured },
    });
    refresh(model);
    return featured ? "Featured." : "No longer featured.";
  });
}

/** Swaps with its neighbour, and rewrites the order so old ties can't make a move do nothing. */
export async function moveItem(
  model: Orderable,
  id: string,
  direction: "up" | "down",
): Promise<ActionState> {
  await requirePermission("content.manage");
  return attempt(async () => {
    assertAllowed(ORDERABLE, model, id);
    const where = model === "category" ? {} : { deletedAt: null };
    const rows = await delegate(model).findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, sortOrder: true },
    });
    const index = rows.findIndex((row) => row.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= rows.length) return "Already at the end of the list.";

    [rows[index], rows[target]] = [rows[target], rows[index]];
    await prisma.$transaction(
      rows.map((row, sortOrder) =>
        delegate(model).update({ where: { id: row.id }, data: { sortOrder } }),
      ) as never,
    );
    refresh(model);
    return "Order updated.";
  });
}

/** Soft delete: the row stays in the database, and its slug is freed for reuse. */
export async function removeItem(model: Removable, id: string): Promise<ActionState> {
  const user = await requirePermission("content.manage");
  return attempt(async () => {
    assertAllowed(REMOVABLE, model, id);
    const data: Record<string, unknown> = { deletedAt: new Date() };
    if (model === "project" || model === "service") {
      const row = await delegate(model).findUnique({ where: { id } });
      if (!row) throw new AdminError("That item no longer exists.");
      data.slug = `${String(row.slug).slice(0, 90)}-deleted-${Date.now()}`;
      data.status = "DRAFT";
    }
    await delegate(model).update({ where: { id }, data });
    await recordAudit({
      actorId: user.id,
      action: `${model}.deleted`,
      entity: model,
      entityId: id,
    });
    refresh(model);
    return "Deleted.";
  });
}
