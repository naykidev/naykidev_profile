import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { skills } from "@/data/skills";
import { Reveal, SectionHeading } from "./Reveal";
import { useClassicMotion } from "./motion";

export function SkillsCloud() {
  const { reduce } = useClassicMotion();
  const [active, setActive] = useState<string | null>(skills[0]?.id ?? null);
  const flat = useMemo(
    () =>
      skills.flatMap((group) =>
        group.items.map((item) => ({ item, group: group.title, groupId: group.id })),
      ),
    [],
  );
  const activeGroup = skills.find((g) => g.id === active) ?? skills[0];

  return (
    <section className="border-b border-white/10 px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading eyebrow="Craft" title="Skills">
            Tap a group to focus — tags come straight from the skills data module.
          </SectionHeading>
        </Reveal>
        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Skill groups">
          {skills.map((group) => {
            const selected = active === group.id;
            return (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(group.id)}
                className={`rounded-full px-3 py-1.5 font-ui text-[11px] tracking-[0.12em] uppercase transition ${
                  selected
                    ? "border border-sand/50 bg-sand/20 text-sand"
                    : "border border-white/12 text-paper/70 hover:text-paper"
                }`}
              >
                {group.title}
              </button>
            );
          })}
        </div>
        <p className="mb-5 font-ui text-sm text-paper/60">{activeGroup?.object}</p>
        <ul className="flex flex-wrap gap-2.5" aria-live="polite">
          {flat.map(({ item, groupId }, i) => {
            const dim = active !== null && groupId !== active;
            return (
              <motion.li
                key={`${groupId}-${item}`}
                layout={!reduce}
                animate={{
                  opacity: dim ? 0.28 : 1,
                  scale: dim ? 0.96 : 1,
                }}
                transition={{ duration: reduce ? 0 : 0.25, delay: reduce ? 0 : i * 0.01 }}
                className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 font-ui text-sm text-paper/90"
              >
                {item}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
