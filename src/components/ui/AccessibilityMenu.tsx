import { useAppStore } from "@/systems/store";

const chip =
  "min-h-9 rounded-full border border-white/15 bg-black/25 px-2.5 py-1.5 font-ui text-[9px] tracking-[0.12em] text-paper uppercase backdrop-blur-[10px] transition hover:bg-white/10 sm:min-h-0 sm:px-3 sm:text-[10px] sm:tracking-[0.16em]";

export function AccessibilityMenu() {
  const highContrast = useAppStore((s) => s.highContrast);
  const toggleHighContrast = useAppStore((s) => s.toggleHighContrast);
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  return (
    <div
      data-look-block
      className="pointer-events-auto absolute top-[max(0.65rem,env(safe-area-inset-top))] right-[max(0.65rem,env(safe-area-inset-right))] z-[70] flex max-w-[calc(100%-5.5rem)] flex-wrap justify-end gap-1.5 sm:top-4 sm:right-4 sm:gap-2"
    >
      <button type="button" className={chip} onClick={toggleHighContrast} aria-pressed={highContrast}>
        {highContrast ? "Contrast on" : "High contrast"}
      </button>
      {mode !== "traditional" ? (
        <button type="button" className={chip} onClick={() => setMode("traditional")}>
          Skip 3D
        </button>
      ) : (
        <button type="button" className={chip} onClick={() => setMode("intro")}>
          Enter campus
        </button>
      )}
    </div>
  );
}
