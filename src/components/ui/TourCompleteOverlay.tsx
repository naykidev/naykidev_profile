import { useAppStore } from "@/systems/store";

export function TourCompleteOverlay() {
  const tourComplete = useAppStore((s) => s.tourComplete);
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  if (mode !== "tour" || !tourComplete) return null;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#1c1814]/72 text-center backdrop-blur-[3px]">
      <div className="max-w-xl px-6">
        <h1 className="font-display text-5xl font-semibold tracking-wide text-paper sm:text-6xl">
          Thank you for taking a tour!
        </h1>
        <p className="mt-5 font-ui text-sm tracking-[0.08em] text-paper/80">
          You’ve seen About Me, the Projects Gallery, and Awards & Certificates.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            className="min-w-48 border border-paper/40 bg-paper/10 px-6 py-3 font-ui text-xs tracking-[0.28em] text-paper uppercase backdrop-blur-[2px] transition hover:bg-paper/20"
            onClick={() => setMode("explore")}
          >
            Explore
          </button>
          <button
            type="button"
            className="min-w-48 border border-paper/40 bg-paper/10 px-6 py-3 font-ui text-xs tracking-[0.28em] text-paper uppercase backdrop-blur-[2px] transition hover:bg-paper/20"
            onClick={() => setMode("tour")}
          >
            Take the tour again
          </button>
        </div>
        <button
          type="button"
          className="mt-6 font-ui text-[11px] tracking-[0.18em] text-paper/60 uppercase underline-offset-4 hover:text-paper hover:underline"
          onClick={() => setMode("intro")}
        >
          Back to start
        </button>
      </div>
    </div>
  );
}
