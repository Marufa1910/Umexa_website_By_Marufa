"use client";

import { buttonClass } from "@/components/admin/ui";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="border border-signal p-6">
      <h1 className="font-display text-2xl tracking-tight">This page couldn&rsquo;t load</h1>
      <p className="mt-2 text-sm text-muted">
        Nothing was changed. Try again, and if it keeps happening, check that the database is
        running.
      </p>
      <button type="button" onClick={reset} className={`${buttonClass} mt-4`}>
        Try again
      </button>
    </div>
  );
}
