"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { submitInquiry } from "@/actions/inquiry";
import {
  budgetOptions,
  inquirySchema,
  timelineOptions,
  type Currency,
  type InquiryState,
  type InquiryValues,
} from "@/schemas/inquiry";

const inputClass =
  "min-h-12 w-full border-b border-paper/40 bg-transparent py-2 text-lg outline-none transition-colors placeholder:text-muted focus:border-lime aria-invalid:border-red-400";

const countries = [
  "Bangladesh",
  "Australia",
  "Canada",
  "Germany",
  "India",
  "Saudi Arabia",
  "Singapore",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
];

type FieldProps = {
  label: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

function Field({ label, error, optional, className = "", children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="slate text-muted">
        {label}
        {optional && <span className="ml-2 text-muted normal-case">Optional</span>}
      </label>
      {children({ id, describedBy: error ? errorId : undefined, invalid: Boolean(error) })}
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

function Select({
  options,
  placeholder,
  registration,
  ...props
}: ComponentProps<"select"> & {
  options: readonly { id: string; label: string }[];
  placeholder: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <select
      {...props}
      {...registration}
      className={`${inputClass} -ml-1 w-[calc(100%+0.25rem)] cursor-pointer`}
    >
      <option value="" className="bg-surface">
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.id} value={option.id} className="bg-surface">
          {option.label}
        </option>
      ))}
    </select>
  );
}

const initialState: InquiryState = { status: "idle" };

type Option = { id: string; label: string };

export function ContactForm({
  services,
  defaultService = "",
}: {
  services: Option[];
  defaultService?: string;
}) {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState);
  const formElement = useRef<HTMLFormElement>(null);
  const startedAt = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      country: "",
      service: services.some((option) => option.id === defaultService) ? defaultService : "",
      currency: "USD",
      budget: "",
      timeline: "",
      description: "",
      referenceUrl: "",
    },
  });

  const currency = useWatch({ control, name: "currency" }) as Currency;

  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);

  // A saved inquiry clears the form, so a second click can't send it twice
  useEffect(() => {
    if (state.status === "saved") reset();
  }, [state, reset]);

  // Browser errors first; the server's own verdict fills in anything the browser let through
  const serverErrors = state.status === "invalid" ? state.fieldErrors : {};
  const errorFor = (field: keyof InquiryValues) =>
    errors[field]?.message ?? serverErrors[field] ?? undefined;

  return (
    <form
      ref={formElement}
      action={formAction}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit(() => {
          if (!formElement.current) return;
          const data = new FormData(formElement.current);
          startTransition(() => formAction(data));
        })(event);
      }}
      className="grid gap-x-6 gap-y-8 sm:grid-cols-2"
    >
      {/* Spam traps: invisible to people, tempting to bots */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input ref={startedAt} type="hidden" name="startedAt" />

      <Field label="Full name" error={errorFor("fullName")}>
        {({ id, describedBy, invalid }) => (
          <input
            id={id}
            type="text"
            autoComplete="name"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={inputClass}
            {...register("fullName")}
          />
        )}
      </Field>

      <Field label="Email" error={errorFor("email")}>
        {({ id, describedBy, invalid }) => (
          <input
            id={id}
            type="email"
            autoComplete="email"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={inputClass}
            {...register("email")}
          />
        )}
      </Field>

      <Field label="Company name" optional error={errorFor("company")}>
        {({ id, describedBy, invalid }) => (
          <input
            id={id}
            type="text"
            autoComplete="organization"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={inputClass}
            {...register("company")}
          />
        )}
      </Field>

      <Field label="Country" error={errorFor("country")}>
        {({ id, describedBy, invalid }) => (
          <>
            <input
              id={id}
              type="text"
              list="country-options"
              autoComplete="country-name"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={inputClass}
              {...register("country")}
            />
            <datalist id="country-options">
              {countries.map((country) => (
                <option key={country} value={country} />
              ))}
            </datalist>
          </>
        )}
      </Field>

      <Field label="Preferred service" error={errorFor("service")}>
        {({ id, describedBy, invalid }) => (
          <Select
            id={id}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            options={services}
            placeholder="Choose a service"
            registration={register("service")}
          />
        )}
      </Field>

      <Field label="Project timeline" error={errorFor("timeline")}>
        {({ id, describedBy, invalid }) => (
          <Select
            id={id}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            options={timelineOptions}
            placeholder="Choose a timeline"
            registration={register("timeline")}
          />
        )}
      </Field>

      <fieldset className="sm:col-span-2">
        <legend className="slate text-muted">Project budget</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-6">
          <div className="flex gap-1">
            {(Object.keys(budgetOptions) as Currency[]).map((code) => (
              <label
                key={code}
                className={`slate flex min-h-12 min-w-16 cursor-pointer items-center justify-center border transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-lime ${
                  currency === code
                    ? "border-lime bg-lime text-ink"
                    : "border-line text-paper hover:border-paper"
                }`}
              >
                <input
                  type="radio"
                  value={code}
                  className="sr-only"
                  {...register("currency", {
                    onChange: () => setValue("budget", ""),
                  })}
                />
                {code}
              </label>
            ))}
          </div>
          <Field label="Budget range" error={errorFor("budget")} className="[&>label]:sr-only">
            {({ id, describedBy, invalid }) => (
              <Select
                id={id}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                options={budgetOptions[currency]}
                placeholder="Choose a range"
                registration={register("budget")}
              />
            )}
          </Field>
        </div>
      </fieldset>

      <Field label="Project description" error={errorFor("description")} className="sm:col-span-2">
        {({ id, describedBy, invalid }) => (
          <textarea
            id={id}
            rows={5}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            placeholder="What are you making, who is it for, and what would success look like?"
            className={`${inputClass} resize-y`}
            {...register("description")}
          />
        )}
      </Field>

      <Field
        label="Reference link"
        optional
        error={errorFor("referenceUrl")}
        className="sm:col-span-2"
      >
        {({ id, describedBy, invalid }) => (
          <input
            id={id}
            type="url"
            inputMode="url"
            placeholder="https://"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={inputClass}
            {...register("referenceUrl")}
          />
        )}
      </Field>

      <div className="sm:col-span-2" aria-live="polite">
        {state.status === "saved" && (
          <p role="status" className="mb-6 border border-lime p-4 leading-relaxed">
            <strong className="font-medium text-lime">Thank you, we have your inquiry.</strong> The
            team will read it and reply to the email you gave.
          </p>
        )}
        {state.status === "error" && (
          <p role="alert" className="mb-6 border border-red-400 p-4 leading-relaxed">
            Something went wrong on our side, and your inquiry was not sent. Please try again.
          </p>
        )}
        {state.status === "rate_limited" && (
          <p role="alert" className="mb-6 border border-red-400 p-4 leading-relaxed">
            That&rsquo;s a lot of messages in a short time. Please try again in a few minutes.
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="group flex min-h-14 w-full items-center justify-between gap-6 bg-lime px-5 font-medium text-ink transition-colors duration-300 hover:bg-paper disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:min-w-72"
        >
          {pending ? "Sending" : "Send inquiry"}
          {pending ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <ArrowUpRight
              aria-hidden
              className="size-4 transition-transform duration-500 ease-studio group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          )}
        </button>
      </div>
    </form>
  );
}

/** Preselects the service when arriving from a service page. Must sit inside Suspense. */
export function ContactFormFromUrl({ services }: { services: Option[] }) {
  const params = useSearchParams();
  return <ContactForm services={services} defaultService={params.get("service") ?? ""} />;
}
