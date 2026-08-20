import { awardPieces } from "@/data/achievements";
import { type GalleryPiece } from "@/data/projects";
import { ProjectLinks } from "@/components/ui/ProjectLinks";
import { findExhibitPiece } from "@/components/ui/ProjectView";
import { useAppStore } from "@/systems/store";

const VIEWPORT_STACK_BREAKPOINT = 980;
const GALLERY_FRAME = { width: 2.32, height: 1.62, fov: 46, dist: 2.58 };
const AWARDS_FRAME = { width: 1.64, height: 1.16, fov: 42, dist: 1.68 };
const LEFT_MIN = 360;
const RIGHT_MIN = 280;

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

export function TourExhibitOverlay() {
  const mode = useAppStore((s) => s.mode);
  const tourExhibit = useAppStore((s) => s.tourExhibit);
  const piece = findExhibitPiece(tourExhibit);
  if (mode !== "tour" || !piece) return null;

  const tiny = awardPieces.some((item) => item.id === piece.id);
  const frameSpec = tiny ? AWARDS_FRAME : GALLERY_FRAME;
  const viewportW = typeof window === "undefined" ? 1280 : window.innerWidth;
  const viewportH = typeof window === "undefined" ? 720 : window.innerHeight;
  const compact = viewportW < VIEWPORT_STACK_BREAKPOINT;

  const frameWidthPx = projectedPixels(frameSpec.width, frameSpec.dist, frameSpec.fov, viewportH);
  const frameHeightPx = projectedPixels(frameSpec.height, frameSpec.dist, frameSpec.fov, viewportH);
  const photos = supplementalPhotos(piece);
  const hasPhotos = photos.length > 0;

  const contentW = Math.max(720, viewportW - 32);
  const gap = 24;
  const leftWidth = Math.min(420, Math.max(LEFT_MIN, Math.round(contentW * 0.3)));
  const rightWidth = hasPhotos
    ? Math.min(320, Math.max(RIGHT_MIN, Math.round(contentW * 0.28)))
    : 0;
  const sideBudget = leftWidth + rightWidth + gap * (hasPhotos ? 2 : 1);
  const centerMax = Math.max(220, contentW - sideBudget);
  const centerColumnWidth = Math.min(
    Math.max(Math.round(frameWidthPx), Math.round(contentW * 0.36)),
    centerMax,
    Math.round(contentW * 0.42),
  );
  const panelMaxHeight = Math.min(viewportH - 180, 640);
  const mobilePortraitGapHeight = Math.max(120, Math.min(frameHeightPx * 1.05, viewportH * 0.38));
  const mobilePortraitGapWidth = Math.min(viewportW - 48, Math.max(200, frameWidthPx * 0.85));

  return (
    <div className="pointer-events-none absolute inset-0 z-40 px-4 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[8.75rem]">
      <section
        key={piece.id}
        data-look-block
        className="pointer-events-auto mx-auto h-full w-full max-w-[1440px] text-paper"
      >
        {compact ? (
          <div className="mx-auto flex h-full max-w-[780px] flex-col gap-4 overflow-y-auto pb-4">
            <div
              className="pointer-events-none mx-auto shrink-0"
              style={{ width: `${mobilePortraitGapWidth}px`, height: `${mobilePortraitGapHeight}px` }}
            />
            <article className="shrink-0 rounded-lg border border-white/18 bg-black/62 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px] sm:p-6">
              <ExhibitCopy piece={piece} />
            </article>
            {hasPhotos ? (
              <aside className="grid shrink-0 grid-cols-1 gap-3 pb-2 sm:grid-cols-2">
                {photos.map((photo) => (
                  <figure
                    key={photo.src}
                    className="overflow-hidden rounded-lg border border-white/20 bg-black/50"
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="block h-48 w-full object-cover"
                      loading="lazy"
                    />
                  </figure>
                ))}
              </aside>
            ) : null}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center gap-6">
            <article
              className="shrink-0 overflow-y-auto rounded-lg border border-white/18 bg-black/62 p-6 text-left shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px] sm:p-7"
              style={{
                width: `${leftWidth}px`,
                minWidth: `${LEFT_MIN}px`,
                maxHeight: `${panelMaxHeight}px`,
              }}
            >
              <ExhibitCopy piece={piece} />
            </article>

            <div
              className="pointer-events-none shrink-0"
              aria-hidden
              style={{
                width: `${centerColumnWidth}px`,
                minHeight: `${Math.max(frameHeightPx * 0.85, 220)}px`,
              }}
            />

            {hasPhotos ? (
              <aside
                className="shrink-0 overflow-y-auto rounded-lg border border-white/18 bg-black/55 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-[8px]"
                style={{
                  width: `${rightWidth}px`,
                  minWidth: `${RIGHT_MIN}px`,
                  maxHeight: `${panelMaxHeight}px`,
                }}
              >
                <div className="grid grid-cols-1 gap-3">
                  {photos.map((photo) => (
                    <figure
                      key={photo.src}
                      className="overflow-hidden rounded-lg border border-white/20 bg-black/55"
                    >
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
              </aside>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
