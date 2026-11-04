import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Local secrets live in .env.local; on Vercel the variables are already set
config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Installing generates the client, which needs no database, so a fresh clone must not fail here
    // Hosts with connection pooling need a direct connection for migrations
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
