"use client";

import { saveService } from "@/actions/admin/content";
import type { PickerAsset } from "@/types/admin";
import {
  AdminForm,
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

export type ServiceFormValues = {
  id: string | null;
  title: string;
  slug: string;
  summary: string;
  intro: string;
  previewUrl: string;
  capabilities: string[];
  deliverables: string[];
  workflow: { title: string; copy: string }[];
  faq: { question: string; answer: string }[];
  categories: string[];
  status: string;
  seoTitle: string;
  seoDescription: string;
};

const sectionClass = "space-y-5 border border-line p-5";
const headingClass = "font-display text-lg tracking-tight";

export function ServiceForm({
  values,
  categories,
  assets,
}: {
  values: ServiceFormValues;
  categories: { value: string; label: string }[];
  assets: PickerAsset[];
}) {
  return (
    <MediaProvider assets={assets}>
      <AdminForm
        action={saveService.bind(null, values.id)}
        className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <div className="min-w-0 space-y-5">
          <section className={sectionClass}>
            <h2 className={headingClass}>Description</h2>
            <TextField name="title" label="Title" defaultValue={values.title} />
            <SlugField from="title" defaultValue={values.slug} />
            <TextField
              name="summary"
              label="Summary"
              hint="One line, shown in service lists."
              defaultValue={values.summary}
            />
            <TextAreaField name="intro" label="Introduction" rows={4} defaultValue={values.intro} />
            <MediaField name="previewUrl" label="Image" defaultValue={values.previewUrl} />
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>What&rsquo;s included</h2>
            <TextAreaField
              name="capabilities"
              label="Capabilities"
              hint="One per line."
              rows={5}
              defaultValue={values.capabilities.join("\n")}
            />
            <TextAreaField
              name="deliverables"
              label="Deliverables"
              hint="One per line."
              rows={4}
              defaultValue={values.deliverables.join("\n")}
            />
            <RowsField
              name="workflow"
              label="Workflow"
              addLabel="Add step"
              defaultValue={values.workflow}
              blank={{ title: "", copy: "" }}
              columns={[
                { key: "title", label: "Step" },
                { key: "copy", label: "Description", type: "textarea" },
              ]}
            />
            <RowsField
              name="faq"
              label="FAQ"
              addLabel="Add question"
              defaultValue={values.faq}
              blank={{ question: "", answer: "" }}
              columns={[
                { key: "question", label: "Question", type: "textarea" },
                { key: "answer", label: "Answer", type: "textarea" },
              ]}
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
            <SubmitButton>Save service</SubmitButton>
          </section>
          <section className={sectionClass}>
            <h2 className={headingClass}>Relevant work</h2>
            <CheckGroup
              name="categories"
              label="Show projects from"
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
