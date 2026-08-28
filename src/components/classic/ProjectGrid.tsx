import { motion } from "framer-motion";
import type { GalleryPiece } from "@/data/projects";
import { AxolotlMascot } from "./AxolotlMascot";
import { Reveal, SectionHeading } from "./Reveal";
import { useClassicMotion } from "./motion";

const FLOATING_AXOL_IDS = new Set(["accessibility-surfer", "axol-work"]);

const CARD_STYLES = [
  "rounded-2xl rounded-br-md border-white/10",
  "rounded-xl rounded-tl-lg border-sunflower/15",
  "rounded-2xl rounded-bl-sm border-white/12",
  "rounded-xl rounded-tr-2xl border-white/10",
  "rounded-2xl border-sunflower/12",
  "rounded-xl rounded-br-2xl border-white/10",
];

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
          className="classic-link font-ui text-sm tracking-[0.04em]"
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
        <li key={item} className="classic-pill">
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

        <ul className="grid grid-cols-1 gap-10">
          {projects.map((piece, i) => {
            const imageRight = i % 2 === 1;
            const isAxolAssist = piece.id === "axol-assist";
            const isFloatingAxol = FLOATING_AXOL_IDS.has(piece.id);
            const cardStyle = CARD_STYLES[i % CARD_STYLES.length]!;
            return (
              <Reveal key={piece.id} delay={i * 0.04}>
                <motion.li
                  className={`relative flex flex-col items-center gap-6 overflow-hidden border bg-white/[0.03] p-4 sm:gap-8 sm:p-5 md:gap-10 ${cardStyle} ${
                    imageRight ? "md:flex-row-reverse" : "md:flex-row"
                  }`}
                  whileHover={
                    reduce
                      ? undefined
                      : {
                          borderColor: "rgba(252,191,73,0.4)",
                          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
                          y: -2,
                        }
                  }
                >
                  {isAxolAssist ? (
                    <div
                      className="pointer-events-none absolute -right-1 bottom-0 z-10 w-16 sm:w-20"
                      aria-hidden
                    >
                      <AxolotlMascot />
                    </div>
                  ) : null}
                  <div
                    className={`relative w-full shrink-0 overflow-hidden bg-ink/40 ring-1 ring-white/10 md:w-[38%] lg:w-[34%] ${
                      i % 3 === 0 ? "rounded-xl" : i % 3 === 1 ? "rounded-2xl rounded-tr-sm" : "rounded-lg rounded-bl-xl"
                    }`}
                  >
                    <img
                      src={piece.portrait}
                      alt={`${piece.name} gallery portrait`}
                      className="block h-auto w-full"
                    />
                  </div>
                  <div
                    className={`relative min-w-0 flex-1 px-1 sm:px-2 md:py-2 ${
                      isFloatingAxol ? "pr-14 sm:pr-16" : ""
                    }`}
                  >
                    {isFloatingAxol ? (
                      <div className="axolotl-float-lane axolotl-float-lane--text" aria-hidden>
                        <div
                          className={
                            reduce
                              ? "axolotl-float-lane__mascot"
                              : "axolotl-float-lane__mascot axolotl-float--active"
                          }
                        >
                          <AxolotlMascot />
                        </div>
                      </div>
                    ) : null}
                    {piece.context ? (
                      <p className="mb-1 font-ui text-[10px] tracking-[0.16em] text-paper/45 uppercase">
                        {piece.context}
                      </p>
                    ) : null}
                    <h3 className="font-display text-2xl font-semibold text-paper sm:text-3xl">{piece.name}</h3>
                    <p className="mt-2 font-ui text-sm font-light leading-6 text-paper/75 sm:text-[15px] sm:leading-7">
                      {piece.summary}
                    </p>
                    <TechPills items={piece.technologies} />
                    <OutLinks links={piece.links} />
                  </div>
                </motion.li>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
