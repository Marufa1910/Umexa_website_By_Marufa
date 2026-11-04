"use server";

import { refresh } from "next/cache";
import { hashPassword } from "better-auth/crypto";
import { attempt, runForm, AdminError } from "@/lib/admin/action";
import { recordAudit } from "@/lib/audit";
import { canAssignRole, type Role } from "@/lib/auth/permissions";
import { requirePermission, type CurrentUser } from "@/lib/auth/session";
import { createStaffUser } from "@/lib/data/staff";
import { prisma } from "@/lib/db";
import { createUserSchema, resetPasswordSchema, roleSchema } from "@/schemas/admin";
import type { ActionState } from "@/types/admin";

/** Admins may only touch Editors. An Owner can only lose that role while another Owner remains. */
async function loadManageable(actor: CurrentUser, id: string) {
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!target) throw new AdminError("That account no longer exists.");
  if (actor.role !== "OWNER" && target.role !== "EDITOR") {
    throw new AdminError("Only an Owner can change that account.");
  }
  return target;
}

async function assertAnotherOwner(role: Role) {
  if (role !== "OWNER") return;
  if ((await prisma.user.count({ where: { role: "OWNER" } })) <= 1) {
    throw new AdminError("There must always be at least one Owner.");
  }
}

export async function createUser(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runForm("users.manage", createUserSchema, formData, async (data, user) => {
    if (!canAssignRole(user.role, data.role)) {
      throw new AdminError("You can't assign that role.");
    }
    const email = data.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
      throw new AdminError("That email is already in use.");
    }
    const created = await createStaffUser(data);
    await recordAudit({
      actorId: user.id,
      action: "user.created",
      entity: "User",
      entityId: created.id,
      metadata: { role: data.role },
    });
    refresh();
    return "Account created.";
  });
}

export async function changeUserRole(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runForm("users.manage", roleSchema, formData, async ({ role }, user) => {
    if (id === user.id) throw new AdminError("You can't change your own role.");
    const target = await loadManageable(user, id);
    if (!canAssignRole(user.role, role)) throw new AdminError("You can't assign that role.");
    if (role !== "OWNER") await assertAnotherOwner(target.role);

    await prisma.user.update({ where: { id }, data: { role } });
    await recordAudit({
      actorId: user.id,
      action: "user.role_changed",
      entity: "User",
      entityId: id,
      metadata: { role },
    });
    refresh();
    return "Role updated.";
  });
}

/** Also signs the person out everywhere, so an old session can't outlive the old password. */
export async function resetUserPassword(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runForm("users.manage", resetPasswordSchema, formData, async ({ password }, user) => {
    await loadManageable(user, id);
    await prisma.$transaction([
      prisma.account.updateMany({
        where: { userId: id, providerId: "credential" },
        data: { password: await hashPassword(password) },
      }),
      prisma.session.deleteMany({ where: { userId: id } }),
    ]);
    await recordAudit({
      actorId: user.id,
      action: "user.password_reset",
      entity: "User",
      entityId: id,
    });
    return "Password reset.";
  });
}

export async function deleteUser(id: string): Promise<ActionState> {
  const user = await requirePermission("users.manage");
  return attempt(async () => {
    if (id === user.id) throw new AdminError("You can't delete your own account.");
    const target = await loadManageable(user, id);
    await assertAnotherOwner(target.role);

    await prisma.user.delete({ where: { id } });
    await recordAudit({ actorId: user.id, action: "user.deleted", entity: "User", entityId: id });
    refresh();
    return "Account deleted.";
  });
}
