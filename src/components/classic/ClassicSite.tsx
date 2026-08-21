import { achievements } from "@/data/achievements";
import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { galleryPieces } from "@/data/projects";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { useTouchUi } from "@/hooks/useCoarsePointer";
import { navigate } from "@/lib/appRoute";
import { useEffect, type ReactNode } from "react";

const nav = [
  { href: "#about", label: "About", full: "About Me" },
  { href: "#projects", label: "Projects", full: "Projects" },
  { href: "#awards", label: "Awards", full: "Awards & Certificates" },
  { href: "#resume", label: "Resume", full: "Resume" },
] as const;

/** Axol / research story lives in the 3D campus panels — not on the classic site. */
const CLASSIC_PROJECT_SKIP = new Set(["accessibility-surfer", "axol-assist", "axol-work"]);


function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 max-w-2xl sm:mb-10">
      {eyebrow ? (
        <p className="mb-2 font-ui text-[11px] tracking-[0.22em] text-sand uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-3xl font-semibold tracking-wide text-paper sm:text-4xl">{title}</h2>
      {children ? <p className="mt-3 font-ui text-[15px] leading-7 text-paper/75">{children}</p> : null}
    </header>
  );
}

function TechPills({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
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

function OutLinks({
  links,
}: {
  links?: readonly { label: string; href: string }[];
}) {
  if (!links?.length) return null;
  return (
    <div className="mt-5 flex flex-wrap gap-3">
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

export function ClassicSite() {
  const touchUi = useTouchUi();
  const awards = achievements.filter((item) => item.kind === "award");
  const certificates = achievements.filter((item) => item.kind === "certificate");
  const classicProjects = galleryPieces.filter((p) => !CLASSIC_PROJECT_SKIP.has(p.id));
  const featured = classicProjects.filter((p) =>
    ["weather-report", "surf-del-mar", "freddy-takes-flight", "dodo"].includes(p.id),
  );

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, []);

  return (
    <div className="classic-site min-h-dvh bg-ink text-paper">
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-md focus:bg-paper focus:px-3 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#top" className="font-display text-lg font-semibold tracking-wide text-paper">
            {profile.name}
          </a>
          <nav aria-label="Classic site" className="flex flex-wrap items-center gap-1 sm:gap-2">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-2.5 py-1.5 font-ui text-[10px] tracking-[0.14em] text-paper/80 uppercase transition hover:bg-white/8 hover:text-paper sm:text-[11px]"
              >
                <span className="sm:hidden">{item.label}</span>
                <span className="hidden sm:inline">{item.full}</span>
              </a>
            ))}
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-2.5 py-1.5 font-ui text-[10px] tracking-[0.14em] text-paper/80 uppercase transition hover:bg-white/8 hover:text-paper sm:text-[11px]"
            >
              <span className="sm:hidden">Link</span>
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
            {!touchUi ? (
              <button
                type="button"
                onClick={() => navigate("/")}
                className="ml-1 rounded-full border border-sand/40 px-3 py-1.5 font-ui text-[10px] tracking-[0.14em] text-sand uppercase transition hover:border-sand hover:bg-sand/10 sm:text-[11px]"
              >
                Back to 3D tour
              </button>
            ) : null}
          </nav>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(196,165,116,0.22), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 30%, rgba(63,106,76,0.18), transparent 50%)",
            }}
          />
          <div className="relative mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="mb-3 font-ui text-[11px] tracking-[0.28em] text-sand uppercase">
                {profile.locationPath}
              </p>
              <h1 className="font-display text-4xl leading-[1.1] font-semibold tracking-wide sm:text-6xl">
                {profile.name}
              </h1>
              <p className="mt-4 font-ui text-sm tracking-[0.12em] text-paper/80 uppercase sm:text-base">
                {profile.headline}
              </p>
              <p className="mt-6 max-w-xl font-display text-2xl leading-snug text-paper/90 italic sm:text-3xl">
                “{profile.quote}”
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
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
              </div>
            </div>
            <figure className="justify-self-center lg:justify-self-end">
              <img
                src={profile.photo}
                alt={profile.name}
                className="h-56 w-56 rounded-full object-cover shadow-[0_24px_60px_rgba(0,0,0,0.45)] ring-1 ring-white/15 sm:h-72 sm:w-72"
              />
            </figure>
          </div>
        </section>

        {/* About */}
        <section id="about" className="scroll-mt-24 border-b border-white/10 px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <SectionHeading eyebrow="About" title="About me">
              {profile.tagline}
            </SectionHeading>
            <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr]">
              <div className="space-y-4 font-ui text-[15px] leading-7 text-paper/88">
                {profile.intro.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
              <aside className="space-y-8">
                <div>
                  <h3 className="mb-3 font-ui text-[11px] tracking-[0.2em] text-sand uppercase">Education</h3>
                  <ul className="space-y-5">
                    {education.map((entry) => (
                      <li key={entry.id}>
                        <p className="font-display text-xl text-paper">{entry.institution}</p>
                        <p className="mt-1 font-ui text-sm text-paper/70">
                          {entry.program} · {entry.dates}
                        </p>
                        <p className="font-ui text-sm text-paper/55">{entry.location}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 font-ui text-[11px] tracking-[0.2em] text-sand uppercase">Skills</h3>
                  <div className="space-y-4">
                    {skills.map((group) => (
                      <div key={group.id}>
                        <p className="font-ui text-sm font-medium text-paper">{group.title}</p>
                        <p className="mt-1 font-ui text-sm leading-6 text-paper/65">{group.items.join(" · ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Projects — varied rhythm */}
        <section id="projects" className="scroll-mt-24 border-b border-white/10 px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <SectionHeading eyebrow="Work" title="Projects">
              Selected builds from gallery pieces and product work.
            </SectionHeading>

            {/* Wide image + text */}
            {(() => {
              const lead = classicProjects.find((p) => p.id === "weather-report") ?? classicProjects[0];
              if (!lead) return null;
              return (
                <article className="mb-14 grid items-center gap-8 lg:grid-cols-2">
                  {lead.photo || lead.portrait ? (
                    <img
                      src={lead.photo ?? lead.portrait}
                      alt={lead.photoAlt ?? lead.name}
                      className="w-full rounded-xl object-cover ring-1 ring-white/10"
                    />
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
                </article>
              );
            })()}

            {/* Compact list of the rest */}
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {featured
                .filter((p) => p.id !== "weather-report")
                .concat(
                  classicProjects.filter(
                    (p) => !featured.some((f) => f.id === p.id) && p.id !== "weather-report",
                  ),
                )
                .map((piece) => (
                  <li key={piece.id} className="grid gap-3 py-6 sm:grid-cols-[1fr_auto] sm:items-start">
                    <div>
                      {piece.context ? (
                        <p className="mb-1 font-ui text-[10px] tracking-[0.16em] text-paper/45 uppercase">
                          {piece.context}
                        </p>
                      ) : null}
                      <h3 className="font-display text-2xl text-paper">{piece.name}</h3>
                      <p className="mt-2 max-w-2xl font-ui text-sm leading-6 text-paper/70">{piece.summary}</p>
                      <TechPills items={piece.technologies} />
                    </div>
                    <OutLinks links={piece.links} />
                  </li>
                ))}
            </ul>
          </div>
        </section>

        {/* Experience strip */}
        <section className="border-b border-white/10 px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 font-ui text-[11px] tracking-[0.22em] text-sand uppercase">Experience</h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {experience.map((entry) => (
                <li key={entry.id}>
                  <p className="font-display text-xl text-paper">{entry.title}</p>
                  <p className="mt-1 font-ui text-xs tracking-[0.12em] text-paper/50 uppercase">{entry.org}</p>
                  <p className="mt-2 font-ui text-sm leading-6 text-paper/70">{entry.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Awards */}
        <section id="awards" className="scroll-mt-24 border-b border-white/10 bg-[#221c17] px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <SectionHeading eyebrow="Recognition" title="Awards & Certificates" />
            {awards.length > 0 ? (
              <div className="mb-12">
                <h3 className="mb-4 font-ui text-[11px] tracking-[0.2em] text-sand uppercase">Awards</h3>
                <ul className="space-y-6">
                  {awards.map((item) => (
                    <li key={item.id} className="max-w-3xl">
                      <p className="font-display text-2xl text-paper">{item.title}</p>
                      <p className="mt-1 font-ui text-sm text-paper/60">
                        {item.issuer} · {item.date}
                        {item.associated ? ` · ${item.associated}` : ""}
                      </p>
                      <p className="mt-2 font-ui text-sm leading-6 text-paper/75">{item.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div>
              <h3 className="mb-4 font-ui text-[11px] tracking-[0.2em] text-sand uppercase">Certificates</h3>
              <ul className="grid gap-6 sm:grid-cols-2">
                {certificates.map((item) => (
                  <li key={item.id} className="border border-white/10 bg-ink/40 p-5">
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
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Resume */}
        <section id="resume" className="scroll-mt-24 border-b border-white/10 px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <SectionHeading eyebrow="Documents" title="Resume">
              Download the latest PDF, or open it in a new tab.
            </SectionHeading>
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
            <div className="mt-8 hidden overflow-hidden rounded-xl ring-1 ring-white/10 sm:block">
              <object
                data={profile.resume}
                type="application/pdf"
                className="h-[min(70vh,52rem)] w-full bg-white"
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

        {/* Links / contact */}
        <section id="links" className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <SectionHeading eyebrow="Contact" title="Links" />
            <ul className="space-y-4 font-ui text-[15px]">
              <li>
                <a href={`mailto:${profile.email}`} className="text-sand underline underline-offset-4">
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sand underline underline-offset-4"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={profile.resume} className="text-sand underline underline-offset-4">
                  Resume PDF
                </a>
              </li>
            </ul>
          </div>
        </section>
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
              Prefer the 3D campus tour?
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
