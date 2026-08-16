export function FramedCertificate({
  src,
  alt,
  href,
}: {
  src: string;
  alt: string;
  href?: string;
}) {
  return (
    <figure className="mt-4 max-w-xl">
      <div className="bg-gradient-to-br from-[#e8d3a8] via-[#8f6b45] to-[#3a2418] p-[11px] shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
        <div className="bg-[#f7f1e4] p-2.5">
          <img src={src} alt={alt} className="block w-full" />
        </div>
      </div>
      {href ? (
        <figcaption className="mt-2 font-ui text-[11px] tracking-[0.16em] uppercase">
          <a href={href} className="text-paper/70 underline-offset-4 hover:text-paper" target="_blank" rel="noreferrer">
            Verify certificate
          </a>
        </figcaption>
      ) : null}
    </figure>
  );
}
