import { awardPieces } from "@/data/achievements";
import { galleryPieces, type GalleryPiece } from "@/data/projects";
import { FramedCertificate } from "@/components/ui/FramedCertificate";
import { ProjectLinks, ProjectPhoto } from "@/components/ui/ProjectLinks";

export function findExhibitPiece(id: string | null | undefined) {
  if (!id) return null;
  return galleryPieces.find((item) => item.id === id) ?? awardPieces.find((item) => item.id === id) ?? null;
}

export function ProjectCopy({ piece }: { piece: GalleryPiece }) {
  return (
    <div className="flex flex-col items-start text-left">
      {piece.context ? (
        <p className="font-ui text-[11px] tracking-[0.16em] text-paper/60 uppercase">{piece.context}</p>
      ) : null}
      <p className="mt-3 font-ui text-sm leading-relaxed text-paper/90">{piece.summary}</p>
      {piece.technologies.length > 0 ? (
        <>
          <p className="mt-5 font-ui text-[10px] tracking-[0.22em] text-paper/55 uppercase">Tech stack</p>
          <ul className="mt-2 flex flex-wrap justify-start gap-2">
            {piece.technologies.map((item) => (
              <li key={item} className="border border-white/20 bg-black/25 px-2 py-1 font-ui text-xs">
                {item}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <ProjectLinks links={piece.links} />
      {(piece.github || piece.demo) && !piece.links?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {piece.github ? (
            <a
              href={piece.github}
              target="_blank"
              rel="noreferrer"
              className="border border-paper/30 px-3 py-2 font-ui text-[10px] tracking-[0.18em] uppercase"
            >
              GitHub
            </a>
          ) : null}
          {piece.demo ? (
            <a
              href={piece.demo}
              target="_blank"
              rel="noreferrer"
              className="border border-paper/30 px-3 py-2 font-ui text-[10px] tracking-[0.18em] uppercase"
            >
              Live Demo
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ProjectMedia({ piece, awards }: { piece: GalleryPiece; awards?: boolean }) {
  if (awards && piece.photo) {
    return <FramedCertificate src={piece.photo} alt={piece.photoAlt ?? piece.name} href={piece.links?.[0]?.href} />;
  }
  return (
    <ProjectPhoto
      src={piece.photo ?? piece.portrait}
      alt={piece.photoAlt ?? piece.name}
      photos={piece.photos}
    />
  );
}
