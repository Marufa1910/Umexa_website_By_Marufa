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
    url: process.env.DATABASE_URL ?? "",
  },
});
