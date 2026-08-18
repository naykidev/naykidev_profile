export const SAN_DIEGO = {
  lat: 32.7157,
  lng: -117.1611,
  label: "San Diego",
  id: "sandiego",
} as const;

export const MADISON = {
  lat: 43.0731,
  lng: -89.4012,
  label: "Madison",
  id: "madison",
} as const;

export const GLOBE_BEAT_DURATION = 4.6;

export type GlobePin = { lat: number; lng: number; label: string; id: string };

export type GlobeBeatId = "coast" | "wide" | "sandiego" | "arc" | "madison";

export type GlobeBeat = {
  id: GlobeBeatId;
  pov: { lat: number; lng: number; altitude: number };
  transitionMs: number;
  autoRotate: boolean;
  pins: GlobePin[];
  showArc: boolean;
};

export type GlobePov = { lat: number; lng: number; altitude: number };

type PovKey = { t: number; lat: number; lng: number; altitude: number };

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

function lerpLng(a: number, b: number, t: number) {
  const d = ((((b - a) % 360) + 540) % 360) - 180;
  return a + d * t;
}

function sampleKeys(t: number, keys: PovKey[]): GlobePov {
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (t <= first.t) return { lat: first.lat, lng: first.lng, altitude: first.altitude };
  if (t >= last.t) return { lat: last.lat, lng: last.lng, altitude: last.altitude };
  for (let i = 1; i < keys.length; i += 1) {
    if (t > keys[i].t) continue;
    const a = keys[i - 1];
    const b = keys[i];
    const u = smoothstep((t - a.t) / Math.max(0.0001, b.t - a.t));
    return {
      lat: lerp(a.lat, b.lat, u),
      lng: lerpLng(a.lng, b.lng, u),
      altitude: lerp(a.altitude, b.altitude, u),
    };
  }
  return { lat: last.lat, lng: last.lng, altitude: last.altitude };
}

const LIFT_OFF_POV: PovKey[] = [
  { t: 0, lat: 32.72, lng: -117.45, altitude: 0.38 },
  { t: 0.7, lat: 32.9, lng: -117.9, altitude: 0.55 },
  { t: 1.45, lat: 33.7, lng: -120.2, altitude: 1.15 },
  { t: 2.25, lat: 38.8, lng: -104.2, altitude: 1.95 },
  { t: 3.5, lat: MADISON.lat, lng: MADISON.lng, altitude: 1.2 },
  { t: 4.25, lat: MADISON.lat, lng: MADISON.lng, altitude: 1.08 },
];

const PREVIEW_POV: PovKey[] = [
  { t: 0, lat: 22, lng: -108, altitude: 2.45 },
  { t: 1.2, lat: SAN_DIEGO.lat, lng: SAN_DIEGO.lng, altitude: 1.12 },
  { t: 2.6, lat: MADISON.lat, lng: MADISON.lng, altitude: 1.15 },
  { t: 3.4, lat: MADISON.lat, lng: MADISON.lng, altitude: 1.12 },
];

/** Frame-driven camera so globe.gl d3 tweens cannot stall or overlap. */
export function globePovAt(elapsed: number, options?: { liftOff?: boolean }): GlobePov {
  return sampleKeys(Math.max(0, elapsed), options?.liftOff ? LIFT_OFF_POV : PREVIEW_POV);
}

export function globeBeatAt(elapsed: number, options?: { liftOff?: boolean }): GlobeBeat {
  const t = Math.max(0, elapsed);
  const pov = globePovAt(t, options);
  if (options?.liftOff) {
    if (t < 2.25) {
      return {
        id: "coast",
        pov,
        transitionMs: 0,
        autoRotate: false,
        pins: [{ ...SAN_DIEGO }],
        showArc: false,
      };
    }
    if (t < 3.55) {
      return {
        id: "arc",
        pov,
        transitionMs: 0,
        autoRotate: false,
        pins: [{ ...SAN_DIEGO }, { ...MADISON }],
        showArc: true,
      };
    }
    return {
      id: "madison",
      pov,
      transitionMs: 0,
      autoRotate: false,
      pins: [{ ...SAN_DIEGO }, { ...MADISON }],
      showArc: true,
    };
  }
  if (t < 1.2) {
    return {
      id: "wide",
      pov,
      transitionMs: 0,
      autoRotate: false,
      pins: [],
      showArc: false,
    };
  }
  if (t < 2.6) {
    return {
      id: "sandiego",
      pov,
      transitionMs: 0,
      autoRotate: false,
      pins: [{ ...SAN_DIEGO }],
      showArc: false,
    };
  }
  return {
    id: "madison",
    pov,
    transitionMs: 0,
    autoRotate: false,
    pins: [{ ...SAN_DIEGO }, { ...MADISON }],
    showArc: true,
  };
}

export const JOURNEY_ARC = {
  startLat: SAN_DIEGO.lat,
  startLng: SAN_DIEGO.lng,
  endLat: MADISON.lat,
  endLng: MADISON.lng,
};
