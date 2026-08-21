import { profile } from "@/data/profile";
import { useTouchUi } from "@/hooks/useCoarsePointer";
import { navigate } from "@/lib/appRoute";
import { useAppStore } from "@/systems/store";

const chip =
  "overlay-chip overlay-nav-chip inline-flex items-center rounded-full font-ui uppercase";

function NavLabel({ full, short }: { full: string; short: string }) {
  return (
    <>
      <span className="nav-full">{full}</span>
      <span className="nav-short">{short}</span>
    </>
  );
}

export function AccessibilityMenu() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const skipIntro = useAppStore((s) => s.skipIntro);
  const activePanel = useAppStore((s) => s.activePanel);
  const openPanel = useAppStore((s) => s.openPanel);
  const closePanel = useAppStore((s) => s.closePanel);
  const startProjectsTour = useAppStore((s) => s.startProjectsTour);
  const startAwardsTour = useAppStore((s) => s.startAwardsTour);
  const touchUi = useTouchUi();

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
      className="overlay-nav-bar pointer-events-auto absolute top-[max(0.5rem,env(safe-area-inset-top))] right-0 left-0 z-[70] w-full max-w-none px-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] sm:top-4 sm:right-4 sm:left-auto sm:w-auto sm:max-w-[calc(100%-6rem)] sm:px-0"
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
        <NavLabel full="About Me" short="About" />
      </button>
      <button type="button" className={chip} onClick={() => startProjectsTour()}>
        <NavLabel full="Projects" short="Projects" />
      </button>
      <button type="button" className={chip} onClick={() => startAwardsTour()}>
        <NavLabel full="Awards & Certificates" short="Awards" />
      </button>
      <button type="button" className={chip} onClick={() => navigate("/classic#resume")}>
        Resume
      </button>
      <a
        className={chip}
        href={profile.linkedin}
        target="_blank"
        rel="noreferrer"
        aria-label="Aaron Nayki LinkedIn profile"
      >
        <NavLabel full="LinkedIn" short="Link" />
      </a>
      {!touchUi ? (
        <button type="button" className={chip} onClick={() => navigate("/classic")}>
          <NavLabel full="View as a regular site" short="Classic" />
        </button>
      ) : null}
    </div>
  );
}
