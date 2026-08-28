import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useClassicMotion } from "./motion";

const COORD_W = 1200;
const COORD_H = 120;

const PATH_VARIANTS = [
  {
    id: "v1",
    d: "M 0 25 C 150 15 250 15 400 25 C 550 15 650 15 800 25 C 950 15 1050 15 1200 25",
    duration: { desktop: 2.5, mobile: 2 },
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    sprayDuration: "0.15s",
    wakeDuration: "0.2s",
    sprayPeakOpacity: 0.7,
    wakeOpacity: 0.5,
    wakeW: 48,
    wakeH: 6,
    particleCount: 5,
  },
  {
    id: "v2",
    d: "M 0 35 C 200 10 400 40 600 15 C 800 45 1000 20 1200 35",
    duration: { desktop: 2, mobile: 1.6 },
    easing: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
    sprayDuration: "0.08s",
    wakeDuration: "0.12s",
    sprayPeakOpacity: 0.9,
    wakeOpacity: 0.7,
    wakeW: 60,
    wakeH: 8,
    particleCount: 6,
  },
  {
    id: "v3",
    d: "M 0 20 C 300 35 400 15 700 30 C 900 10 1100 25 1200 20",
    duration: { desktop: 1.8, mobile: 1.5 },
    easing: "cubic-bezier(0.4, 0, 0.6, 1)",
    sprayDuration: "0.15s",
    wakeDuration: "0.2s",
    sprayPeakOpacity: 0.7,
    wakeOpacity: 0.5,
    wakeW: 48,
    wakeH: 6,
    particleCount: 5,
  },
  {
    id: "v4",
    d: "M 0 30 C 250 28 500 32 750 28 C 1000 33 1200 30 1200 30",
    duration: { desktop: 3.2, mobile: 2.5 },
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    sprayDuration: "0.15s",
    wakeDuration: "0.2s",
    sprayPeakOpacity: 0.7,
    wakeOpacity: 0.5,
    wakeW: 48,
    wakeH: 6,
    particleCount: 5,
  },
] as const;

function sprayShadow(count: number) {
  const offsets = [
    "-4px -3px 0 0",
    "-7px 0 0 0",
    "-10px 2px 0 0",
    "-6px 4px 0 0",
    "-12px -1px 0 0",
    "-14px 3px 0 0",
  ];
  return offsets
    .slice(0, count)
    .map((o) => `${o} rgba(255,255,255,0.35)`)
    .join(", ");
}

