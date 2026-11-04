import { AlertTriangle, LoaderCircle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export const buttonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 border border-line px-4 text-sm transition-colors hover:border-fg disabled:cursor-not-allowed disabled:opacity-50";
export const primaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 bg-signal px-4 text-sm font-medium text-canvas transition-colors hover:bg-fg disabled:cursor-wait disabled:opacity-70";
const fieldClass =
  "min-h-10 border border-line bg-canvas px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-signal aria-invalid:border-signal";
export const inputClass = `w-full ${fieldClass}`;
/** For filter rows, where each control sizes itself and they sit side by side. */
export const filterClass = fieldClass;

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={primaryButtonClass}>
      {children}
    </Link>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <p role="status" className="flex items-center gap-2 py-12 text-sm text-muted">
      <LoaderCircle aria-hidden className="size-4 animate-spin" />
      {label}
    </p>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-line px-6 py-14 text-center">
      <p className="font-display text-xl tracking-tight">{title}</p>
      {children && <div className="mt-3 text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex gap-3 border border-line bg-surface p-4 text-sm leading-relaxed">
      <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
      <div>{children}</div>
    </div>
  );
}

const badgeStyles: Record<string, string> = {
  PUBLISHED: "border-signal text-accent",
  DRAFT: "border-line text-muted",
  NEW: "border-signal text-accent",
  WON: "border-signal text-accent",
  LOST: "border-signal text-accent",
  ARCHIVED: "border-line text-muted",
};

export function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={`slate inline-block border px-2 py-0.5 whitespace-nowrap ${
        badgeStyles[value] ?? "border-line text-fg"
      }`}
    >
      {label ?? value.replace(/_/g, " ")}
    </span>
  );
}

/** Wide tables scroll inside their frame, so the page itself never scrolls sideways. */
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-surface">
            {head.map((label, i) => (
              <th key={label || i} scope="col" className="slate px-4 py-3 font-medium text-muted">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export const rowClass = "border-b border-line last:border-b-0";
export const cellClass = "px-4 py-3 align-middle";

export function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
