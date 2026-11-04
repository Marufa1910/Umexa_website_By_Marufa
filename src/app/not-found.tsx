import { Logo } from "@/components/layout/Logo";
import { NotFoundMessage } from "@/components/layout/NotFoundMessage";

export default function NotFound() {
  return (
    <main className="gutter flex min-h-dvh flex-col justify-between py-6">
      <Logo />
      <NotFoundMessage />
      <span />
    </main>
  );
}
