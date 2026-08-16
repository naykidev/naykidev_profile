import { useEffect } from "react";
import { profile } from "@/data/profile";
import { useIntroSequenceFrame } from "@/hooks/useIntroSequence";
import { markIntroSeen } from "@/systems/introSequence";
import { useAppStore } from "@/systems/store";

export function IntroOverlay() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const frame = useIntroSequenceFrame();
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
        <p className="mb-3 font-ui text-[10px] tracking-[0.22em] text-paper/70 uppercase sm:text-[11px] sm:tracking-[0.42em]">
          University of Wisconsin–Madison
        </p>
        <h1 className="font-display text-[2.65rem] leading-tight font-semibold tracking-wide text-paper sm:text-7xl">
          {profile.name}
        </h1>
        <p className="mt-3 font-ui text-xs tracking-[0.1em] text-paper/80 uppercase sm:text-sm sm:tracking-[0.14em]">
          {profile.headline}
        </p>
        <p className="mt-4 font-display text-xl italic text-paper/90 sm:mt-5 sm:text-2xl">
          “{profile.tagline}”
        </p>
        <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
          <button
            type="button"
            className="min-h-12 w-full border border-paper/40 bg-paper/10 px-6 py-3 font-ui text-xs tracking-[0.28em] text-paper uppercase backdrop-blur-[2px] transition hover:bg-paper/20 sm:w-auto sm:min-w-48"
            onClick={() => setMode("explore")}
          >
            Explore
          </button>
          <button
            type="button"
            className="min-h-12 w-full border border-paper/40 bg-paper/10 px-6 py-3 font-ui text-xs tracking-[0.28em] text-paper uppercase backdrop-blur-[2px] transition hover:bg-paper/20 sm:w-auto sm:min-w-48"
            onClick={() => setMode("tour")}
          >
            Take the Tour
          </button>
        </div>
        <button
          type="button"
          className="mt-6 font-ui text-[11px] tracking-[0.18em] text-paper/60 uppercase underline-offset-4 hover:text-paper hover:underline"
          onClick={() => setMode("traditional")}
        >
          View traditional portfolio
        </button>
      </div>
    </div>
  );
}
