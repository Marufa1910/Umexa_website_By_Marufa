"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/layout/Logo";

/** The sidebar becomes a drawer below 1024px. The nav itself is rendered on the server. */
export function AdminShell({
  nav,
  user,
  children,
}: {
  nav: ReactNode;
  user: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const closeMenu = useCallback(() => setOpen(false), []);

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_minmax(0,1fr)]">
      <Suspense>
        <CloseOnNavigate onNavigate={closeMenu} />
      </Suspense>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-y-auto border-r border-line bg-surface p-4 transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <Wordmark className="text-2xl" />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex size-10 items-center justify-center lg:hidden"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        {nav}
      </aside>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-ink/70 lg:hidden"
        />
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between gap-4 border-b border-line bg-ink px-4 lg:px-8">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="-ml-2 flex size-10 items-center justify-center lg:hidden"
          >
            <Menu aria-hidden className="size-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">{user}</div>
        </header>
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function CloseOnNavigate({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  useEffect(() => onNavigate(), [pathname, onNavigate]);
  return null;
}

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-10 items-center gap-3 px-3 text-sm transition-colors ${
        active ? "bg-surface-2 text-lime" : "text-paper hover:bg-surface-2"
      }`}
    >
      {children}
    </Link>
  );
}
