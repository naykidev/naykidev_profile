import { useEffect, useState } from "react";
import {
  CAMPUS_WARM,
  GLOBE_MOUNT,
  GLOBE_UNMOUNT,
  INTRO_DURATION,
  SD_UNMOUNT,
  sampleIntroFromPlayback,
  type IntroSequenceSample,
} from "@/systems/introSequence";
import { useAppStore } from "@/systems/store";

export type IntroUiState = {
  titleVisible: boolean;
  showSkip: boolean;
  mountSd: boolean;
  mountGlobe: boolean;
};

export function readIntroPlayback(): IntroSequenceSample {
  const state = useAppStore.getState();
  return sampleIntroFromPlayback({
    introStartedAt: state.introStartedAt,
    introShortened: state.introShortened,
    introForcedEnd: state.introForcedEnd,
    reducedMotion: state.reducedMotion,
  });
}

const listeners = new Set<(sample: IntroSequenceSample) => void>();
let raf = 0;
let pumping = false;

function pump() {
  pumping = true;
  const sample = readIntroPlayback();
  listeners.forEach((fn) => fn(sample));
  const state = useAppStore.getState();
  const elapsed = (performance.now() - state.introStartedAt) / 1000;
  const playing =
    !state.introForcedEnd &&
    !state.introShortened &&
    !state.reducedMotion &&
    elapsed < INTRO_DURATION + 0.4;
  if (listeners.size > 0 && playing) {
    raf = requestAnimationFrame(pump);
    return;
  }
  pumping = false;
}

/** Shared intro clock — canvases write opacity/camera from this, React does not. */
export function subscribeIntroPlayback(fn: (sample: IntroSequenceSample) => void) {
  listeners.add(fn);
  fn(readIntroPlayback());
  if (!pumping) raf = requestAnimationFrame(pump);
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0) {
      cancelAnimationFrame(raf);
      pumping = false;
    }
  };
}

function uiFrom(sample: IntroSequenceSample, shortened: boolean): IntroUiState {
  if (shortened) {
    return { titleVisible: true, showSkip: false, mountSd: false, mountGlobe: false };
  }
  const t = sample.sdElapsed;
  return {
    titleVisible: sample.titleVisible,
    showSkip: sample.showSkip,
    mountSd: t < SD_UNMOUNT,
    mountGlobe: t >= GLOBE_MOUNT && t < GLOBE_UNMOUNT,
  };
}

export function useIntroSequenceUi(): IntroUiState | null {
  const mode = useAppStore((s) => s.mode);
  const introStartedAt = useAppStore((s) => s.introStartedAt);
  const introShortened = useAppStore((s) => s.introShortened);
  const introForcedEnd = useAppStore((s) => s.introForcedEnd);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const shortened = introShortened || introForcedEnd || reducedMotion;

  const [ui, setUi] = useState<IntroUiState | null>(() =>
    mode === "intro" ? uiFrom(readIntroPlayback(), shortened) : null,
  );

  useEffect(() => {
    if (mode !== "intro") {
      setUi(null);
      return;
    }
    if (shortened) {
      setUi(uiFrom(readIntroPlayback(), true));
      return;
    }
    let prev = "";
    return subscribeIntroPlayback((sample) => {
      const next = uiFrom(sample, false);
      const key = `${next.titleVisible}|${next.showSkip}|${next.mountSd}|${next.mountGlobe}`;
      if (key === prev) return;
      prev = key;
      setUi(next);
    });
  }, [mode, introStartedAt, shortened]);

  return mode === "intro" ? ui : null;
}

/** Campus canvas stays frozen until the globe is about to reveal it. */
export function useIntroCampusLive() {
  const mode = useAppStore((s) => s.mode);
  const introStartedAt = useAppStore((s) => s.introStartedAt);
  const introShortened = useAppStore((s) => s.introShortened);
  const introForcedEnd = useAppStore((s) => s.introForcedEnd);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const shortened = introShortened || introForcedEnd || reducedMotion;
  const [live, setLive] = useState(() => mode !== "intro" || shortened);

  useEffect(() => {
    if (mode !== "intro" || shortened) {
      setLive(true);
      return;
    }
    setLive(false);
    return subscribeIntroPlayback((sample) => {
      if (sample.sdElapsed >= CAMPUS_WARM) setLive(true);
    });
  }, [mode, introStartedAt, shortened]);

  return live;
}
