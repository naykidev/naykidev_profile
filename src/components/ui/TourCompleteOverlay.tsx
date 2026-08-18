import { useAppStore } from "@/systems/store";

export function TourCompleteOverlay() {
  const tourComplete = useAppStore((s) => s.tourComplete);
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  if (mode !== "tour" || !tourComplete) return null;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center overflow-y-auto bg-[#1c1814]/72 px-4 py-[max(4rem,env(safe-area-inset-top))] text-center backdrop-blur-[3px]">
      <div className="w-full max-w-xl px-2 sm:px-6">
        <h1 className="overlay-hero-text font-display text-[2.15rem] leading-tight font-semibold tracking-wide text-paper sm:text-6xl">
          Thank you for taking a tour!
        </h1>
        <p className="overlay-hero-text mt-5 font-ui text-sm font-semibold tracking-[0.08em] text-paper">
          You’ve seen About Me, the Projects Gallery, and Awards & Certificates.
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
            Take the tour again
          </button>
        </div>
        <button
          type="button"
          className="overlay-chip mt-6 rounded-full px-4 py-2 font-ui text-[11px] tracking-[0.18em] uppercase"
          onClick={() => setMode("intro")}
        >
          Back to start
        </button>
      </div>
    </div>
  );
}
