/**
 * Intro timeline: aerial San Diego coast → globe.gl → campus dolly.
 */
import { SAN_DIEGO } from "@/scenes/introGlobe/globeTimeline";

export const INTRO_SEEN_KEY = "aaron-nayki-campus-intro-seen";

export const SD_END = 3.6;
export const GLOBE_START = 2.2;
export const GLOBE_END = 7.35;
export const CAMPUS_START = 6.85;
export const INTRO_DURATION = 9.65;
export const LAYER_FADE = 1.2;

/** Exact explore/tour handoff pose — do not change. */
export const INTRO_ARRIVAL = {
  position: [3.2, 4.6, 16] as const,
  lookAt: [0, 7.2, -22] as const,
  fov: 50,
};

const CAMPUS_FROM = [8.5, 3.1, 34] as const;

export type Vec3 = readonly [number, number, number];

export type IntroCameraSample = {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
};

export type IntroOverlaySample = {
  beat: "sandiego" | "globe" | "campus";
  titleVisible: boolean;
  showSkip: boolean;
  sdFade: number;
  globeFade: number;
  sdElapsed: number;
  globeElapsed: number;
};

export type IntroSequenceSample = IntroCameraSample & IntroOverlaySample;

function clamp01(t: number) {
  return Math.min(1, Math.max(0, t));
}

function smoothstep(t: number) {
  const u = clamp01(t);
  return u * u * (3 - 2 * u);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hasPhotorealisticTiles() {
  return true;
}

function fadeWindow(t: number, start: number, end: number, fadeIn: boolean) {
  if (t < start || t > end) return 0;
  const inn = fadeIn && t < start + LAYER_FADE ? smoothstep((t - start) / LAYER_FADE) : 1;
  const out = t > end - LAYER_FADE ? 1 - smoothstep((t - (end - LAYER_FADE)) / LAYER_FADE) : 1;
  return clamp01(inn * out);
}

export function sampleIntroCamera(elapsed: number): IntroCameraSample {
  const t = Math.max(0, elapsed);
  if (t <= CAMPUS_START) {
    return {
      position: [...CAMPUS_FROM],
      lookAt: [...INTRO_ARRIVAL.lookAt],
      fov: INTRO_ARRIVAL.fov,
    };
  }
  if (t >= INTRO_DURATION) {
    return {
      position: [...INTRO_ARRIVAL.position],
      lookAt: [...INTRO_ARRIVAL.lookAt],
      fov: INTRO_ARRIVAL.fov,
    };
  }
  const u = smoothstep((t - CAMPUS_START) / (INTRO_DURATION - CAMPUS_START));
  return {
    position: [
      lerp(CAMPUS_FROM[0], INTRO_ARRIVAL.position[0], u),
      lerp(CAMPUS_FROM[1], INTRO_ARRIVAL.position[1], u),
      lerp(CAMPUS_FROM[2], INTRO_ARRIVAL.position[2], u),
    ],
    lookAt: [...INTRO_ARRIVAL.lookAt],
    fov: INTRO_ARRIVAL.fov,
  };
}

export function sampleIntroOverlay(elapsed: number): IntroOverlaySample {
  const t = Math.max(0, elapsed);
  const tiles = hasPhotorealisticTiles();
  return {
    beat: t < GLOBE_START ? "sandiego" : t < CAMPUS_START ? "globe" : "campus",
    titleVisible: t >= CAMPUS_START + 2.15,
    showSkip: t < CAMPUS_START + 1.5,
    sdFade: tiles ? fadeWindow(t, 0, SD_END, false) : 0,
    globeFade: fadeWindow(t, GLOBE_START, GLOBE_END, true),
    sdElapsed: t,
    globeElapsed: Math.max(0, t - GLOBE_START),
  };
}

export function sampleIntroSequence(
  elapsed: number,
  options?: { reducedMotion?: boolean; shortened?: boolean },
): IntroSequenceSample {
  if (options?.reducedMotion || options?.shortened) {
    return {
      position: [...INTRO_ARRIVAL.position],
      lookAt: [...INTRO_ARRIVAL.lookAt],
      fov: INTRO_ARRIVAL.fov,
      beat: "campus",
      titleVisible: true,
      showSkip: false,
      sdFade: 0,
      globeFade: 0,
      sdElapsed: 0,
      globeElapsed: 0,
    };
  }

  const timeline = elapsed + (hasPhotorealisticTiles() ? 0 : GLOBE_START);
  return { ...sampleIntroCamera(timeline), ...sampleIntroOverlay(timeline) };
}

export function sampleIntroFromPlayback(state: {
  introStartedAt: number;
  introShortened: boolean;
  introForcedEnd: boolean;
  reducedMotion: boolean;
}): IntroSequenceSample {
  const shortened = state.introShortened || state.introForcedEnd;
  const elapsed = shortened
    ? INTRO_DURATION
    : (performance.now() - state.introStartedAt) / 1000;
  return sampleIntroSequence(elapsed, {
    shortened,
  });
}

export function hasSeenIntro(): boolean {
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    window.localStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function createIntroPlayback(_reducedMotion: boolean) {
  return {
    introStartedAt: typeof performance !== "undefined" ? performance.now() : 0,
    introShortened: false,
    introForcedEnd: false,
  };
}

export { SAN_DIEGO };
