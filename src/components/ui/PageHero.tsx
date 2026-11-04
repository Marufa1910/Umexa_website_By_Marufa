import type { CSSProperties, ReactNode } from "react";
import { SectionSlate } from "./SectionSlate";

type Props = {
  index: string;
  label: string;
  /** Each entry is one line of the headline, and rises in on its own */
  lines: ReactNode[];
  intro?: ReactNode;
  children?: ReactNode;
};

export function PageHero({ index, label, lines, intro, children }: Props) {
  return (
    <section className="gutter pt-28 pb-14 lg:pt-36 lg:pb-20">
      <div className="settle">
        <SectionSlate index={index} label={label} />
      </div>
      <h1 className="display mt-6 text-display lg:mt-8">
        {lines.map((line, i) => (
          <span key={i} className="line-mask">
            <span className="rise" style={{ "--i": i } as CSSProperties}>
              {line}
            </span>{" "}
          </span>
        ))}
      </h1>
      {intro && (
        <div
          className="settle mt-8 grid md:grid-cols-12 lg:mt-12"
          style={{ "--i": lines.length + 1 } as CSSProperties}
        >
          <p className="max-w-2xl text-lg leading-snug text-paper/85 md:col-span-9 md:col-start-4 lg:text-2xl lg:leading-snug">
            {intro}
          </p>
        </div>
      )}
      {children}
    </section>
  );
}
