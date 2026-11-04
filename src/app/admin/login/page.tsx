import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { Wordmark } from "@/components/layout/Logo";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="gutter mx-auto flex min-h-dvh max-w-md flex-col justify-center py-12">
      <Wordmark className="text-3xl" />
      <h1 className="mt-8 font-display text-2xl tracking-tight">Sign in to the admin</h1>
      <LoginForm />
    </main>
  );
}
