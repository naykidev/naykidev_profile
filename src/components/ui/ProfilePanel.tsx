import type { JSX, ReactNode } from "react";
import { CloseButton } from "@/components/ui/CloseButton";
import { achievements } from "@/data/achievements";
import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { arcadeProjects, axolAssist } from "@/data/projects";
import { FramedCertificate } from "@/components/ui/FramedCertificate";
import { ProjectLinks, ProjectPhoto } from "@/components/ui/ProjectLinks";
import { profile } from "@/data/profile";
import { research } from "@/data/research";
import { skills } from "@/data/skills";
import type { PanelKind } from "@/data/locations";
import { useAppStore } from "@/systems/store";

function Shell({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  const closePanel = useAppStore((s) => s.closePanel);
  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
      data-look-block
      className="absolute inset-0 z-[65] flex h-full w-full max-w-none flex-col border-r border-paper/15 bg-[#1c1814]/90 px-5 pt-[max(3.75rem,calc(env(safe-area-inset-top)+2.75rem))] pb-[max(1.25rem,env(safe-area-inset-bottom))] text-paper backdrop-blur-[6px] sm:inset-auto sm:top-0 sm:left-0 sm:max-w-md sm:w-[28rem] sm:px-7 sm:pt-8 sm:pb-8"
    >
      <CloseButton onClick={closePanel} />
      <p className="font-ui text-[10px] tracking-[0.32em] text-paper/60 uppercase">
        {kicker}
      </p>
      <h2 id="panel-title" className="mt-2 pr-12 font-display text-3xl sm:text-4xl">
        {title}
      </h2>
      <div className="mt-6 flex-1 space-y-5 overflow-y-auto pr-1 font-ui text-sm leading-relaxed text-paper/85">
        {children}
      </div>
    </aside>
  );
}

