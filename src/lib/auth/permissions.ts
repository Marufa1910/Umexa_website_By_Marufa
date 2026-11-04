export type Role = "OWNER" | "ADMIN" | "EDITOR";

export type Permission =
  | "dashboard.view"
  | "content.manage"
  | "inquiries.manage"
  | "settings.manage"
  | "users.view"
  | "users.manage";

/**
 * The single source of truth for who may do what. Checked on the server by every admin page,
 * API route and action. Editors handle content only: inquiries hold personal data.
 */
const grants: Record<Role, readonly Permission[]> = {
  OWNER: [
    "dashboard.view",
    "content.manage",
    "inquiries.manage",
    "settings.manage",
    "users.view",
    "users.manage",
  ],
  ADMIN: [
    "dashboard.view",
    "content.manage",
    "inquiries.manage",
    "settings.manage",
    "users.view",
    "users.manage",
  ],
  EDITOR: ["dashboard.view", "content.manage"],
};

export function can(role: string | null | undefined, permission: Permission) {
  return grants[role as Role]?.includes(permission) ?? false;
}

/** Owners may assign any role. Admins may only create Editors, so nobody can raise their own level. */
export function canAssignRole(actor: string, target: Role) {
  if (actor === "OWNER") return true;
  return actor === "ADMIN" && target === "EDITOR";
}
