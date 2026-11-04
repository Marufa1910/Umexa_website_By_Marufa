import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./index";
import { can, type Permission, type Role } from "./permissions";

export type CurrentUser = { id: string; name: string; email: string; role: Role };

/** The signed-in user, read fresh from the database, so a role change applies immediately. */
export async function getCurrentUser(requestHeaders?: Headers): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({ headers: requestHeaders ?? (await headers()) });
  if (!session) return null;
  const { id, name, email, role } = session.user;
  return { id, name, email, role: role as Role };
}

/** For admin pages and server actions. */
export async function requirePermission(permission: Permission) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  // Every role can see the dashboard, so this cannot loop
  if (!can(user.role, permission)) redirect("/admin/dashboard");
  return user;
}

type Guarded = { user: CurrentUser; denied?: never } | { user?: never; denied: Response };

/**
 * For API routes. Returns the user, or the response to send. Changing requests must also come
 * from this site: session cookies are SameSite=Lax, and this closes the remaining CSRF gaps.
 */
export async function guardApi(request: Request, permission: Permission): Promise<Guarded> {
  const user = await getCurrentUser(request.headers);
  if (!user) return { denied: Response.json({ error: "Not signed in" }, { status: 401 }) };
  if (!can(user.role, permission)) {
    return { denied: Response.json({ error: "Not allowed" }, { status: 403 }) };
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).host !== new URL(request.url).host) {
      return { denied: Response.json({ error: "Invalid origin" }, { status: 403 }) };
    }
  }
  return { user };
}
