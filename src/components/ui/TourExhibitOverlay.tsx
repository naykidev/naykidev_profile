import { useSyncExternalStore } from "react";
import { awardPieces } from "@/data/achievements";
import { type GalleryPiece } from "@/data/projects";
import { ProjectLinks } from "@/components/ui/ProjectLinks";
import { findExhibitPiece } from "@/components/ui/ProjectView";
import { useAppStore } from "@/systems/store";

const GALLERY_FRAME = { width: 2.32, height: 1.62, fov: 46, dist: 2.58 };
const AWARDS_FRAME = { width: 1.64, height: 1.16, fov: 42, dist: 1.68 };
const LEFT_WIDTH = 380;
const RIGHT_WIDTH = 300;
const PORTRAIT_EDGE_GAP = 28;
const OUTER_PAD = 32;

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

/** Project a world-space size through the same vertical FOV used by frameZoomShot. */
function projectedPixels(worldSize: number, dist: number, fov: number, viewportHeight: number) {
  const fovRad = (fov * Math.PI) / 180;
  const halfFrustumHeight = dist * Math.tan(fovRad / 2);
  if (halfFrustumHeight <= 0) return 0;
  return (worldSize / (2 * halfFrustumHeight)) * viewportHeight;
}

function supplementalPhotos(piece: GalleryPiece) {
  const photos = [...(piece.photos ?? [])];
  if (piece.photo) {
    photos.push({
      src: piece.photo,
      alt: piece.photoAlt ?? `${piece.name} supplementary photo`,
    });
  }
  return photos.filter(
    (photo, index, list) =>
      photo.src !== piece.portrait && list.findIndex((item) => item.src === photo.src) === index,
  );
}

function ExhibitCopy({ piece }: { piece: GalleryPiece }) {
  return (
    <>
      <p className="mb-2 font-ui text-xs tracking-[0.16em] text-paper/65 uppercase">
        {piece.context ?? "Project spotlight"}
      </p>
      <h2 className="mb-4 font-display text-[1.85rem] leading-tight font-semibold tracking-wide sm:text-[2rem]">
        {piece.name}
      </h2>
      <p className="mb-5 font-ui text-[15px] leading-[1.55] text-pretty text-paper/95 sm:text-base">
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

function PhotoRail({
  photos,
  className,
}: {
  photos: { src: string; alt: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      {photos.map((photo) => (
        <figure key={photo.src} className="overflow-hidden rounded-lg border border-white/20 bg-black/55">
          <img
            src={photo.src}
            alt={photo.alt}
            className="block h-auto w-full object-cover"
            style={{ minHeight: "160px", maxHeight: "240px" }}
            loading="lazy"
          />
        </figure>
      ))}
    </div>
  );
}

export function TourExhibitOverlay() {
  const mode = useAppStore((s) => s.mode);
  const tourExhibit = useAppStore((s) => s.tourExhibit);
  const piece = findExhibitPiece(tourExhibit);
  const viewport = useViewport();

  if (mode !== "tour" || !piece) return null;

  const tiny = awardPieces.some((item) => item.id === piece.id);
  const frameSpec = tiny ? AWARDS_FRAME : GALLERY_FRAME;
  const photos = supplementalPhotos(piece);
  const hasPhotos = photos.length > 0;

  // Never clamp this below the true projected portrait width — clamping is what
  // caused side panels to slide on top of the image. 1.05 covers frame moulding.
  const portraitWidthPx = Math.ceil(
    projectedPixels(frameSpec.width, frameSpec.dist, frameSpec.fov, viewport.h) * 1.05,
  );
  const portraitHeightPx = Math.ceil(
    projectedPixels(frameSpec.height, frameSpec.dist, frameSpec.fov, viewport.h) * 1.05,
  );
  const centerSpacerWidth = portraitWidthPx + PORTRAIT_EDGE_GAP * 2;

  const leftWidth = LEFT_WIDTH;
  const rightWidth = hasPhotos ? RIGHT_WIDTH : 0;
  const availableWidth = viewport.w - OUTER_PAD;
  const neededWidth = leftWidth + centerSpacerWidth + rightWidth;
  const useThreeColumn = neededWidth <= availableWidth;

  const panelMaxHeight = Math.min(viewport.h - 180, 640);
  const stackPortraitHeight = Math.max(120, Math.min(portraitHeightPx * 1.05, viewport.h * 0.38));
  const stackPortraitWidth = Math.min(viewport.w - 48, Math.max(200, portraitWidthPx * 0.85));

  return (
    <div className="pointer-events-none absolute inset-0 z-40 px-4 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[8.75rem]">
      <section key={piece.id} data-look-block className="pointer-events-auto h-full w-full text-paper">
        {useThreeColumn ? (
          <div className="flex h-full w-full items-center justify-center">
            <article
              className="shrink-0 overflow-y-auto rounded-lg border border-white/18 bg-black/62 p-6 text-left shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px] sm:p-7"
              style={{
                width: leftWidth,
                maxHeight: panelMaxHeight,
              }}
            >
              <ExhibitCopy piece={piece} />
            </article>

            <div
              className="pointer-events-none shrink-0 grow-0"
              aria-hidden
              style={{
                width: centerSpacerWidth,
                minHeight: Math.max(portraitHeightPx * 0.85, 220),
              }}
            />

            {hasPhotos ? (
              <aside
                className="shrink-0 overflow-y-auto rounded-lg border border-white/18 bg-black/55 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-[8px]"
                style={{
                  width: rightWidth,
                  maxHeight: panelMaxHeight,
                }}
              >
                <PhotoRail photos={photos} className="grid grid-cols-1 gap-3" />
              </aside>
            ) : null}
          </div>
        ) : (
          <div className="mx-auto flex h-full max-w-[780px] flex-col gap-4 overflow-y-auto pb-4">
            <div
              className="pointer-events-none mx-auto shrink-0"
              style={{ width: stackPortraitWidth, height: stackPortraitHeight }}
            />
            <article className="shrink-0 rounded-lg border border-white/18 bg-black/62 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px] sm:p-6">
              <ExhibitCopy piece={piece} />
            </article>
            {hasPhotos ? (
              <aside className="shrink-0 pb-2">
                <PhotoRail photos={photos} className="grid grid-cols-1 gap-3 sm:grid-cols-2" />
              </aside>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
