import { motion } from "framer-motion";
import type { GalleryPiece } from "@/data/projects";
import { Reveal, SectionHeading } from "./Reveal";
import { useClassicMotion } from "./motion";

function OutLinks({ links }: { links?: readonly { label: string; href: string }[] }) {
  if (!links?.length) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.href + link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="font-ui text-sm tracking-[0.04em] text-sand underline decoration-sand/40 underline-offset-4 transition hover:text-paper hover:decoration-paper/50"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

function TechPills({ items }: { items: readonly string[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-ui text-xs text-paper/85"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ProjectGrid({ projects }: { projects: GalleryPiece[] }) {
  const { reduce } = useClassicMotion();

  return (
    <section id="projects" className="scroll-mt-24 border-b border-white/10 px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading eyebrow="Work" title="Projects">
            Gallery portraits from the campus tour — the same frames you walk past in 3D.
          </SectionHeading>
        </Reveal>

        <ul className="grid grid-cols-1 gap-8">
          {projects.map((piece, i) => (
            <Reveal key={piece.id} delay={i * 0.04}>
              <motion.li
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-sand/35 hover:bg-sand/[0.06]"
                whileHover={reduce ? undefined : { borderColor: "rgba(196,165,116,0.35)" }}
              >
                <div className="bg-ink/40 ring-1 ring-inset ring-white/10">
                  <img
                    src={piece.portrait}
                    alt={`${piece.name} gallery portrait`}
                    className="block h-auto w-full"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  {piece.context ? (
                    <p className="mb-1 font-ui text-[10px] tracking-[0.16em] text-paper/45 uppercase">
                      {piece.context}
                    </p>
                  ) : null}
                  <h3 className="font-display text-2xl text-paper sm:text-3xl">{piece.name}</h3>
                  <p className="mt-2 font-ui text-sm leading-6 text-paper/70 sm:text-[15px] sm:leading-7">
                    {piece.summary}
                  </p>
                  <TechPills items={piece.technologies} />
                  <OutLinks links={piece.links} />
                </div>
              </motion.li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
