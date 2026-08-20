import { CloseButton } from "@/components/ui/CloseButton";
import { ProjectCopy, findExhibitPiece } from "@/components/ui/ProjectView";
import { useAppStore } from "@/systems/store";

export function GalleryModal() {
  const id = useAppStore((s) => s.galleryProjectId);
  const interior = useAppStore((s) => s.interior);
  const close = useAppStore((s) => s.setGalleryProject);
  const piece = findExhibitPiece(id);
  if (!piece) return null;
  const hallLabel = interior === "awards" ? "Awards & Certificates" : "Projects Gallery";

  return (
    <div
      data-look-block
      className="absolute inset-0 z-40 flex items-center justify-center bg-[#1c1814]/55 px-4 pt-[max(3.5rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-[3px]"
      onClick={() => close(null)}
      role="presentation"
    >
      <article
        key={piece.id}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-piece-title"
        className="relative max-h-[min(88dvh,100%)] w-[90%] max-w-[650px] overflow-y-auto rounded-lg border border-paper/20 bg-[#1c1814]/92 p-6 text-left text-paper sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <CloseButton onClick={() => close(null)} />
        <p className="font-ui text-[10px] tracking-[0.32em] text-paper/55 uppercase">{hallLabel}</p>
        <h2 id="gallery-piece-title" className="mt-2 mb-5 pr-10 font-display text-[1.8rem] leading-tight font-semibold">
          {piece.name}
        </h2>
        <ProjectCopy piece={piece} />
      </article>
    </div>
  );
}
