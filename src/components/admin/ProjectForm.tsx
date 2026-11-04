"use client";

import { saveProject } from "@/actions/admin/content";
import type { PickerAsset } from "@/types/admin";
import {
  AdminForm,
  CheckField,
  CheckGroup,
  MediaField,
  MediaProvider,
  RowsField,
  SelectField,
  SlugField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "./form";

export type ProjectFormValues = {
  id: string | null;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  clientId: string;
  categories: string[];
  year: number;
  coverUrl: string;
  coverAlt: string;
  videoUrl: string;
  objectives: string[];
  creativeStrategy: string;
  process: { title: string; copy: string }[];
  deliverables: string[];
  gallery: {
    kind: string;
    url: string;
    posterUrl: string;
    alt: string;
    width: number;
    height: number;
  }[];
  featured: boolean;
  isSample: boolean;
  status: string;
  seoTitle: string;
  seoDescription: string;
};

const sectionClass = "space-y-5 border border-line p-5";
const headingClass = "font-display text-lg tracking-tight";

export function ProjectForm({
  values,
  categories,
  clients,
  assets,
}: {
  values: ProjectFormValues;
  categories: { value: string; label: string }[];
  clients: { value: string; label: string }[];
  assets: PickerAsset[];
}) {
  return (
    <MediaProvider assets={assets}>
      <AdminForm
        action={saveProject.bind(null, values.id)}
        className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <div className="min-w-0 space-y-5">
          <section className={sectionClass}>
            <h2 className={headingClass}>Basics</h2>
            <TextField name="title" label="Title" defaultValue={values.title} />
            <SlugField from="title" defaultValue={values.slug} />
            <TextAreaField
              name="shortDescription"
              label="Short description"
              rows={2}
              defaultValue={values.shortDescription}
            />
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Media</h2>
            <MediaField
              name="coverUrl"
              label="Cover image"
              hint="Choose from the library, or use a path starting with /media/."
              defaultValue={values.coverUrl}
            />
            <TextField
              name="coverAlt"
              label="Cover description"
              hint="Describes the image for people who can't see it."
              defaultValue={values.coverAlt}
            />
            <MediaField
              name="videoUrl"
              label="Video URL"
              kind="VIDEO"
              hint="A direct link to a video file. Optional: it shows in the case-study hero and on hover."
              defaultValue={values.videoUrl}
            />
            <RowsField
              name="gallery"
              label="Media gallery"
              addLabel="Add gallery item"
              defaultValue={values.gallery}
              blank={{ kind: "IMAGE", url: "", posterUrl: "", alt: "", width: 1600, height: 1000 }}
              columns={[
                { key: "url", label: "File", type: "media" },
                {
                  key: "kind",
                  label: "Type",
                  type: "select",
                  options: [
                    { value: "IMAGE", label: "Image" },
                    { value: "VIDEO", label: "Video" },
                  ],
                },
                { key: "alt", label: "Description" },
                { key: "width", label: "Width (px)", type: "number" },
                { key: "height", label: "Height (px)", type: "number" },
                { key: "posterUrl", label: "Video poster (optional)", type: "media" },
              ]}
            />
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Case study</h2>
            <TextAreaField
              name="fullDescription"
              label="Full description"
              rows={5}
              defaultValue={values.fullDescription}
            />
            <TextAreaField
              name="objectives"
              label="Project objectives"
              hint="One per line."
              defaultValue={values.objectives.join("\n")}
            />
            <TextAreaField
              name="creativeStrategy"
              label="Creative strategy"
              rows={5}
              defaultValue={values.creativeStrategy}
            />
            <RowsField
              name="process"
              label="Creative process"
              addLabel="Add stage"
              defaultValue={values.process}
              blank={{ title: "", copy: "" }}
              columns={[
                { key: "title", label: "Stage" },
                { key: "copy", label: "What happened", type: "textarea" },
              ]}
            />
            <TextAreaField
              name="deliverables"
              label="Deliverables"
              hint="One per line."
              defaultValue={values.deliverables.join("\n")}
            />
          </section>
        </div>

        <div className="min-w-0 space-y-5">
          <section className={sectionClass}>
            <h2 className={headingClass}>Publishing</h2>
            <SelectField
              name="status"
              label="Status"
              defaultValue={values.status}
              options={[
                { value: "DRAFT", label: "Draft" },
                { value: "PUBLISHED", label: "Published" },
              ]}
            />
            <CheckField name="featured" label="Featured" defaultChecked={values.featured} />
            <CheckField
              name="isSample"
              label="Sample content"
              hint="Shows a Sample label on the site. Turn off only for real client work."
              defaultChecked={values.isSample}
            />
            <SubmitButton>Save project</SubmitButton>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Details</h2>
            <SelectField
              name="clientId"
              label="Client"
              defaultValue={values.clientId}
              options={[{ value: "", label: "No client" }, ...clients]}
            />
            <TextField name="year" label="Year" type="number" defaultValue={values.year} />
            <CheckGroup
              name="categories"
              label="Categories"
              options={categories}
              defaultValue={values.categories}
            />
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>SEO</h2>
            <TextField name="seoTitle" label="SEO title" defaultValue={values.seoTitle} />
            <TextAreaField
              name="seoDescription"
              label="SEO description"
              rows={3}
              defaultValue={values.seoDescription}
            />
          </section>
        </div>
      </AdminForm>
    </MediaProvider>
  );
}
