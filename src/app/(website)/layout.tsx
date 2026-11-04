import { PageTransition } from "@/components/animations/PageTransition";
import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StructuredData } from "@/components/layout/StructuredData";
import { getSiteSettings } from "@/lib/data/public";

export default async function WebsiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();

  return (
    <>
      <StructuredData settings={settings} />
      <SmoothScroll />
      <PageTransition />
      <a
        href="#main"
        className="fixed top-2 left-2 z-[60] -translate-y-20 bg-signal px-4 py-3 text-sm font-medium text-canvas focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header logoUrl={settings.logoUrl} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
