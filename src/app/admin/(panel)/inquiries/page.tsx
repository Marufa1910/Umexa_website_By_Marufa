import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import {
  Badge,
  buttonClass,
  cellClass,
  EmptyState,
  formatDate,
  filterClass,
  LoadingState,
  PageHeader,
  rowClass,
  Table,
} from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { listInquiries } from "@/lib/data/admin";
import { inquiryFilterSchema, inquiryStatuses } from "@/schemas/admin";

export const metadata: Metadata = { title: "Inquiries" };

type Search = { search?: string; status?: string };

async function Inquiries({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("inquiries.manage");
  const raw = await searchParams;
  const parsed = inquiryFilterSchema.safeParse({
    search: raw.search || undefined,
    status: raw.status || undefined,
  });
  const filter = parsed.success ? parsed.data : {};
  const inquiries = await listInquiries(
    // Archived inquiries stay out of the way unless asked for
    filter.status ? filter : { ...filter, excludeArchived: true },
    200,
  );
  const filtered = Boolean(raw.search || raw.status);

  return (
    <>
      <Form action="/admin/inquiries" className="mb-4 flex flex-wrap gap-2">
        <input
          type="search"
          name="search"
          aria-label="Search inquiries"
          placeholder="Name, email, company or message"
          defaultValue={raw.search}
          className={`${filterClass} w-full sm:w-72`}
        />
        <select
          name="status"
          aria-label="Filter by status"
          defaultValue={raw.status ?? ""}
          className={filterClass}
        >
          <option value="">All except archived</option>
          {inquiryStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, " ").toLowerCase()}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonClass}>
          Filter
        </button>
      </Form>

      {inquiries.length === 0 ? (
        <EmptyState title={filtered ? "No inquiries match" : "No inquiries yet"}>
          {filtered ? (
            <Link href="/admin/inquiries" className="underline">
              Clear the filters
            </Link>
          ) : (
            "Messages from the contact form will appear here."
          )}
        </EmptyState>
      ) : (
        <Table head={["From", "Service", "Country", "Status", "Received"]}>
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id} className={rowClass}>
              <td className={cellClass}>
                <Link href={`/admin/inquiries/${inquiry.id}`} className="hover:text-accent">
                  {inquiry.fullName}
                </Link>
                <span className="block text-xs text-muted">
                  {inquiry.company ? `${inquiry.company}, ` : ""}
                  {inquiry.email}
                </span>
              </td>
              <td className={`${cellClass} text-muted`}>{inquiry.service?.title ?? "Not sure"}</td>
              <td className={`${cellClass} text-muted`}>{inquiry.country}</td>
              <td className={cellClass}>
                <Badge value={inquiry.status} />
              </td>
              <td className={`${cellClass} whitespace-nowrap text-muted`}>
                {formatDate(inquiry.createdAt)}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}

export default function InquiriesPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <>
      <PageHeader title="Inquiries" description="Everything sent through the contact form." />
      <Suspense fallback={<LoadingState label="Loading inquiries" />}>
        <Inquiries searchParams={searchParams} />
      </Suspense>
    </>
  );
}
