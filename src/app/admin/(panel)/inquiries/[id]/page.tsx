import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArchiveButton, InquiryStatusForm, NoteForm } from "@/components/admin/InquiryControls";
import { Badge, formatDate, LoadingState } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { getInquiry } from "@/lib/data/admin";
import { budgetOptions, timelineOptions } from "@/schemas/inquiry-options";

export const metadata: Metadata = { title: "Inquiry" };

type Params = Promise<{ id: string }>;

const labelFor = (options: readonly { id: string; label: string }[], id: string) =>
  options.find((option) => option.id === id)?.label ?? id;

async function InquiryDetail({ params }: { params: Params }) {
  await requirePermission("inquiries.manage");
  const inquiry = await getInquiry((await params).id);
  if (!inquiry) notFound();

  const facts = [
    {
      label: "Email",
      value: (
        <a href={`mailto:${inquiry.email}`} className="underline">
          {inquiry.email}
        </a>
      ),
    },
    { label: "Company", value: inquiry.company ?? "Not given" },
    { label: "Country", value: inquiry.country },
    { label: "Service", value: inquiry.service?.title ?? "Not sure yet" },
    { label: "Budget", value: labelFor(budgetOptions[inquiry.currency], inquiry.budget) },
    { label: "Timeline", value: labelFor(timelineOptions, inquiry.timeline) },
    { label: "Received", value: formatDate(inquiry.createdAt) },
  ];

  return (
    <>
      <Link href="/admin/inquiries" className="text-sm text-muted hover:text-fg">
        Back to inquiries
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl tracking-tight">{inquiry.fullName}</h1>
          <Badge value={inquiry.status} />
        </div>
        <ArchiveButton id={inquiry.id} archived={inquiry.status === "ARCHIVED"} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-5">
          <section className="border border-line p-5">
            <h2 className="font-display text-lg tracking-tight">Project details</h2>
            <p className="mt-3 leading-relaxed break-words whitespace-pre-wrap">
              {inquiry.description}
            </p>
            {inquiry.referenceUrl && (
              <p className="mt-4 text-sm break-all">
                Reference:{" "}
                <a
                  href={inquiry.referenceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  {inquiry.referenceUrl}
                </a>
              </p>
            )}
          </section>

          <section className="border border-line p-5">
            <h2 className="mb-3 font-display text-lg tracking-tight">Internal notes</h2>
            <NoteForm id={inquiry.id} />
            {inquiry.notes.length > 0 && (
              <ul className="mt-5 border-t border-line">
                {inquiry.notes.map((note) => (
                  <li key={note.id} className="border-b border-line py-3 last:border-b-0">
                    <p className="text-sm whitespace-pre-wrap">{note.body}</p>
                    <p className="mt-1 text-xs text-muted">
                      {note.author?.name ?? "Former staff"}, {formatDate(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-5">
          <section className="border border-line p-5">
            <InquiryStatusForm id={inquiry.id} status={inquiry.status} />
          </section>

          <section className="border border-line p-5">
            <dl className="space-y-3 text-sm">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-muted">{fact.label}</dt>
                  <dd className="break-words">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="border border-line p-5">
            <h2 className="mb-3 font-display text-lg tracking-tight">Status history</h2>
            {inquiry.statusChanges.length === 0 ? (
              <p className="text-sm text-muted">No changes yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {inquiry.statusChanges.map((change) => (
                  <li key={change.id}>
                    {change.fromStatus.replace(/_/g, " ").toLowerCase()} to{" "}
                    {change.toStatus.replace(/_/g, " ").toLowerCase()}
                    <span className="block text-xs text-muted">
                      {change.changedBy?.name ?? "Former staff"}, {formatDate(change.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default function InquiryPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<LoadingState label="Loading the inquiry" />}>
      <InquiryDetail params={params} />
    </Suspense>
  );
}
