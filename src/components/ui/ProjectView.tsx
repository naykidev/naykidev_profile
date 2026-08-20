import { awardPieces } from "@/data/achievements";
import { galleryPieces, type GalleryPiece } from "@/data/projects";
import { ProjectLinks } from "@/components/ui/ProjectLinks";

export function findExhibitPiece(id: string | null | undefined) {
  if (!id) return null;
  return galleryPieces.find((item) => item.id === id) ?? awardPieces.find((item) => item.id === id) ?? null;
}

export function ProjectCopy({ piece }: { piece: GalleryPiece }) {
  return (
    <div className="flex w-full flex-col items-stretch text-left">
      {piece.context ? (
        <p className="mb-3 font-ui text-[11px] tracking-[0.16em] text-paper/65 uppercase">{piece.context}</p>
      ) : null}
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
      {(piece.github || piece.demo) && !piece.links?.length ? (
        <div className="flex flex-wrap gap-2">
          {piece.github ? (
            <a
              href={piece.github}
              target="_blank"
              rel="noreferrer"
              className="overlay-chip rounded-full px-4 py-2.5 font-ui text-[11px] tracking-[0.16em] uppercase"
            >
              GitHub
            </a>
          ) : null}
          {piece.demo ? (
            <a
              href={piece.demo}
              target="_blank"
              rel="noreferrer"
              className="overlay-chip rounded-full px-4 py-2.5 font-ui text-[11px] tracking-[0.16em] uppercase"
            >
              Live Demo
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
