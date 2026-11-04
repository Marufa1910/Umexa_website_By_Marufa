import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { categories, projects } from "./seed-data/projects";
import { sampleLogos, sampleTeam, sampleTestimonials } from "./seed-data/people";
import { services } from "./seed-data/services";

config({ path: ".env.local", quiet: true });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function seedOwner() {
  const email = process.env.SEED_OWNER_EMAIL?.toLowerCase();
  const password = process.env.SEED_OWNER_PASSWORD;
  if (!email || !password) {
    console.log("No SEED_OWNER_EMAIL or SEED_OWNER_PASSWORD: skipped the Owner account.");
    return;
  }
  if (password.length < 12) throw new Error("SEED_OWNER_PASSWORD must be at least 12 characters.");
  // Never touches an existing account, so re-seeding can't reset a changed password
  if (await prisma.user.findUnique({ where: { email } })) return;

  const id = randomUUID();
  await prisma.user.create({
    data: {
      id,
      name: "Owner",
      email,
      role: "OWNER",
      accounts: {
        create: {
          id: randomUUID(),
          accountId: id,
          providerId: "credential",
          password: await hashPassword(password),
        },
      },
    },
  });
}

async function seedCategories() {
  const ids = new Map<string, string>();
  for (const [sortOrder, name] of categories.entries()) {
    const row = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name), sortOrder },
    });
    ids.set(name, row.id);
  }
  return ids;
}

async function seedProjects(categoryIds: Map<string, string>) {
  for (const [sortOrder, project] of projects.entries()) {
    // Existing projects are left alone, so re-seeding never overwrites admin edits
    if (await prisma.project.findUnique({ where: { slug: project.slug } })) continue;

    const client = await prisma.client.create({
      data: { name: project.client, industry: project.industry, isSample: true },
    });
    await prisma.project.create({
      data: {
        title: project.title,
        slug: project.slug,
        shortDescription: project.shortDescription,
        fullDescription: project.overview,
        objectives: project.objectives,
        creativeStrategy: project.strategy,
        process: project.process,
        deliverables: project.deliverables,
        year: project.year,
        coverUrl: project.cover,
        coverAlt: project.alt,
        videoUrl: project.video,
        featured: project.featured,
        status: "PUBLISHED",
        publishedAt: new Date(),
        sortOrder,
        isSample: true,
        seoTitle: project.seoTitle,
        seoDescription: project.seoDescription,
        clientId: client.id,
        categories: {
          create: project.categories.map((name, order) => ({
            sortOrder: order,
            categoryId: categoryIds.get(name)!,
          })),
        },
        media: {
          create: project.gallery.map((item, order) => ({
            kind: item.kind === "video" ? ("VIDEO" as const) : ("IMAGE" as const),
            url: item.src,
            posterUrl: item.poster,
            alt: item.alt,
            width: item.width,
            height: item.height,
            sortOrder: order,
          })),
        },
      },
    });
  }
}

async function seedServices(categoryIds: Map<string, string>) {
  for (const [sortOrder, service] of services.entries()) {
    if (await prisma.service.findUnique({ where: { slug: service.slug } })) continue;
    await prisma.service.create({
      data: {
        title: service.title,
        slug: service.slug,
        summary: service.summary,
        intro: service.intro,
        previewUrl: service.preview,
        capabilities: service.capabilities,
        deliverables: service.deliverables,
        workflow: service.workflow,
        faq: service.faq,
        status: "PUBLISHED",
        sortOrder,
        seoTitle: service.seoTitle,
        seoDescription: service.seoDescription,
        categories: {
          create: service.categories.map((name) => ({ categoryId: categoryIds.get(name)! })),
        },
      },
    });
  }
}

async function seedPeople() {
  if ((await prisma.client.count({ where: { featured: true } })) === 0) {
    await prisma.client.createMany({
      data: sampleLogos.map((name, sortOrder) => ({
        name,
        featured: true,
        isSample: true,
        sortOrder,
      })),
    });
  }
  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({
      data: sampleTestimonials.map((item, sortOrder) => ({
        ...item,
        status: "PUBLISHED" as const,
        isSample: true,
        sortOrder,
      })),
    });
  }
  if ((await prisma.teamMember.count()) === 0) {
    await prisma.teamMember.createMany({
      data: sampleTeam.map((item, sortOrder) => ({
        ...item,
        status: "PUBLISHED" as const,
        isSample: true,
        sortOrder,
      })),
    });
  }
}

async function seedSettings() {
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      seoDescription:
        "UMEXA is a creative studio for design, video, motion, 3D, branding, digital marketing and web.",
      showreelUrl: "/media/samples/reel.mp4",
      showreelPoster: "/media/samples/reel-poster.webp",
      showreelSample: true,
    },
  });
}

async function main() {
  await seedOwner();
  const categoryIds = await seedCategories();
  await seedProjects(categoryIds);
  await seedServices(categoryIds);
  await seedPeople();
  await seedSettings();
  console.log(
    "Seed complete. All portfolio, client, quote and team records are marked as samples.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
