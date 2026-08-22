import { Color } from "three";

export type DayPhase = "night" | "sunrise" | "day" | "sunset";

export type Atmosphere = {
  phase: DayPhase;
  background: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  sunPosition: [number, number, number];
  turbidity: number;
  rayleigh: number;
  mieCoefficient: number;
  mieDirectionalG: number;
  ambientIntensity: number;
  ambientColor: string;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  sunIntensity: number;
  sunColor: string;
  fillIntensity: number;
  fillColor: string;
  rimIntensity: number;
  rimColor: string;
  porchIntensity: number;
  porchColor: string;
  cloudOpacity: number;
  cloudColor: string;
  showClouds: boolean;
  starOpacity: number;
  /** 0 by day → 1 at night; drives window glow and facade lamps. */
  buildingGlow: number;
};

type Keyframe = { hour: number; phase: DayPhase } & Omit<Atmosphere, "phase">;

const KEYFRAMES: Keyframe[] = [
  {
    hour: 0,
    phase: "night",
    background: "#0b1220",
    fog: "#141c2c",
    fogNear: 48,
    fogFar: 130,
    sunPosition: [-8, -12, -30],
    turbidity: 1.2,
    rayleigh: 0.35,
    mieCoefficient: 0.001,
    mieDirectionalG: 0.7,
    ambientIntensity: 0.18,
    ambientColor: "#6e7fa0",
    hemiSky: "#1a2740",
    hemiGround: "#1c2418",
    hemiIntensity: 0.22,
    sunIntensity: 0.08,
    sunColor: "#9bb0d4",
    fillIntensity: 0.05,
    fillColor: "#7a8fb8",
    rimIntensity: 0.12,
    rimColor: "#4a5f88",
    porchIntensity: 1.9,
    porchColor: "#ffd6a0",
    cloudOpacity: 0.35,
    cloudColor: "#2a3348",
    showClouds: true,
    starOpacity: 1,
    buildingGlow: 1,
  },
  {
    hour: 5.2,
    phase: "night",
    background: "#10182a",
    fog: "#1a2438",
    fogNear: 50,
    fogFar: 135,
    sunPosition: [-20, -4, 10],
    turbidity: 1.6,
    rayleigh: 0.55,
    mieCoefficient: 0.002,
    mieDirectionalG: 0.75,
    ambientIntensity: 0.22,
    ambientColor: "#7a88a8",
    hemiSky: "#243452",
    hemiGround: "#2a3220",
    hemiIntensity: 0.26,
    sunIntensity: 0.15,
    sunColor: "#c4a078",
    fillIntensity: 0.08,
    fillColor: "#a88868",
    rimIntensity: 0.14,
    rimColor: "#5a6e90",
    porchIntensity: 1.6,
    porchColor: "#ffd6a0",
    cloudOpacity: 0.4,
    cloudColor: "#3a4258",
    showClouds: true,
    starOpacity: 0.75,
    buildingGlow: 0.85,
  },
  {
    hour: 6.4,
    phase: "sunrise",
    background: "#e8a878",
    fog: "#e6b896",
    fogNear: 55,
    fogFar: 145,
    sunPosition: [-28, 6, 18],
    turbidity: 6.5,
    rayleigh: 1.6,
    mieCoefficient: 0.006,
    mieDirectionalG: 0.88,
    ambientIntensity: 0.4,
    ambientColor: "#ffd8b8",
    hemiSky: "#f0c8a0",
    hemiGround: "#6a5840",
    hemiIntensity: 0.4,
    sunIntensity: 1.15,
    sunColor: "#ffb070",
    fillIntensity: 0.35,
    fillColor: "#ffc090",
    rimIntensity: 0.3,
    rimColor: "#88a0c8",
    porchIntensity: 0.7,
    porchColor: "#ffe0b8",
    cloudOpacity: 0.75,
    cloudColor: "#f8dcc8",
    showClouds: true,
    starOpacity: 0,
    buildingGlow: 0.15,
  },
  {
    hour: 8,
    phase: "day",
    background: "#9eb8d4",
    fog: "#c5d4e4",
    fogNear: 62,
    fogFar: 155,
    sunPosition: [20, 38, 36],
    turbidity: 2.4,
    rayleigh: 1.05,
    mieCoefficient: 0.0035,
    mieDirectionalG: 0.82,
    ambientIntensity: 0.52,
    ambientColor: "#fff6ea",
    hemiSky: "#dce8f5",
    hemiGround: "#5a6e48",
    hemiIntensity: 0.48,
    sunIntensity: 1.85,
    sunColor: "#ffe6b8",
    fillIntensity: 0.5,
    fillColor: "#ffe9c4",
    rimIntensity: 0.28,
    rimColor: "#a8c0dc",
    porchIntensity: 1.35,
    porchColor: "#ffe6c2",
    cloudOpacity: 0.88,
    cloudColor: "#f4f7fb",
    showClouds: true,
    starOpacity: 0,
    buildingGlow: 0,
  },
  {
    hour: 13,
    phase: "day",
    background: "#8eafd0",
    fog: "#bdd0e2",
    fogNear: 65,
    fogFar: 158,
    sunPosition: [8, 52, 18],
    turbidity: 2.1,
    rayleigh: 1.15,
    mieCoefficient: 0.003,
    mieDirectionalG: 0.8,
    ambientIntensity: 0.55,
    ambientColor: "#fff8ef",
    hemiSky: "#e4eef8",
    hemiGround: "#5c704a",
    hemiIntensity: 0.5,
    sunIntensity: 2.05,
    sunColor: "#fff0c8",
    fillIntensity: 0.45,
    fillColor: "#fff2d4",
    rimIntensity: 0.22,
    rimColor: "#9eb6d4",
    porchIntensity: 1.2,
    porchColor: "#fff0d4",
    cloudOpacity: 0.82,
    cloudColor: "#f7f9fc",
    showClouds: true,
    starOpacity: 0,
    buildingGlow: 0,
  },
  {
    hour: 17.2,
    phase: "sunset",
    background: "#d88868",
    fog: "#d4a080",
    fogNear: 52,
    fogFar: 140,
    sunPosition: [34, 8, -16],
    turbidity: 7.2,
    rayleigh: 1.8,
    mieCoefficient: 0.007,
    mieDirectionalG: 0.9,
    ambientIntensity: 0.38,
    ambientColor: "#ffc8a0",
    hemiSky: "#e8a888",
    hemiGround: "#5a4838",
    hemiIntensity: 0.38,
    sunIntensity: 1.25,
    sunColor: "#ff9050",
    fillIntensity: 0.4,
    fillColor: "#ffb080",
    rimIntensity: 0.35,
    rimColor: "#6880b0",
    porchIntensity: 0.85,
    porchColor: "#ffd0a0",
    cloudOpacity: 0.8,
    cloudColor: "#f0c8b0",
    showClouds: true,
    starOpacity: 0,
    buildingGlow: 0.45,
  },
  {
    hour: 19.4,
    phase: "sunset",
    background: "#6a4068",
    fog: "#6a4860",
    fogNear: 48,
    fogFar: 128,
    sunPosition: [30, -2, -28],
    turbidity: 4.5,
    rayleigh: 0.9,
    mieCoefficient: 0.004,
    mieDirectionalG: 0.85,
    ambientIntensity: 0.26,
    ambientColor: "#b090b8",
    hemiSky: "#584070",
    hemiGround: "#2a2418",
    hemiIntensity: 0.28,
    sunIntensity: 0.35,
    sunColor: "#ff7858",
    fillIntensity: 0.15,
    fillColor: "#d08070",
    rimIntensity: 0.22,
    rimColor: "#506088",
    porchIntensity: 1.5,
    porchColor: "#ffd6a0",
    cloudOpacity: 0.5,
    cloudColor: "#685068",
    showClouds: true,
    starOpacity: 0.35,
    buildingGlow: 0.9,
  },
  {
    hour: 21.5,
    phase: "night",
    background: "#0c1422",
    fog: "#121a2a",
    fogNear: 48,
    fogFar: 128,
    sunPosition: [12, -14, -32],
    turbidity: 1.2,
    rayleigh: 0.35,
    mieCoefficient: 0.001,
    mieDirectionalG: 0.7,
    ambientIntensity: 0.18,
    ambientColor: "#6e7fa0",
    hemiSky: "#1a2740",
    hemiGround: "#1c2418",
    hemiIntensity: 0.22,
    sunIntensity: 0.08,
    sunColor: "#9bb0d4",
    fillIntensity: 0.05,
    fillColor: "#7a8fb8",
    rimIntensity: 0.12,
    rimColor: "#4a5f88",
    porchIntensity: 1.9,
    porchColor: "#ffd6a0",
    cloudOpacity: 0.35,
    cloudColor: "#2a3348",
    showClouds: true,
    starOpacity: 1,
    buildingGlow: 1,
  },
  {
    // Wrap for midnight lerp from late night
    hour: 24,
    phase: "night",
    background: "#0b1220",
    fog: "#141c2c",
    fogNear: 48,
    fogFar: 130,
    sunPosition: [-8, -12, -30],
    turbidity: 1.2,
    rayleigh: 0.35,
    mieCoefficient: 0.001,
    mieDirectionalG: 0.7,
    ambientIntensity: 0.18,
    ambientColor: "#6e7fa0",
    hemiSky: "#1a2740",
    hemiGround: "#1c2418",
    hemiIntensity: 0.22,
    sunIntensity: 0.08,
    sunColor: "#9bb0d4",
    fillIntensity: 0.05,
    fillColor: "#7a8fb8",
    rimIntensity: 0.12,
    rimColor: "#4a5f88",
    porchIntensity: 1.9,
    porchColor: "#ffd6a0",
    cloudOpacity: 0.35,
    cloudColor: "#2a3348",
    showClouds: true,
    starOpacity: 1,
    buildingGlow: 1,
  },
];

