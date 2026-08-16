import { profile } from "@/data/profile";

export function TraditionalPortfolio() {
  return (
    <main className="flex h-full flex-col bg-[#1c1814] pt-[max(3.5rem,calc(env(safe-area-inset-top)+2.75rem))]">
      <object
        data={profile.resume}
        type="application/pdf"
        className="min-h-0 w-full flex-1 bg-white"
        aria-label={`${profile.name} resume`}
      >
        <div className="flex h-full items-center justify-center px-6 text-center">
          <a
            href={profile.resume}
            className="font-ui text-sm tracking-[0.16em] text-paper uppercase underline"
          >
            Open resume PDF
          </a>
        </div>
      </object>
    </main>
  );
}
