/**
 * Intro cinematic stack: aerial San Diego (z-56) over globe (z-54).
 * Below IntroOverlay (60) and a11y (70).
 */
import { useIntroSequenceFrame } from "@/hooks/useIntroSequence";
import { IntroGlobeCanvas } from "@/scenes/introGlobe/IntroGlobeCanvas";
import { SanDiegoTilesCanvas } from "@/scenes/introGlobe/SanDiegoTilesCanvas";
import { useAppStore } from "@/systems/store";

export function IntroCinematicLayer() {
  const frame = useIntroSequenceFrame();
  const skipIntro = useAppStore((s) => s.skipIntro);
  if (!frame) return null;

  const overlap = frame.sdFade > 0.01 && frame.globeFade > 0.05;

  return (
    <>
      {frame.globeFade > 0.01 ? (
        <IntroGlobeCanvas elapsed={frame.globeElapsed} fade={frame.globeFade} liftOff />
      ) : null}
      {overlap ? (
        <div
          className="pointer-events-none absolute inset-0 z-[55]"
          style={{
            opacity: (1 - frame.sdFade) * 0.58,
            background:
              "radial-gradient(ellipse at 50% 42%, rgba(186, 220, 236, 0.18) 0%, rgba(8, 14, 28, 0.68) 74%)",
          }}
        />
      ) : null}
      {frame.sdFade > 0.01 ? (
        <SanDiegoTilesCanvas elapsed={frame.sdElapsed} fade={frame.sdFade} />
      ) : null}
      {frame.showSkip ? (
        <button
          type="button"
          className="pointer-events-auto absolute top-[max(0.65rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] z-[58] min-h-9 border border-paper/30 bg-ink/40 px-3 py-1.5 font-ui text-[10px] tracking-[0.18em] text-paper/80 uppercase backdrop-blur-[2px] hover:text-paper"
          onClick={skipIntro}
        >
          Skip intro
        </button>
      ) : null}
    </>
  );
}
