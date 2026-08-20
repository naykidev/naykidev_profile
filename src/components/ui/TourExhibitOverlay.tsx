import { useSyncExternalStore } from "react";
import { awardPieces } from "@/data/achievements";
import { type GalleryPiece } from "@/data/projects";
import { ProjectLinks } from "@/components/ui/ProjectLinks";
import { findExhibitPiece } from "@/components/ui/ProjectView";
import { useAppStore } from "@/systems/store";

const GALLERY_FRAME = { width: 2.32, height: 1.62, fov: 46, dist: 2.58 };
const AWARDS_FRAME = { width: 1.64, height: 1.16, fov: 42, dist: 1.68 };
const STACK_BREAKPOINT = 900;
const COLUMN_GAP = 48;
const OUTER_PAD_X = 32;

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
      <p className="mb-3 font-ui text-xs tracking-[0.16em] text-paper/65 uppercase">
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

function PhotoRail({ photos }: { photos: { src: string; alt: string }[] }) {
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      {photos.map((photo) => (
        <figure
          key={photo.src}
          className="min-h-0 flex-1 overflow-hidden rounded-lg border border-white/20 bg-black/55"
        >
          <img src={photo.src} alt={photo.alt} className="block h-full w-full object-cover" loading="lazy" />
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

  const overlayTop = 72;
  const overlayBottom = 140;
  const availableH = Math.max(320, viewport.h - overlayTop - overlayBottom);
  const availableW = Math.max(320, viewport.w - OUTER_PAD_X);

  // Center box tracks the real projected portrait bounds.
  const portraitW = Math.ceil(
    projectedPixels(frameSpec.width, frameSpec.dist, frameSpec.fov, viewport.h) * 1.05,
  );
  const portraitH = Math.ceil(
    projectedPixels(frameSpec.height, frameSpec.dist, frameSpec.fov, viewport.h) * 1.05,
  );

  // Wireframe proportions relative to the portrait gap.
  // description ~29%, portrait ~43.5%, images ~23.5% of the content row.
  const descriptionW = Math.round(portraitW * (0.29 / 0.435));
  const imagesW = hasPhotos ? Math.round(portraitW * (0.235 / 0.435)) : 0;
  const descriptionH = Math.round(Math.min(availableH * 0.9, portraitH * 1.18));
  const imagesH = Math.round(descriptionH * 0.37);

  const rowWidth =
    descriptionW + COLUMN_GAP + portraitW + (hasPhotos ? COLUMN_GAP + imagesW : 0);
  const useThreeColumn = viewport.w >= STACK_BREAKPOINT && rowWidth <= availableW;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 px-4 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[8.75rem]">
      <section key={piece.id} data-look-block className="pointer-events-auto h-full w-full text-paper">
        {useThreeColumn ? (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ gap: COLUMN_GAP }}
          >
            {/* Description — tallest box, content flows from the top */}
            <article
              className="shrink-0 overflow-y-auto rounded-lg border border-white/18 bg-black/62 text-left shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px]"
              style={{
                width: descriptionW,
                height: descriptionH,
                padding: "36px",
              }}
            >
              <ExhibitCopy piece={piece} />
            </article>

            {/* Portrait gap — empty spacer matching projected frame bounds */}
            <div
              className="pointer-events-none shrink-0"
              aria-hidden
              style={{
                width: portraitW,
                height: portraitH,
              }}
            />

            {/* Images — shortest box, vertically centered with the portrait */}
            {hasPhotos ? (
              <aside
                className="shrink-0 overflow-hidden rounded-lg border border-white/18 bg-black/55 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-[8px]"
                style={{
                  width: imagesW,
                  height: imagesH,
                }}
              >
                <PhotoRail photos={photos} />
              </aside>
            ) : null}
          </div>
        ) : (
          <div className="mx-auto flex h-full max-w-[780px] flex-col items-center gap-5 overflow-y-auto pb-4">
            <div
              className="pointer-events-none shrink-0"
              aria-hidden
              style={{
                width: Math.min(availableW - 16, Math.max(200, portraitW * 0.85)),
                height: Math.max(120, Math.min(portraitH * 0.95, availableH * 0.36)),
              }}
            />
            <article
              className="w-full shrink-0 rounded-lg border border-white/18 bg-black/62 text-left shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px]"
              style={{ padding: "32px" }}
            >
              <ExhibitCopy piece={piece} />
            </article>
            {hasPhotos ? (
              <aside
                className="w-full max-w-[420px] shrink-0 rounded-lg border border-white/18 bg-black/55 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-[8px]"
                style={{ height: Math.max(160, Math.min(imagesH, 280)) }}
              >
                <PhotoRail photos={photos} />
              </aside>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
