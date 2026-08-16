import { X } from "lucide-react";

export function CloseButton({ onClick, label = "Close" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/25 text-paper/80 backdrop-blur-[10px] transition duration-200 hover:scale-105 hover:bg-white/10 hover:text-paper"
    >
      <X size={16} strokeWidth={1.6} />
    </button>
  );
}
