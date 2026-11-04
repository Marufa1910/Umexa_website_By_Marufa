"use server";

import { attempt, runForm, AdminError } from "@/lib/admin/action";
import { recordAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import type { InquiryStatus } from "@/generated/prisma/client";
import { noteSchema, statusSchema } from "@/schemas/admin";
import type { ActionState } from "@/types/admin";
import { refresh } from "next/cache";

async function changeStatus(id: string, status: InquiryStatus, userId: string) {
  const current = await prisma.inquiry.findUnique({ where: { id }, select: { status: true } });
  if (!current) throw new AdminError("That inquiry no longer exists.");
  if (current.status === status) return;

  await prisma.$transaction([
    prisma.inquiry.update({ where: { id }, data: { status } }),
    prisma.inquiryStatusChange.create({
      data: { inquiryId: id, fromStatus: current.status, toStatus: status, changedById: userId },
    }),
  ]);
  await recordAudit({
    actorId: userId,
    action: "inquiry.status_changed",
    entity: "Inquiry",
    entityId: id,
    metadata: { status },
  });
  refresh();
}

export async function updateInquiryStatus(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runForm("inquiries.manage", statusSchema, formData, async ({ status }, user) => {
    await changeStatus(id, status, user.id);
    return "Status updated.";
  });
}

export async function archiveInquiry(id: string, archived: boolean): Promise<ActionState> {
  const user = await requirePermission("inquiries.manage");
  return attempt(async () => {
    await changeStatus(id, archived ? "ARCHIVED" : "NEW", user.id);
    return archived ? "Archived." : "Restored as new.";
  });
}

export async function addInquiryNote(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runForm("inquiries.manage", noteSchema, formData, async ({ body }, user) => {
    await prisma.inquiryNote.create({ data: { inquiryId: id, authorId: user.id, body } });
    await recordAudit({
      actorId: user.id,
      action: "inquiry.note_added",
      entity: "Inquiry",
      entityId: id,
    });
    refresh();
    return "Note added.";
  });
}
