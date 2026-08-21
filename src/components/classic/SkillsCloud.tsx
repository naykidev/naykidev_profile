import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { GalleryPiece } from "@/data/projects";
import { skills } from "@/data/skills";
import { Reveal, SectionHeading } from "./Reveal";
import { useClassicMotion } from "./motion";

/** Loose match between a skill label and project.technologies (shapes don't share IDs). */
export function skillMatchesProject(skill: string, project: GalleryPiece): boolean {
  const s = skill.toLowerCase();
  const parts = s.split(/[\s/+,]+/).filter((p) => p.length > 2);
  return project.technologies.some((tech) => {
    const t = tech.toLowerCase();
    if (t === s || t.includes(s) || s.includes(t)) return true;
    return parts.some((part) => t.includes(part));
  });
}

export function SkillsCloud({ projects }: { projects: GalleryPiece[] }) {
  const { reduce } = useClassicMotion();
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const flat = useMemo(
    () =>
      skills.flatMap((group) =>
        group.items.map((item) => ({ item, group: group.title, groupId: group.id })),
      ),
    [],
  );

  const related = useMemo(() => {
    if (!activeSkill) return [];
    return projects.filter((p) => skillMatchesProject(activeSkill, p));
  }, [activeSkill, projects]);

  return (
    <section className="border-b border-white/10 px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading eyebrow="Craft" title="Skills">
            Hover or tap a tag to emphasize related projects (matched against{" "}
            <code className="text-sand">technologies</code>). No proficiency numbers.
          </SectionHeading>
        </Reveal>

        <ul className="flex flex-wrap gap-2.5" aria-label="Skills">
          {flat.map(({ item, groupId }) => {
            const selected = activeSkill === item;
            const dim = activeSkill !== null && !selected;
            return (
              <motion.li key={`${groupId}-${item}`} layout={!reduce}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onMouseEnter={() => setActiveSkill(item)}
                  onFocus={() => setActiveSkill(item)}
                  onClick={() => setActiveSkill((prev) => (prev === item ? null : item))}
                  className={`rounded-full border px-3.5 py-2 font-ui text-sm transition ${
                    selected
                      ? "border-sand/55 bg-sand/20 text-sand"
                      : "border-white/15 bg-white/[0.04] text-paper/90 hover:border-sand/35"
                  }`}
                  style={{ opacity: dim ? 0.32 : 1 }}
                >
                  {item}
                </button>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-6 min-h-[1.5rem]" aria-live="polite">
          {activeSkill ? (
            related.length > 0 ? (
              <p className="font-ui text-sm text-paper/70">
                Related projects:{" "}
                {related.map((p, i) => (
                  <span key={p.id}>
                    {i > 0 ? ", " : null}
                    <a href="#projects" className="text-sand underline underline-offset-4">
                      {p.name}
                    </a>
                  </span>
                ))}
              </p>
            ) : (
              <p className="font-ui text-sm text-paper/50">
                No classic-listed projects match “{activeSkill}” yet.
              </p>
            )
          ) : (
            <p className="font-ui text-sm text-paper/45">Select a skill to see related work.</p>
          )}
        </div>
      </div>
    </section>
  );
}
