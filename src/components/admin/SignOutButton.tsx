"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
      className="min-h-9 shrink-0 border border-line px-3 text-sm transition-colors hover:border-fg"
    >
      Sign out
    </button>
  );
}
