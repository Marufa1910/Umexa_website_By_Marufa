import type { Metadata } from "next";
import { Suspense } from "react";
import { DeleteButton, MoveButtons, PublishButton } from "@/components/admin/RowActions";
import { TestimonialDialog } from "@/components/admin/SimpleForms";
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
import { listPickerAssets, listTestimonialsForAdmin } from "@/lib/data/admin-content";

export const metadata: Metadata = { title: "Testimonials" };

async function NewTestimonial() {
  await requirePermission("content.manage");
  return <TestimonialDialog assets={await listPickerAssets()} />;
}

async function Testimonials() {
  await requirePermission("content.manage");
  const [testimonials, assets] = await Promise.all([
    listTestimonialsForAdmin(),
    listPickerAssets(),
  ]);

  if (testimonials.length === 0) {
    return <EmptyState title="No testimonials yet">Add feedback from a real client.</EmptyState>;
  }
  return (
    <Table head={["Quote", "From", "Status", "Source", "Actions"]}>
      {testimonials.map((item) => {
        const name = `${item.clientName}, ${item.company}`;
        return (
          <tr key={item.id} className={rowClass}>
            <td className={`${cellClass} max-w-sm`}>
              <span className="line-clamp-2">{item.quote}</span>
            </td>
            <td className={`${cellClass} text-muted`}>{name}</td>
            <td className={cellClass}>
              <Badge value={item.status} />
            </td>
            <td className={cellClass}>
              {item.isSample ? (
                <Badge value="DRAFT" label="Sample" />
              ) : (
                <Badge value="PUBLISHED" label="Verified" />
              )}
            </td>
            <td className={cellClass}>
              <div className="flex gap-1">
                <TestimonialDialog
                  assets={assets}
                  testimonial={{
                    id: item.id,
                    clientName: item.clientName,
                    designation: item.designation,
                    company: item.company,
                    quote: item.quote,
                    photoUrl: item.photoUrl,
                    status: item.status,
                    isSample: item.isSample,
                  }}
                />
                <PublishButton
                  model="testimonial"
                  id={item.id}
                  name={name}
                  published={item.status === "PUBLISHED"}
                />
                <MoveButtons model="testimonial" id={item.id} name={name} />
                <DeleteButton model="testimonial" id={item.id} name={name} />
              </div>
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

export default function TestimonialsPage() {
  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Samples are labelled on the site. Mark a quote verified only when the client really said it and agreed to its use."
      >
        <Suspense>
          <NewTestimonial />
        </Suspense>
      </PageHeader>
      <Suspense fallback={<LoadingState label="Loading testimonials" />}>
        <Testimonials />
      </Suspense>
    </>
  );
}
