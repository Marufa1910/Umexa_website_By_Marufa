import { Button } from "@/components/ui/Button";
import { HeroVisual } from "./HeroVisual";

const lines = [
  { text: "We turn bold", className: "" },
  { text: "ideas into", className: "pl-[9vw]" },
  { text: "powerful visual", className: "" },
  { text: "experiences.", className: "pl-[18vw] accent-serif text-accent", serif: true },
];

export function Hero() {
  return (
    <section className="gutter relative flex min-h-svh flex-col justify-between overflow-clip bg-surface pt-24 pb-6 lg:pt-28">
      <HeroVisual />

      <div className="relative">
        <p className="settle slate mb-5 flex justify-between text-muted lg:mb-7">
          <span>Creative production studio</span>
          <span className="hidden sm:block">Bangladesh / Worldwide</span>
        </p>
        <h1 className="display text-display">
          {lines.map((line, i) => (
            <span key={line.text} className={`line-mask ${line.className}`}>
              <span
                className={`rise ${line.serif ? "text-[1.08em] leading-[0.87]" : ""}`}
                style={{ "--i": i } as React.CSSProperties}
              >
                {line.text}
              </span>{" "}
            </span>
          ))}
        </h1>
      </div>

      <div className="relative mt-12 grid gap-8 md:grid-cols-12 md:items-end">
        <p
          aria-hidden
          className="settle slate hidden text-muted md:col-span-5 md:block"
          style={{ "--i": 7 } as React.CSSProperties}
        >
          Scroll to roll
        </p>
        <div
          className="settle md:col-span-7 lg:col-span-5 lg:col-start-8"
          style={{ "--i": 5 } as React.CSSProperties}
        >
          <p className="max-w-lg text-lg leading-snug text-fg/85 lg:text-xl">
            We combine creative thinking, design and technology to help ambitious brands stand out
            and move forward.
          </p>
          <div className="mt-6 flex flex-col flex-wrap gap-2 sm:flex-row">
            <Button href="/contact" className="sm:flex-1">
              Start a project
            </Button>
            <Button href="/work" variant="ghost" className="sm:flex-1">
              See the work
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
