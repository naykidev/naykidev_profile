import { motion, useScroll, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import { useState } from "react";
import { profile } from "@/data/profile";
import { useTouchUi } from "@/hooks/useCoarsePointer";
import { navigate } from "@/lib/appRoute";
import { useAppStore } from "@/systems/store";

export const CLASSIC_NAV = [
  { id: "about", href: "#about", label: "About", full: "About Me" },
  { id: "projects", href: "#projects", label: "Projects", full: "Projects" },
  { id: "awards", href: "#awards", label: "Awards", full: "Awards & Certificates" },
  { id: "resume", href: "#resume", label: "Resume", full: "Resume" },
  { id: "links", href: "#links", label: "Links", full: "Links" },
] as const;

export function ClassicHeader({ activeId }: { activeId: string }) {
  const touchUi = useTouchUi();
  const highContrast = useAppStore((s) => s.highContrast);
  const toggleHighContrast = useAppStore((s) => s.toggleHighContrast);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const scaleX = useTransform(progress, [0, 1], [0, 1]);
  const [compact, setCompact] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    setCompact(y > 48);
  });

  return (
    <motion.header
      className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur-md"
      animate={{
        paddingTop: compact ? 6 : 12,
        paddingBottom: compact ? 6 : 12,
      }}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
        <a
          href="#top"
          className={`font-display font-semibold tracking-wide text-paper transition-all ${
            compact ? "text-base" : "text-lg"
          }`}
        >
          {profile.name}
        </a>
        <nav aria-label="Classic site" className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {CLASSIC_NAV.map((item) => {
            const active = activeId === item.id;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? "true" : undefined}
                className={`rounded-full px-2.5 py-1.5 font-ui text-[10px] tracking-[0.14em] uppercase transition sm:text-[11px] ${
                  active
                    ? "classic-nav-active"
                    : "text-paper/75 hover:bg-white/8 hover:text-paper"
                }`}
              >
                <span className="sm:hidden">{item.label}</span>
                <span className="hidden sm:inline">{item.full}</span>
              </a>
            );
          })}
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-2.5 py-1.5 font-ui text-[10px] tracking-[0.14em] text-paper/75 uppercase transition hover:bg-white/8 hover:text-paper sm:text-[11px]"
          >
            <span className="sm:hidden">Link</span>
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
          <button
            type="button"
            onClick={() => toggleHighContrast()}
            aria-pressed={highContrast}
            className="rounded-full px-2.5 py-1.5 font-ui text-[10px] tracking-[0.14em] text-paper/75 uppercase transition hover:bg-white/8 hover:text-paper sm:text-[11px]"
          >
            Contrast
          </button>
          {!touchUi ? (
            <button
              type="button"
              onClick={() => navigate("/")}
              className="classic-btn classic-btn--accent ml-1 !min-h-9 !px-3 !py-1.5 !text-[10px] sm:!text-[11px]"
            >
              Enter 3D Campus
            </button>
          ) : null}
        </nav>
      </div>
      <motion.div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-0.5 origin-left bg-sunflower/80"
        style={{ scaleX }}
        aria-hidden
      />
    </motion.header>
  );
}
