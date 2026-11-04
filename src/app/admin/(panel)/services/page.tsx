import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DeleteButton, MoveButtons, PublishButton } from "@/components/admin/RowActions";
import {
  Badge,
  buttonClass,
  cellClass,
  EmptyState,
  LinkButton,
  LoadingState,
  PageHeader,
  rowClass,
  Table,
} from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { listServicesForAdmin } from "@/lib/data/admin-content";

export const metadata: Metadata = { title: "Services" };

async function Services() {
  await requirePermission("content.manage");
  const services = await listServicesForAdmin();

  if (services.length === 0) {
    return <EmptyState title="No services yet">Add a service to show it on the site.</EmptyState>;
  }
  return (
    <Table head={["Service", "Summary", "Status", "Actions"]}>
      {services.map((service) => (
        <tr key={service.id} className={rowClass}>
          <td className={cellClass}>
            <Link href={`/admin/services/${service.id}/edit`} className="hover:text-accent">
              {service.title}
            </Link>
          </td>
          <td className={`${cellClass} text-muted`}>{service.summary}</td>
          <td className={cellClass}>
            <Badge value={service.status} />
          </td>
          <td className={cellClass}>
            <div className="flex gap-1">
              <Link
                href={`/admin/services/${service.id}/edit`}
                aria-label={`Edit ${service.title}`}
                className={`${buttonClass} min-h-9 px-3`}
              >
                <Pencil aria-hidden className="size-4" />
              </Link>
              <PublishButton
                model="service"
                id={service.id}
                name={service.title}
                published={service.status === "PUBLISHED"}
              />
              <MoveButtons model="service" id={service.id} name={service.title} />
              <DeleteButton model="service" id={service.id} name={service.title} />
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageHeader title="Services" description="What the agency offers, shown on the public site.">
        <LinkButton href="/admin/services/new">New service</LinkButton>
      </PageHeader>
      <Suspense fallback={<LoadingState label="Loading services" />}>
        <Services />
      </Suspense>
    </>
  );
}
