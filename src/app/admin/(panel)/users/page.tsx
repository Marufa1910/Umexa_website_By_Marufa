import type { Metadata } from "next";
import { Suspense } from "react";
import { NewUserDialog, UserRowActions } from "@/components/admin/UserControls";
import {
  Badge,
  cellClass,
  formatDate,
  LoadingState,
  PageHeader,
  rowClass,
  Table,
} from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Users" };

async function NewUser() {
  const user = await requirePermission("users.manage");
  return <NewUserDialog actorRole={user.role} />;
}

async function Users() {
  const actor = await requirePermission("users.view");
  const users = await listUsers();

  return (
    <Table head={["Name", "Email", "Role", "Added", "Actions"]}>
      {users.map((user) => {
        const isSelf = user.id === actor.id;
        const manageable = !isSelf && (actor.role === "OWNER" || user.role === "EDITOR");
        return (
          <tr key={user.id} className={rowClass}>
            <td className={cellClass}>
              {user.name}
              {isSelf && <span className="text-muted"> (you)</span>}
            </td>
            <td className={`${cellClass} text-muted`}>{user.email}</td>
            <td className={cellClass}>
              <Badge value={user.role} />
            </td>
            <td className={`${cellClass} whitespace-nowrap text-muted`}>
              {formatDate(user.createdAt)}
            </td>
            <td className={cellClass}>
              {manageable && (
                <UserRowActions
                  id={user.id}
                  name={user.name}
                  role={user.role}
                  actorRole={actor.role}
                />
              )}
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

export default function UsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        description="People who can sign in to this admin. Admins can manage Editors, and Owners can manage everyone."
      >
        <Suspense>
          <NewUser />
        </Suspense>
      </PageHeader>
      <Suspense fallback={<LoadingState label="Loading users" />}>
        <Users />
      </Suspense>
    </>
  );
}
