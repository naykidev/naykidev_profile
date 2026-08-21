import { Reveal, SectionHeading } from "./Reveal";
import { buildJourneyTimeline } from "./timeline";

export function JourneyTimeline() {
  const items = buildJourneyTimeline();
  return (
    <section id="journey" className="scroll-mt-24 border-b border-white/10 bg-[#221c17] px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading eyebrow="Path" title="Journey">
            Education and experience merged through a small normalizer — experience has no dates in
            data, so those rows are ordered between high school and UW without inventing labels.
          </SectionHeading>
        </Reveal>
        <ol className="relative space-y-0 border-l border-sand/35 pl-6 sm:pl-8">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.04}>
              <li className="relative pb-10 last:pb-0">
                <span
                  className="absolute top-1.5 -left-[1.9rem] h-3 w-3 rounded-full border-2 border-sand bg-ink sm:-left-[2.15rem]"
                  aria-hidden
                />
                <p className="font-ui text-[10px] tracking-[0.2em] text-sand uppercase">{item.kind}</p>
                <h3 className="mt-1 font-display text-2xl text-paper">{item.title}</h3>
                <p className="mt-1 font-ui text-sm text-paper/60">{item.meta}</p>
                <p className="mt-2 max-w-2xl font-ui text-sm leading-6 text-paper/75">{item.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
