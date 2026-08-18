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
      <div className="overlay-label overlay-scene-title absolute top-[max(6rem,calc(env(safe-area-inset-top)+5.25rem))] left-1/2 max-w-[calc(100%-1.25rem)] -translate-x-1/2 font-ui text-[10px] uppercase sm:top-[max(1.15rem,env(safe-area-inset-top))] sm:left-[max(1rem,env(safe-area-inset-left))] sm:max-w-[55%] sm:translate-x-0 sm:text-[11px]">
        {title}
      </div>
      {showHelp ? (
        <div className="overlay-banner absolute bottom-8 left-8 hidden max-w-sm font-ui text-[15px] leading-7 tracking-normal font-medium normal-case sm:block sm:text-[16px] sm:leading-8">
          <p>WASD / arrows to move</p>
          <p>Click and drag to look around</p>
          <p>Click a building or frame to open it</p>
          <p>Walk through a doorway to enter or leave</p>
        </div>
      ) : null}
      {mode === "tour" && !cameraTransition && !tourComplete ? (
        <div
          data-look-block
          className="pointer-events-auto absolute bottom-[max(1.35rem,env(safe-area-inset-bottom))] left-1/2 flex w-[min(100%-1.5rem,22rem)] -translate-x-1/2 flex-col items-center gap-2"
        >
          <p className="overlay-label font-ui text-[10px] uppercase sm:text-[11px]">
            {tourStops[tourIndex]?.name ?? "Tour"} · {tourIndex + 1} / {tourStops.length}
          </p>
          <div className="flex w-full justify-center gap-2">
            <button
              type="button"
              className="overlay-chip min-h-11 flex-1 rounded-full px-4 py-2 font-ui text-[10px] tracking-[0.22em] uppercase sm:flex-none"
              onClick={() => advanceTour()}
            >
              Next
            </button>
            <button
              type="button"
              className="overlay-chip min-h-11 flex-1 rounded-full px-4 py-2 font-ui text-[10px] tracking-[0.22em] uppercase sm:flex-none"
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
