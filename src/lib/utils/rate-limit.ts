import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";

/**
 * Fixed-window limiter in PostgreSQL, so every server instance shares one count. The upsert is
 * atomic, so simultaneous requests can't slip through, and identifiers are stored only as hashes.
 */
export async function isRateLimited(
  scope: string,
  identifier: string,
  limit: number,
  windowMs: number,
) {
  const hash = createHash("sha256")
    .update(`${process.env.BETTER_AUTH_SECRET}:${identifier}`)
    .digest("hex");
  const key = `${scope}:${hash}`;
  const now = BigInt(Date.now());
  const windowStart = now - BigInt(windowMs);

  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("id", "key", "count", "lastRequest")
    VALUES (${randomUUID()}, ${key}, 1, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."lastRequest" < ${windowStart} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "lastRequest" = CASE WHEN "RateLimit"."lastRequest" < ${windowStart} THEN ${now} ELSE "RateLimit"."lastRequest" END
    RETURNING "count"`;

  // Occasionally clear old rows, so the table can't grow forever. All windows are under a day.
  if (Math.random() < 0.01) {
    await prisma.rateLimit.deleteMany({
      where: { lastRequest: { lt: now - BigInt(24 * 60 * 60 * 1000) } },
    });
  }

  return rows[0].count > limit;
}
