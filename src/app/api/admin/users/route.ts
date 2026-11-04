import { recordAudit } from "@/lib/audit";
import { canAssignRole } from "@/lib/auth/permissions";
import { guardApi } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/admin";
import { createStaffUser } from "@/lib/data/staff";
import { prisma } from "@/lib/db";
import { createUserSchema } from "@/schemas/admin";

export async function GET(request: Request) {
  const { denied } = await guardApi(request, "users.view");
  if (denied) return denied;

  return Response.json({ users: await listUsers() });
}

export async function POST(request: Request) {
  const { user, denied } = await guardApi(request, "users.manage");
  if (denied) return denied;

  const body = createUserSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "Invalid user details" }, { status: 400 });

  const { email, role } = body.data;
  if (!canAssignRole(user.role, role)) {
    return Response.json({ error: "You can't assign that role" }, { status: 403 });
  }

  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) return Response.json({ error: "That email is already in use" }, { status: 409 });

  const created = await createStaffUser(body.data);

  await recordAudit({
    actorId: user.id,
    action: "user.created",
    entity: "User",
    entityId: created.id,
    metadata: { role },
  });

  return Response.json({ user: created }, { status: 201 });
}
