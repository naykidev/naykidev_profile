import { ProjectCopy, ProjectMedia, findExhibitPiece } from "@/components/ui/ProjectView";
import { useAppStore } from "@/systems/store";

export function TourExhibitOverlay() {
  const mode = useAppStore((s) => s.mode);
  const interior = useAppStore((s) => s.interior);
  const tourExhibit = useAppStore((s) => s.tourExhibit);
  const piece = findExhibitPiece(tourExhibit);
  if (mode !== "tour" || !piece) return null;
  const awards = interior === "awards";

  return (
    <div className="pointer-events-none absolute inset-0 z-[25]">
      <aside
        data-look-block
        className="pointer-events-auto absolute top-[max(4.75rem,calc(env(safe-area-inset-top)+3.6rem))] left-[max(0.75rem,env(safe-area-inset-left))] flex max-h-[calc(100%-11.5rem)] w-[min(20.5rem,72vw)] flex-col items-start overflow-y-auto rounded-lg border border-white/15 bg-black/55 p-5 text-left text-paper shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-[8px] sm:w-[min(24rem,32vw)]"
      >
        <h2 className="pr-2 font-display text-2xl leading-tight sm:text-3xl">{piece.name}</h2>
        <div className="mt-3 w-full">
          <ProjectCopy piece={piece} />
        </div>
      </aside>
      <div className="pointer-events-auto absolute top-[max(4.75rem,calc(env(safe-area-inset-top)+3.6rem))] right-[max(0.75rem,env(safe-area-inset-right))] hidden max-h-[calc(100%-11.5rem)] w-[min(36rem,42vw)] overflow-y-auto rounded-lg border border-white/12 bg-black/35 p-4 backdrop-blur-[6px] lg:block">
        <ProjectMedia piece={piece} awards={awards} />
      </div>
    </div>
  );
}
