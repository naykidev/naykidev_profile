import { useAppStore } from "@/systems/store";

const chip =
  "rounded-full border border-white/15 bg-black/25 px-3 py-1.5 font-ui text-[10px] tracking-[0.16em] text-paper uppercase backdrop-blur-[10px] transition hover:bg-white/10";

export function AccessibilityMenu() {
  const highContrast = useAppStore((s) => s.highContrast);
  const toggleHighContrast = useAppStore((s) => s.toggleHighContrast);
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  return (
    <div className="pointer-events-auto absolute top-4 right-4 z-[70] flex gap-2">
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
