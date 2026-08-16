import { profile } from "@/data/profile";
import { useAppStore } from "@/systems/store";

const chip =
  "min-h-9 rounded-full border border-white/15 bg-black/25 px-2.5 py-1.5 font-ui text-[9px] tracking-[0.12em] text-paper uppercase backdrop-blur-[10px] transition hover:bg-white/10 sm:min-h-0 sm:px-3 sm:text-[10px] sm:tracking-[0.16em]";

export function AccessibilityMenu() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const skipIntro = useAppStore((s) => s.skipIntro);
  const activePanel = useAppStore((s) => s.activePanel);
  const openPanel = useAppStore((s) => s.openPanel);
  const closePanel = useAppStore((s) => s.closePanel);

  const goHome = () => {
    if (mode === "intro") {
      skipIntro();
      closePanel();
      return;
    }
    setMode("intro");
    useAppStore.getState().skipIntro();
  };

  return (
    <div
      data-look-block
      className="pointer-events-auto absolute top-[max(0.65rem,env(safe-area-inset-top))] right-[max(0.65rem,env(safe-area-inset-right))] z-[70] flex max-w-[calc(100%-5.5rem)] flex-wrap justify-end gap-1.5 sm:top-4 sm:right-4 sm:gap-2"
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
        className={`${chip} inline-flex items-center`}
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
