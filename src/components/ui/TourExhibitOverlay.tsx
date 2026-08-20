import { useSyncExternalStore } from "react";
import { awardPieces } from "@/data/achievements";
import { type GalleryPiece } from "@/data/projects";
import { ProjectLinks } from "@/components/ui/ProjectLinks";
import { findExhibitPiece } from "@/components/ui/ProjectView";
import { useAppStore } from "@/systems/store";

const GALLERY_FRAME = { width: 2.32, height: 1.62, fov: 46, dist: 2.58 };
const AWARDS_FRAME = { width: 1.64, height: 1.16, fov: 42, dist: 1.68 };
const STACK_BREAKPOINT = 900;
const DESCRIPTION_WIDTH = 340;
const IMAGES_WIDTH = 260;
const COLUMN_GAP = 48;
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
      <h2 className="mb-4 font-display text-[1.85rem] leading-tight font-semibold tracking-wide">
        {piece.name}
      </h2>
      <p className="mb-5 font-ui text-[15px] leading-[1.55] text-pretty text-paper/95">
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
  const frameSpec = tiny ? AWARDS_FRAME : GALLERY_FRAME;
  const photos = supplementalPhotos(piece);
  const hasPhotos = photos.length > 0;

  const portraitWidth = Math.ceil(
    projectedPixels(frameSpec.width, frameSpec.dist, frameSpec.fov, viewport.h) * 1.05,
  );
  const portraitHeight = Math.ceil(
    projectedPixels(frameSpec.height, frameSpec.dist, frameSpec.fov, viewport.h) * 1.05,
  );

  const imagesWidth = hasPhotos ? IMAGES_WIDTH : 0;
  const rowWidth =
    DESCRIPTION_WIDTH + COLUMN_GAP + portraitWidth + (hasPhotos ? COLUMN_GAP + imagesWidth : 0);
  const useThreeColumn = viewport.w >= STACK_BREAKPOINT && rowWidth <= viewport.w - OUTER_PAD;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 px-4 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[8.75rem]">
      <section key={piece.id} data-look-block className="pointer-events-auto h-full w-full text-paper">
        {useThreeColumn ? (
          <div
            className="gallery-overlay-row flex h-full w-full items-center justify-center"
            style={{ gap: COLUMN_GAP }}
          >
            <div
              className="description-panel shrink-0 grow-0 overflow-y-auto rounded-xl border border-white/18 bg-[rgba(20,20,20,0.85)] text-left shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px]"
              style={{
                flex: `0 0 ${DESCRIPTION_WIDTH}px`,
                width: DESCRIPTION_WIDTH,
                maxWidth: DESCRIPTION_WIDTH,
                height: "80%",
                padding: 32,
              }}
            >
              <ExhibitCopy piece={piece} />
            </div>

            <div
              className="portrait-spacer pointer-events-none shrink-0 grow-0"
              aria-hidden
              style={{
                flex: `0 0 ${portraitWidth}px`,
                width: portraitWidth,
                height: Math.max(portraitHeight, Math.round(viewport.h * 0.45)),
                background: "transparent",
                border: "none",
                boxShadow: "none",
              }}
            />

            {hasPhotos ? (
              <div
                className="images-panel shrink-0 grow-0 overflow-hidden rounded-xl border border-white/18 bg-[rgba(20,20,20,0.85)] p-3 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-[8px]"
                style={{
                  flex: `0 0 ${IMAGES_WIDTH}px`,
                  width: IMAGES_WIDTH,
                  maxWidth: IMAGES_WIDTH,
                  height: "40%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {photos.map((photo) => (
                  <figure
                    key={photo.src}
                    className="m-0 overflow-hidden rounded-lg border border-white/20 bg-black/40"
                    style={{ width: "100%", flex: "1 1 auto", minHeight: 120 }}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="block"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        position: "static",
                      }}
                      loading="lazy"
                    />
                  </figure>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mx-auto flex h-full max-w-[720px] flex-col items-center gap-5 overflow-y-auto pb-4">
            <div
              className="portrait-spacer pointer-events-none shrink-0"
              aria-hidden
              style={{
                width: Math.min(viewport.w - 48, Math.max(220, portraitWidth * 0.8)),
                height: Math.max(140, Math.min(portraitHeight * 0.9, viewport.h * 0.34)),
                background: "transparent",
              }}
            />
            <div
              className="description-panel w-full shrink-0 overflow-y-auto rounded-xl border border-white/18 bg-[rgba(20,20,20,0.85)] text-left shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px]"
              style={{ padding: 32, maxWidth: 520 }}
            >
              <ExhibitCopy piece={piece} />
            </div>
            {hasPhotos ? (
              <div
                className="images-panel w-full shrink-0 rounded-xl border border-white/18 bg-[rgba(20,20,20,0.85)] p-3 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-[8px]"
                style={{
                  maxWidth: IMAGES_WIDTH,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {photos.map((photo) => (
                  <figure
                    key={photo.src}
                    className="m-0 overflow-hidden rounded-lg border border-white/20 bg-black/40"
                    style={{ width: "100%", height: 180 }}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="block h-full w-full"
                      style={{ objectFit: "cover", position: "static" }}
                      loading="lazy"
                    />
                  </figure>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
