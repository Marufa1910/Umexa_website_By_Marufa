import type { Metadata } from "next";
import { Suspense } from "react";
import { DeleteButton, FeatureButton, MoveButtons } from "@/components/admin/RowActions";
import { ClientDialog } from "@/components/admin/SimpleForms";
import {
  Badge,
  cellClass,
  EmptyState,
  LoadingState,
  PageHeader,
  rowClass,
  Table,
} from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { listClientsForAdmin, listPickerAssets } from "@/lib/data/admin-content";

export const metadata: Metadata = { title: "Clients" };

async function NewClient() {
  await requirePermission("content.manage");
  return <ClientDialog assets={await listPickerAssets()} />;
}

async function Clients() {
  await requirePermission("content.manage");
  const [clients, assets] = await Promise.all([listClientsForAdmin(), listPickerAssets()]);

  if (clients.length === 0) {
    return <EmptyState title="No clients yet">Add a client to link it to projects.</EmptyState>;
  }
  return (
    <Table head={["Client", "Industry", "Projects", "Labels", "Actions"]}>
      {clients.map((client) => (
        <tr key={client.id} className={rowClass}>
          <td className={cellClass}>{client.name}</td>
          <td className={`${cellClass} text-muted`}>{client.industry ?? "None"}</td>
          <td className={`${cellClass} text-muted`}>{client._count.projects}</td>
          <td className={cellClass}>
            <span className="flex gap-1">
              {client.featured && <Badge value="PUBLISHED" label="Featured" />}
              {client.isSample && <Badge value="DRAFT" label="Sample" />}
            </span>
          </td>
          <td className={cellClass}>
            <div className="flex gap-1">
              <ClientDialog
                assets={assets}
                client={{
                  id: client.id,
                  name: client.name,
                  logoUrl: client.logoUrl,
                  websiteUrl: client.websiteUrl,
                  industry: client.industry,
                  featured: client.featured,
                  isSample: client.isSample,
                }}
              />
              <FeatureButton
                model="client"
                id={client.id}
                name={client.name}
                featured={client.featured}
              />
              <MoveButtons model="client" id={client.id} name={client.name} />
              <DeleteButton model="client" id={client.id} name={client.name} />
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Clients"
        description="Featured clients appear in the homepage logo row. Only list real clients with their permission."
      >
        <Suspense>
          <NewClient />
        </Suspense>
      </PageHeader>
      <Suspense fallback={<LoadingState label="Loading clients" />}>
        <Clients />
      </Suspense>
    </>
  );
}
