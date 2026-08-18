/**
 * Intro cinematic stack: aerial San Diego (z-56) over globe (z-54).
 * Below IntroOverlay (60) and a11y (70).
 */
import { useEffect, useRef } from "react";
import { subscribeIntroPlayback, useIntroSequenceUi } from "@/hooks/useIntroSequence";
import { IntroGlobeCanvas } from "@/scenes/introGlobe/IntroGlobeCanvas";
import { SanDiegoTilesCanvas } from "@/scenes/introGlobe/SanDiegoTilesCanvas";
import { useAppStore } from "@/systems/store";

function IntroCrossfadeVeil() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    return subscribeIntroPlayback((sample) => {
      const el = ref.current;
      if (!el) return;
      const show = sample.sdFade > 0.01 && sample.globeFade > 0.05;
      el.style.opacity = show ? String((1 - sample.sdFade) * 0.58) : "0";
    });
  }, []);
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-[55]"
      style={{
        opacity: 0,
        background:
          "radial-gradient(ellipse at 50% 42%, rgba(186, 220, 236, 0.18) 0%, rgba(8, 14, 28, 0.68) 74%)",
      }}
    />
  );
}

export function IntroCinematicLayer() {
  const frame = useIntroSequenceUi();
  const skipIntro = useAppStore((s) => s.skipIntro);
  if (!frame) return null;

  return (
    <>
      {frame.mountGlobe ? <IntroGlobeCanvas liftOff /> : null}
      <IntroCrossfadeVeil />
      {frame.mountSd ? <SanDiegoTilesCanvas /> : null}
      {frame.showSkip ? (
        <button
          type="button"
          className="pointer-events-auto absolute top-[max(0.65rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] z-[58] min-h-11 border border-paper/30 bg-ink/40 px-3 py-1.5 font-ui text-[10px] tracking-[0.18em] text-paper/80 uppercase backdrop-blur-[2px] hover:text-paper sm:min-h-9"
          onClick={skipIntro}
        >
          Skip intro
        </button>
      ) : null}
    </>
  );
}
