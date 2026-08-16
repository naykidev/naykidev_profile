import { tourStops } from "@/data/locations";
import { useAppStore } from "@/systems/store";

export function Hud() {
  const mode = useAppStore((s) => s.mode);
  const nearby = useAppStore((s) => s.nearby);
  const interior = useAppStore((s) => s.interior);
  const cameraTransition = useAppStore((s) => s.cameraTransition);
  const tourIndex = useAppStore((s) => s.tourIndex);
  const tourComplete = useAppStore((s) => s.tourComplete);
  const setMode = useAppStore((s) => s.setMode);
  const advanceTour = useAppStore((s) => s.advanceTour);
  const activePanel = useAppStore((s) => s.activePanel);
  const galleryProjectId = useAppStore((s) => s.galleryProjectId);
  if (mode === "traditional" || mode === "intro" || tourComplete) return null;

  const title =
    mode === "tour"
      ? (tourStops[tourIndex]?.name ?? "Guided Tour")
      : interior === "awards"
        ? "Awards & Certificates"
        : interior === "gallery"
          ? "Projects Gallery"
          : nearby
            ? nearby.name
            : "Bascom Hill";

  const showHelp = mode === "explore" && !activePanel && !galleryProjectId && !cameraTransition;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute top-5 left-5 font-ui text-[11px] tracking-[0.32em] text-paper/55 uppercase">
        {title}
      </div>
      {showHelp ? (
        <div className="absolute bottom-8 left-8 hidden max-w-sm font-ui text-[15px] leading-7 text-paper drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)] sm:block sm:text-[16px] sm:leading-8">
          <p>WASD / arrows to move</p>
          <p>Click and drag to look around</p>
          <p>Click a building or frame to open it</p>
          <p>Walk through a doorway to enter or leave</p>
        </div>
      ) : null}
      {mode === "tour" && !cameraTransition && !tourComplete ? (
        <div className="pointer-events-auto absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
          <p className="font-ui text-[11px] tracking-[0.22em] text-paper/55 uppercase">
            {tourStops[tourIndex]?.name ?? "Tour"} · {tourIndex + 1} / {tourStops.length}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-white/15 bg-black/25 px-4 py-2 font-ui text-[10px] tracking-[0.22em] text-paper uppercase backdrop-blur-[10px] transition hover:bg-white/10"
              onClick={() => advanceTour()}
            >
              Next
            </button>
            <button
              type="button"
              className="rounded-full border border-white/15 bg-black/25 px-4 py-2 font-ui text-[10px] tracking-[0.22em] text-paper/80 uppercase backdrop-blur-[10px] transition hover:bg-white/10"
              onClick={() => setMode("intro")}
            >
              Exit tour
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
