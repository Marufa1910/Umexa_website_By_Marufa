"use client";

import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import {
  createContext,
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { initialActionState, type ActionState, type PickerAsset } from "@/types/admin";
import { useToast } from "./toast";
import { buttonClass, inputClass, primaryButtonClass } from "./ui";

// ---------- Form ----------

type FormContextValue = { errors: Record<string, string>; pending: boolean };
const FormContext = createContext<FormContextValue>({ errors: {}, pending: false });

const DialogContext = createContext<(() => void) | null>(null);

type AdminFormProps = {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  /** Clear the fields after saving, for forms that add one item after another */
  resetOnSuccess?: boolean;
};

/** Runs a server action, shows field errors and a toast, and keeps what was typed if it fails. */
export function AdminForm({
  action,
  children,
  className = "space-y-5",
  resetOnSuccess,
}: AdminFormProps) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const toast = useToast();
  const closeDialog = useContext(DialogContext);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.message) return;
    toast(state.message, state.ok);
    if (state.ok) {
      closeDialog?.();
      if (resetOnSuccess) form.current?.reset();
    }
  }, [state, toast, closeDialog, resetOnSuccess]);

  return (
    <FormContext.Provider value={{ errors: state.errors ?? {}, pending }}>
      <form
        ref={form}
        noValidate
        className={className}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          // Submitting by hand stops React resetting the fields after the action
          startTransition(() => formAction(data));
        }}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

export function SubmitButton({ children = "Save" }: { children?: ReactNode }) {
  const { pending } = useContext(FormContext);
  return (
    <button type="submit" disabled={pending} className={primaryButtonClass}>
      {pending ? "Saving" : children}
    </button>
  );
}

// ---------- Fields ----------

type FieldShellProps = {
  name: string;
  label: string;
  hint?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

function FieldShell({ name, label, hint, children }: FieldShellProps) {
  const id = useId();
  const { errors } = useContext(FormContext);
  const error = errors[name];
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ");

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm">
        {label}
      </label>
      {children({ id, describedBy: describedBy || undefined, invalid: Boolean(error) })}
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = ComponentProps<"input"> & { name: string; label: string; hint?: string };

export function TextField({ name, label, hint, ...props }: TextFieldProps) {
  return (
    <FieldShell name={name} label={label} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          name={name}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={inputClass}
          {...props}
        />
      )}
    </FieldShell>
  );
}

type TextAreaFieldProps = ComponentProps<"textarea"> & {
  name: string;
  label: string;
  hint?: string;
};

export function TextAreaField({ name, label, hint, rows = 4, ...props }: TextAreaFieldProps) {
  return (
    <FieldShell name={name} label={label} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          name={name}
          rows={rows}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`${inputClass} resize-y`}
          {...props}
        />
      )}
    </FieldShell>
  );
}

type SelectFieldProps = ComponentProps<"select"> & {
  name: string;
  label: string;
  hint?: string;
  options: readonly { value: string; label: string }[];
};

