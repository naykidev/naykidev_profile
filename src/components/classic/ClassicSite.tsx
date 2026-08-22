import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { achievements } from "@/data/achievements";
import { galleryPieces } from "@/data/projects";
import { profile } from "@/data/profile";
import { useTouchUi } from "@/hooks/useCoarsePointer";
import { navigate } from "@/lib/appRoute";
import { ClassicHeader, CLASSIC_NAV } from "./ClassicHeader";
import { ContactSection } from "./ContactSection";
import { ProjectGrid } from "./ProjectGrid";
import { Reveal, SectionHeading } from "./Reveal";
import { useClassicMotion } from "./motion";

function useActiveSection(ids: readonly string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "about");

  useEffect(() => {
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: [0.15, 0.35, 0.6] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

export function ClassicSite() {
  const touchUi = useTouchUi();
  const { reduce } = useClassicMotion();
  const sectionIds = CLASSIC_NAV.map((item) => item.id);
  const activeId = useActiveSection(sectionIds);
  const awards = achievements.filter((item) => item.kind === "award");
  const certificates = achievements.filter((item) => item.kind === "certificate");

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, []);

  return (
    <div className="classic-site relative min-h-dvh bg-ink text-paper">
      <div className="classic-grain pointer-events-none fixed inset-0 z-[1] opacity-[0.35]" aria-hidden />

      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-md focus:bg-paper focus:px-3 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>

      <div className="relative z-[2]">
        <ClassicHeader activeId={activeId} />

        <main id="top">
          <section className="relative overflow-hidden border-b border-white/10">
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 18% 0%, rgba(196,165,116,0.24), transparent 55%), radial-gradient(ellipse 70% 50% at 92% 28%, rgba(63,106,76,0.2), transparent 50%)",
              }}
              aria-hidden
            />
            <div className="relative mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <motion.p
                  className="mb-3 font-ui text-[11px] tracking-[0.28em] text-sand uppercase"
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.45 }}
                >
                  {profile.locationPath}
                </motion.p>
                <motion.h1
                  className="font-display text-4xl leading-[1.1] font-semibold tracking-wide sm:text-6xl"
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 0.06 }}
                >
                  {profile.name}
                </motion.h1>
                <motion.p
                  className="mt-4 font-ui text-sm tracking-[0.12em] text-paper/80 uppercase sm:text-base"
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.12 }}
                >
                  {profile.headline}
                </motion.p>
                <motion.p
                  className="mt-6 max-w-xl font-display text-2xl leading-snug text-paper/90 italic sm:text-3xl"
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 0.18 }}
                >
                  “{profile.quote}”
                </motion.p>
                <motion.div
                  className="mt-8 flex flex-wrap gap-3"
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.24 }}
                >
                  <a
                    href="#projects"
                    className="inline-flex min-h-11 items-center rounded-full border border-paper/25 bg-paper/10 px-5 font-ui text-xs tracking-[0.18em] uppercase transition hover:bg-paper/15"
                  >
                    See projects
                  </a>
                  <a
                    href="#resume"
                    className="inline-flex min-h-11 items-center rounded-full border border-sand/50 px-5 font-ui text-xs tracking-[0.18em] text-sand uppercase transition hover:bg-sand/10"
                  >
                    Resume
                  </a>
                  {!touchUi ? (
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="inline-flex min-h-11 items-center rounded-full border border-lawn/50 px-5 font-ui text-xs tracking-[0.18em] text-mist uppercase transition hover:bg-lawn/15"
                    >
                      Enter 3D Campus
                    </button>
                  ) : null}
                </motion.div>
              </div>
              <motion.figure
                className="justify-self-center lg:justify-self-end"
                initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.15 }}
              >
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="h-56 w-56 rounded-full object-cover shadow-[0_24px_60px_rgba(0,0,0,0.45)] ring-1 ring-white/15 sm:h-72 sm:w-72"
                />
              </motion.figure>
            </div>
          </section>

          <section id="about" className="scroll-mt-24 border-b border-white/10 px-4 py-14 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-5xl">
              <Reveal>
                <SectionHeading eyebrow="About" title="About me">
                  {profile.tagline}
                </SectionHeading>
              </Reveal>
              <Reveal delay={0.06}>
                <div className="max-w-3xl space-y-4 font-ui text-[15px] leading-7 text-paper/88">
                  {profile.intro.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          <ProjectGrid projects={galleryPieces} />

          <section
            id="awards"
            className="scroll-mt-24 border-b border-white/10 bg-[#221c17] px-4 py-14 sm:px-6 sm:py-16"
          >
            <div className="mx-auto max-w-5xl">
              <Reveal>
                <SectionHeading eyebrow="Recognition" title="Awards & Certificates" />
              </Reveal>
              {awards.length > 0 ? (
                <div className="mb-12">
                  <h3 className="mb-4 font-ui text-[11px] tracking-[0.2em] text-sand uppercase">Awards</h3>
                  <ul className="space-y-6">
                    {awards.map((item, i) => (
                      <Reveal key={item.id} delay={i * 0.04}>
                        <li className="max-w-3xl">
                          <p className="font-display text-2xl text-paper">{item.title}</p>
                          <p className="mt-1 font-ui text-sm text-paper/60">
                            {item.issuer} · {item.date}
                            {item.associated ? ` · ${item.associated}` : ""}
                          </p>
                          <p className="mt-2 font-ui text-sm leading-6 text-paper/75">{item.detail}</p>
                        </li>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div>
                <h3 className="mb-4 font-ui text-[11px] tracking-[0.2em] text-sand uppercase">
                  Certificates
                </h3>
                <ul className="grid gap-6 sm:grid-cols-2">
                  {certificates.map((item, i) => (
                    <Reveal key={item.id} delay={i * 0.04}>
                      <li className="border border-white/10 bg-ink/40 p-5 transition hover:border-sand/30">
                        {item.photo ? (
                          <img
                            src={item.photo}
                            alt={item.photoAlt ?? item.title}
                            className="mb-4 h-36 w-full object-contain bg-[#f4ece0]/5"
                          />
                        ) : null}
                        <p className="font-display text-xl text-paper">{item.title}</p>
                        <p className="mt-1 font-ui text-sm text-paper/60">
                          {item.issuer} · {item.date}
                        </p>
                        <p className="mt-2 font-ui text-sm leading-6 text-paper/70">{item.detail}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-block font-ui text-sm text-sand underline underline-offset-4"
                          >
                            Verify
                          </a>
                        ) : null}
                      </li>
                    </Reveal>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="resume" className="scroll-mt-24 border-b border-white/10 px-4 py-14 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-5xl">
              <Reveal>
                <SectionHeading eyebrow="Documents" title="Resume">
                  Download the latest PDF, or open it in a new tab.
                </SectionHeading>
              </Reveal>
              <Reveal delay={0.05}>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={profile.resume}
                    download
                    className="inline-flex min-h-11 items-center rounded-full border border-paper/25 bg-paper/10 px-5 font-ui text-xs tracking-[0.18em] uppercase transition hover:bg-paper/15"
                  >
                    Download PDF
                  </a>
                  <a
                    href={profile.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-full border border-sand/50 px-5 font-ui text-xs tracking-[0.18em] text-sand uppercase transition hover:bg-sand/10"
                  >
                    Open in new tab
                  </a>
                </div>
              </Reveal>
              <div className="mt-8 hidden rounded-xl ring-1 ring-white/10 sm:block">
                <object
                  data={`${profile.resume}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  type="application/pdf"
                  className="aspect-[8.5/11] w-full bg-white"
                  aria-label={`${profile.name} resume`}
                >
                  <p className="bg-ink p-6 font-ui text-sm text-paper/70">
                    PDF preview unavailable.{" "}
                    <a href={profile.resume} className="text-sand underline">
                      Open the resume
                    </a>
                    .
                  </p>
                </object>
              </div>
            </div>
          </section>

          <ContactSection />
        </main>

        <footer className="border-t border-white/10 px-4 py-8 sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-ui text-sm text-paper/50">
              © {new Date().getFullYear()} {profile.name}
            </p>
            {!touchUi ? (
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-left font-ui text-sm text-sand underline underline-offset-4"
              >
                Enter 3D Campus
              </button>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
