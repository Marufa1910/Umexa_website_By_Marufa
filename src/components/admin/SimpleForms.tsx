"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  deleteCategory,
  saveCategory,
  saveClient,
  saveTeamMember,
  saveTestimonial,
} from "@/actions/admin/content";
import type { PickerAsset } from "@/types/admin";
import {
  ActionButton,
  AdminForm,
  CheckField,
  FormDialog,
  MediaField,
  MediaProvider,
  SelectField,
  SlugField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "./form";

const statusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
];

/** Same dialog for adding and editing: only the trigger and the starting values differ. */
function RecordDialog({
  id,
  name,
  noun,
  children,
}: {
  id: string | null;
  name?: string;
  noun: string;
  children: React.ReactNode;
}) {
  return (
    <FormDialog
      primary={!id}
      title={id ? `Edit ${name}` : `New ${noun}`}
      trigger={id ? <Pencil aria-label={`Edit ${name}`} className="size-4" /> : `New ${noun}`}
    >
      {children}
    </FormDialog>
  );
}

type CategoryValues = { id: string; name: string; slug: string };

export function CategoryDialog({ category }: { category?: CategoryValues }) {
  return (
    <RecordDialog id={category?.id ?? null} name={category?.name} noun="category">
      <AdminForm action={saveCategory.bind(null, category?.id ?? null)}>
        <TextField name="name" label="Name" defaultValue={category?.name} />
        <SlugField from="name" defaultValue={category?.slug} />
        <SubmitButton />
      </AdminForm>
    </RecordDialog>
  );
}

export function DeleteCategoryButton({
  id,
  name,
  uses,
}: {
  id: string;
  name: string;
  uses: number;
}) {
  return (
    <ActionButton
      label={`Delete ${name}`}
      confirm={
        uses > 0
          ? `Delete “${name}”? It will be removed from ${uses} project(s) and service(s). They stay on the site.`
          : `Delete “${name}”?`
      }
      action={() => deleteCategory(id)}
    >
      <Trash2 aria-hidden className="size-4" />
    </ActionButton>
  );
}

type ClientValues = {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  industry: string | null;
  featured: boolean;
  isSample: boolean;
};

export function ClientDialog({ client, assets }: { client?: ClientValues; assets: PickerAsset[] }) {
  return (
    <RecordDialog id={client?.id ?? null} name={client?.name} noun="client">
      <MediaProvider assets={assets}>
        <AdminForm action={saveClient.bind(null, client?.id ?? null)}>
          <TextField name="name" label="Client name" defaultValue={client?.name} />
          <MediaField
            name="logoUrl"
            label="Logo"
            hint="Optional. Without a logo, the name is shown."
            defaultValue={client?.logoUrl ?? ""}
          />
          <TextField name="websiteUrl" label="Website" defaultValue={client?.websiteUrl ?? ""} />
          <TextField name="industry" label="Industry" defaultValue={client?.industry ?? ""} />
          <CheckField
            name="featured"
            label="Featured"
            hint="Shows in the homepage logo row. Only use with the client's permission."
            defaultChecked={client?.featured}
          />
          <CheckField
            name="isSample"
            label="Sample content"
            hint="Marks this as a placeholder on the site, not a real client."
            defaultChecked={client?.isSample}
          />
          <SubmitButton />
        </AdminForm>
      </MediaProvider>
    </RecordDialog>
  );
}

type TestimonialValues = {
  id: string;
  clientName: string;
  designation: string;
  company: string;
  quote: string;
  photoUrl: string | null;
  status: string;
  isSample: boolean;
};

export function TestimonialDialog({
  testimonial,
  assets,
}: {
  testimonial?: TestimonialValues;
  assets: PickerAsset[];
}) {
  return (
    <RecordDialog id={testimonial?.id ?? null} name={testimonial?.clientName} noun="testimonial">
      <MediaProvider assets={assets}>
        <AdminForm action={saveTestimonial.bind(null, testimonial?.id ?? null)}>
          <TextAreaField name="quote" label="Testimonial" defaultValue={testimonial?.quote} />
          <TextField name="clientName" label="Client name" defaultValue={testimonial?.clientName} />
          <TextField
            name="designation"
            label="Designation"
            defaultValue={testimonial?.designation}
          />
          <TextField name="company" label="Company" defaultValue={testimonial?.company} />
          <MediaField
            name="photoUrl"
            label="Client photo"
            hint="Optional."
            defaultValue={testimonial?.photoUrl ?? ""}
          />
          <SelectField
            name="status"
            label="Status"
            defaultValue={testimonial?.status ?? "DRAFT"}
            options={statusOptions}
          />
          <CheckField
            name="isSample"
            label="Sample, not verified"
            hint="Keep this on until the client has really said this and agreed to its use."
            defaultChecked={testimonial ? testimonial.isSample : true}
          />
          <SubmitButton />
        </AdminForm>
      </MediaProvider>
    </RecordDialog>
  );
}

type TeamValues = {
  id: string;
  name: string;
  jobTitle: string;
  bio: string | null;
  photoUrl: string | null;
  status: string;
  isSample: boolean;
};

export function TeamDialog({ member, assets }: { member?: TeamValues; assets: PickerAsset[] }) {
  return (
    <RecordDialog id={member?.id ?? null} name={member?.name} noun="team member">
      <MediaProvider assets={assets}>
        <AdminForm action={saveTeamMember.bind(null, member?.id ?? null)}>
          <TextField name="name" label="Name" defaultValue={member?.name} />
          <TextField name="jobTitle" label="Job title" defaultValue={member?.jobTitle} />
          <TextAreaField name="bio" label="Bio" hint="Optional." defaultValue={member?.bio ?? ""} />
          <MediaField name="photoUrl" label="Photo" defaultValue={member?.photoUrl ?? ""} />
          <SelectField
            name="status"
            label="Status"
            defaultValue={member?.status ?? "DRAFT"}
            options={statusOptions}
          />
          <CheckField
            name="isSample"
            label="Sample content"
            hint="Marks this profile as a placeholder on the site."
            defaultChecked={member?.isSample}
          />
          <SubmitButton />
        </AdminForm>
      </MediaProvider>
    </RecordDialog>
  );
}
