import type { Metadata } from "next";
import { Suspense } from "react";
import { DeleteButton, MoveButtons, PublishButton } from "@/components/admin/RowActions";
import { TeamDialog } from "@/components/admin/SimpleForms";
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
import { listPickerAssets, listTeamForAdmin } from "@/lib/data/admin-content";

export const metadata: Metadata = { title: "Team" };

async function NewMember() {
  await requirePermission("content.manage");
  return <TeamDialog assets={await listPickerAssets()} />;
}

async function Team() {
  await requirePermission("content.manage");
  const [team, assets] = await Promise.all([listTeamForAdmin(), listPickerAssets()]);

  if (team.length === 0) {
    return <EmptyState title="No team members yet">Add people to the About page.</EmptyState>;
  }
  return (
    <Table head={["Name", "Job title", "Status", "Labels", "Actions"]}>
      {team.map((member) => {
        const name = `${member.name} (${member.jobTitle})`;
        return (
          <tr key={member.id} className={rowClass}>
            <td className={cellClass}>{member.name}</td>
            <td className={`${cellClass} text-muted`}>{member.jobTitle}</td>
            <td className={cellClass}>
              <Badge value={member.status} />
            </td>
            <td className={cellClass}>
              {member.isSample && <Badge value="DRAFT" label="Sample" />}
            </td>
            <td className={cellClass}>
              <div className="flex gap-1">
                <TeamDialog
                  assets={assets}
                  member={{
                    id: member.id,
                    name: member.name,
                    jobTitle: member.jobTitle,
                    bio: member.bio,
                    photoUrl: member.photoUrl,
                    status: member.status,
                    isSample: member.isSample,
                  }}
                />
                <PublishButton
                  model="teamMember"
                  id={member.id}
                  name={name}
                  published={member.status === "PUBLISHED"}
                />
                <MoveButtons model="teamMember" id={member.id} name={name} />
                <DeleteButton model="teamMember" id={member.id} name={name} />
              </div>
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team"
        description="Profiles on the About page. Sign-in accounts are managed under Users."
      >
        <Suspense>
          <NewMember />
        </Suspense>
      </PageHeader>
      <Suspense fallback={<LoadingState label="Loading the team" />}>
        <Team />
      </Suspense>
    </>
  );
}
