import { tourStops } from "@/data/locations";
import { findExhibitPiece } from "@/components/ui/ProjectView";
import { useAppStore } from "@/systems/store";

export function Hud() {
  const mode = useAppStore((s) => s.mode);
  const nearby = useAppStore((s) => s.nearby);
  const interior = useAppStore((s) => s.interior);
  const cameraTransition = useAppStore((s) => s.cameraTransition);
  const tourIndex = useAppStore((s) => s.tourIndex);
  const tourComplete = useAppStore((s) => s.tourComplete);
  const tourExhibit = useAppStore((s) => s.tourExhibit);
  const setMode = useAppStore((s) => s.setMode);
  const advanceTour = useAppStore((s) => s.advanceTour);
  const activePanel = useAppStore((s) => s.activePanel);
  const galleryProjectId = useAppStore((s) => s.galleryProjectId);
  if (mode === "traditional" || mode === "intro" || tourComplete) return null;

  const exhibit = findExhibitPiece(tourExhibit);
  const title =
    mode === "tour"
      ? (exhibit?.name ?? tourStops[tourIndex]?.name ?? "Guided Tour")
      : interior === "awards"
        ? "Awards & Certificates"
        : interior === "gallery"
          ? "Projects Gallery"
          : nearby
            ? nearby.name
            : "Bascom Hill";

  const showHelp = mode === "explore" && !activePanel && !galleryProjectId && !cameraTransition;
  const showTopTitle = mode !== "tour" || !exhibit;

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {showTopTitle ? (
        <div className="overlay-label overlay-scene-title absolute top-[max(6rem,calc(env(safe-area-inset-top)+5.25rem))] left-1/2 m-0 max-w-[calc(100%-1.25rem)] -translate-x-1/2 truncate whitespace-nowrap font-ui text-[10px] tracking-[0.14em] uppercase sm:top-[max(1.15rem,env(safe-area-inset-top))] sm:left-[max(1rem,env(safe-area-inset-left))] sm:max-w-[min(55%,20rem)] sm:translate-x-0 sm:text-[11px]">
          {title}
        </div>
      ) : null}
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
          className="pointer-events-auto absolute bottom-[max(1.35rem,env(safe-area-inset-bottom))] left-1/2 flex w-[min(100%-1.5rem,24rem)] -translate-x-1/2 flex-col items-center gap-3"
        >
          {exhibit ? (
            <p className="overlay-label m-0 max-w-full truncate whitespace-nowrap font-ui text-[10px] tracking-[0.14em] uppercase sm:text-[11px]">
              {exhibit.name}
            </p>
          ) : null}
          <div className="flex w-full flex-col items-center gap-2">
            <p className="overlay-label m-0 max-w-full truncate whitespace-nowrap font-ui text-[10px] tracking-[0.14em] uppercase sm:text-[11px]">
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
        </div>
      ) : null}
    </div>
  );
}
