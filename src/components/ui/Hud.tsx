import { awardPieces } from "@/data/achievements";
import { galleryPieces } from "@/data/projects";
import { tourStops } from "@/data/locations";
import { findExhibitPiece } from "@/components/ui/ProjectView";
import { useAppStore } from "@/systems/store";

function ControlLabel({ full, short }: { full: string; short: string }) {
  return (
    <>
      <span className="hidden sm:inline">{full}</span>
      <span className="sm:hidden">{short}</span>
    </>
  );
}

export function Hud() {
  const mode = useAppStore((s) => s.mode);
  const nearby = useAppStore((s) => s.nearby);
  const interior = useAppStore((s) => s.interior);
  const cameraTransition = useAppStore((s) => s.cameraTransition);
  const tourIndex = useAppStore((s) => s.tourIndex);
  const tourKind = useAppStore((s) => s.tourKind);
  const tourShotIndex = useAppStore((s) => s.tourShotIndex);
  const tourComplete = useAppStore((s) => s.tourComplete);
  const tourExhibit = useAppStore((s) => s.tourExhibit);
  const setMode = useAppStore((s) => s.setMode);
  const advanceTour = useAppStore((s) => s.advanceTour);
  const advanceTourPiece = useAppStore((s) => s.advanceTourPiece);
  const retreatTourPiece = useAppStore((s) => s.retreatTourPiece);
  const activePanel = useAppStore((s) => s.activePanel);
  const galleryProjectId = useAppStore((s) => s.galleryProjectId);
  if (mode === "intro" || tourComplete) return null;

  const exhibit = findExhibitPiece(tourExhibit);
  const hall = mode === "tour" ? tourStops[tourIndex]?.tourInterior : undefined;
  const awardsHall = hall === "awards" || tourKind === "awards";
  const pieceTour = mode === "tour" && Boolean(hall);
  const pieceCount = pieceTour ? (awardsHall ? awardPieces.length : galleryPieces.length) : 0;
  const onLastPiece = pieceTour && tourShotIndex >= pieceCount - 1;
  const nextPieceLabel = awardsHall
    ? onLastPiece && tourKind === "full"
      ? "Next gallery"
      : "Next certificate/award"
    : onLastPiece && tourKind === "full"
      ? "Next gallery"
      : "Next project";
  const prevPieceLabel = awardsHall ? "Previous certificate/award" : "Previous project";
  const title =
    mode === "tour"
      ? tourKind === "projects" || hall === "gallery"
        ? "Projects Gallery"
        : tourKind === "awards" || hall === "awards"
          ? "Awards & Certificates"
          : (tourStops[tourIndex]?.name ?? "Guided Tour")
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
        <div className="overlay-label overlay-scene-title absolute top-[max(6.5rem,calc(env(safe-area-inset-top)+5.75rem))] left-1/2 m-0 max-w-[calc(100%-1.25rem)] -translate-x-1/2 truncate whitespace-nowrap font-ui text-[10px] tracking-[0.14em] uppercase sm:top-[max(1.15rem,env(safe-area-inset-top))] sm:left-[max(1rem,env(safe-area-inset-left))] sm:max-w-[min(55%,20rem)] sm:translate-x-0 sm:text-[11px]">
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
          className="pointer-events-auto fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-1/2 z-[100] flex w-[min(100%-1rem,28rem)] -translate-x-1/2 flex-col items-center gap-1.5 sm:bottom-[max(20px,env(safe-area-inset-bottom))] sm:w-[min(100%-1.5rem,28rem)] sm:gap-2"
        >
          <p className="overlay-label m-0 max-w-full truncate whitespace-nowrap font-ui text-[10px] tracking-[0.14em] uppercase sm:text-[11px]">
            {pieceTour
              ? `${awardsHall ? "Award" : "Project"} · ${tourShotIndex + 1} / ${pieceCount}`
              : `${tourStops[tourIndex]?.name ?? "Tour"} · ${tourIndex + 1} / ${tourStops.length}`}
          </p>
          <div className="grid w-full grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:justify-center sm:gap-2">
            {pieceTour ? (
              <>
                <button
                  type="button"
                  className="overlay-chip min-h-11 rounded-full px-2 py-2 font-ui text-[9px] tracking-[0.08em] uppercase sm:flex-1 sm:px-3 sm:text-[10px] sm:tracking-[0.14em] sm:flex-none"
                  onClick={() => advanceTourPiece()}
                >
                  <ControlLabel full={nextPieceLabel} short="Next" />
                </button>
                <button
                  type="button"
                  className="overlay-chip min-h-11 rounded-full px-2 py-2 font-ui text-[9px] tracking-[0.08em] uppercase disabled:opacity-40 sm:flex-1 sm:px-3 sm:text-[10px] sm:tracking-[0.14em] sm:flex-none"
                  onClick={() => retreatTourPiece()}
                  disabled={tourShotIndex <= 0}
                >
                  <ControlLabel full={prevPieceLabel} short="Prev" />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="overlay-chip col-span-2 min-h-11 rounded-full px-2 py-2 font-ui text-[9px] tracking-[0.1em] uppercase sm:col-span-1 sm:flex-1 sm:px-4 sm:text-[10px] sm:tracking-[0.18em] sm:flex-none"
                onClick={() => advanceTour()}
              >
                <ControlLabel full="Next gallery" short="Next" />
              </button>
            )}
            <button
              type="button"
              className="overlay-chip min-h-11 rounded-full px-2 py-2 font-ui text-[9px] tracking-[0.1em] uppercase sm:flex-1 sm:px-4 sm:text-[10px] sm:tracking-[0.18em] sm:flex-none"
              onClick={() => setMode("intro")}
            >
              <ControlLabel full="Exit tour" short="Exit" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
