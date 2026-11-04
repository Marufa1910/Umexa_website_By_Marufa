import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSiteSettings } from "@/lib/data/public";

export default async function WebsiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { logoUrl } = await getSiteSettings();

  return (
    <>
      <SmoothScroll />
      <a
        href="#main"
        className="fixed top-2 left-2 z-[60] -translate-y-20 bg-lime px-4 py-3 text-sm font-medium text-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header logoUrl={logoUrl} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
