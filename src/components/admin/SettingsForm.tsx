"use client";

import { saveSettings } from "@/actions/admin/content";
import type { PickerAsset } from "@/types/admin";
import {
  AdminForm,
  CheckField,
  MediaField,
  MediaProvider,
  RowsField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "./form";

export type SettingsValues = {
  agencyName: string;
  logoUrl: string;
  contactEmail: string;
  phone: string;
  whatsapp: string;
  location: string;
  socials: { label: string; href: string }[];
  seoTitle: string;
  seoDescription: string;
  showreelUrl: string;
  showreelPoster: string;
  showreelSample: boolean;
};

const sectionClass = "space-y-5 border border-line p-5";
const headingClass = "font-display text-lg tracking-tight";

export function SettingsForm({
  values,
  assets,
}: {
  values: SettingsValues;
  assets: PickerAsset[];
}) {
  return (
    <MediaProvider assets={assets}>
      <AdminForm action={saveSettings} className="max-w-3xl space-y-5">
        <section className={sectionClass}>
          <h2 className={headingClass}>Agency</h2>
          <TextField name="agencyName" label="Agency name" defaultValue={values.agencyName} />
          <MediaField
            name="logoUrl"
            label="Logo"
            hint="Optional. Without one, the UMEXA wordmark is used."
            defaultValue={values.logoUrl}
          />
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Contact details</h2>
          <TextField
            name="contactEmail"
            label="Contact email"
            type="email"
            defaultValue={values.contactEmail}
          />
          <TextField name="phone" label="Phone" defaultValue={values.phone} />
          <TextField
            name="whatsapp"
            label="WhatsApp"
            hint="With the country code, such as +880 1XXX XXXXXX."
            defaultValue={values.whatsapp}
          />
          <TextField name="location" label="Location" defaultValue={values.location} />
          <RowsField
            name="socials"
            label="Social links"
            addLabel="Add link"
            defaultValue={values.socials}
            blank={{ label: "", href: "" }}
            columns={[
              { key: "label", label: "Name" },
              { key: "href", label: "Link" },
            ]}
          />
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Showreel</h2>
          <MediaField
            name="showreelUrl"
            label="Showreel video"
            kind="VIDEO"
            defaultValue={values.showreelUrl}
          />
          <MediaField
            name="showreelPoster"
            label="Poster image"
            hint="Required for the showreel to appear on the homepage."
            defaultValue={values.showreelPoster}
          />
          <CheckField
            name="showreelSample"
            label="Sample footage"
            hint="Labels the showreel as not being client work."
            defaultChecked={values.showreelSample}
          />
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>SEO defaults and metadata</h2>
          <TextField name="seoTitle" label="Default title" defaultValue={values.seoTitle} />
          <TextAreaField
            name="seoDescription"
            label="Default description"
            rows={3}
            defaultValue={values.seoDescription}
          />
        </section>

        <SubmitButton>Save settings</SubmitButton>
      </AdminForm>
    </MediaProvider>
  );
}
