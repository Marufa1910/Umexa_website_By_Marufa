import { Reveal } from "@/components/animations/Reveal";
import { SectionSlate } from "@/components/ui/SectionSlate";
import { ScrubText } from "./ScrubText";

const notes = [
  {
    title: "Our story",
    copy: "Movexa was built around one frustration: great ideas lose their edge every time they are passed between separate vendors. So we put them under one roof.",
  },
  {
    title: "What we believe",
    copy: "Good creative work is clear before it is clever. If an idea cannot survive a six-second cut or a phone screen, it isn't finished yet.",
  },
  {
    title: "Where we fit",
    copy: "A production partner for brands in Bangladesh and abroad, for startups, e-commerce teams, corporates and the agencies that need extra hands.",
  },
];

export function AgencyIntro() {
  return (
    <section className="gutter py-24 lg:py-40">
      <SectionSlate index="03" label="The studio" />
      <ScrubText
        className="mt-8 max-w-[22ch] font-display text-lede leading-[1.06] font-medium tracking-[-0.035em] md:max-w-[26ch] lg:ml-[calc(100%/3)] lg:max-w-[24ch]"
        text="Most brands don't have a visibility problem. They have a sameness problem. We make the work that fixes it."
      />
      <Reveal className="mt-16 grid gap-10 border-t border-line pt-8 md:grid-cols-3 md:gap-8 lg:mt-28">
        {notes.map((note) => (
          <div key={note.title} data-reveal>
            <h3 className="slate text-lime">{note.title}</h3>
            <p className="mt-4 max-w-md leading-relaxed text-paper/80">{note.copy}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
