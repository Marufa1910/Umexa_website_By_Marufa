"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";

const inputClass =
  "min-h-12 w-full border-b border-fg/40 bg-transparent py-2 text-lg outline-none transition-colors focus:border-signal";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const { error: failure } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    if (failure) {
      setPending(false);
      // The same message for a wrong email or password, so accounts can't be discovered
      setError(
        failure.status === 429
          ? "Too many attempts. Please wait a minute and try again."
          : "That email and password don't match.",
      );
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="email" className="slate text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className="slate text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex min-h-13 w-full items-center justify-center gap-2 bg-signal font-medium text-canvas transition-colors hover:bg-fg disabled:cursor-wait disabled:opacity-70"
      >
        {pending && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
