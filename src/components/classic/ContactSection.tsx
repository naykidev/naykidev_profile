import { useState } from "react";
import { profile } from "@/data/profile";
import { Reveal, SectionHeading } from "./Reveal";

export function ContactSection() {
  const [toast, setToast] = useState<string | null>(null);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setToast("Email copied");
      window.setTimeout(() => setToast(null), 1800);
    } catch {
      setToast("Couldn't copy — use the mailto link");
      window.setTimeout(() => setToast(null), 2200);
    }
  };

  return (
    <section id="links" className="scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading eyebrow="Contact" title="Links" />
        </Reveal>
        <ul className="space-y-4 font-ui text-[15px]">
          <li className="flex flex-wrap items-center gap-3">
            <a href={`mailto:${profile.email}`} className="classic-link">
              {profile.email}
            </a>
            <button
              type="button"
              onClick={() => void copyEmail()}
              className="classic-btn !min-h-8 !px-3 !py-1 !text-[11px]"
            >
              Copy
            </button>
          </li>
          <li>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="classic-link"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a href={profile.resume} className="classic-link">
              Resume PDF
            </a>
          </li>
        </ul>
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-sunflower/40 bg-ink/95 px-4 py-2 font-ui text-xs tracking-[0.14em] text-sunflower uppercase shadow-lg transition ${
            toast ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {toast ?? "Copied"}
        </div>
      </div>
    </section>
  );
}
