import { useSyncExternalStore } from "react";
import { awardPieces } from "@/data/achievements";
import { ProjectLinks } from "@/components/ui/ProjectLinks";
import { findExhibitPiece } from "@/components/ui/ProjectView";
import { useAppStore } from "@/systems/store";

const GALLERY_FRAME = { width: 2.32, height: 1.62, fov: 46, dist: 3.35 };
const DESCRIPTION_WIDTH = 440;
const DESCRIPTION_WIDTH_DODO = 480;
const DESCRIPTION_WIDTH_NARROW = 400;
const NARROW_DESCRIPTION = new Set([
  "surf-del-mar",
  "weather-report",
  "accessibility-surfer",
  "freddy-takes-flight",
]);
const SIDE_INSET = 24;
const PORTRAIT_GAP = 28;

let viewportSnapshot = { w: 1280, h: 720 };

function syncViewport() {
  if (typeof window === "undefined") return viewportSnapshot;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w !== viewportSnapshot.w || h !== viewportSnapshot.h) {
    viewportSnapshot = { w, h };
  }
  return viewportSnapshot;
}

function subscribeViewport(onStoreChange: () => void) {
  const onResize = () => {
    syncViewport();
    onStoreChange();
  };
  syncViewport();
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}

function useViewport() {
  return useSyncExternalStore(subscribeViewport, syncViewport, () => viewportSnapshot);
}

function projectedPixels(worldSize: number, dist: number, fov: number, viewportHeight: number) {
  const fovRad = (fov * Math.PI) / 180;
  const halfFrustumHeight = dist * Math.tan(fovRad / 2);
  if (halfFrustumHeight <= 0) return 0;
  return (worldSize / (2 * halfFrustumHeight)) * viewportHeight;
}

function ExhibitCopy({
  piece,
}: {
  piece: NonNullable<ReturnType<typeof findExhibitPiece>>;
}) {
  return (
    <>
      <p className="mb-3 font-ui text-xs tracking-[0.16em] text-paper/65 uppercase">
        {piece.context ?? "Project spotlight"}
      </p>
      <h2 className="mb-4 font-display text-[1.85rem] leading-tight font-semibold tracking-wide">
        {piece.name}
      </h2>
      <p className="mb-4 font-ui text-[15px] leading-[1.5] text-pretty text-paper/95">
        {piece.summary}
      </p>
      {piece.technologies.length > 0 ? (
        <>
          <p className="mb-2 font-ui text-[10px] tracking-[0.22em] text-paper/60 uppercase">Tech stack</p>
          <ul className="mb-5 flex flex-wrap gap-2">
            {piece.technologies.map((item) => (
              <li
                key={item}
                className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 font-ui text-xs font-semibold text-paper"
              >
                {item}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <ProjectLinks links={piece.links} />
    </>
  );
}

export function TourExhibitOverlay() {
  const mode = useAppStore((s) => s.mode);
  const tourExhibit = useAppStore((s) => s.tourExhibit);
  const piece = findExhibitPiece(tourExhibit);
  const viewport = useViewport();

  if (mode !== "tour" || !piece) return null;

  const tiny = awardPieces.some((item) => item.id === piece.id);
  // Awards & certificates: portrait only — no overlay cards.
  if (tiny) return null;

  const projectedPortraitW = Math.ceil(
    projectedPixels(GALLERY_FRAME.width, GALLERY_FRAME.dist, GALLERY_FRAME.fov, viewport.h) * 1.02,
  );

  const descriptionWidthTarget =
    piece.id === "dodo"
      ? DESCRIPTION_WIDTH_DODO
      : NARROW_DESCRIPTION.has(piece.id)
        ? DESCRIPTION_WIDTH_NARROW
        : DESCRIPTION_WIDTH;
  const descriptionWidth = Math.min(
    descriptionWidthTarget,
    viewport.w - SIDE_INSET * 2 - 280,
  );
  const descriptionLeft = SIDE_INSET;

  const midStart = descriptionLeft + descriptionWidth + PORTRAIT_GAP;
  const midEnd = viewport.w - SIDE_INSET;
  const midSpan = Math.max(200, midEnd - midStart);
  const centerWidth = Math.min(projectedPortraitW, midSpan);
  const portraitLeft = midStart + (midSpan - centerWidth) / 2;

  const overlayPadTop = 72;
  const overlayPadBottom = 140;
  const descriptionMaxHeight = Math.max(320, viewport.h - overlayPadTop - overlayPadBottom);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[8.75rem]">
      <section key={piece.id} data-look-block className="pointer-events-auto relative h-full w-full overflow-visible text-paper">
        <div
          className="description-panel absolute rounded-xl border border-white/18 bg-[rgba(20,20,20,0.85)] text-left shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px]"
          style={{
            left: descriptionLeft,
            top: "50%",
            transform: "translateY(-50%)",
            width: descriptionWidth,
            height: "fit-content",
            maxHeight: descriptionMaxHeight,
            overflow: "visible",
            padding: 28,
          }}
        >
          <ExhibitCopy piece={piece} />
        </div>

        <div
          className="portrait-spacer pointer-events-none absolute"
          aria-hidden
          style={{
            left: portraitLeft,
            top: "50%",
            transform: "translateY(-50%)",
            width: centerWidth,
            height: "60%",
            background: "none",
            border: "none",
            boxShadow: "none",
          }}
        />
      </section>
    </div>
  );
}
