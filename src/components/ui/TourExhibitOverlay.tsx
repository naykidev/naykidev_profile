import { useSyncExternalStore } from "react";
import { awardPieces } from "@/data/achievements";
import { ProjectLinks } from "@/components/ui/ProjectLinks";
import { findExhibitPiece } from "@/components/ui/ProjectView";
import { galleryZoomFraming } from "@/systems/hallFrames";
import { useAppStore } from "@/systems/store";

const FRAME_W = 2.32;
const FRAME_H = 1.62;
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
/** Stack description under portrait on phones / narrow tablets (incl. "Request Desktop Site"). */
const MOBILE_BREAKPOINT = 1024;

let viewportSnapshot = { w: 1280, h: 720 };

function syncViewport() {
  if (typeof window === "undefined") return viewportSnapshot;
  const vv = window.visualViewport;
  const w = Math.min(window.innerWidth, vv?.width ?? window.innerWidth);
  const h = Math.min(window.innerHeight, vv?.height ?? window.innerHeight);
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
  window.visualViewport?.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("scroll", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("scroll", onResize);
  };
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
  compact = false,
}: {
  piece: NonNullable<ReturnType<typeof findExhibitPiece>>;
  compact?: boolean;
}) {
  return (
    <>
      <p
        className={`font-ui tracking-[0.16em] text-paper/65 uppercase ${compact ? "mb-2 text-[10px]" : "mb-3 text-xs"}`}
      >
        {piece.context ?? "Project spotlight"}
      </p>
      <h2
        className={`font-display leading-tight font-semibold tracking-wide ${compact ? "mb-3 text-[1.45rem]" : "mb-4 text-[1.85rem]"}`}
      >
        {piece.name}
      </h2>
      <p
        className={`text-pretty text-paper/95 ${compact ? "mb-3 font-ui text-[14px] leading-[1.45]" : "mb-4 font-ui text-[15px] leading-[1.5]"}`}
      >
        {piece.summary}
      </p>
      {piece.technologies.length > 0 ? (
        <>
          <p className="mb-2 font-ui text-[10px] tracking-[0.22em] text-paper/60 uppercase">Tech stack</p>
          <ul className={`flex flex-wrap gap-2 ${compact ? "mb-3" : "mb-5"}`}>
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
  if (tiny) return null;

  const framing = galleryZoomFraming(false);
  const portraitPhone = viewport.h > viewport.w && viewport.w < 1200;
  const mobile = viewport.w < MOBILE_BREAKPOINT || portraitPhone;
  const projectedPortraitW = Math.ceil(
    projectedPixels(FRAME_W, framing.dist, framing.fov, viewport.h) * 1.02,
  );
  const projectedPortraitH = Math.ceil(
    projectedPixels(FRAME_H, framing.dist, framing.fov, viewport.h) * 1.02,
  );

  const descriptionWidthTarget =
    piece.id === "dodo"
      ? DESCRIPTION_WIDTH_DODO
      : NARROW_DESCRIPTION.has(piece.id)
        ? DESCRIPTION_WIDTH_NARROW
        : DESCRIPTION_WIDTH;

  const overlayPadTop = mobile ? 76 : 72;
  const overlayPadBottom = mobile ? 148 : 140;
  const availableH = Math.max(280, viewport.h - overlayPadTop - overlayPadBottom);

  if (mobile) {
    // Leave a tight window for the 3D frame (camera already recenters it); card takes the rest.
    const portraitGapH = Math.min(
      Math.max(projectedPortraitH * 0.72, viewport.h * 0.34),
      availableH * 0.46,
      320,
    );
    const descriptionMaxHeight = Math.max(160, availableH - portraitGapH - 4);

    return (
      <div className="pointer-events-none absolute inset-0 z-40 px-3 pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[max(8.75rem,calc(env(safe-area-inset-bottom)+7.25rem))]">
        <section
          key={piece.id}
          data-look-block
          className="pointer-events-auto mx-auto flex h-full w-full max-w-xl flex-col items-stretch gap-2 overflow-hidden text-paper"
        >
          <div
            className="portrait-spacer pointer-events-none w-full shrink-0 self-center"
            aria-hidden
            style={{
              height: portraitGapH,
              maxWidth: Math.min(viewport.w - 16, projectedPortraitW),
            }}
          />
          <div
            className="description-panel w-full min-h-0 flex-1 overflow-y-auto rounded-xl border border-white/18 bg-[rgba(20,20,20,0.92)] text-left shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px]"
            style={{ maxHeight: descriptionMaxHeight, padding: "14px 16px", width: "100%" }}
          >
            <ExhibitCopy piece={piece} compact />
          </div>
        </section>
      </div>
    );
  }

  const descriptionWidth = Math.min(
    descriptionWidthTarget,
    Math.max(
      320,
      Math.min(
        descriptionWidthTarget,
        viewport.w - SIDE_INSET * 2 - Math.min(projectedPortraitW, viewport.w * 0.42) - PORTRAIT_GAP,
      ),
    ),
  );
  const descriptionLeft = SIDE_INSET;
  const midStart = descriptionLeft + descriptionWidth + PORTRAIT_GAP;
  const midEnd = viewport.w - SIDE_INSET;
  const midSpan = Math.max(200, midEnd - midStart);
  const centerWidth = Math.min(projectedPortraitW, midSpan);
  const portraitLeft = midStart + (midSpan - centerWidth) / 2;
  const descriptionMaxHeight = Math.max(320, availableH);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[8.75rem]">
      <section
        key={piece.id}
        data-look-block
        className="pointer-events-auto relative h-full w-full overflow-visible text-paper"
      >
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
