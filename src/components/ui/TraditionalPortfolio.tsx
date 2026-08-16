import { achievements } from "@/data/achievements";
import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { arcadeProjects, axolAssist } from "@/data/projects";
import { FramedCertificate } from "@/components/ui/FramedCertificate";
import { ProjectLinks, ProjectPhoto } from "@/components/ui/ProjectLinks";
import { profile } from "@/data/profile";
import { research } from "@/data/research";
import { skills } from "@/data/skills";
import { useAppStore } from "@/systems/store";

export function TraditionalPortfolio() {
  const setMode = useAppStore((s) => s.setMode);
  const webgl = useAppStore((s) => s.webgl);

  return (
    <main className="h-full overflow-y-auto overscroll-y-contain bg-[#1c1814] text-paper">
      <div className="mx-auto max-w-3xl px-4 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-16">
        <p className="font-ui text-[11px] tracking-[0.32em] text-paper/60 uppercase">
          Traditional portfolio
        </p>
        <img
          src={profile.photo}
          alt={`${profile.name} headshot`}
          className="mt-6 h-36 w-36 rounded-full object-cover sm:h-44 sm:w-44"
        />
        <h1 className="mt-3 font-display text-4xl sm:text-6xl">{profile.name}</h1>
        <p className="mt-3 font-ui tracking-[0.12em] uppercase">{profile.headline}</p>
        <div className="mt-6 max-w-xl space-y-4 text-lg text-paper/85">
          {profile.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-4 text-paper/70">{profile.locationPath}</p>
        {webgl ? (
          <button
            type="button"
            className="mt-8 border border-paper/30 px-5 py-2 font-ui text-xs tracking-[0.22em] uppercase"
            onClick={() => setMode("intro")}
          >
            Return to campus
          </button>
        ) : (
          <p className="mt-8 text-sm text-paper/60">
            3D campus is unavailable in this browser. This page is the full profile.
          </p>
        )}

        <section className="mt-16" aria-labelledby="edu-heading">
          <h2 id="edu-heading" className="font-display text-4xl">
            Education
          </h2>
          {education.map((entry) => (
            <article key={entry.id} className="mt-6">
              <h3 className="text-xl">{entry.institution}</h3>
              <p className="text-paper/70">
                {entry.program} · {entry.dates} · {entry.location}
              </p>
              <ul className="mt-2 list-disc pl-5 text-paper/80">
                {entry.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="mt-16" aria-labelledby="skills-heading">
          <h2 id="skills-heading" className="font-display text-4xl">
            Skills
          </h2>
          {skills.map((group) => (
            <article key={group.id} className="mt-5">
              <h3 className="text-xl">{group.title}</h3>
              <p>{group.items.join(", ")}</p>
            </article>
          ))}
        </section>

        <section className="mt-16" aria-labelledby="axol-heading">
          <h2 id="axol-heading" className="font-display text-4xl">
            {axolAssist.name}
          </h2>
          <p className="mt-3 italic">{axolAssist.quote}</p>
          <p className="mt-4">{axolAssist.story}</p>
          <ProjectLinks links={[{ label: "axolassist.com", href: "https://axolassist.com" }]} />
          {axolAssist.products.map((product) => (
            <article key={product.id} className="mt-6">
              <h3 className="text-xl">{product.name}</h3>
              {"photo" in product || "photos" in product ? (
                <ProjectPhoto
                  src={"photo" in product ? product.photo : undefined}
                  alt={"photoAlt" in product ? product.photoAlt : undefined}
                  photos={"photos" in product ? product.photos : undefined}
                />
              ) : null}
              <p>{product.summary}</p>
              <ul className="mt-2 list-disc pl-5">
                {product.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {"links" in product ? <ProjectLinks links={[...product.links]} /> : null}
            </article>
          ))}
        </section>

        <section className="mt-16" aria-labelledby="research-heading">
          <h2 id="research-heading" className="font-display text-4xl">
            Research
          </h2>
          <h3 className="mt-4 text-xl">{research.title}</h3>
          <p className="mt-2">{research.question}</p>
          <p className="mt-2">{research.arc}</p>
        </section>

        <section className="mt-16" aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="font-display text-4xl">
            Projects
          </h2>
          {arcadeProjects.map((project) => (
            <article key={project.id} className="mt-5">
              <h3 className="text-xl">{project.name}</h3>
              {project.context ? <p className="text-sm text-paper/60">{project.context}</p> : null}
              <p>{project.summary}</p>
              <ProjectPhoto src={project.photo} alt={project.photoAlt} />
              <ProjectLinks links={project.links} />
              <p className="text-sm text-paper/60">{project.technologies.join(", ")}</p>
            </article>
          ))}
        </section>

        <section className="mt-16" aria-labelledby="exp-heading">
          <h2 id="exp-heading" className="font-display text-4xl">
            Tutoring & teaching
          </h2>
          {experience.map((entry) => (
            <article key={entry.id} className="mt-5">
              <h3 className="text-xl">{entry.title}</h3>
              <p className="text-paper/70">{entry.org}</p>
              <p>{entry.summary}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 mb-20" aria-labelledby="awards-heading">
          <h2 id="awards-heading" className="font-display text-4xl">
            Awards & Certificates
          </h2>
          {achievements.map((item) => (
            <article key={item.id} className="mt-5">
              <h3 className="text-xl">{item.title}</h3>
              <p className="text-paper/70">
                {item.issuer} · {item.date}
                {item.associated ? ` · ${item.associated}` : ""}
              </p>
              <p>{item.detail}</p>
              {item.photo ? (
                <FramedCertificate src={item.photo} alt={item.photoAlt ?? item.title} href={item.href} />
              ) : null}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
