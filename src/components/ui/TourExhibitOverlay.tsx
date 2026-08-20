import { useSyncExternalStore } from "react";
import { awardPieces } from "@/data/achievements";
import { type GalleryPiece } from "@/data/projects";
import { ProjectLinks } from "@/components/ui/ProjectLinks";
import { findExhibitPiece } from "@/components/ui/ProjectView";
import { useAppStore } from "@/systems/store";

const GALLERY_FRAME = { width: 2.32, height: 1.62, fov: 46, dist: 2.58 };
const AWARDS_FRAME = { width: 1.64, height: 1.16, fov: 42, dist: 1.68 };
const DESCRIPTION_MAX = 420;
const IMAGES_MAX = 300;
const DESCRIPTION_MIN = 320;
const IMAGES_MIN = 240;
const SIDE_INSET = 16;
const PORTRAIT_GAP = 36;
/** Keep the open center from eating the side gutters — panels stay readable. */
const CENTER_MAX_VIEWPORT_FRAC = 0.4;

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

const NO_SIDE_IMAGES = new Set(["dodo", "axol-assist", "surf-del-mar", "freddy-takes-flight"]);

function supplementalPhotos(piece: GalleryPiece) {
  if (NO_SIDE_IMAGES.has(piece.id)) return [];
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

  const projectedPortraitW = Math.ceil(
    projectedPixels(frameSpec.width, frameSpec.dist, frameSpec.fov, viewport.h) * 1.08,
  );

  // Cap the reserved center so the description stays readable; only reserve
  // right-side room when there are real supplemental photos.
  const rightReserve = hasPhotos ? IMAGES_MIN + PORTRAIT_GAP + SIDE_INSET : SIDE_INSET;
  const maxCenter = Math.min(
    projectedPortraitW,
    Math.floor(viewport.w * CENTER_MAX_VIEWPORT_FRAC),
    viewport.w - DESCRIPTION_MIN - PORTRAIT_GAP - SIDE_INSET - rightReserve,
  );
  const centerWidth = Math.max(280, maxCenter);

  const portraitLeft = (viewport.w - centerWidth) / 2;
  const portraitRight = portraitLeft + centerWidth;

  const descriptionWidth = Math.min(
    DESCRIPTION_MAX,
    Math.max(DESCRIPTION_MIN, Math.floor(portraitLeft - PORTRAIT_GAP - SIDE_INSET)),
  );
  const imagesWidth = hasPhotos
    ? Math.min(
        IMAGES_MAX,
        Math.max(IMAGES_MIN, Math.floor(viewport.w - portraitRight - PORTRAIT_GAP - SIDE_INSET)),
      )
    : 0;

  const descriptionLeft = Math.max(SIDE_INSET, portraitLeft - PORTRAIT_GAP - descriptionWidth);
  const imagesLeft = portraitRight + PORTRAIT_GAP;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[8.75rem]">
      <section key={piece.id} data-look-block className="pointer-events-auto relative h-full w-full text-paper">
        {/* LEFT of portrait — never centered */}
        <div
          className="description-panel absolute overflow-y-auto rounded-xl border border-white/18 bg-[rgba(20,20,20,0.85)] text-left shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px]"
          style={{
            left: descriptionLeft,
            top: "50%",
            transform: "translateY(-50%)",
            width: descriptionWidth,
            height: "80%",
            padding: 32,
          }}
        >
          <ExhibitCopy piece={piece} />
        </div>

        {/* CENTER — empty; 3D portrait shows through */}
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

        {/* RIGHT of portrait — only real supplemental photos (no portrait duplicate) */}
        {hasPhotos ? (
          <div
            className="images-panel absolute overflow-hidden rounded-xl border border-white/18 bg-[rgba(20,20,20,0.85)] shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-[8px]"
            style={{
              left: imagesLeft,
              top: "50%",
              transform: "translateY(-50%)",
              width: imagesWidth,
              height: "40%",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {photos.map((photo) => (
              <figure
                key={photo.src}
                className="m-0 overflow-hidden rounded-lg border border-white/20 bg-black/40"
                style={{ width: "100%", flex: "1 1 0", minHeight: 140 }}
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
      </section>
    </div>
  );
}
