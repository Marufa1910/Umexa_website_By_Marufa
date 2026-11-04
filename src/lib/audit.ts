import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

type AuditEntry = {
  actorId: string | null;
  action: string;
  entity: string;
  entityId?: string;
  /** Never put passwords or an inquiry's personal details here */
  metadata?: Prisma.InputJsonValue;
};

export async function recordAudit(entry: AuditEntry) {
  await prisma.auditLog.create({ data: entry });
}
