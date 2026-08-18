import { profile } from "@/data/profile";
import { useAppStore } from "@/systems/store";

const chip =
  "overlay-chip inline-flex min-h-11 items-center rounded-full px-3 py-2 font-ui text-[9px] tracking-[0.16em] uppercase sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-[0.18em]";

export function AccessibilityMenu() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const skipIntro = useAppStore((s) => s.skipIntro);
  const activePanel = useAppStore((s) => s.activePanel);
  const openPanel = useAppStore((s) => s.openPanel);
  const closePanel = useAppStore((s) => s.closePanel);

  const goHome = () => {
    closePanel();
    if (mode === "intro") {
      skipIntro();
      return;
    }
    setMode("intro");
  };

  return (
    <div
      data-look-block
      className="pointer-events-auto absolute top-[max(0.65rem,env(safe-area-inset-top))] right-[max(0.65rem,env(safe-area-inset-right))] z-[70] flex max-w-[calc(100%-5.5rem)] flex-wrap justify-end gap-2 sm:top-4 sm:right-4 sm:gap-2"
    >
      <button type="button" className={chip} onClick={goHome}>
        Home
      </button>
      <button
        type="button"
        className={chip}
        aria-pressed={activePanel === "about"}
        onClick={() => {
          if (activePanel === "about") closePanel();
          else openPanel("about");
        }}
      >
        About Me
      </button>
      {mode !== "traditional" ? (
        <button type="button" className={chip} onClick={() => setMode("traditional")}>
          Resume
        </button>
      ) : (
        <button type="button" className={chip} onClick={goHome}>
          Enter campus
        </button>
      )}
      <a
        className={`${chip}`}
        href={profile.linkedin}
        target="_blank"
        rel="noreferrer"
        aria-label="Aaron Nayki LinkedIn profile"
      >
        LinkedIn
      </a>
    </div>
  );
}
