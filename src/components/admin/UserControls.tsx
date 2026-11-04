"use client";

import { KeyRound, Trash2, UserCog } from "lucide-react";
import { useState, type FormEvent } from "react";
import { changeUserRole, createUser, deleteUser, resetUserPassword } from "@/actions/admin/users";
import { authClient } from "@/lib/auth/client";
import { ActionButton, AdminForm, FormDialog, SelectField, SubmitButton, TextField } from "./form";
import { useToast } from "./toast";
import { inputClass, primaryButtonClass } from "./ui";

const allRoles = [
  { value: "EDITOR", label: "Editor: manages content" },
  { value: "ADMIN", label: "Admin: also inquiries, settings and Editors" },
  { value: "OWNER", label: "Owner: full control" },
];

const assignable = (actorRole: string) =>
  actorRole === "OWNER" ? allRoles : allRoles.filter((role) => role.value === "EDITOR");

export function NewUserDialog({ actorRole }: { actorRole: string }) {
  return (
    <FormDialog primary trigger="New user" title="New user">
      <AdminForm action={createUser}>
        <TextField name="name" label="Name" autoComplete="off" />
        <TextField name="email" label="Email" type="email" autoComplete="off" />
        <TextField
          name="password"
          label="Temporary password"
          type="password"
          autoComplete="new-password"
          hint="At least 12 characters. Ask them to change it after signing in."
        />
        <SelectField name="role" label="Role" options={assignable(actorRole)} />
        <SubmitButton>Create account</SubmitButton>
      </AdminForm>
    </FormDialog>
  );
}

export function UserRowActions({
  id,
  name,
  role,
  actorRole,
}: {
  id: string;
  name: string;
  role: string;
  actorRole: string;
}) {
  return (
    <div className="flex gap-1">
      <FormDialog
        title={`Change role: ${name}`}
        trigger={<UserCog aria-label={`Change role for ${name}`} className="size-4" />}
      >
        <AdminForm action={changeUserRole.bind(null, id)}>
          <SelectField
            name="role"
            label="Role"
            defaultValue={role}
            options={assignable(actorRole)}
          />
          <SubmitButton />
        </AdminForm>
      </FormDialog>
      <FormDialog
        title={`Reset password: ${name}`}
        trigger={<KeyRound aria-label={`Reset password for ${name}`} className="size-4" />}
      >
        <AdminForm action={resetUserPassword.bind(null, id)}>
          <TextField
            name="password"
            label="New password"
            type="password"
            autoComplete="new-password"
            hint="At least 12 characters. This also signs them out everywhere."
          />
          <SubmitButton>Reset password</SubmitButton>
        </AdminForm>
      </FormDialog>
      <ActionButton
        label={`Delete ${name}`}
        confirm={`Delete the account for ${name}? They will no longer be able to sign in.`}
        action={() => deleteUser(id)}
      >
        <Trash2 aria-hidden className="size-4" />
      </ActionButton>
    </div>
  );
}

export function ChangePasswordForm() {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword: String(data.get("currentPassword")),
      newPassword: String(data.get("newPassword")),
      revokeOtherSessions: true,
    });
    setPending(false);
    if (error) {
      toast("Check your current password. The new one needs at least 12 characters.", false);
      return;
    }
    form.reset();
    toast("Password changed. Other devices have been signed out.");
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <label className="block text-sm">
        <span className="mb-1.5 block">Current password</span>
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block">New password</span>
        <input
          name="newPassword"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Saving" : "Change password"}
      </button>
    </form>
  );
}
