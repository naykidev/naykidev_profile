import { useEffect, useState } from "react";
import { sampleIntroFromPlayback, type IntroSequenceSample } from "@/systems/introSequence";
import { useAppStore } from "@/systems/store";

export function useIntroSequenceFrame(): IntroSequenceSample | null {
  const mode = useAppStore((s) => s.mode);
  const introStartedAt = useAppStore((s) => s.introStartedAt);
  const introShortened = useAppStore((s) => s.introShortened);
  const introForcedEnd = useAppStore((s) => s.introForcedEnd);
  const live = mode === "intro" && !introShortened && !introForcedEnd;
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!live) return;
    let id = 0;
    const tick = () => {
      setTick((n) => n + 1);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [live, introStartedAt]);

  if (mode !== "intro") return null;
  return sampleIntroFromPlayback({
    introStartedAt,
    introShortened,
    introForcedEnd,
    reducedMotion: false,
  });
}
