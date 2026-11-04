import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Local secrets live in .env.local; on Vercel the variables are already set
config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