const _ca = new Color();
const _cb = new Color();

function lerpNum(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpHex(a: string, b: string, t: number) {
  _ca.set(a);
  _cb.set(b);
  _ca.lerp(_cb, t);
  return `#${_ca.getHexString()}`;
}

function lerpVec3(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [lerpNum(a[0], b[0], t), lerpNum(a[1], b[1], t), lerpNum(a[2], b[2], t)];
}

function mixKeyframe(a: Keyframe, b: Keyframe, t: number): Atmosphere {
  const soft = t * t * (3 - 2 * t);
  return {
    phase: soft < 0.5 ? a.phase : b.phase,
    background: lerpHex(a.background, b.background, soft),
    fog: lerpHex(a.fog, b.fog, soft),
    fogNear: lerpNum(a.fogNear, b.fogNear, soft),
    fogFar: lerpNum(a.fogFar, b.fogFar, soft),
    sunPosition: lerpVec3(a.sunPosition, b.sunPosition, soft),
    turbidity: lerpNum(a.turbidity, b.turbidity, soft),
    rayleigh: lerpNum(a.rayleigh, b.rayleigh, soft),
    mieCoefficient: lerpNum(a.mieCoefficient, b.mieCoefficient, soft),
    mieDirectionalG: lerpNum(a.mieDirectionalG, b.mieDirectionalG, soft),
    ambientIntensity: lerpNum(a.ambientIntensity, b.ambientIntensity, soft),
    ambientColor: lerpHex(a.ambientColor, b.ambientColor, soft),
    hemiSky: lerpHex(a.hemiSky, b.hemiSky, soft),
    hemiGround: lerpHex(a.hemiGround, b.hemiGround, soft),
    hemiIntensity: lerpNum(a.hemiIntensity, b.hemiIntensity, soft),
    sunIntensity: lerpNum(a.sunIntensity, b.sunIntensity, soft),
    sunColor: lerpHex(a.sunColor, b.sunColor, soft),
    fillIntensity: lerpNum(a.fillIntensity, b.fillIntensity, soft),
    fillColor: lerpHex(a.fillColor, b.fillColor, soft),
    rimIntensity: lerpNum(a.rimIntensity, b.rimIntensity, soft),
    rimColor: lerpHex(a.rimColor, b.rimColor, soft),
    porchIntensity: lerpNum(a.porchIntensity, b.porchIntensity, soft),
    porchColor: lerpHex(a.porchColor, b.porchColor, soft),
    cloudOpacity: lerpNum(a.cloudOpacity, b.cloudOpacity, soft),
    cloudColor: lerpHex(a.cloudColor, b.cloudColor, soft),
    showClouds: soft < 0.5 ? a.showClouds : b.showClouds,
    starOpacity: lerpNum(a.starOpacity, b.starOpacity, soft),
    buildingGlow: lerpNum(a.buildingGlow, b.buildingGlow, soft),
  };
}

/** Fractional local hour in [0, 24). Optional `?tod=` / `?hour=` overrides for demos. */
export function getLocalHour(now = new Date()): number {
  if (typeof window !== "undefined") {
    const q = new URLSearchParams(window.location.search);
    const named = q.get("tod");
    if (named === "night") return 1;
    if (named === "sunrise") return 6.5;
    if (named === "day") return 13;
    if (named === "sunset") return 18.5;
    const hour = q.get("hour");
    if (hour != null) {
      const n = Number(hour);
      if (Number.isFinite(n)) return ((n % 24) + 24) % 24;
    }
  }
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
}

export function sampleAtmosphere(hour = getLocalHour()): Atmosphere {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < KEYFRAMES.length - 1 && KEYFRAMES[i + 1]!.hour <= h) i += 1;
  const a = KEYFRAMES[i]!;
  const b = KEYFRAMES[Math.min(i + 1, KEYFRAMES.length - 1)]!;
  const span = b.hour - a.hour || 1;
  const t = (h - a.hour) / span;
  return mixKeyframe(a, b, Math.min(1, Math.max(0, t)));
}
