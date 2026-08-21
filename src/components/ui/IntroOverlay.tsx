import { useEffect } from "react";
import { profile } from "@/data/profile";
import { useIntroSequenceUi } from "@/hooks/useIntroSequence";
import { useTouchUi } from "@/hooks/useCoarsePointer";
import { navigate } from "@/lib/appRoute";
import { markIntroSeen } from "@/systems/introSequence";
import { useAppStore } from "@/systems/store";

export function IntroOverlay() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const touchUi = useTouchUi();
  const frame = useIntroSequenceUi();
  const titleVisible = mode === "intro" && (frame?.titleVisible ?? false);

  useEffect(() => {
    if (titleVisible) markIntroSeen();
  }, [titleVisible]);

  if (mode !== "intro") return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[60] flex flex-col items-center justify-end bg-gradient-to-t from-[#1c1814]/75 via-transparent to-transparent pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+2.5rem))] text-center transition-opacity duration-500 ${
        titleVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className={`w-full max-w-xl px-4 sm:px-6 ${titleVisible ? "pointer-events-auto" : "pointer-events-none"}`}>
        <p className="overlay-label mb-3 font-ui text-[10px] tracking-[0.22em] uppercase sm:text-[11px] sm:tracking-[0.42em]">
          University of Wisconsin–Madison
        </p>
        <h1 className="overlay-hero-text font-display text-[2.65rem] leading-tight font-semibold tracking-wide text-paper sm:text-7xl">
          {profile.name}
        </h1>
        <p className="overlay-hero-text mt-3 font-ui text-xs font-semibold tracking-[0.1em] text-paper uppercase sm:text-sm sm:tracking-[0.14em]">
          {profile.headline}
        </p>
        <p className="overlay-hero-text mt-4 font-display text-xl italic text-paper sm:mt-5 sm:text-2xl">
          “{profile.tagline}”
        </p>
        <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
          <button
            type="button"
            className="overlay-chip min-h-12 w-full px-6 py-3 font-ui text-xs tracking-[0.28em] uppercase sm:w-auto sm:min-w-48"
            onClick={() => setMode("explore")}
          >
            Explore
          </button>
          <button
            type="button"
            className="overlay-chip min-h-12 w-full px-6 py-3 font-ui text-xs tracking-[0.28em] uppercase sm:w-auto sm:min-w-48"
            onClick={() => setMode("tour")}
          >
            Take the Tour
          </button>
        </div>
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            className="overlay-chip rounded-full px-4 py-2 font-ui text-[11px] tracking-[0.18em] uppercase"
            onClick={() => navigate("/classic#resume")}
          >
            View resume
          </button>
          {!touchUi ? (
            <button
              type="button"
              className="font-ui text-[11px] tracking-[0.14em] text-paper/75 uppercase underline decoration-white/25 underline-offset-4"
              onClick={() => navigate("/classic")}
            >
              Prefer a simple version?
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
