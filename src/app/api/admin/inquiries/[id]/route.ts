import { recordAudit } from "@/lib/audit";
import { guardApi } from "@/lib/auth/session";
import { getInquiry } from "@/lib/data/admin";
import { prisma } from "@/lib/db";
import { inquiryUpdateSchema } from "@/schemas/admin";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const { denied } = await guardApi(request, "inquiries.manage");
  if (denied) return denied;

  const inquiry = await getInquiry((await params).id);
  if (!inquiry) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ inquiry });
}

export async function PATCH(request: Request, { params }: Context) {
  const { user, denied } = await guardApi(request, "inquiries.manage");
  if (denied) return denied;

  const body = inquiryUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "Invalid update" }, { status: 400 });

  const { id } = await params;
  const current = await prisma.inquiry.findUnique({ where: { id }, select: { status: true } });
  if (!current) return Response.json({ error: "Not found" }, { status: 404 });

  const { status, note } = body.data;
  const statusChanged = status !== undefined && status !== current.status;

  await prisma.$transaction(async (tx) => {
    if (statusChanged) {
      await tx.inquiry.update({ where: { id }, data: { status } });
      await tx.inquiryStatusChange.create({
        data: { inquiryId: id, fromStatus: current.status, toStatus: status, changedById: user.id },
      });
    }
    if (note)
      await tx.inquiryNote.create({ data: { inquiryId: id, authorId: user.id, body: note } });
  });

  await recordAudit({
    actorId: user.id,
    action: "inquiry.updated",
    entity: "Inquiry",
    entityId: id,
    metadata: { status: statusChanged ? status : undefined, noteAdded: Boolean(note) },
  });

  return Response.json({ inquiry: await getInquiry(id) });
}
