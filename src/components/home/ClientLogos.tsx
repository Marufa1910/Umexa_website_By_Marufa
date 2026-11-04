import Image from "next/image";
import { SampleTag } from "@/components/ui/SampleTag";
import { getFeaturedClients } from "@/lib/data/public";

export async function ClientLogos() {
  const clients = await getFeaturedClients();
  if (clients.length === 0) return null;

  const row = [...clients, ...clients];

  return (
    <section aria-label="Client logos" className="border-y border-line py-10 lg:py-14">
      <div className="gutter mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="slate text-muted">Brands we work with</p>
        {clients.some((client) => client.isSample) && (
          <SampleTag className="bg-surface-2">
            Sample names for layout only, not real clients
          </SampleTag>
        )}
      </div>
      <div className="marquee-host overflow-clip">
        <ul className="marquee flex w-max motion-reduce:w-full motion-reduce:flex-wrap">
          {row.map((client, i) => (
            <li
              key={`${client.name}-${i}`}
              aria-hidden={i >= clients.length}
              className="px-6 font-display text-3xl font-medium tracking-tight whitespace-nowrap text-muted/70 lg:px-12 lg:text-5xl motion-reduce:[&:nth-child(n+9)]:hidden"
            >
              {client.logoUrl ? (
                <span className="relative block h-10 w-36 lg:h-14 lg:w-48">
                  <Image
                    src={client.logoUrl}
                    alt={client.name}
                    fill
                    sizes="192px"
                    className="object-contain"
                  />
                </span>
              ) : (
                client.name
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
