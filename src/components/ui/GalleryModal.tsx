import { CloseButton } from "@/components/ui/CloseButton";
import { ProjectCopy, ProjectMedia, findExhibitPiece } from "@/components/ui/ProjectView";
import { useAppStore } from "@/systems/store";

export function GalleryModal() {
  const id = useAppStore((s) => s.galleryProjectId);
  const interior = useAppStore((s) => s.interior);
  const close = useAppStore((s) => s.setGalleryProject);
  const piece = findExhibitPiece(id);
  if (!piece) return null;
  const hallLabel = interior === "awards" ? "Awards & Certificates" : "Projects Gallery";
  const awards = interior === "awards";

  return (
    <div
      data-look-block
      className="absolute inset-0 z-40 flex items-end justify-center bg-[#1c1814]/55 px-3 pt-[max(3.5rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[3px] sm:items-center sm:px-4"
      onClick={() => close(null)}
      role="presentation"
    >
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-piece-title"
        className="relative grid max-h-[min(88dvh,100%)] w-full max-w-5xl grid-cols-1 gap-6 overflow-y-auto rounded-lg border border-paper/20 bg-[#1c1814]/92 p-5 text-left text-paper sm:gap-8 sm:p-7 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,2fr)]"
        onClick={(event) => event.stopPropagation()}
      >
        <CloseButton onClick={() => close(null)} />
        <div className="flex min-w-0 flex-col items-start">
          <p className="font-ui text-[10px] tracking-[0.32em] text-paper/55 uppercase">{hallLabel}</p>
          <h2 id="gallery-piece-title" className="mt-2 pr-10 font-display text-3xl sm:text-4xl">
            {piece.name}
          </h2>
          <div className="mt-4 w-full">
            <ProjectCopy piece={piece} />
          </div>
        </div>
        <div className="min-w-0">
          <ProjectMedia piece={piece} awards={awards} />
        </div>
      </article>
    </div>
  );
}
