import "server-only";
import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";
import { requirePermission, type CurrentUser } from "@/lib/auth/session";
import type { Permission } from "@/lib/auth/permissions";
import type { ActionState } from "@/types/admin";

/** Repeated fields named "x[]" become arrays; everything else stays a single value. */
function formToObject(formData: FormData) {
  const output: Record<string, unknown> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue;
    output[key.endsWith("[]") ? key.slice(0, -2) : key] = key.endsWith("[]")
      ? formData.getAll(key)
      : formData.get(key);
  }
  return output;
}

/**
 * Every admin form action runs through here: permission first, then validation, then the work.
 * Users only ever see a safe message, and details stay in the server log.
 */
export async function runForm<S extends z.ZodType>(
  permission: Permission,
  schema: S,
  formData: FormData,
  handler: (data: z.output<S>, user: CurrentUser) => Promise<string | void>,
): Promise<ActionState> {
  const user = await requirePermission(permission);

  const parsed = schema.safeParse(formToObject(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  return attempt(() => handler(parsed.data, user));
}

/** For actions with no form, such as publish, reorder and delete. */
export async function attempt(work: () => Promise<string | void>): Promise<ActionState> {
  try {
    return { ok: true, message: (await work()) ?? "Saved." };
  } catch (error) {
    unstable_rethrow(error); // redirects must keep travelling
    if (error instanceof AdminError) return { ok: false, message: error.message };
    if ((error as { code?: string }).code === "P2002") {
      return {
        ok: false,
        message: "That value is already in use.",
        errors: { slug: "Already in use." },
      };
    }
    console.error("Admin action failed", error instanceof Error ? error.name : "unknown");
    return { ok: false, message: "Something went wrong. Nothing was changed." };
  }
}

/** A problem the person can understand and fix. The message is shown as written. */
export class AdminError extends Error {}
