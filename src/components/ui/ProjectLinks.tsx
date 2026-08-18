import { useState } from "react";
import type { ProjectLink } from "@/data/projects";

const linkClass =
  "border border-paper/30 px-3 py-2 font-ui text-[10px] tracking-[0.18em] text-paper uppercase hover:bg-paper/10";

export function ProjectLinks({ links }: { links?: readonly ProjectLink[] }) {
  if (!links?.length) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {links.map((link) => (
        <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={linkClass}>
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function ProjectPhoto({
  src,
  alt,
  photos,
}: {
  src?: string;
  alt?: string;
  photos?: readonly { src: string; alt: string }[];
}) {
  const slides = photos?.length ? photos : src ? [{ src, alt: alt ?? "" }] : [];
  const [index, setIndex] = useState(0);
  if (!slides.length) return null;
  const current = slides[Math.min(index, slides.length - 1)];
  const multi = slides.length > 1;
  const go = (dir: -1 | 1) => setIndex((n) => (n + dir + slides.length) % slides.length);

  return (
    <figure
        className="relative mt-0 w-full"
      tabIndex={multi ? 0 : undefined}
      onKeyDown={(event) => {
        if (!multi) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(1);
        }
      }}
    >
      <img src={current.src} alt={current.alt} className="w-full border border-paper/15 object-cover" />
      {multi ? (
        <>
          <button
            type="button"
            className="absolute top-1/2 left-2 -translate-y-1/2 border border-paper/40 bg-ink/70 px-2 py-1 font-ui text-xs text-paper"
            aria-label="Previous screenshot"
            onClick={(event) => {
              event.stopPropagation();
              go(-1);
            }}
          >
            ←
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-2 -translate-y-1/2 border border-paper/40 bg-ink/70 px-2 py-1 font-ui text-xs text-paper"
            aria-label="Next screenshot"
            onClick={(event) => {
              event.stopPropagation();
              go(1);
            }}
          >
            →
          </button>
          <p className="mt-2 text-center font-ui text-[10px] tracking-[0.16em] text-paper/50 uppercase">
            {index + 1} / {slides.length}
          </p>
        </>
      ) : null}
    </figure>
  );
}