function SurferSvg({ riding }: { riding: boolean }) {
  return (
    <svg
      viewBox="0 0 36 32"
      width="32"
      height="28"
      className={`surfer-svg ${riding ? "surfer-svg--riding" : ""}`}
      aria-hidden
    >
      <ellipse cx="18" cy="28" rx="14" ry="1.5" fill="currentColor" opacity="0.25" />
      <path
        d="M 6 24 Q 18 20 30 24 L 28 26 Q 18 23 8 26 Z"
        fill="var(--vivid-tangerine)"
        opacity="0.85"
      />
      <path d="M 6 25 L 4 28 L 7 26 Z" fill="var(--flag-red)" opacity="0.7" />
      <circle cx="24" cy="6" r="2.5" fill="currentColor" />
      <path
        d="M 22 9 L 20 16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 24 8 L 28 5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 22 9 L 18 7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 20 16 L 16 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 20 16 L 24 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function WaveSurfer() {
  const { reduce } = useClassicMotion();
  const stripRef = useRef<HTMLDivElement>(null);
  const surferRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [variantIdx, setVariantIdx] = useState(0);
  const [rideKey, setRideKey] = useState(0);
  const [phase, setPhase] = useState<"idle" | "riding" | "shake" | "hidden">("idle");
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [isMobile, setIsMobile] = useState(false);

  const variant = PATH_VARIANTS[variantIdx]!;
  const duration = isMobile ? variant.duration.mobile : variant.duration.desktop;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const updateScale = () => {
      const { width, height } = strip.getBoundingClientRect();
      setScale({
        x: width / COORD_W,
        y: height / COORD_H,
      });
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(strip);
    return () => ro.disconnect();
  }, []);

  const startRide = useCallback(() => {
    setPhase("riding");
    setRideKey((k) => k + 1);
  }, []);

  const onRideEnd = useCallback(() => {
    setPhase("shake");
    pauseRef.current = setTimeout(() => {
      setPhase("hidden");
      pauseRef.current = setTimeout(() => {
        setVariantIdx((i) => (i + 1) % PATH_VARIANTS.length);
        startRide();
      }, 400);
    }, 400);
  }, [startRide]);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(startRide, 600);
    return () => {
      clearTimeout(t);
      if (pauseRef.current) clearTimeout(pauseRef.current);
    };
  }, [reduce, startRide]);

  useEffect(() => {
    const el = surferRef.current;
    if (!el || reduce || phase !== "riding") return;

    const handler = (e: AnimationEvent) => {
      if (e.animationName === "ride-wave") onRideEnd();
    };
    el.addEventListener("animationend", handler);
    return () => el.removeEventListener("animationend", handler);
  }, [phase, reduce, onRideEnd, rideKey]);

  if (reduce) return null;

  const sprayBoxShadow = sprayShadow(variant.particleCount);
  const showSurfer = phase !== "hidden";

  const surferStyle: CSSProperties = {
    offsetPath: `path('${variant.d}')`,
    offsetDistance: "0%",
    offsetRotate: "auto",
    offsetAnchor: "18px 26px",
    animation:
      phase === "riding"
        ? `ride-wave ${duration}s ${variant.easing} forwards`
        : undefined,
    opacity: showSurfer ? 1 : 0,
    visibility: showSurfer ? "visible" : "hidden",
    "--spray-duration": variant.sprayDuration,
    "--wake-duration": variant.wakeDuration,
    "--spray-peak-opacity": variant.sprayPeakOpacity,
    "--wake-opacity": variant.wakeOpacity,
    "--wake-w": `${variant.wakeW}px`,
    "--wake-h": `${variant.wakeH}px`,
  } as CSSProperties;

  return (
    <div ref={stripRef} className="wave-tube-strip" aria-hidden>
      <svg className="wave-back" viewBox={`0 0 ${COORD_W} ${COORD_H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--wave-deep)" />
            <stop offset="50%" stopColor="var(--wave-mid)" />
            <stop offset="100%" stopColor="var(--wave-deep)" />
          </linearGradient>
        </defs>
        <path
          d="M0,60 Q200,20 400,50 T800,45 T1200,55 L1200,120 L0,120 Z"
          fill="url(#wave-grad)"
          opacity="0.65"
        />
      </svg>
      <svg className="wave-foam" viewBox={`0 0 ${COORD_W} ${COORD_H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="foam-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="40%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width={COORD_W} height={COORD_H} fill="url(#foam-grad)" />
        <path
          d="M0,48 Q150,38 300,46 T600,42 T900,47 T1200,44 L1200,60 L0,60 Z"
          fill="white"
          opacity="0.12"
        />
      </svg>

      <div
        className="wave-coord-space"
        style={{
          width: COORD_W,
          height: COORD_H,
          transform: `scale(${scale.x}, ${scale.y})`,
        }}
      >
        <div className="wave-surfer-wrap">
          {showSurfer ? (
            <div
              key={rideKey}
              ref={surferRef}
              className={`surfer-rider surfer-rider--${variant.id} ${phase === "shake" ? "surfer-rider--shake" : ""}`}
              style={surferStyle}
            >
              <div className="surfer-inner">
                <span className="spray" style={{ boxShadow: sprayBoxShadow }} />
                <SurferSvg riding={phase === "riding"} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
