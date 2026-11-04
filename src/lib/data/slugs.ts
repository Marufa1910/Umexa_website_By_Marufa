import "server-only";
import { prisma } from "@/lib/db";

const TTL_MS = 60 * 1000;

let cached: { work: Set<string>; services: Set<string>; expires: number } | null = null;

/**
 * Published slugs for the 404 check in proxy.ts, held briefly because it runs on every request to
 * those routes. A slug not in the list is looked up directly, so new pages work immediately.
 */
export async function getKnownSlugs() {
  if (cached && cached.expires > Date.now()) return cached;

  const where = { status: "PUBLISHED", deletedAt: null } as const;
  const [projects, services] = await Promise.all([
    prisma.project.findMany({ where, select: { slug: true } }),
    prisma.service.findMany({ where, select: { slug: true } }),
  ]);

  cached = {
    work: new Set(projects.map((project) => project.slug)),
    services: new Set(services.map((service) => service.slug)),
    expires: Date.now() + TTL_MS,
  };
  return cached;
}

export async function isPublishedSlug(section: "work" | "services", slug: string) {
  const known = await getKnownSlugs();
  if (known[section].has(slug)) return true;

  const where = { slug, status: "PUBLISHED", deletedAt: null } as const;
  const row =
    section === "work"
      ? await prisma.project.findFirst({ where, select: { id: true } })
      : await prisma.service.findFirst({ where, select: { id: true } });
  if (row) known[section].add(slug);
  return Boolean(row);
}
