import type { Metadata } from "next";
import { Suspense } from "react";
import {
  cellClass,
  EmptyState,
  LoadingState,
  PageHeader,
  rowClass,
  Table,
} from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { getDashboardStats, getRecentActivity } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Dashboard" };

const entityNames: Record<string, string> = {
  project: "project",
  service: "service",
  category: "category",
  client: "client",
  testimonial: "testimonial",
  teamMember: "team member",
  media: "media file",
  settings: "settings",
  User: "account",
  Inquiry: "inquiry",
};

/** Turns "project.published" into "Published a project", for anyone reading the log. */
function describe(action: string, entity: string) {
  if (action === "auth.sign_in") return "Signed in";
  if (action === "inquiry.received") return "New inquiry received";
  const verb = (action.split(".")[1] ?? action).replace(/_/g, " ");
  const name = entityNames[entity] ?? entity;
  return `${verb[0].toUpperCase()}${verb.slice(1)}: ${name}`;
}

async function Overview() {
  await requirePermission("dashboard.view");
  const [stats, activity] = await Promise.all([getDashboardStats(), getRecentActivity()]);

  const cards = [
    { label: "Total projects", value: stats.totalProjects },
    { label: "Published projects", value: stats.publishedProjects },
    { label: "Draft projects", value: stats.draftProjects },
    { label: "Total inquiries", value: stats.totalInquiries },
    { label: "New inquiries", value: stats.newInquiries },
    { label: "Active services", value: stats.activeServices },
  ];

  return (
    <>
      <dl className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-surface p-5">
            <dt className="slate text-muted">{card.label}</dt>
            <dd className="mt-2 font-display text-4xl tracking-tight">{card.value}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 mb-3 font-display text-xl tracking-tight">Recent activity</h2>
      {activity.length === 0 ? (
        <EmptyState title="Nothing yet">Activity will appear here as the team works.</EmptyState>
      ) : (
        <Table head={["What happened", "Who", "When (UTC)"]}>
          {activity.map((entry) => (
            <tr key={entry.id} className={rowClass}>
              <td className={cellClass}>{describe(entry.action, entry.entity)}</td>
              <td className={`${cellClass} text-muted`}>
                {entry.actor?.name ?? "Website visitor"}
              </td>
              <td className={`${cellClass} whitespace-nowrap text-muted`}>
                {entry.createdAt.toISOString().slice(0, 16).replace("T", " ")}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Live numbers from the database." />
      <Suspense fallback={<LoadingState label="Loading the dashboard" />}>
        <Overview />
      </Suspense>
    </>
  );
}
