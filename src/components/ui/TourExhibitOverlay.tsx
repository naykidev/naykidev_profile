import { awardPieces } from "@/data/achievements";
import { type GalleryPiece } from "@/data/projects";
import { ProjectLinks } from "@/components/ui/ProjectLinks";
import { findExhibitPiece } from "@/components/ui/ProjectView";
import { useAppStore } from "@/systems/store";

const VIEWPORT_STACK_BREAKPOINT = 980;
const GALLERY_FRAME = { width: 2.32, height: 1.62, fov: 46, dist: 2.58 };
const AWARDS_FRAME = { width: 1.64, height: 1.16, fov: 42, dist: 1.68 };

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
  return photos.filter((photo, index, list) => photo.src !== piece.portrait && list.findIndex((p) => p.src === photo.src) === index);
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

  const centerColumnWidth = Math.max(
    compact ? 0 : frameWidthPx + (hasPhotos ? 56 : 84),
    compact ? 0 : Math.min(viewportW * 0.34, 300),
  );
  const leftColumnMax = Math.min(430, Math.max(280, viewportW * 0.32));
  const rightColumnMax = Math.min(330, Math.max(220, viewportW * 0.24));
  const mobilePortraitGapHeight = Math.max(120, Math.min(frameHeightPx * 1.1, viewportH * 0.42));
  const mobilePortraitGapWidth = Math.min(viewportW - 48, Math.max(180, frameWidthPx));

  return (
    <div className="pointer-events-none absolute inset-0 z-40 px-4 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[8.75rem]">
      <section
        key={piece.id}
        data-look-block
        className="pointer-events-auto mx-auto h-full w-full max-w-[min(1300px,100%)] overflow-y-auto text-paper"
      >
        {compact ? (
          <div className="mx-auto flex max-w-[780px] flex-col gap-4 pb-4">
            <div className="pointer-events-none mx-auto" style={{ width: `${mobilePortraitGapWidth}px`, height: `${mobilePortraitGapHeight}px` }} />
            <article className="rounded-lg border border-white/18 bg-black/62 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px] sm:p-6">
              <p className="mb-2 font-ui text-[11px] tracking-[0.16em] text-paper/65 uppercase">{piece.context ?? "Project spotlight"}</p>
              <h2 className="mb-4 font-display text-[1.7rem] leading-tight font-semibold tracking-wide">{piece.name}</h2>
              <p className="mb-5 font-ui text-[15px] leading-[1.6] text-paper/95">{piece.summary}</p>
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
            </article>
            {hasPhotos ? (
              <aside className="grid grid-cols-1 gap-3 pb-2 sm:grid-cols-2">
                {photos.map((photo) => (
                  <figure key={photo.src} className="overflow-hidden rounded-md border border-white/20 bg-black/50">
                    <img src={photo.src} alt={photo.alt} className="block h-44 w-full object-cover" loading="lazy" />
                  </figure>
                ))}
              </aside>
            ) : null}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center gap-6">
            <article
              className="max-h-full flex-1 overflow-y-auto rounded-lg border border-white/18 bg-black/62 p-6 text-left shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px] sm:p-7"
              style={{ maxWidth: `${leftColumnMax}px` }}
            >
              <p className="mb-2 font-ui text-[11px] tracking-[0.16em] text-paper/65 uppercase">{piece.context ?? "Project spotlight"}</p>
              <h2 className="mb-4 font-display text-[1.8rem] leading-tight font-semibold tracking-wide">{piece.name}</h2>
              <p className="mb-5 font-ui text-[15px] leading-[1.6] text-paper/95">{piece.summary}</p>
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
            </article>

            <div className="pointer-events-none shrink-0" style={{ width: `${centerColumnWidth}px`, minHeight: `${Math.max(frameHeightPx + 24, 180)}px` }} />

            {hasPhotos ? (
              <aside
                className="max-h-full flex-1 overflow-y-auto rounded-lg border border-white/18 bg-black/55 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-[8px]"
                style={{ maxWidth: `${rightColumnMax}px` }}
              >
                <div className="grid grid-cols-1 gap-3">
                  {photos.map((photo) => (
                    <figure key={photo.src} className="overflow-hidden rounded-md border border-white/20 bg-black/55">
                      <img src={photo.src} alt={photo.alt} className="block max-h-52 w-full object-cover" loading="lazy" />
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