function AboutPanel() {
  return (
    <Shell kicker="About Me" title={profile.name}>
      <img
        src={profile.photo}
        alt={`${profile.name} headshot`}
        className="h-36 w-36 rounded-full object-cover"
      />
      <p className="tracking-[0.14em] text-paper/70 uppercase">{profile.headline}</p>
      {profile.intro.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <ul className="grid grid-cols-1 gap-2">
        {profile.focus.map((item) => (
          <li key={item} className="border-l border-paper/30 pl-3">
            {item}
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function EducationPanel() {
  return (
    <Shell kicker="Bascom Hall" title="Education">
      {education.map((entry) => (
        <article key={entry.id} className="border-t border-paper/10 pt-4 first:border-0 first:pt-0">
          <h3 className="font-display text-2xl text-paper">{entry.institution}</h3>
          <p className="mt-1 text-paper/70">
            {entry.program} · {entry.dates}
          </p>
          <p className="text-paper/55">{entry.location}</p>
          <ul className="mt-3 space-y-2">
            {entry.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </article>
      ))}
    </Shell>
  );
}

function SkillsPanel() {
  return (
    <Shell kicker="Engineering Lab" title="At the bench">
      <p>Each station is a different way of making. Nothing here is a dump of keywords.</p>
      {skills.map((group) => (
        <article key={group.id}>
          <p className="text-[10px] tracking-[0.22em] text-paper/55 uppercase">
            {group.object}
          </p>
          <h3 className="font-display text-2xl">{group.title}</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <li key={item} className="border border-paper/20 px-2 py-1 text-xs">
                {item}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </Shell>
  );
}

function AxolPanel() {
  return (
    <Shell kicker="Axol Assist" title={axolAssist.name}>
      <p className="font-display text-xl italic">“{axolAssist.quote}”</p>
      <p className="mt-3">{axolAssist.story}</p>
      <ProjectLinks links={[{ label: "axolassist.com", href: "https://axolassist.com" }]} />
      {axolAssist.products.map((product) => (
        <article key={product.id} className="border-t border-paper/10 pt-4">
          <h3 className="font-display text-2xl">{product.name}</h3>
          {"photo" in product || "photos" in product ? (
            <ProjectPhoto
              src={"photo" in product ? product.photo : undefined}
              alt={"photoAlt" in product ? product.photoAlt : undefined}
              photos={"photos" in product ? product.photos : undefined}
            />
          ) : null}
          <p className="mt-1">{product.summary}</p>
          <ul className="mt-3 space-y-1 text-paper/75">
            {product.highlights.map((item) => (
              <li key={item}>— {item}</li>
            ))}
          </ul>
          {"links" in product ? <ProjectLinks links={[...product.links]} /> : null}
        </article>
      ))}
    </Shell>
  );
}

function ResearchPanel() {
  return (
    <Shell kicker="Research Lab" title={research.title}>
      <p className="text-[10px] tracking-[0.2em] uppercase">Research question</p>
      <p>{research.question}</p>
      <p className="text-[10px] tracking-[0.2em] uppercase">Method</p>
      <p>{research.methods.join(" · ")}</p>
      <p className="text-[10px] tracking-[0.2em] uppercase">Findings</p>
      <ul className="space-y-2">
        {research.findings.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="text-[10px] tracking-[0.2em] uppercase">Design principles</p>
      <ul className="space-y-2">
        {research.principles.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="font-display text-xl italic">{research.arc}</p>
    </Shell>
  );
}

function ProjectsPanel() {
  return (
    <Shell kicker="Project Arcade" title="Earlier work">
      {arcadeProjects.map((project) => (
        <article key={project.id} className="border-t border-paper/10 pt-4 first:border-0 first:pt-0">
          <h3 className="font-display text-2xl">{project.name}</h3>
          {project.context ? (
            <p className="mt-1 text-xs tracking-[0.14em] text-paper/55 uppercase">{project.context}</p>
          ) : null}
          <p className="mt-1">{project.summary}</p>
          <ProjectPhoto src={project.photo} alt={project.photoAlt} />
          <ProjectLinks links={project.links} />
          <p className="mt-2 text-xs tracking-[0.14em] text-paper/60 uppercase">
            {project.technologies.join(" · ")}
          </p>
        </article>
      ))}
    </Shell>
  );
}

function TutoringPanel() {
  return (
    <Shell kicker="Study hall" title="Teaching">
      {experience.map((entry) => (
        <article key={entry.id}>
          <h3 className="font-display text-2xl">{entry.title}</h3>
          <p className="text-paper/60">{entry.org}</p>
          <p className="mt-1">{entry.summary}</p>
        </article>
      ))}
    </Shell>
  );
}

function AchievementsPanel() {
  return (
    <Shell kicker="Awards & Certificates" title="Recognitions">
      {achievements.map((item) => (
        <article key={item.id} className="border-l border-paper/25 pl-4">
          <h3 className="font-display text-2xl">{item.title}</h3>
          <p className="mt-1 text-[11px] tracking-[0.14em] text-paper/55 uppercase">
            {item.issuer} · {item.date}
          </p>
          {item.associated ? <p className="text-paper/60">{item.associated}</p> : null}
          <p className="mt-2">{item.detail}</p>
          {item.photo ? (
            <FramedCertificate src={item.photo} alt={item.photoAlt ?? item.title} href={item.href} />
          ) : null}
        </article>
      ))}
    </Shell>
  );
}

function InterestsPanel() {
  return (
    <Shell kicker="Quiet corner" title="After hours">
      <p>Music, making, and games live here quietly — they keep the engineering human.</p>
      <ul className="space-y-2">
        <li>Guitar</li>
        <li>Building software</li>
        <li>Games as systems to study</li>
      </ul>
    </Shell>
  );
}

function FuturePanel() {
  return (
    <Shell kicker="The Next Chapter" title="UW–Madison">
      <p className="font-display text-3xl">2026 → …</p>
      <p>
        This campus will grow with internships, research, clubs, courses, and the
        companies still unnamed. The path is open on purpose.
      </p>
    </Shell>
  );
}

const panels: Record<PanelKind, () => JSX.Element> = {
  about: AboutPanel,
  education: EducationPanel,
  skills: SkillsPanel,
  axol: AxolPanel,
  research: ResearchPanel,
  projects: ProjectsPanel,
  tutoring: TutoringPanel,
  achievements: AchievementsPanel,
  interests: InterestsPanel,
  future: FuturePanel,
};

export function ProfilePanel() {
  const activePanel = useAppStore((s) => s.activePanel);
  if (!activePanel) return null;
  const Panel = panels[activePanel];
  return <Panel />;
}
