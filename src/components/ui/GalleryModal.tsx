import { CloseButton } from "@/components/ui/CloseButton";
import { awardPieces } from "@/data/achievements";
import { galleryPieces } from "@/data/projects";
import { FramedCertificate } from "@/components/ui/FramedCertificate";
import { ProjectLinks, ProjectPhoto } from "@/components/ui/ProjectLinks";
import { useAppStore } from "@/systems/store";

export function GalleryModal() {
  const id = useAppStore((s) => s.galleryProjectId);
  const interior = useAppStore((s) => s.interior);
  const close = useAppStore((s) => s.setGalleryProject);
  const piece =
    galleryPieces.find((item) => item.id === id) ?? awardPieces.find((item) => item.id === id);
  if (!piece) return null;
  const hallLabel = interior === "awards" ? "Awards & Certificates" : "Projects Gallery";

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
        className="relative max-h-[min(88dvh,100%)] w-full max-w-xl overflow-y-auto border border-paper/20 bg-[#1c1814]/92 px-5 py-7 text-paper sm:px-7 sm:py-8"
        onClick={(event) => event.stopPropagation()}
      >
        <CloseButton onClick={() => close(null)} />
        <p className="font-ui text-[10px] tracking-[0.32em] text-paper/55 uppercase">
          {hallLabel}
        </p>
        <h2 id="gallery-piece-title" className="mt-2 pr-10 font-display text-3xl sm:text-4xl">
          {piece.name}
        </h2>
        {piece.context ? (
          <p className="mt-2 font-ui text-[11px] tracking-[0.16em] text-paper/55 uppercase">{piece.context}</p>
        ) : null}
        {interior === "awards" && piece.photo ? (
          <FramedCertificate src={piece.photo} alt={piece.photoAlt ?? piece.name} href={piece.links?.[0]?.href} />
        ) : (
          <ProjectPhoto src={piece.photo} alt={piece.photoAlt} photos={piece.photos} />
        )}
        <p className="mt-4 font-ui text-sm leading-relaxed text-paper/85">{piece.summary}</p>
        {piece.technologies.length > 0 ? (
          <>
            <p className="mt-5 font-ui text-[10px] tracking-[0.22em] text-paper/50 uppercase">
              Tech stack
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {piece.technologies.map((item) => (
                <li key={item} className="border border-paper/20 px-2 py-1 font-ui text-xs">
                  {item}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <ProjectLinks links={piece.links} />
        {(piece.github || piece.demo) && !piece.links?.length ? (
          <div className="mt-6 flex flex-wrap gap-3">
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
      </article>
    </div>
  );
}
