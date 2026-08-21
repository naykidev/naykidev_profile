import { LayoutGroup, motion } from "framer-motion";
import { useMemo, useState } from "react";
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
  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) for (const t of p.technologies) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  /** Multi-select: empty set = show all; otherwise OR — any selected tech matches. */
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (tag: string) => {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const visible = useMemo(() => {
    if (selected.length === 0) return projects;
    return projects.filter((p) => selected.some((tag) => p.technologies.includes(tag)));
  }, [projects, selected]);

  const lead = visible.find((p) => p.id === "weather-report") ?? visible[0];
  const rest = visible.filter((p) => p.id !== lead?.id);

  return (
    <section id="projects" className="scroll-mt-24 border-b border-white/10 px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading eyebrow="Work" title="Projects">
            Multi-select technology chips from each project&apos;s <code className="text-sand">technologies</code>{" "}
            field. Empty selection shows everything.
          </SectionHeading>
        </Reveal>

        <div
          role="toolbar"
          aria-label="Filter projects by technology"
          className="mb-10 flex flex-wrap gap-2"
        >
          {tags.map((tag) => {
            const active = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(tag)}
                className={`rounded-full px-3 py-1.5 font-ui text-[11px] tracking-[0.12em] uppercase transition ${
                  active
                    ? "border border-sand/50 bg-sand/20 text-sand"
                    : "border border-white/12 text-paper/70 hover:border-white/25 hover:text-paper"
                }`}
              >
                {tag}
              </button>
            );
          })}
          {selected.length > 0 ? (
            <button
              type="button"
              onClick={() => setSelected([])}
              className="rounded-full px-3 py-1.5 font-ui text-[11px] tracking-[0.12em] text-paper/50 uppercase underline-offset-2 hover:text-paper hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>

        <LayoutGroup>
          {lead ? (
            <Reveal>
              <motion.article
                layout={!reduce}
                className="group mb-12 grid items-center gap-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 lg:grid-cols-2"
                whileHover={reduce ? undefined : { borderColor: "rgba(196,165,116,0.35)" }}
                transition={{ layout: { duration: reduce ? 0 : 0.35 } }}
              >
                {lead.photo || lead.portrait ? (
                  <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
                    <motion.img
                      layout={!reduce}
                      src={lead.photo ?? lead.portrait}
                      alt={lead.photoAlt ?? lead.name}
                      className="aspect-[16/10] w-full object-cover"
                      whileHover={reduce ? undefined : { scale: 1.04 }}
                      transition={{ duration: 0.45 }}
                    />
                  </div>
                ) : null}
                <div>
                  {lead.context ? (
                    <p className="mb-2 font-ui text-[11px] tracking-[0.18em] text-sand uppercase">
                      {lead.context}
                    </p>
                  ) : null}
                  <h3 className="font-display text-3xl text-paper">{lead.name}</h3>
                  <p className="mt-3 font-ui text-[15px] leading-7 text-paper/80">{lead.summary}</p>
                  <TechPills items={lead.technologies} />
                  <OutLinks links={lead.links} />
                </div>
              </motion.article>
            </Reveal>
          ) : (
            <p className="font-ui text-sm text-paper/60">No projects match these filters.</p>
          )}

          <motion.ul layout={!reduce} className="grid gap-4 sm:grid-cols-2">
            {rest.map((piece, i) => (
              <Reveal key={piece.id} delay={i * 0.05}>
                <motion.li
                  layout={!reduce}
                  className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-sand/35 hover:bg-sand/[0.06]"
                >
                  {piece.context ? (
                    <p className="mb-1 font-ui text-[10px] tracking-[0.16em] text-paper/45 uppercase">
                      {piece.context}
                    </p>
                  ) : null}
                  <h3 className="font-display text-2xl text-paper">{piece.name}</h3>
                  <p className="mt-2 font-ui text-sm leading-6 text-paper/70">{piece.summary}</p>
                  <TechPills items={piece.technologies} />
                  <OutLinks links={piece.links} />
                </motion.li>
              </Reveal>
            ))}
          </motion.ul>
        </LayoutGroup>
      </div>
    </section>
  );
}
