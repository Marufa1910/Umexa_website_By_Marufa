import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";
import { recordAudit } from "@/lib/audit";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Accounts are only created by an Owner or Admin, never by public sign-up
    disableSignUp: true,
    minPasswordLength: 12,
  },
  user: {
    additionalFields: {
      // input: false stops anyone setting their own role through the auth API
      role: { type: "string", required: false, defaultValue: "EDITOR", input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await recordAudit({ actorId: session.userId, action: "auth.sign_in", entity: "User" });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