export function SelectField({ name, label, hint, options, ...props }: SelectFieldProps) {
  return (
    <FieldShell name={name} label={label} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          name={name}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={inputClass}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function CheckField({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 accent-signal"
      />
      <span>
        {label}
        {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function CheckGroup({
  name,
  label,
  options,
  defaultValue = [],
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string[];
}) {
  const { errors } = useContext(FormContext);
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={`${name}[]`}
              value={option.value}
              defaultChecked={defaultValue.includes(option.value)}
              className="size-4 accent-signal"
            />
            {option.label}
          </label>
        ))}
      </div>
      {errors[name] && <p className="mt-1 text-xs text-accent">{errors[name]}</p>}
    </fieldset>
  );
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Follows the title until someone edits it by hand. Existing slugs never change on their own. */
export function SlugField({ from, defaultValue = "" }: { from: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [edited, setEdited] = useState(Boolean(defaultValue));
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (edited) return;
    const source = input.current?.form?.elements.namedItem(from);
    if (!(source instanceof HTMLInputElement)) return;
    const follow = () => setValue(toSlug(source.value));
    source.addEventListener("input", follow);
    return () => source.removeEventListener("input", follow);
  }, [from, edited]);

  return (
    <TextField
      ref={input}
      name="slug"
      label="Slug"
      hint="The page address. Changing it breaks existing links."
      value={value}
      onChange={(event) => {
        setEdited(true);
        setValue(toSlug(event.target.value));
      }}
    />
  );
}

// ---------- Media ----------

const MediaContext = createContext<PickerAsset[]>([]);

export function MediaProvider({
  assets,
  children,
}: {
  assets: PickerAsset[];
  children: ReactNode;
}) {
  return <MediaContext.Provider value={assets}>{children}</MediaContext.Provider>;
}

function MediaPicker({
  kind,
  onPick,
}: {
  kind?: "IMAGE" | "VIDEO";
  onPick: (asset: PickerAsset) => void;
}) {
  const assets = useContext(MediaContext).filter((asset) => !kind || asset.kind === kind);
  const dialog = useRef<HTMLDialogElement>(null);
  if (assets.length === 0) return null;

  return (
    <>
      <button
        type="button"
        className={`${buttonClass} shrink-0`}
        onClick={() => dialog.current?.showModal()}
      >
        Library
      </button>
      <dialog
        ref={dialog}
        className="m-auto max-h-[85vh] w-[min(48rem,92vw)] border border-line bg-canvas p-5 text-fg backdrop:bg-fg/60"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl tracking-tight">Choose a file</h2>
          <button
            type="button"
            aria-label="Close"
            className="flex size-10 items-center justify-center"
            onClick={() => dialog.current?.close()}
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {assets.map((asset) => (
            <li key={asset.id}>
              <button
                type="button"
                className="block w-full border border-line text-left hover:border-signal"
                onClick={() => {
                  onPick(asset);
                  dialog.current?.close();
                }}
              >
                {asset.kind === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a small admin-only preview
                  <img
                    src={asset.url}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <span className="slate flex aspect-video items-center justify-center bg-canvas">
                    Video
                  </span>
                )}
                <span className="block truncate p-2 text-xs text-muted">
                  {asset.alt || asset.url.split("/").pop()}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}

export function MediaField({
  name,
  label,
  hint,
  kind = "IMAGE",
  defaultValue = "",
}: {
  name: string;
  label: string;
  hint?: string;
  kind?: "IMAGE" | "VIDEO";
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <FieldShell name={name} label={label} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <div className="flex gap-2">
          <input
            id={id}
            name={name}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={inputClass}
          />
          <MediaPicker kind={kind} onPick={(asset) => setValue(asset.url)} />
        </div>
      )}
    </FieldShell>
  );
}

// ---------- Editable rows ----------

export type RowColumn = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "media" | "select";
  options?: { value: string; label: string }[];
};
type Row = Record<string, string | number | null | undefined> & { _key?: number };

/** A list of small records (process steps, FAQs, gallery items), sent as one JSON field. */
export function RowsField({
  name,
  label,
  addLabel,
  columns,
  defaultValue = [],
  blank,
}: {
  name: string;
  label: string;
  addLabel: string;
  columns: RowColumn[];
  defaultValue?: Row[];
  blank: Row;
}) {
  const nextKey = useRef(defaultValue.length);
  const [rows, setRows] = useState<Row[]>(() =>
    defaultValue.map((row, _key) => ({ ...row, _key })),
  );
  const { errors } = useContext(FormContext);

  const change = (index: number, patch: Row) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const move = (index: number, by: number) =>
    setRows((current) => {
      const next = [...current];
      const [row] = next.splice(index, 1);
      next.splice(index + by, 0, row);
      return next;
    });

  const payload = rows.map((row) => {
    const copy = { ...row };
    delete copy._key;
    return copy;
  });

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm">{label}</legend>
      <input type="hidden" name={name} value={JSON.stringify(payload)} />
      <ol className="space-y-3">
        {rows.map((row, index) => (
          <li key={row._key} className="border border-line p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {columns.map((column) => {
                const value = row[column.key] ?? "";
                const aria = `${column.label}, item ${index + 1}`;
                const wide = column.type === "textarea" || column.type === "media";
                return (
                  <label
                    key={column.key}
                    className={`block text-xs text-muted ${wide ? "sm:col-span-2" : ""}`}
                  >
                    <span className="mb-1 block">{column.label}</span>
                    {column.type === "textarea" ? (
                      <textarea
                        aria-label={aria}
                        rows={2}
                        value={value}
                        onChange={(e) => change(index, { [column.key]: e.target.value })}
                        className={`${inputClass} resize-y text-fg`}
                      />
                    ) : column.type === "select" ? (
                      <select
                        aria-label={aria}
                        value={value}
                        onChange={(e) => change(index, { [column.key]: e.target.value })}
                        className={`${inputClass} text-fg`}
                      >
                        {column.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="flex gap-2">
                        <input
                          aria-label={aria}
                          type={column.type === "number" ? "number" : "text"}
                          value={value}
                          onChange={(e) => change(index, { [column.key]: e.target.value })}
                          className={`${inputClass} text-fg`}
                        />
                        {column.type === "media" && (
                          <MediaPicker
                            onPick={(asset) =>
                              change(index, {
                                [column.key]: asset.url,
                                ...(column.key === "url"
                                  ? {
                                      kind: asset.kind,
                                      alt: row.alt || asset.alt,
                                      width: asset.width ?? row.width,
                                      height: asset.height ?? row.height,
                                    }
                                  : {}),
                              })
                            }
                          />
                        )}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            <div className="mt-2 flex justify-end gap-1">
              <button
                type="button"
                disabled={index === 0}
                aria-label={`Move item ${index + 1} up`}
                onClick={() => move(index, -1)}
                className={`${buttonClass} px-3`}
              >
                <ArrowUp aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                disabled={index === rows.length - 1}
                aria-label={`Move item ${index + 1} down`}
                onClick={() => move(index, 1)}
                className={`${buttonClass} px-3`}
              >
                <ArrowDown aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                aria-label={`Remove item ${index + 1}`}
                onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                className={`${buttonClass} px-3`}
              >
                <Trash2 aria-hidden className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className={`${buttonClass} mt-3`}
        onClick={() => setRows((current) => [...current, { ...blank, _key: nextKey.current++ }])}
      >
        <Plus aria-hidden className="size-4" />
        {addLabel}
      </button>
      {errors[name] && <p className="mt-1 text-xs text-accent">{errors[name]}</p>}
    </fieldset>
  );
}

// ---------- Dialogs and row actions ----------

/** A button that opens a form in a modal, and closes it when the form saves. */
export function FormDialog({
  trigger,
  title,
  primary,
  children,
}: {
  trigger: ReactNode;
  title: string;
  primary?: boolean;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  // Remounting the contents on each open clears any earlier errors
  return (
    <>
      <button
        type="button"
        className={primary ? primaryButtonClass : buttonClass}
        onClick={() => {
          setOpen(true);
          dialog.current?.showModal();
        }}
      >
        {trigger}
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        className="m-auto max-h-[90vh] w-[min(36rem,92vw)] border border-line bg-canvas p-5 text-fg backdrop:bg-fg/60"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-xl tracking-tight">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            className="flex size-10 shrink-0 items-center justify-center"
            onClick={() => dialog.current?.close()}
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <DialogContext.Provider value={() => dialog.current?.close()}>
          {open && children}
        </DialogContext.Provider>
      </dialog>
    </>
  );
}

/** Runs a row action with a toast. With `confirm`, it asks first. */
export function ActionButton({
  action,
  children,
  label,
  confirm,
  disabled,
}: {
  action: () => Promise<ActionState>;
  children: ReactNode;
  label?: string;
  confirm?: string;
  disabled?: boolean;
}) {
  const toast = useToast();
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);

  const run = async () => {
    setPending(true);
    try {
      const result = await action();
      if (result.message) toast(result.message, result.ok);
    } catch {
      toast("Something went wrong. Nothing was changed.", false);
    } finally {
      setPending(false);
      dialog.current?.close();
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={label}
        disabled={pending || disabled}
        onClick={() => (confirm ? dialog.current?.showModal() : run())}
        className={`${buttonClass} min-h-9 px-3`}
      >
        {children}
      </button>
      {confirm && (
        <dialog
          ref={dialog}
          className="m-auto w-[min(26rem,92vw)] border border-line bg-canvas p-5 text-fg backdrop:bg-fg/60"
        >
          <p className="leading-relaxed">{confirm}</p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className={buttonClass} onClick={() => dialog.current?.close()}>
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={run}
              className="inline-flex min-h-10 items-center justify-center border border-signal px-4 text-sm text-accent transition-colors hover:bg-signal hover:text-canvas disabled:opacity-50"
            >
              {pending ? "Working" : "Confirm"}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
