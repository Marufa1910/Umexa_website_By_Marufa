import type { Metadata } from "next";
import { Suspense } from "react";
import { MoveButtons } from "@/components/admin/RowActions";
import { CategoryDialog, DeleteCategoryButton } from "@/components/admin/SimpleForms";
import {
  cellClass,
  EmptyState,
  LoadingState,
  PageHeader,
  rowClass,
  Table,
} from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { listCategories } from "@/lib/data/admin-content";

export const metadata: Metadata = { title: "Categories" };

async function Categories() {
  await requirePermission("content.manage");
  const categories = await listCategories();

  if (categories.length === 0) {
    return <EmptyState title="No categories yet">Categories filter the portfolio.</EmptyState>;
  }
  return (
    <Table head={["Category", "Slug", "Projects", "Actions"]}>
      {categories.map((category) => (
        <tr key={category.id} className={rowClass}>
          <td className={cellClass}>{category.name}</td>
          <td className={`${cellClass} text-muted`}>{category.slug}</td>
          <td className={`${cellClass} text-muted`}>{category._count.projects}</td>
          <td className={cellClass}>
            <div className="flex gap-1">
              <CategoryDialog
                category={{ id: category.id, name: category.name, slug: category.slug }}
              />
              <MoveButtons model="category" id={category.id} name={category.name} />
              <DeleteCategoryButton
                id={category.id}
                name={category.name}
                uses={category._count.projects + category._count.services}
              />
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}

export default function CategoriesPage() {
  return (
    <>
      <PageHeader
        title="Categories"
        description="The filters on the portfolio page, in this order."
      >
        <CategoryDialog />
      </PageHeader>
      <Suspense fallback={<LoadingState label="Loading categories" />}>
        <Categories />
      </Suspense>
    </>
  );
}
