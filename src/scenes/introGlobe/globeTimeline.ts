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

export const GLOBE_BEAT_DURATION = 5.4;

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

export function globeBeatAt(elapsed: number, options?: { liftOff?: boolean }): GlobeBeat {
  const t = Math.max(0, elapsed);
  if (options?.liftOff) {
    if (t < 1.15) {
      return {
        id: "coast",
        pov: { lat: 32.72, lng: -117.45, altitude: 0.38 },
        transitionMs: 0,
        autoRotate: false,
        pins: [{ ...SAN_DIEGO }],
        showArc: false,
      };
    }
    if (t < 2.05) {
      return {
        id: "sandiego",
        pov: { lat: 33.05, lng: -118.05, altitude: 0.88 },
        transitionMs: 1100,
        autoRotate: false,
        pins: [{ ...SAN_DIEGO }],
        showArc: false,
      };
    }
    if (t < 2.75) {
      return {
        id: "wide",
        pov: { lat: 38.2, lng: -102, altitude: 1.65 },
        transitionMs: 900,
        autoRotate: false,
        pins: [{ ...SAN_DIEGO }, { ...MADISON }],
        showArc: false,
      };
    }
    if (t < 4.05) {
      return {
        id: "arc",
        pov: { lat: MADISON.lat, lng: MADISON.lng, altitude: 1.18 },
        transitionMs: 1400,
        autoRotate: false,
        pins: [{ ...SAN_DIEGO }, { ...MADISON }],
        showArc: true,
      };
    }
    return {
      id: "madison",
      pov: { lat: MADISON.lat, lng: MADISON.lng, altitude: 1.12 },
      transitionMs: 0,
      autoRotate: false,
      pins: [{ ...SAN_DIEGO }, { ...MADISON }],
      showArc: true,
    };
  }
  if (t < 1.1) {
    return {
      id: "wide",
      pov: { lat: 22, lng: -108, altitude: 2.45 },
      transitionMs: 0,
      autoRotate: true,
      pins: [],
      showArc: false,
    };
  }
  if (t < 2.55) {
    return {
      id: "sandiego",
      pov: { lat: SAN_DIEGO.lat, lng: SAN_DIEGO.lng, altitude: 1.15 },
      transitionMs: 1100,
      autoRotate: false,
      pins: [{ ...SAN_DIEGO }],
      showArc: false,
    };
  }
  if (t < 4.05) {
    return {
      id: "arc",
      pov: { lat: MADISON.lat, lng: MADISON.lng, altitude: 1.15 },
      transitionMs: 1500,
      autoRotate: false,
      pins: [{ ...SAN_DIEGO }, { ...MADISON }],
      showArc: true,
    };
  }
  return {
    id: "madison",
    pov: { lat: MADISON.lat, lng: MADISON.lng, altitude: 1.15 },
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
