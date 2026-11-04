import type { Metadata } from "next";
import { Suspense } from "react";
import { ChangePasswordForm } from "@/components/admin/UserControls";
import { LoadingState, PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";

export const metadata: Metadata = { title: "My account" };

async function Account() {
  const user = await requirePermission("dashboard.view");
  return (
    <>
      <dl className="mb-8 space-y-3 text-sm">
        <div>
          <dt className="text-muted">Name</dt>
          <dd>{user.name}</dd>
        </div>
        <div>
          <dt className="text-muted">Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt className="text-muted">Role</dt>
          <dd>{user.role.toLowerCase()}</dd>
        </div>
      </dl>
      <h2 className="mb-3 font-display text-xl tracking-tight">Change password</h2>
      <ChangePasswordForm />
    </>
  );
}

export default function AccountPage() {
  return (
    <>
      <PageHeader title="My account" />
      <Suspense fallback={<LoadingState />}>
        <Account />
      </Suspense>
    </>
  );
}
