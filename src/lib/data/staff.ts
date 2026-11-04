import "server-only";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import type { Role } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";

/** Staff accounts are only ever created here, by a signed-in Owner or Admin. */
export async function createStaffUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) {
  const id = randomUUID();
  return prisma.user.create({
    data: {
      id,
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
      accounts: {
        create: {
          id: randomUUID(),
          accountId: id,
          providerId: "credential",
          password: await hashPassword(input.password),
        },
      },
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}
