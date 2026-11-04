"use client";

import { addInquiryNote, archiveInquiry, updateInquiryStatus } from "@/actions/admin/inquiries";
import { inquiryStatuses } from "@/schemas/admin";
import { ActionButton, AdminForm, SelectField, SubmitButton, TextAreaField } from "./form";

export function InquiryStatusForm({ id, status }: { id: string; status: string }) {
  return (
    <AdminForm action={updateInquiryStatus.bind(null, id)} className="space-y-3">
      <SelectField
        key={status}
        name="status"
        label="Status"
        defaultValue={status}
        options={inquiryStatuses.map((value) => ({
          value,
          label: value.replace(/_/g, " ").toLowerCase(),
        }))}
      />
      <SubmitButton>Update status</SubmitButton>
    </AdminForm>
  );
}

export function ArchiveButton({ id, archived }: { id: string; archived: boolean }) {
  return (
    <ActionButton
      confirm={archived ? undefined : "Archive this inquiry? It stays in the database."}
      action={() => archiveInquiry(id, !archived)}
    >
      {archived ? "Restore" : "Archive"}
    </ActionButton>
  );
}

export function NoteForm({ id }: { id: string }) {
  return (
    <AdminForm action={addInquiryNote.bind(null, id)} className="space-y-3" resetOnSuccess>
      <TextAreaField
        name="body"
        label="Add an internal note"
        hint="Only staff can see notes."
        rows={3}
      />
      <SubmitButton>Add note</SubmitButton>
    </AdminForm>
  );
}
