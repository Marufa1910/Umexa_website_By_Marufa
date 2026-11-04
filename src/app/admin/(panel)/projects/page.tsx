import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import {
  DeleteButton,
  FeatureButton,
  MoveButtons,
  PublishButton,
} from "@/components/admin/RowActions";
import {
  Badge,
  buttonClass,
  cellClass,
  EmptyState,
  filterClass,
  LinkButton,
  LoadingState,
  PageHeader,
  rowClass,
  Table,
} from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { listCategories, listProjects } from "@/lib/data/admin-content";

export const metadata: Metadata = { title: "Projects" };

type Search = { search?: string; status?: string; category?: string };

async function Projects({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("content.manage");
  const { search, status, category } = await searchParams;
  const [projects, categories] = await Promise.all([
    listProjects({
      search: search?.slice(0, 200) || undefined,
      status: status === "DRAFT" || status === "PUBLISHED" ? status : undefined,
      categoryId: category || undefined,
    }),
    listCategories(),
  ]);
  const filtered = Boolean(search || status || category);

  return (
    <>
      <Form action="/admin/projects" className="mb-4 flex flex-wrap gap-2">
        <input
          type="search"
          name="search"
          aria-label="Search projects"
          placeholder="Search projects"
          defaultValue={search}
          className={`${filterClass} w-full sm:w-64`}
        />
        <select
          name="status"
          aria-label="Filter by status"
          defaultValue={status ?? ""}
          className={filterClass}
        >
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
        <select
          name="category"
          aria-label="Filter by category"
          defaultValue={category ?? ""}
          className={filterClass}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonClass}>
          Filter
        </button>
      </Form>

      {projects.length === 0 ? (
        <EmptyState title={filtered ? "No projects match" : "No projects yet"}>
          {filtered ? (
            <Link href="/admin/projects" className="underline">
              Clear the filters
            </Link>
          ) : (
            "Create your first project to show it on the site."
          )}
        </EmptyState>
      ) : (
        <Table head={["Project", "Client", "Category", "Year", "Status", "Actions"]}>
          {projects.map((project) => (
            <tr key={project.id} className={rowClass}>
              <td className={cellClass}>
                <Link href={`/admin/projects/${project.id}/edit`} className="hover:text-accent">
                  {project.title}
                </Link>
                <span className="mt-1 flex gap-1">
                  {project.featured && <Badge value="PUBLISHED" label="Featured" />}
                  {project.isSample && <Badge value="DRAFT" label="Sample" />}
                </span>
              </td>
              <td className={`${cellClass} text-muted`}>{project.client?.name ?? "None"}</td>
              <td className={`${cellClass} text-muted`}>
                {project.categories.map((item) => item.category.name).join(", ")}
              </td>
              <td className={`${cellClass} text-muted`}>{project.year}</td>
              <td className={cellClass}>
                <Badge value={project.status} />
              </td>
              <td className={cellClass}>
                <div className="flex gap-1">
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    aria-label={`Edit ${project.title}`}
                    className={`${buttonClass} min-h-9 px-3`}
                  >
                    <Pencil aria-hidden className="size-4" />
                  </Link>
                  <PublishButton
                    model="project"
                    id={project.id}
                    name={project.title}
                    published={project.status === "PUBLISHED"}
                  />
                  <FeatureButton
                    model="project"
                    id={project.id}
                    name={project.title}
                    featured={project.featured}
                  />
                  <MoveButtons model="project" id={project.id} name={project.title} />
                  <DeleteButton model="project" id={project.id} name={project.title} />
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}

export default function ProjectsPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <>
      <PageHeader title="Projects" description="Everything in the portfolio, including drafts.">
        <LinkButton href="/admin/projects/new">New project</LinkButton>
      </PageHeader>
      <Suspense fallback={<LoadingState label="Loading projects" />}>
        <Projects searchParams={searchParams} />
      </Suspense>
    </>
  );
}
