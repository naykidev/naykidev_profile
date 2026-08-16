import { X } from "lucide-react";

export function CloseButton({ onClick, label = "Close" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-paper/80 backdrop-blur-[10px] transition duration-200 hover:scale-105 hover:bg-white/10 hover:text-paper sm:top-4 sm:right-4 sm:h-9 sm:w-9"
    >
      <X size={16} strokeWidth={1.6} />
    </button>
  );
}
