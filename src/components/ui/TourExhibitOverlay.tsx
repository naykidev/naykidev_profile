import { ProjectCopy, findExhibitPiece } from "@/components/ui/ProjectView";
import { useAppStore } from "@/systems/store";

export function TourExhibitOverlay() {
  const mode = useAppStore((s) => s.mode);
  const tourExhibit = useAppStore((s) => s.tourExhibit);
  const piece = findExhibitPiece(tourExhibit);
  if (mode !== "tour" || !piece) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-4 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[8.75rem]">
      <article
        key={piece.id}
        data-look-block
        className="pointer-events-auto max-h-full w-[90%] max-w-[650px] overflow-y-auto rounded-lg border border-white/18 bg-black/62 p-6 text-left text-paper shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-[10px] sm:p-8"
      >
        <h2 className="mb-5 font-display text-[1.8rem] leading-tight font-semibold tracking-wide">
          {piece.name}
        </h2>
        <ProjectCopy piece={piece} />
      </article>
    </div>
  );
}
